from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from db.database import Base

class Learner(Base):
    __tablename__ = "learners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="default_learner")

    states = relationship("LearnerState", back_populates="learner")

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(String, primary_key=True, index=True) # e.g. 'binary_search'
    name = Column(String)
    domain = Column(String, default="Computer Science")

    learner_states = relationship("LearnerState", back_populates="concept")

class ConceptDependency(Base):
    __tablename__ = "concept_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    advanced_concept_id = Column(String, ForeignKey("concepts.id"))
    prerequisite_concept_id = Column(String, ForeignKey("concepts.id"))

class LearnerState(Base):
    """
    Represents the LCMG nodes per learner.
    """
    __tablename__ = "learner_states"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("learners.id"))
    concept_id = Column(String, ForeignKey("concepts.id"))
    mastery = Column(Float, default=0.0) # p(c)
    uncertainty = Column(Float, default=1.0) # u(c), starts with max uncertainty
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    learner = relationship("Learner", back_populates="states")
    concept = relationship("Concept", back_populates="learner_states")
