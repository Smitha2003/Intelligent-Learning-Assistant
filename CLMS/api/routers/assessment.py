from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from engines.assessment import get_assessment_recommendations
from engines.insights import get_cross_domain_insights
from models.schemas import AssessmentRecommendation, CrossDomainInsight
from typing import List

assessment_router = APIRouter(prefix="/assessment", tags=["assessment"])
insights_router = APIRouter(prefix="/insights", tags=["insights"])

@assessment_router.get("/recommendations", response_model=List[AssessmentRecommendation])
def get_recommendations(learner_id: int, db: Session = Depends(get_db)):
    return get_assessment_recommendations(db, learner_id)

@insights_router.get("/cross-domain", response_model=List[CrossDomainInsight])
def get_insights(learner_id: int, db: Session = Depends(get_db)):
    return get_cross_domain_insights(db, learner_id)
