from sqlalchemy.orm import Session
from models.schemas import CrossDomainInsight
from models.domain import ConceptDependency, Concept

def get_cross_domain_insights(db: Session, learner_id: int):
    """
    Dynamically queries the graph for real cross-domain prerequisite links.
    """
    insights = []
    
    # Query edges where source domain != target domain, ignoring Documents
    edges = db.query(ConceptDependency).all()
    
    for edge in edges:
        advanced = db.query(Concept).filter_by(id=edge.advanced_concept_id).first()
        prereq = db.query(Concept).filter_by(id=edge.prerequisite_concept_id).first()
        
        if advanced and prereq:
            if advanced.domain != prereq.domain and advanced.domain != "Document" and prereq.domain != "Document":
                insights.append(
                    CrossDomainInsight(
                        current_concept_id=prereq.id,
                        current_name=prereq.name,
                        domain_a=prereq.domain,
                        recommended_domain_concept=advanced.id,
                        recommended_name=advanced.name,
                        domain_b=advanced.domain,
                        relationship_type="interdisciplinary_prerequisite"
                    )
                )
    
    return insights
