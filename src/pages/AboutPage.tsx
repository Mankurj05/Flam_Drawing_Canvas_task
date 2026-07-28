import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] text-text-light dark:text-text-dark p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-primary font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-black text-heading-light dark:text-heading-dark mb-6">About CollaborateCanvas</h1>
        <p className="text-lg mb-6 leading-relaxed">
          CollaborateCanvas is a high-performance, real-time collaborative workspace designed to illustrate, draw, and brainstorm designs with team members instantly.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-400">
          Built with React 19, TypeScript, Tailwind CSS, Zustand, and Socket.IO. We decoupling the drawing canvas rendering pipeline from React to sustain high rendering throughput and minimum latency under heavy workloads.
        </p>
      </div>
    </div>
  )
}
