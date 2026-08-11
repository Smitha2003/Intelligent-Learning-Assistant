import os
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv("CLMS/.env")

class ExtractionResult(BaseModel):
    concept_id: str
    concept_name: str
    domain: str
    confidence: float
    prerequisites: list[str]

class ExtractionList(BaseModel):
    concepts: list[ExtractionResult]

try:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents="Extract concepts from: Artificial Neural Networks are inspired by Neurons.",
        config={
            'response_mime_type': 'application/json',
            'response_schema': ExtractionList,
        },
    )
    print("SUCCESS")
    print(response.text)
except Exception as e:
    print("FAILED:", e)
