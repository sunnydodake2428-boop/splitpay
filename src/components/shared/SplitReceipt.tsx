import { useRef } from 'react'
import { Download, Share2 } from 'lucide-react'

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
    const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'splitpay-receipt.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'SplitPay Receipt' })
      } else {
        downloadReceipt()
      }
    })
  }

  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="mt-4">
      {/* Receipt */}
      <div ref={receiptRef} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-transparent" />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-500 opacity-10 rounded-full" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white tracking-widest">SPLITPAY</h2>
            <p className="text-xs text-gray-400 mt-0.5">Developed by Sanmay</p>
            <p className="text-xs text-gray-500 mt-2">{date}</p>
          </div>
        </div>

        {/* Dotted separator */}
        <div className="flex items-center px-4">
          <div className="w-5 h-5 bg-gray-50 rounded-full -ml-2.5 border border-gray-100" />
          <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
          <div className="w-5 h-5 bg-gray-50 rounded-full -mr-2.5 border border-gray-100" />
        </div>

        <div className="px-6 py-4">
          {/* Bill Details */}
          <div className="space-y-2 mb-4">
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

          {/* Dotted separator */}
          <div className="flex items-center mb-4">
            <div className="w-4 h-4 bg-gray-50 rounded-full -ml-8 border border-gray-100" />
            <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
            <div className="w-4 h-4 bg-gray-50 rounded-full -mr-8 border border-gray-100" />
          </div>

          {/* Participants */}
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Split Details</p>
          <div className="space-y-3">
            {participants.map((p, i) => {
              const amount = splitMode === 'equal'
                ? perPerson.toFixed(2)
                : parseFloat(p.custom || '0').toFixed(2)
              return (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-50 rounded-full flex items-center justify-center text-violet-600 text-xs font-bold border border-violet-100">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{p.name || `Person ${i + 1}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">₹{amount}</span>
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">✓ PAID</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dotted separator */}
        <div className="flex items-center px-4">
          <div className="w-5 h-5 bg-gray-50 rounded-full -ml-2.5 border border-gray-100" />
          <div className="flex-1 border-t-2 border-dashed border-gray-100 mx-1" />
          <div className="w-5 h-5 bg-gray-50 rounded-full -mr-2.5 border border-gray-100" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <p className="text-xs text-gray-400">Thank you for using SplitPay</p>
          <p className="text-xs text-violet-400 mt-0.5">splitpay-five.vercel.app</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
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