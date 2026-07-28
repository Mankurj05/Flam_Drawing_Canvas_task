import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LandingPage } from '@/pages/LandingPage'
import { AboutPage } from '@/pages/AboutPage'
import { FeaturesPage } from '@/pages/FeaturesPage'
import { RoomPage } from '@/pages/RoomPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useUIStore } from '@/store/uiStore'

const App: React.FC = () => {
  // Initialize dark mode class on mount based on store
  const theme = useUIStore((state) => state.theme)
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] text-text-light dark:text-text-dark selection:bg-brand-primary/20">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/create" element={<RoomPage />} />
          <Route path="/join" element={<RoomPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            className: 'glass border border-border-light dark:border-border-dark dark:text-white dark:bg-card-dark text-sm rounded-xl px-4 py-3',
            duration: 4000,
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
