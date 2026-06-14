import { motion } from 'framer-motion'
import { TrendingUp, Users, Receipt, Wallet } from 'lucide-react'

export default function Analytics() {
  const groups: { name: string }[] = JSON.parse(localStorage.getItem('splitpay_groups') || '[]')

  const totalExpenses = groups.reduce((sum, g) => {
    const expenses: { amount: number }[] = JSON.parse(localStorage.getItem(`splitpay_expenses_${g.name}`) || '[]')
    return sum + expenses.reduce((s, e) => s + e.amount, 0)
  }, 0)

  const totalMembers = groups.reduce((sum, g) => {
    const members: { id: number }[] = JSON.parse(localStorage.getItem(`splitpay_members_${g.name}`) || '[]')
    return sum + members.length
  }, 0)

  const stats = [
    { icon: Wallet, label: 'Total Spent', value: `₹${totalExpenses.toFixed(2)}`, color: 'bg-violet-100 text-violet-600' },
    { icon: Users, label: 'Total Members', value: totalMembers, color: 'bg-blue-100 text-blue-600' },
    { icon: Receipt, label: 'Total Groups', value: groups.length, color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Avg per Group', value: groups.length ? `₹${(totalExpenses / groups.length).toFixed(2)}` : '₹0', color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div className="p-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 mb-6"
      >
        Analytics
      </motion.h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Group Breakdown */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Group Breakdown</h3>
      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 text-sm">
          No data yet. Create groups and add expenses.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g, i) => {
            const expenses: { amount: number }[] = JSON.parse(localStorage.getItem(`splitpay_expenses_${g.name}`) || '[]')
            const total = expenses.reduce((s, e) => s + e.amount, 0)
            const percent = totalExpenses ? (total / totalExpenses) * 100 : 0
            return (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium text-gray-800">{g.name}</p>
                  <p className="text-sm font-semibold text-gray-700">₹{total.toFixed(2)}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{percent.toFixed(0)}% of total spending</p>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}