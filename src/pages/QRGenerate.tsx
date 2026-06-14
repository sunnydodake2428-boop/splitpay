import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { Share2, MessageCircle, Copy, Download, Calculator } from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'

export default function QRGenerate() {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [upiId, setUpiId] = useState(() => localStorage.getItem('splitpay_upi') || '')
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [totalBill, setTotalBill] = useState('')
  const [numPeople, setNumPeople] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  const upiLink = `upi://pay?pa=${upiId}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`

  const handleGenerate = () => { if (!upiId || !amount) return; setGenerated(true) }
  const applyCalc = () => {
    if (!totalBill || !numPeople) return
    setAmount((parseFloat(totalBill) / parseFloat(numPeople)).toFixed(2))
    setShowCalc(false); setGenerated(false)
  }
  const copyLink = () => { navigator.clipboard.writeText(upiLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const shareWhatsApp = () => {
    const message = `*Payment Request*\n\nAmount: *₹${amount}*\nFor: ${note || 'Split Payment'}\n\nPay directly via UPI:\n${upiLink}\n\nScan QR or click the link to pay instantly on GPay, PhonePe or Paytm`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }
  const shareNative = () => { if (navigator.share) navigator.share({ title: `Pay ₹${amount} via UPI`, text: `Payment Request\nAmount: ₹${amount}\nFor: ${note || 'Split Payment'}\n\nPay via UPI: ${upiLink}` }); else copyLink() }
  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 300; canvas.height = 300
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => { ctx?.drawImage(img, 0, 0, 300, 300); const a = document.createElement('a'); a.download = `splitpay-qr-₹${amount}.png`; a.href = canvas.toDataURL('image/png'); a.click() }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div>
      <PageHeader title="Generate QR" subtitle="Request payment" />
      <div className="p-4">
        <button onClick={() => setShowCalc(!showCalc)} className="w-full flex items-center justify-center gap-2 border border-violet-300 text-violet-600 rounded-xl py-3 text-sm font-medium mb-4">
          <Calculator size={16} /> {showCalc ? 'Hide Calculator' : 'Quick Split Calculator'}
        </button>

        {showCalc && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-4 space-y-3">
            <p className="text-sm font-medium text-violet-700">Split the bill equally</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-violet-500 mb-1 block">Total Bill (₹)</label>
                <input type="number" placeholder="e.g. 60" value={totalBill} onChange={e => setTotalBill(e.target.value)} className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm outline-none bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-violet-500 mb-1 block">No. of People</label>
                <input type="number" placeholder="e.g. 4" value={numPeople} onChange={e => setNumPeople(e.target.value)} className="w-full border border-violet-200 rounded-xl px-3 py-2 text-sm outline-none bg-white" />
              </div>
            </div>
            {totalBill && numPeople && (
              <div className="bg-white rounded-xl p-3 text-center border border-violet-200">
                <p className="text-xs text-violet-500">Each person pays</p>
                <p className="text-2xl font-bold text-violet-600">₹{(parseFloat(totalBill) / parseFloat(numPeople)).toFixed(2)}</p>
              </div>
            )}
            <button onClick={applyCalc} className="w-full bg-violet-600 text-white rounded-xl py-2 text-sm font-medium">Use this amount for QR</button>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4 mb-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Your UPI ID</label>
            <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Amount (₹)</label>
            <input type="number" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); setGenerated(false) }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Note (optional)</label>
            <input type="text" placeholder="Dinner split, Movie tickets..." value={note} onChange={e => setNote(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400" />
          </div>
          <button onClick={handleGenerate} className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold text-sm">Generate QR Code</button>
        </div>

        {generated && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Scan to pay ₹{amount}</p>
            <div ref={qrRef} className="p-3 bg-white rounded-xl border border-gray-100"><QRCode value={upiLink} size={200} /></div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button onClick={shareWhatsApp} className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 text-sm font-medium"><MessageCircle size={16} /> WhatsApp</button>
              <button onClick={shareNative} className="flex items-center justify-center gap-2 bg-violet-600 text-white rounded-xl py-3 text-sm font-medium"><Share2 size={16} /> Share</button>
              <button onClick={copyLink} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium"><Copy size={16} /> {copied ? 'Copied!' : 'Copy Link'}</button>
              <button onClick={downloadQR} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium"><Download size={16} /> Download QR</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}