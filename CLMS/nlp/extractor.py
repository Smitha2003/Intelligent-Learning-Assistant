import os
from typing import List, Dict
from models.schemas import ExtractedConcept
from db.database import SessionLocal
from models.domain import Concept
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class ExtractionResult(BaseModel):
    concept_id: str
    concept_name: str
    domain: str
    confidence: float
    prerequisites: List[str]

class ExtractionList(BaseModel):
    concepts: list[ExtractionResult]

def get_valid_concepts() -> List[Dict[str, str]]:
    db = SessionLocal()
    try:
        concepts = db.query(Concept).all()
        return [{"id": c.id, "name": c.name, "domain": c.domain} for c in concepts]
    finally:
        db.close()

def extract_concepts_from_text(text: str) -> List[ExtractedConcept]:
    """
    Extract concepts from text using Gemini LLM.
    """
    valid_concepts = get_valid_concepts()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key or api_key == "your_api_key_here":
        # Fallback to mock if no API key is provided
        return fallback_mock_extract(text)

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Analyze the following learner's note.
        Identify the core educational concepts the learner is demonstrating knowledge of.
        
        STRICT EXTRACTION LIMIT: You MUST extract a MAXIMUM of 2 concepts per note. Only extract the most dominant, overarching topics. Do NOT extract minor details or passing mentions.

        
        Here are the concepts currently tracked in the system:
        {valid_concepts}
        
        If the note relates to an existing concept, use its concept_id, concept_name, and domain exactly as they appear in the list above.
        If the note introduces a new concept that is not in the list, create a new concept_id (snake_case), a human-readable concept_name, and assign it to a broad domain.
        CRITICAL DOMAIN RULE: Assign the domain based on the concept's true academic discipline (e.g., "Computer Science", "Physics", "Math", "Biology", "Economics"), NOT just the general topic of the note! A single note can contain concepts from completely different domains (e.g., a Biology note can contain Math concepts).
        
        CRITICAL PREREQUISITE AND CROSS-DOMAIN RULE: 
        For every concept (new or existing), output an array of `prerequisites` containing the `concept_id`s of concepts that logically support, inspire, or must be learned before this concept.
        DO NOT just rely on what is explicitly written in the text! Use your broad academic world knowledge to autonomously discover LATENT connections between the concepts you are extracting and the existing concepts in the list provided above, or between concepts you are extracting simultaneously.
        For example, if you are extracting a Computer Science concept like "Neural Networks", and a Neuroscience concept like "Neurons" exists in the list above (or is being extracted simultaneously), you MUST autonomously draw a prerequisite link between them because they are conceptually foundational across domains, even if the user didn't explicitly write that!
        
        For each concept, assign a confidence score (0.0 to 1.0) based on how explicitly the concept is demonstrated in the text.
        
        Learner's Note:
        "{text}"
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': ExtractionList,
            },
        )
        
        extracted_data = response.parsed
        
        extracted_concepts = []
        for item in extracted_data.concepts:
            extracted_concepts.append(ExtractedConcept(
                concept=item.concept_id,
                concept_name=item.concept_name,
                domain=item.domain,
                confidence=round(item.confidence, 2),
                prerequisites=item.prerequisites
            ))
        return extracted_concepts
    except Exception as e:
        print(f"LLM Extraction failed: {e}")
        return fallback_mock_extract(text)

def fallback_mock_extract(text: str) -> List[ExtractedConcept]:
    MOCK_KEYWORD_MAP = {
        "binary search": ("binary_search", "Binary Search", "Computer Science", ["sorted_arrays"]),
        "sorted array": ("sorted_arrays", "Sorted Arrays", "Computer Science", ["arrays"]),
        "sorting": ("sorted_arrays", "Sorted Arrays", "Computer Science", ["arrays"]),
        "loop": ("iteration", "Iteration", "Computer Science", []),
        "array": ("arrays", "Arrays", "Computer Science", []),
        "calculus": ("calculus", "Calculus", "Math", []),
        "derivative": ("derivatives", "Derivatives", "Math", ["calculus"]),
        "wave mechanics": ("wave_mechanics", "Wave Mechanics", "Physics", ["calculus"]),
        
        "artificial intelligence": ("artificial_intelligence", "Artificial Intelligence", "Computer Science", []),
        "machine learning": ("machine_learning", "Machine Learning", "Computer Science", ["artificial_intelligence"]),
        "neural network": ("neural_networks", "Neural Networks", "Computer Science", ["machine_learning", "neurons", "synapses"]),
        "large language model": ("large_language_models", "Large Language Models", "Computer Science", ["neural_networks", "vector_embeddings", "neuroplasticity"]),
        "vector embedding": ("vector_embeddings", "Vector Embeddings", "Computer Science", ["machine_learning"]),
        
        "neuron": ("neurons", "Neurons", "Neuroscience", []),
        "synapse": ("synapses", "Synapses", "Neuroscience", ["neurons"]),
        "semantic memory": ("semantic_memory", "Semantic Memory", "Neuroscience", ["neurons", "synapses"]),
        "working memory": ("working_memory", "Working Memory", "Neuroscience", ["neurons"]),
        "long-term memory": ("long_term_memory", "Long-Term Memory", "Neuroscience", ["semantic_memory", "synapses"]),
        "neuroplasticity": ("neuroplasticity", "Neuroplasticity", "Neuroscience", ["neurons", "synapses"]),
        
        "time complexity": ("time_complexity", "Time Complexity", "Computer Science", ["iteration"]),
        "linked list": ("linked_lists", "Linked Lists", "Computer Science", ["arrays"]),
        "tree": ("trees", "Trees", "Computer Science", ["linked_lists"]),
        "graph": ("graphs", "Graphs", "Computer Science", ["trees", "arrays"]),
        "knowledge graph": ("knowledge_graphs", "Knowledge Graphs", "Computer Science", ["graphs", "semantic_memory"]),
        
        "cloud computing": ("cloud_computing", "Cloud Computing", "Computer Science", []),
        "docker": ("docker", "Docker", "Computer Science", ["cloud_computing"]),
        "kubernetes": ("kubernetes", "Kubernetes", "Computer Science", ["docker"]),
        "mongodb": ("mongodb", "MongoDB", "Computer Science", ["trees"])
    }
    extracted = []
    text_lower = text.lower()
    for keyword, (concept_id, name, domain, prereqs) in MOCK_KEYWORD_MAP.items():
        if keyword in text_lower:
            confidence = 0.6 + (min(len(keyword)/20.0, 0.3)) 
            extracted.append(ExtractedConcept(
                concept=concept_id, 
                concept_name=name, 
                domain=domain, 
                confidence=round(confidence, 2),
                prerequisites=prereqs
            ))
    unique_extracted = {c.concept: c for c in extracted}.values()
    return list(unique_extracted)
