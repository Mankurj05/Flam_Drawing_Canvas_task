import React from 'react'
import { Link } from 'react-router-dom'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-8xl font-black text-brand-primary">404</h1>
      <h2 className="text-2xl font-bold text-heading-light dark:text-heading-dark mt-4">Canvas Not Found</h2>
      <p className="text-gray-500 mt-2 max-w-sm">
        The workspace you are looking for might have been archived, deleted, or the URL is incorrect.
      </p>
      <Link to="/" className="mt-8 bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-brand-primary-light hover:brightness-110 transition-all">
        Back to Safety
      </Link>
    </div>
  )
}
