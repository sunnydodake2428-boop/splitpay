import { useRef, useState } from 'react'
import { Download, Share2, CheckCircle, XCircle } from 'lucide-react'

interface Participant {
  id: number
  name: string
  custom: string
}

interface SplitReceiptProps {
  total: string
  grandTotal: number
  participants: Participant[]
  splitMode: string
  perPerson: number
  tip: string
  tipAmount: number
}

export default function SplitReceipt({ total, grandTotal, participants, splitMode, perPerson, tip, tipAmount }: SplitReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [paidStatus, setPaidStatus] = useState<Record<number, boolean>>({})

  const togglePaid = (id: number) => {
    setPaidStatus(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const downloadReceipt = async () => {
    const { default: html2canvas } = await import('html2canvas')
    if (!receiptRef.current) return
    const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' })
    const a = document.createElement('a')
    a.download = `splitpay-receipt-${Date.now()}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const shareReceipt = async () => {
    const { default: html2canvas } = await import('html2canvas')
    if (!receiptRef.current) return
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' })
      canvas.toBlob(async (blob) => {
        if (!blob) { downloadReceipt(); return }
        const file = new File([blob], 'splitpay-receipt.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'SplitPay Receipt' })
        } else {
          downloadReceipt()
        }
      })
    } catch {
      downloadReceipt()
    }
  }

  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="mt-6 mb-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Receipt</p>

      {/* Receipt Card */}
      <div ref={receiptRef} className="bg-white rounded-3xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-500 opacity-10 rounded-full" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white tracking-widest">SPLITPAY</h2>
            <p className="text-xs text-gray-400 mt-0.5">Developed by Sanmay</p>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
          </div>
        </div>

        {/* Notch separator */}
        <div className="relative h-4 bg-white">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
          <div className="mx-4 border-t-2 border-dashed border-gray-100 mt-3" />
        </div>

        <div className="px-6 pb-2">
          {/* Bill Details */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Bill Amount</span>
              <span className="text-gray-700 font-medium">₹{parseFloat(total || '0').toFixed(2)}</span>
            </div>
            {parseFloat(tip) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tip ({tip}%)</span>
                <span className="text-gray-700 font-medium">₹{tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-gray-200">
              <span className="text-gray-900">Grand Total</span>
              <span className="text-violet-600">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notch separator */}
        <div className="relative h-4 bg-white">
          <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
          <div className="absolute -right-3 top-0 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
          <div className="mx-4 border-t-2 border-dashed border-gray-100 mt-3" />
        </div>

        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Split Details</p>
          <div className="space-y-3">
            {participants.map((p, i) => {
              const amount = splitMode === 'equal'
                ? perPerson.toFixed(2)
                : parseFloat(p.custom || '0').toFixed(2)
              const isPaid = paidStatus[p.id] ?? false
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold border border-violet-100">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name || `Person ${i + 1}`}</p>
                      <p className="text-xs text-gray-400">₹{amount}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePaid(p.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-red-50 text-red-400 border-red-200'
                    }`}
                  >
                    {isPaid ? <><CheckCircle size={12} /> PAID</> : <><XCircle size={12} /> UNPAID</>}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 text-center border-t border-dashed border-gray-100">
          <p className="text-xs text-gray-400">Thank you for using SplitPay</p>
          <p className="text-xs text-violet-400 mt-0.5">splitpay-five.vercel.app</p>
        </div>
      </div>

      {/* Receipt Action Buttons — SEPARATE from share buttons */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={downloadReceipt}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-2xl py-3 text-sm font-medium"
        >
          <Download size={16} /> Download
        </button>
        <button
          onClick={shareReceipt}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-2xl py-3 text-sm font-medium"
        >
          <Share2 size={16} /> Share Receipt
        </button>
      </div>
    </div>
  )
}