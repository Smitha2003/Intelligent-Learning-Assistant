from sqlalchemy.orm import Session
from kg.graph import get_prerequisites
from models.domain import LearnerState

def evaluate_prerequisite_constraints(db: Session, learner_id: int, advanced_concept_id: str):
    """
    Checks if M_advanced <= M_prerequisite for all prerequisites of the advanced concept.
    Returns a list of violations (prerequisite_id, expected_min_mastery, actual_mastery).
    """
    prereq_ids = get_prerequisites(db, advanced_concept_id)
    if not prereq_ids:
        return []
    
    # Get the mastery of the advanced concept
    adv_state = db.query(LearnerState).filter(
        LearnerState.learner_id == learner_id,
        LearnerState.concept_id == advanced_concept_id
    ).first()
    
    if not adv_state:
        return []

    adv_mastery = adv_state.mastery
    violations = []

    for p_id in prereq_ids:
        p_state = db.query(LearnerState).filter(
            LearnerState.learner_id == learner_id,
            LearnerState.concept_id == p_id
        ).first()

        p_mastery = p_state.mastery if p_state else 0.0
        
        if adv_mastery > p_mastery:
            # Violation of M_j <= M_i
            violations.append((p_id, adv_mastery, p_mastery))
            
    return violations
