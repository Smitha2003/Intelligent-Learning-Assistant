from sqlalchemy.orm import Session
from models.domain import Concept, ConceptDependency

def get_concept(db: Session, concept_id: str):
    return db.query(Concept).filter(Concept.id == concept_id).first()

def create_concept(db: Session, concept_id: str, name: str, domain: str = "Computer Science"):
    concept = Concept(id=concept_id, name=name, domain=domain)
    db.add(concept)
    db.commit()
    db.refresh(concept)
    return concept

def add_dependency(db: Session, advanced_id: str, prerequisite_id: str):
    existing = db.query(ConceptDependency).filter_by(advanced_concept_id=advanced_id, prerequisite_concept_id=prerequisite_id).first()
    if not existing:
        dependency = ConceptDependency(advanced_concept_id=advanced_id, prerequisite_concept_id=prerequisite_id)
        db.add(dependency)
        db.commit()
        return dependency
    return existing

def get_prerequisites(db: Session, concept_id: str):
    """Returns all prerequisites for a given concept."""
    deps = db.query(ConceptDependency).filter(ConceptDependency.advanced_concept_id == concept_id).all()
    return [dep.prerequisite_concept_id for dep in deps]

def get_advanced_concepts(db: Session, concept_id: str):
    """Returns all concepts that have this concept as a prerequisite."""
    deps = db.query(ConceptDependency).filter(ConceptDependency.prerequisite_concept_id == concept_id).all()
    return [dep.advanced_concept_id for dep in deps]

def get_all_concepts(db: Session):
    return db.query(Concept).all()
