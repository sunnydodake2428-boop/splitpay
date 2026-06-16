import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, MessageCircle, Share2, Download } from 'lucide-react'
import { exportSplitPDF } from '@/utils/exportPDF'
import BillScanner from '@/components/shared/BillScanner'
import PageHeader from '@/components/layout/PageHeader'
import SplitReceipt from '@/components/shared/SplitReceipt'
interface Participant { id: number; name: string; custom: string }
type SplitMode = 'equal' | 'unequal'

export default function Split() {
  const [total, setTotal] = useState('')
  const [tip, setTip] = useState('0')
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [count, setCount] = useState<number | null>(null)
  const [countInput, setCountInput] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])

  const tipAmount = (parseFloat(total || '0') * parseFloat(tip || '0')) / 100
  const grandTotal = parseFloat(total || '0') + tipAmount
  const perPerson = participants.length ? grandTotal / participants.length : 0

  const handleSetCount = () => {
    const n = parseInt(countInput)
    if (!n || n < 2) return
    setCount(n)
    setParticipants(
      Array.from({ length: n }, (_, i) => ({ id: i + 1, name: '', custom: '' }))
    )
  }

  const updateName = (id: number, name: string) =>
    setParticipants(p => p.map(x => x.id === id ? { ...x, name } : x))

  const updateCustom = (id: number, custom: string) =>
    setParticipants(p => p.map(x => x.id === id ? { ...x, custom } : x))

  const resetCount = () => {
    setCount(null)
    setCountInput('')
    setParticipants([])
  }

const shareWhatsApp = () => {
  if (!total || !count) return
  const upiId = localStorage.getItem('splitpay_upi') || ''

  if (splitMode === 'equal') {
    const amount = perPerson.toFixed(2)
    let message = `*SplitPay Summary*\nTotal: Rs.${grandTotal.toFixed(2)}\nEach person pays: *Rs.${amount}*\n\n`
    participants.forEach(p => {
      const name = p.name || `Person ${p.id}`
      const link = upiId ? `upi://pay?pa=${upiId}&am=${amount}&tn=SplitPay&cu=INR` : ''
      message += `*${name}* — Rs.${amount}\n${link ? `Pay: ${link}\n` : ''}\n`
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  } else {
    let message = `*SplitPay Summary*\nTotal: Rs.${grandTotal.toFixed(2)}\n\n`
    participants.forEach(p => {
      const name = p.name || `Person ${p.id}`
      const amount = parseFloat(p.custom || '0').toFixed(2)
      const link = upiId ? `upi://pay?pa=${upiId}&am=${amount}&tn=SplitPay&cu=INR` : ''
      message += `*${name}* — Rs.${amount}\n${link ? `Pay: ${link}\n` : ''}\n`
    })
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }
}

  const shareNative = () => {
    if (navigator.share) navigator.share({ title: 'Split Summary', text: `Total: ₹${grandTotal.toFixed(2)} | Per person: ₹${perPerson.toFixed(2)}` })
  }

  const handleExportPDF = () => exportSplitPDF({ total, tip, tipAmount, grandTotal, splitMode, perPerson, participants, note: '' })

  const unequalTotal = participants.reduce((s, p) => s + parseFloat(p.custom || '0'), 0)
  const unequalDiff = grandTotal - unequalTotal

  return (
    <div>
      <PageHeader title="New Split" subtitle="Split a bill" />
      <div className="p-4">

        <BillScanner onAmountDetected={(amt: string) => setTotal(amt)} />

        {/* Bill Amount */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Total Bill Amount (₹)</label>
            <input
              type="number"
              placeholder="0.00"
              value={total}
              onChange={e => setTotal(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400"
            />
          </div>

          {/* Tip */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Add Tip</label>
            <div className="flex gap-2">
              {['0', '5', '10', '15', '18'].map(t => (
                <button key={t} onClick={() => setTip(t)} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${tip === t ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-500'}`}>
                  {t === '0' ? 'No tip' : `${t}%`}
                </button>
              ))}
            </div>
            {parseFloat(tip) > 0 && total && <p className="text-xs text-violet-500 mt-2">Tip: ₹{tipAmount.toFixed(2)} → Grand Total: ₹{grandTotal.toFixed(2)}</p>}
          </div>

          {/* Split Type */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Split Type</label>
            <div className="flex gap-2">
              <button onClick={() => setSplitMode('equal')} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${splitMode === 'equal' ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-500'}`}>Equal Split</button>
              <button onClick={() => setSplitMode('unequal')} className={`flex-1 py-2 rounded-xl text-sm font-medium border ${splitMode === 'unequal' ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-500'}`}>Custom Split</button>
            </div>
          </div>
        </div>

        {/* Step 1 — How many people */}
        {!count ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">How many people are splitting? 👥</p>
            <div className="flex gap-2 mb-3">
              {[2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  onClick={() => { setCountInput(String(n)); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border ${countInput === String(n) ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 text-gray-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Or enter custom number"
                value={countInput}
                onChange={e => setCountInput(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400"
              />
              <button
                onClick={handleSetCount}
                className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          /* Step 2 — Fill names */
          <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Enter names ({count} people)</p>
              <button onClick={resetCount} className="text-xs text-violet-500">Change count</button>
            </div>
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    placeholder={`Person ${i + 1} name`}
                    value={p.name}
                    onChange={e => updateName(p.id, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-violet-400"
                  />
                  {splitMode === 'unequal' && (
                    <input
                      type="number"
                      placeholder="₹"
                      value={p.custom}
                      onChange={e => updateCustom(p.id, e.target.value)}
                      className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unequal warning */}
        {splitMode === 'unequal' && total && count && Math.abs(unequalDiff) > 0.01 && (
          <div className={`rounded-xl px-4 py-2 text-sm mb-4 ${unequalDiff > 0 ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
            {unequalDiff > 0 ? `₹${unequalDiff.toFixed(2)} still unassigned` : `₹${Math.abs(unequalDiff).toFixed(2)} over the total`}
          </div>
        )}

        {/* Result */}
        {total && count && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-5 text-white mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-500 opacity-10 rounded-full" />
            <div className="relative">
              {splitMode === 'equal' ? (
                <>
                  <p className="text-gray-400 text-sm mb-1">Each person pays</p>
                  <h2 className="text-4xl font-bold">₹{perPerson.toFixed(2)}</h2>
                  <p className="text-gray-400 text-sm mt-2">₹{grandTotal.toFixed(2)} ÷ {count} people</p>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-2">Custom Split</p>
                  {participants.map(p => (
                    <div key={p.id} className="flex justify-between text-sm py-1">
                      <span>{p.name || `Person ${p.id}`}</span>
                      <span className="font-semibold">₹{parseFloat(p.custom || '0').toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
        {total && count && (
  <SplitReceipt
    total={total}
    grandTotal={grandTotal}
    participants={participants}
    splitMode={splitMode}
    perPerson={perPerson}
    tip={tip}
    tipAmount={tipAmount}
  />
)}

        {/* Share buttons */}
        {total && count && (
          <div className="flex gap-3">
            <button onClick={shareWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 text-sm font-medium"><MessageCircle size={16} /> WhatsApp</button>
            <button onClick={shareNative} className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white rounded-xl py-3 text-sm font-medium"><Share2 size={16} /> Share</button>
            <button onClick={handleExportPDF} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium"><Download size={16} /> PDF</button>
          </div>
        )}
      </div>
    </div>
  )
}