import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoteDetailPage = () => {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState({ title: "", content: "", tag: "", folder: "Uncategorized" });

  const navigate = useNavigate();

  // FETCH NOTES
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
        if (res.data.length) setSelectedId(res.data[0]._id);
      } catch {
        toast.error("Failed to load notes");
      }
    };
    fetchNotes();
  }, []);

  const selectedNote = notes.find((n) => n._id === selectedId);

  // DELETE
  const handleDelete = async () => {
    if (!window.confirm("Delete note?")) return;

    try {
      await api.delete(`/notes/${selectedId}`);
      setNotes((prev) => prev.filter((n) => n._id !== selectedId));
      setSelectedId(null);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // SAVE
  const handleSave = async () => {
    const title = editNote.title.trim();
    const content = editNote.content.trim();

    if (!title || !content) {
      toast.error("Title & content required");
      return;
    }

    try {
      await api.put(`/notes/${selectedId}`, editNote);
      setNotes((prev) =>
        prev.map((n) =>
          n._id === selectedId ? { ...n, ...editNote } : n
        )
      );
      setIsEditing(false);
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  // CREATE
  const handleCreate = async () => {
    try {
      const res = await api.post("/notes", {
        title: "New Note",
        content: "Start writing...",
      });

      setNotes((prev) => [res.data, ...prev]);
      setSelectedId(res.data._id);
      setIsEditing(true);
      setEditNote(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Create failed");
    }
  };

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-[#0f1a14] text-[#c7d6c7] text-[15px]">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0c1410] border-r border-[#1f3326] flex flex-col">

        {/* Top Controls */}
        <div className="p-2 flex items-center gap-2">

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-7 h-7 rounded border border-[#1f3326] hover:bg-[#1b2e22]"
          >
            <ArrowLeft size={16} className="text-[#8fbf8f] hover:text-white" />
          </button>

          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="flex-1 bg-[#14241a] px-2 py-1 text-sm outline-none"
          />

          {/* CREATE */}
          <button
            onClick={handleCreate}
            className="bg-[#4ade80] p-1 flex items-center justify-center rounded"
          >
            <Plus size={14} className="text-black" />
          </button>
        </div>

        {/* NOTES LIST */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((note) => (
            <div
              key={note._id}
              onClick={() => {
                setSelectedId(note._id);
                setIsEditing(false);
              }}
              className={`p-3 cursor-pointer hover:bg-[#1b2e22] ${
                selectedId === note._id ? "bg-[#1b2e22]" : ""
              }`}
            >
              <p className="text-base font-medium truncate">
                {note.title}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 flex flex-col">

        {!selectedNote ? (
          <div className="flex-1 flex items-center justify-center">
            No note selected
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-[#1f3326]">

              {isEditing ? (
                <div className="flex flex-col gap-2 w-1/2">
                  <input
                    value={editNote.title}
                    onChange={(e) =>
                      setEditNote({ ...editNote, title: e.target.value })
                    }
                    placeholder="Title"
                    className="bg-transparent border-b border-[#4ade80] text-white outline-none text-lg"
                  />
                  <div className="flex gap-2">
                    <input
                      value={editNote.folder || ""}
                      onChange={(e) =>
                        setEditNote({ ...editNote, folder: e.target.value })
                      }
                      placeholder="Folder"
                      className="bg-transparent border-b border-[#1f3326] text-sm text-gray-400 outline-none w-1/2"
                    />
                    <input
                      value={editNote.tag || ""}
                      onChange={(e) =>
                        setEditNote({ ...editNote, tag: e.target.value })
                      }
                      placeholder="Tag"
                      className="bg-transparent border-b border-[#1f3326] text-sm text-gray-400 outline-none w-1/2"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-lg text-white font-semibold">
                    {selectedNote.title}
                  </h1>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase tracking-wider bg-[#1b2e22] text-[#4ade80] px-2 py-0.5 rounded">
                      {selectedNote.folder || "Uncategorized"}
                    </span>
                    {selectedNote.tag && (
                      <span className="text-[10px] uppercase tracking-wider bg-[#1f3326] text-gray-300 px-2 py-0.5 rounded">
                        {selectedNote.tag}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditNote(selectedNote);
                      }}
                    >
                      <Edit3 size={18} />
                    </button>

                    <button onClick={handleDelete}>
                      <Trash2
                        size={18}
                        className="text-red-500 hover:text-red-400"
                      />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSave}>
                      <Save size={18} />
                    </button>
                    <button onClick={() => setIsEditing(false)}>
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-5 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editNote.content}
                  onChange={(e) =>
                    setEditNote({ ...editNote, content: e.target.value })
                  }
                  className="w-full h-full bg-[#14241a] p-4 outline-none rounded text-base"
                />
              ) : (
                <p className="text-base whitespace-pre-line leading-relaxed">
                  {selectedNote.content}
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NoteDetailPage;