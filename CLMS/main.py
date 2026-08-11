from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base, SessionLocal
from api.routers import evidence, learner, assessment
from kg.graph import create_concept, add_dependency

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CLMS API", description="Cognitive Learner Memory System Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(evidence.router)
app.include_router(learner.router)
app.include_router(assessment.assessment_router)
app.include_router(assessment.insights_router)

@app.post("/reset")
def reset_system():
    """Resets the DB and seeds the knowledge graph for testing."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Seed graph
    db = SessionLocal()
    try:
        # Prerequisite: arrays -> sorted_arrays -> binary_search
        create_concept(db, "arrays", "Arrays", "Computer Science")
        create_concept(db, "sorted_arrays", "Sorted Arrays", "Computer Science")
        create_concept(db, "binary_search", "Binary Search", "Computer Science")
        create_concept(db, "iteration", "Iteration", "Computer Science")
        
        add_dependency(db, advanced_id="sorted_arrays", prerequisite_id="arrays")
        add_dependency(db, advanced_id="binary_search", prerequisite_id="sorted_arrays")
        add_dependency(db, advanced_id="binary_search", prerequisite_id="iteration")
        
        return {"status": "System reset and Knowledge Graph seeded."}
    finally:
        db.close()
