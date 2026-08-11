from sqlalchemy.orm import Session
from models.domain import LearnerState
from kg.constraints import evaluate_prerequisite_constraints
from models.schemas import Contradiction

def detect_contradictions(db: Session, learner_id: int):
    """
    Scans the learner's state for prerequisite violations.
    A contradiction is when an advanced concept has higher mastery than its prerequisites.
    """
    states = db.query(LearnerState).filter(LearnerState.learner_id == learner_id).all()
    
    contradictions = []
    
    for state in states:
        violations = evaluate_prerequisite_constraints(db, learner_id, state.concept_id)
        for (p_id, adv_mastery, p_mastery) in violations:
            contradictions.append(Contradiction(
                advanced_concept_id=state.concept_id,
                advanced_mastery=adv_mastery,
                prerequisite_concept_id=p_id,
                prerequisite_mastery=p_mastery,
                reason="Structural violation: Mastery of advanced concept exceeds prerequisite."
            ))
            
    return contradictions
