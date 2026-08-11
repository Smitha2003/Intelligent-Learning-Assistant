import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import RateLimitedUI from '../components/RateLimitedUI'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import NoteCard from '../components/NoteCard'
import NotesNotFound from '../components/NotesNotFound'

const HomePage = () => {
  const [isRatelimited, setIsRateLimited] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState("All")

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes")
        console.log(res.data)

        setNotes(res.data)
        setIsRateLimited(false)
      } catch (error) {
        console.log("Error fetching notes.", error)

        if (error.response?.status === 429) {
          setIsRateLimited(true)
        } else {
          toast.error("Failed to load notes.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

  return (
    <div className='min-h-screen'>
      <Navbar />

      {isRatelimited && <RateLimitedUI />}

      <div className='max-w-7xl mx-auto p-4 mt-6'>
        {loading && <div className='text-center text-primary py-10'>Loading Notes...</div>}

        {notes.length === 0 && !isRatelimited && <NotesNotFound />}

        {notes.length > 0 && !isRatelimited && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["All", ...new Set(notes.map(n => n.folder || "Uncategorized"))].map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFolder === folder
                      ? "bg-[#4ade80] text-black"
                      : "bg-[#14241a] text-gray-300 hover:bg-[#1b2e22]"
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {(activeFolder === "All" ? notes : notes.filter(n => (n.folder || "Uncategorized") === activeFolder)).map((note) => (
                <div key={note._id || note.id}>
                  <NoteCard key={note._id} note={note} setNotes={setNotes} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage