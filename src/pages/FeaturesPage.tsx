import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-[#0f1015] text-text-light dark:text-text-dark p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-primary font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-black text-heading-light dark:text-heading-dark mb-6">Engine Features</h1>
        <ul className="space-y-4">
          <li className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark">
            <h3 className="font-bold text-heading-light dark:text-heading-dark">Interactive Vector Elements</h3>
            <p className="text-sm text-gray-500 mt-1">Draw rectangles, circles, arrows, freeform pencils, and text nodes with ease.</p>
          </li>
          <li className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark">
            <h3 className="font-bold text-heading-light dark:text-heading-dark">Precise Transformation Controls</h3>
            <p className="text-sm text-gray-500 mt-1">Scale, rotate, translate, and re-order elements in depth hierarchy.</p>
          </li>
          <li className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-card-dark">
            <h3 className="font-bold text-heading-light dark:text-heading-dark">History Management</h3>
            <p className="text-sm text-gray-500 mt-1">Linear undo and redo history for complex geometric transformations.</p>
          </li>
        </ul>
      </div>
    </div>
  )
}
