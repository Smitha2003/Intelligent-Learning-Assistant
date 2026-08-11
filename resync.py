import requests
import time

def resync():
    print("Fetching notes from MongoDB...")
    try:
        notes = requests.get("http://localhost:5001/api/notes").json()
    except Exception as e:
        print("Error fetching notes:", e)
        return

    print(f"Found {len(notes)} notes. Sending to CLMS (with a 4-second delay to prevent Gemini rate limits)...")
    
    for note in notes:
        # We process notes from oldest to newest to build the graph chronologically
        payload = {
            "learner_id": 1,
            "note_id": str(note.get("_id")),
            "title": note.get("title", "Untitled"),
            "text": f"{note.get('title', '')}\n{note.get('content', '')}"
        }
        try:
            res = requests.post("http://localhost:8000/evidence/note", json=payload)
            print(f"Syncing '{payload['title']}'... Status: {res.status_code}")
        except Exception as e:
            print(f"Failed to sync '{payload['title']}': {e}")
            
    print("Resync complete!")

if __name__ == "__main__":
    resync()
