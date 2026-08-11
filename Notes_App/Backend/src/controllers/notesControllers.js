import Note from "../models/Note.js"

const CLMS_URL = "http://localhost:8000"; // Changed to 8000

async function sendNoteToCLMS(note) {
    try {
        await fetch(`${CLMS_URL}/evidence/note`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                learner_id: 1, // Defaulting to 1 for prototype
                note_id: note._id.toString(),
                title: note.title,
                text: `${note.title}\n${note.content}`
            })
        });
    } catch (error) {
        console.error("Failed to send note to CLMS:", error.message);
    }
}


export async function getAllNotes(req, res) {
    try {
        const notes = await Note.find().sort({ createdAt: -1 }); // -1 will sort in descending order (newest first)
        res.status(200).json(notes);

    } catch (error) {
        console.error("Error in getAllNotes controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getNoteById(req,res) {
    try {
        const note = await Note.findById(req.params.id);

        if(!note) return res.status(404).json({message: "Note not found!"});
        res.json(note);

    } catch (error) {
        console.error("Error in getNoteById controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function createNote(req,res) {
    try {
        const {title, content, tag, folder} = req.body;
        const note = new Note({title, content, tag, folder: folder || "Uncategorized"});

        const savedNote = await note.save();

        await sendNoteToCLMS(savedNote);

        res.status(201).json(savedNote);

    } catch (error) {
        console.error("Error in createNote controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function modifyNote(req,res) {
    try {
        const {title, content, tag, folder} = req.body;
        const updatedNote = await Note.findByIdAndUpdate(req.params.id,{title, content, tag, folder}, {new: true});

        if(!updatedNote) return res.status(404).json({message: "Note not found!"})

        await sendNoteToCLMS(updatedNote);

        res.status(200).json(updatedNote);
        
    } catch (error) {
        console.error("Error in modifyNote controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function deleteNote(req,res) {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);

        if(!deletedNote) return res.status(404).json({message: "Note not found!"})

        res.status(200).json({message: "Note deleted successfully!"});

    } catch (error) {
        console.error("Error in deleteNote controller", error);
        res.status(500).json({message: "Internal Server Error"});
    }
}