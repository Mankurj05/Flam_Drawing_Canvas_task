import React from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { Sun, Moon, Sparkles, Shield, ArrowRight, Zap, Users } from 'lucide-react'

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useUIStore()

  return (
    <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] text-text-light dark:text-text-dark transition-colors duration-200">
      {/* Navbar */}
      <header className="glass fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2 font-bold text-lg text-heading-light dark:text-heading-dark">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-black">
            C
          </div>
          CollaborateCanvas
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/features" className="hover:text-brand-primary transition-colors">Features</Link>
          <Link to="/about" className="hover:text-brand-primary transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
          <Link 
            to="/create" 
            className="bg-brand-primary text-white px-4 h-10 rounded-lg flex items-center justify-center font-medium shadow-lg shadow-brand-primary-light hover:brightness-110 transition-all text-sm"
          >
            Start Drawing
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-light border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Introducing Real-Time Vector Engine
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-heading-light dark:text-heading-dark max-w-4xl leading-tight">
          Where Teams Sketch, Model, and Collaborate in Real-Time
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl">
          An ultra-fast, production-ready vector drawing environment with 60 FPS performance, offline undo/redo, and seamless WebSocket synchronization.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none">
          <Link 
            to="/create" 
            className="bg-brand-primary text-white px-8 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-brand-primary-light hover:brightness-110 transition-all gap-2"
          >
            Create Workspace <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/join" 
            className="border border-border-light dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5 px-8 h-12 rounded-xl flex items-center justify-center font-semibold transition-all"
          >
            Join Room
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 w-full">
          <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-left">
            <Zap className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="font-bold text-lg text-heading-light dark:text-heading-dark">60 FPS Canvas Engine</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Batched canvas operations separated from the React render cycles to maintain fluid interactive speeds.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-left">
            <Users className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="font-bold text-lg text-heading-light dark:text-heading-dark">Seamless Collaboration</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Synchronize state instantly with custom room layouts, presence controls, and remote cursors.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-left">
            <Shield className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="font-bold text-lg text-heading-light dark:text-heading-dark">Production Ready</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Full offline compatibility, standard vector exporting (SVG, PNG, JSON), and detailed history operations.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
