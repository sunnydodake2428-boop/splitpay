import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean
}

export default function PageHeader({ title, subtitle, back }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gray-900 px-5 pt-8 pb-6 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500 opacity-10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500 opacity-10 rounded-full" />

      <div className="relative flex items-center gap-3">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          {subtitle && <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-0.5">{subtitle}</p>}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      </div>
    </motion.div>
  )
}