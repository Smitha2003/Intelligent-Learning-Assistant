from sqlalchemy.orm import Session
from models.domain import LearnerState, Learner
import datetime

def get_learner_state(db: Session, learner_id: int, concept_id: str) -> LearnerState:
    """Fetches the current state, initializing it to prior if it doesn't exist."""
    state = db.query(LearnerState).filter(
        LearnerState.learner_id == learner_id,
        LearnerState.concept_id == concept_id
    ).first()

    if not state:
        # Create default prior belief (e.g., 0.10 mastery, 1.0 uncertainty)
        # Check if learner exists, if not create
        learner = db.query(Learner).filter(Learner.id == learner_id).first()
        if not learner:
            learner = Learner(id=learner_id)
            db.add(learner)
            db.commit()

        state = LearnerState(
            learner_id=learner_id,
            concept_id=concept_id,
            mastery=0.10, 
            uncertainty=1.0,
            last_updated=datetime.datetime.utcnow()
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    return state

def update_learner_state(db: Session, state: LearnerState, new_mastery: float, new_uncertainty: float):
    state.mastery = round(new_mastery, 4)
    state.uncertainty = round(new_uncertainty, 4)
    state.last_updated = datetime.datetime.utcnow()
    db.commit()
    db.refresh(state)
    return state
