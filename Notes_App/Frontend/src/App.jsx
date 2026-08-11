import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import NoteDetailPage from './pages/NoteDetailPage'

const App = () => {
  return (
    <div className='min-h-screen w-full text-white'>
      
      {/* 2. The Background Layer */}
      <div className='fixed inset-0 -z-10 h-full w-full bg-black'>
        <div className='absolute bottom-0 left-0 right-0 h-[500px] w-full [background:radial-gradient(circle_at_50%_120%,#00FF9D60_0%,transparent_70%)]' />
      </div>

      {/* 3. Your Content Layer */}
      <main className='relative z-10'>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/note/:id" element={<NoteDetailPage />} />
        </Routes>
      </main>

    </div>
  )
}

export default App