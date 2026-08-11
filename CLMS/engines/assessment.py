from sqlalchemy.orm import Session
from models.domain import LearnerState
from models.schemas import AssessmentRecommendation
from typing import List

def get_assessment_recommendations(db: Session, learner_id: int, limit: int = 3) -> List[AssessmentRecommendation]:
    """
    Prioritizes concepts with high uncertainty and low mastery.
    This maximizes expected information gain.
    """
    states = db.query(LearnerState).filter(LearnerState.learner_id == learner_id).all()
    
    if not states:
        return []

    # Calculate a priority score for each concept.
    # We want to assess things with High Uncertainty.
    recommendations = []
    for state in states:
        # Priority = Uncertainty * (1.0 - Mastery)
        # We prioritize things they are uncertain about AND likely don't know well yet.
        priority = state.uncertainty * (1.0 - state.mastery)
        
        recommendations.append(AssessmentRecommendation(
            concept_id=state.concept_id,
            priority_score=round(priority, 4),
            reason=f"High uncertainty ({state.uncertainty}) regarding mastery."
        ))
        
    # Sort descending by priority
    recommendations.sort(key=lambda x: x.priority_score, reverse=True)
    
    return recommendations[:limit]
