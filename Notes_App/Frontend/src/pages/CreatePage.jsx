import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../lib/axios";

const CreatePage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");
  const [folder, setFolder] = useState("Uncategorized");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch notes for sidebar
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
      } catch {
        toast.error("Failed to load notes");
      }
    };
    fetchNotes();
  }, []);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/notes", { title, content, tag, folder });
      toast.success("Note created successfully!");
      navigate("/");
    } catch (error) {
      console.log("Error creating Note", error);

      if (error.response?.status === 429) {
        toast.error("Geez! Slow down there", {
          duration: 4000,
          icon: "👽",
        });
      } else {
        toast.error("Failed to create note!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0f1a14] text-[#c7d6c7] text-[15px]">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0c1410] border-r border-[#1f3326] flex flex-col">

        {/* Top Controls */}
        <div className="p-2 flex items-center gap-2">

          {/* BACK */}
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

          {/* CREATE ICON (disabled here since already on create page) */}
          <button
            disabled
            className="bg-[#4ade80] p-1 flex items-center justify-center rounded opacity-50"
          >
            <Plus size={14} className="text-black" />
          </button>
        </div>

        {/* NOTES LIST */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate(`/note/${note._id}`)}
              className="p-3 cursor-pointer hover:bg-[#1b2e22]"
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

        {/* HEADER */}
        <div className="p-4 border-b border-[#1f3326]">
          <h1 className="text-lg font-semibold text-white">
            Create New Note
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 p-5 flex flex-col gap-4"
        >
          {/* TITLE */}
          <input
            type="text"
            placeholder="Note Title"
            className="bg-[#14241a] p-3 rounded outline-none text-base"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* FOLDER & TAG */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Folder (e.g. Programming fundamentals)"
              className="flex-1 bg-[#14241a] p-3 rounded outline-none text-base"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
            <input
              type="text"
              placeholder="Tag (e.g. Math, Physics)"
              className="flex-1 bg-[#14241a] p-3 rounded outline-none text-base"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>

          {/* CONTENT */}
          <textarea
            placeholder="Write your note here..."
            className="flex-1 bg-[#14241a] p-4 rounded outline-none text-base"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />


          {/* ACTION */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#4ade80] text-black px-4 py-2 rounded font-medium hover:opacity-90"
            >
              {loading ? "Creating..." : "Create Note"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreatePage;