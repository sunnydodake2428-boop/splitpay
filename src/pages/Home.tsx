import { motion, type Variants } from 'framer-motion'
import { Plus, Users, QrCode, BarChart2, ArrowRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const actions = [
  { icon: Plus, label: 'New Split', color: 'bg-violet-50 text-violet-600', path: '/split' },
  { icon: Users, label: 'Groups', color: 'bg-slate-50 text-slate-600', path: '/groups' },
  { icon: QrCode, label: 'QR Pay', color: 'bg-emerald-50 text-emerald-600', path: '/qr' },
  { icon: BarChart2, label: 'Analytics', color: 'bg-amber-50 text-amber-600', path: '/analytics' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

import { type Variants } from 'framer-motion'


const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useUser()

  const groups: { name: string }[] = JSON.parse(localStorage.getItem('splitpay_groups') || '[]')

  const totalExpenses = groups.reduce((sum, g) => {
    const expenses: { amount: number }[] = JSON.parse(localStorage.getItem(`splitpay_expenses_${g.name}`) || '[]')
    return sum + expenses.reduce((s, e) => s + e.amount, 0)
  }, 0)

  const recentGroups = groups.slice(-2).reverse()

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white px-5 pt-8 pb-5 border-b border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-medium tracking-wide uppercase">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{user?.firstName ?? 'Welcome'}</h1>
          </div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className="cursor-pointer"
          >
            <img
              src={localStorage.getItem('splitpay_avatar') || user?.imageUrl}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-100"
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="p-5 space-y-6">
        {/* Balance Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="relative bg-gray-900 rounded-3xl p-6 text-white overflow-hidden cursor-pointer"
          onClick={() => navigate('/analytics')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500 opacity-10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500 opacity-10 rounded-full" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-violet-400" />
              <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Total Spent</span>
            </div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
              className="text-4xl font-bold tracking-tight mb-5"
            >
              ₹{totalExpenses.toFixed(2)}
            </motion.h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <span className="text-xs text-gray-300">{groups.length} active groups</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                View analytics <ArrowRight size={11} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
          <div className="grid grid-cols-4 gap-3">
            {actions.map(({ icon: Icon, label, color, path }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm ${color}`}>
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Groups */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent Groups</p>
            <button
              onClick={() => navigate('/groups')}
              className="text-xs text-violet-500 font-medium flex items-center gap-1"
            >
              See all <ArrowRight size={11} />
            </button>
          </div>

          {recentGroups.length === 0 ? (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/groups')}
              className="bg-white rounded-2xl p-6 border border-dashed border-gray-200 text-center cursor-pointer"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-400 font-medium">No groups yet</p>
              <p className="text-xs text-violet-500 mt-1">Create your first group</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {recentGroups.map((g, i) => {
                const expenses: { amount: number }[] = JSON.parse(localStorage.getItem(`splitpay_expenses_${g.name}`) || '[]')
                const members: { id: number }[] = JSON.parse(localStorage.getItem(`splitpay_members_${g.name}`) || '[]')
                const total = expenses.reduce((s, e) => s + e.amount, 0)
                return (
                  <motion.div
                    key={g.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/groups/${g.name}`)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                        <Users size={16} className="text-violet-500" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                        <p className="text-xs text-gray-400">{members.length} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">₹{total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">total spent</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.button
          variants={itemVariants}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/split')}
          className="w-full bg-gray-900 text-white rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2 tracking-wide"
        >
          <Plus size={16} strokeWidth={2.5} />
          Start a New Split
        </motion.button>
      </div>
    </motion.div>
  )
}