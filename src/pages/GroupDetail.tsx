
import { motion } from 'framer-motion'
import { Plus, Receipt } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import NudgeButton from '@/components/shared/NudgeButton'
import PageHeader from '@/components/layout/PageHeader'

interface Member { id: number; name: string }
interface Expense { id: number; title: string; amount: number; paidBy: string; perPerson: number; participants: string[] }

export default function GroupDetail() {
  const { name } = useParams()
  const navigate = useNavigate()

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`splitpay_members_${name}`)
    return saved ? JSON.parse(saved) : []
  })
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`splitpay_expenses_${name}`)
    return saved ? JSON.parse(saved) : []
  })
  const [memberName, setMemberName] = useState('')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')

  const addMember = () => {
    if (!memberName.trim()) return
    const newMember = { id: Date.now(), name: memberName }
    const updated = [...members, newMember]
    setMembers(updated)
    localStorage.setItem(`splitpay_members_${name}`, JSON.stringify(updated))
    setMemberName('')
  }

  const addExpense = () => {
    if (!expenseTitle || !expenseAmount || !paidBy) return
    const amount = parseFloat(expenseAmount)
    const perPerson = amount / members.length
    const newExpense: Expense = { id: Date.now(), title: expenseTitle, amount, paidBy, perPerson, participants: members.map(m => m.name) }
    const updated = [...expenses, newExpense]
    setExpenses(updated)
    localStorage.setItem(`splitpay_expenses_${name}`, JSON.stringify(updated))
    setExpenseTitle(''); setExpenseAmount(''); setPaidBy(''); setShowExpenseForm(false)
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <PageHeader
        title={decodeURIComponent(name ?? '')}
        subtitle={`${members.length} members · ₹${totalSpent.toFixed(2)} spent`}
        back
      />
      <div className="p-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Add Member</p>
          <div className="flex gap-2">
            <input type="text" placeholder="Member name" value={memberName} onChange={e => setMemberName(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400" />
            <button onClick={addMember} className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-1"><Plus size={16} /> Add</button>
          </div>
          {members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {members.map(m => <span key={m.id} className="bg-violet-100 text-violet-600 text-xs px-3 py-1 rounded-full">{m.name}</span>)}
            </div>
          )}
        </div>

        {members.length >= 2 && (
          <button onClick={() => setShowExpenseForm(true)} className="w-full bg-violet-600 text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mb-4">
            <Plus size={16} /> Add Expense
          </button>
        )}

        {showExpenseForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">New Expense</p>
            <input type="text" placeholder="What was it for?" value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400" />
            <input type="number" placeholder="Amount (₹)" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400" />
            <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400">
              <option value="">Who paid?</option>
              {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={addExpense} className="flex-1 bg-violet-600 text-white rounded-xl py-2 text-sm font-medium">Add</button>
              <button onClick={() => setShowExpenseForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-500">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Expenses ({expenses.length})</p>
          {expenses.length === 0 ? (
            <div className="text-center py-4">
              <Receipt size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No expenses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.title}</p>
                    <p className="text-xs text-gray-400">Paid by {e.paidBy} · ₹{e.perPerson.toFixed(2)}/person</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">₹{e.amount}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {expenses.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Who owes what</p>
            {members.map(m => {
              const totalPaid = expenses.filter(e => e.paidBy === m.name).reduce((sum, e) => sum + e.amount, 0)
              const totalOwed = expenses.reduce((sum, e) => sum + e.perPerson, 0)
              const balance = totalPaid - totalOwed
              return (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-700">{m.name}</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {balance >= 0 ? `gets back ₹${balance.toFixed(2)}` : `owes ₹${Math.abs(balance).toFixed(2)}`}
                    </p>
                    {balance < 0 && <NudgeButton name={m.name} amount={Math.abs(balance)} upiId={localStorage.getItem('splitpay_upi') || ''} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}