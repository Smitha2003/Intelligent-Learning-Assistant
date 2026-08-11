from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.schemas import ConceptStateResponse, Contradiction
from models.domain import LearnerState
from engines.contradictions import detect_contradictions
from lcmg.temporal_dynamics import apply_temporal_decay
from typing import List

router = APIRouter(prefix="/learner", tags=["learner"])

@router.get("/state", response_model=List[ConceptStateResponse])
def get_state(learner_id: int, db: Session = Depends(get_db)):
    states = db.query(LearnerState).filter(LearnerState.learner_id == learner_id).all()
    
    response = []
    for s in states:
        # Apply decay to show real-time state
        s = apply_temporal_decay(s)
    
    # Save all decayed states in one transaction
    db.commit()
    
    from kg.graph import get_prerequisites
    
    for s in states:
        
        response.append(ConceptStateResponse(
            concept_id=s.concept_id,
            name=s.concept.name,
            domain=s.concept.domain,
            mastery=s.concept.mastery if hasattr(s.concept, 'mastery') else s.mastery,
            uncertainty=s.uncertainty,
            last_updated=s.last_updated.isoformat(),
            prerequisites=get_prerequisites(db, s.concept_id)
        ))
    return response

@router.get("/contradictions", response_model=List[Contradiction])
def get_contradictions(learner_id: int, db: Session = Depends(get_db)):
    return detect_contradictions(db, learner_id)
