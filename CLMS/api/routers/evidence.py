from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schemas import NoteEvidence, AssessmentEvidence, ExtractedConcept
from nlp.extractor import extract_concepts_from_text
from nlp.signal_converter import get_likelihood_from_note, get_likelihood_from_assessment
from lcmg.memory import get_learner_state, update_learner_state
from lcmg.bayesian_updater import apply_evidence_update
from lcmg.temporal_dynamics import apply_temporal_decay
from kg.graph import get_all_concepts, get_concept, create_concept, add_dependency

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.post("/note", response_model=list[ExtractedConcept])
def ingest_note(evidence: NoteEvidence, db: Session = Depends(get_db)):
    """
    1. Interpret Evidence (extract concepts)
    2. Convert to Belief Signal
    3. Update LCMG Probabilistically
    """
    extracted_concepts = extract_concepts_from_text(evidence.text)
    
    # Process Document Hub Node
    doc_concept_id = None
    if evidence.note_id and evidence.title:
        doc_concept_id = f"doc_{evidence.note_id}"
        concept = get_concept(db, doc_concept_id)
        if not concept:
            create_concept(db, doc_concept_id, evidence.title, "Document")
        # Ensure Document node has a fixed state so it renders properly in D3
        doc_state = get_learner_state(db, evidence.learner_id, doc_concept_id)
        update_learner_state(db, doc_state, 1.0, 0.0)
    
    for ec in extracted_concepts:
        # Check if concept exists in DB, if not auto-create
        concept = get_concept(db, ec.concept)
        if not concept:
            create_concept(db, ec.concept, ec.concept_name, ec.domain)
            
            # Wire up dependencies!
            if hasattr(ec, 'prerequisites') and ec.prerequisites:
                for p_id in ec.prerequisites:
                    # Make sure the prerequisite exists before linking
                    if get_concept(db, p_id):
                        add_dependency(db, advanced_id=ec.concept, prerequisite_id=p_id)
        
        # Wire Document Hub to Concept
        if doc_concept_id:
            add_dependency(db, advanced_id=doc_concept_id, prerequisite_id=ec.concept)
            
        state = get_learner_state(db, evidence.learner_id, ec.concept)
        
        # Apply temporal decay before new evidence is applied
        state = apply_temporal_decay(state)
        
        # Get likelihood P(E|M)
        likelihood = get_likelihood_from_note(ec.confidence)
        
        # Apply Bayesian Update
        new_mastery, new_uncertainty = apply_evidence_update(state.mastery, likelihood)
        
        # Save
        update_learner_state(db, state, new_mastery, new_uncertainty)

    return extracted_concepts

@router.post("/assessment")
def ingest_assessment(evidence: AssessmentEvidence, db: Session = Depends(get_db)):
    state = get_learner_state(db, evidence.learner_id, evidence.concept_id)
    state = apply_temporal_decay(state)
    
    likelihood = get_likelihood_from_assessment(evidence.is_correct)
    
    new_mastery, new_uncertainty = apply_evidence_update(state.mastery, likelihood)
    update_learner_state(db, state, new_mastery, new_uncertainty)
    
    return {"status": "success", "new_mastery": new_mastery, "new_uncertainty": new_uncertainty}
