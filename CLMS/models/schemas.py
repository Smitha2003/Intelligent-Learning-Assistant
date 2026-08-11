from pydantic import BaseModel
from typing import List, Optional

# --- Input Schemas ---

class NoteEvidence(BaseModel):
    learner_id: int
    note_id: str | None = None
    title: str | None = None
    text: str

class AssessmentEvidence(BaseModel):
    learner_id: int
    concept_id: str
    is_correct: bool

# --- Output Schemas ---

class ExtractedConcept(BaseModel):
    concept: str
    concept_name: str
    domain: str
    confidence: float
    prerequisites: List[str] = []

class ConceptStateResponse(BaseModel):
    concept_id: str
    name: str
    domain: str
    mastery: float
    uncertainty: float
    last_updated: str
    prerequisites: List[str] = []

class Contradiction(BaseModel):
    advanced_concept_id: str
    advanced_mastery: float
    prerequisite_concept_id: str
    prerequisite_mastery: float
    reason: str

class AssessmentRecommendation(BaseModel):
    concept_id: str
    priority_score: float
    reason: str

class CrossDomainInsight(BaseModel):
    current_concept_id: str
    current_name: str
    domain_a: str
    recommended_domain_concept: str
    recommended_name: str
    domain_b: str
    relationship_type: str
