import { useState, useRef } from 'react'
import { Camera, X, Loader } from 'lucide-react'
import { createWorker } from 'tesseract.js'

interface BillScannerProps {
  onAmountDetected: (amount: string) => void
}

export default function BillScanner({ onAmountDetected }: BillScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const extractAmount = (text: string): string | null => {
    const patterns = [
      /total[:\s]+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
      /grand\s*total[:\s]+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
      /amount[:\s]+(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d{1,2})?)/i,
      /(?:rs\.?|inr|₹)\s*(\d+(?:\.\d{1,2})?)/i,
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setPreview(imageUrl)
    setScanning(true)
    setStatus('Reading bill...')

    try {
      const worker = await createWorker('eng')
      setStatus('Detecting amount...')
      const { data: { text } } = await worker.recognize(imageUrl)
      await worker.terminate()

      const amount = extractAmount(text)
      if (amount) {
        setStatus(`Found: ₹${amount}`)
        onAmountDetected(amount)
      } else {
        setStatus('Could not detect amount. Enter manually.')
      }
    } catch {
      setStatus('Scan failed. Enter amount manually.')
    } finally {
      setScanning(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setStatus('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-blue-700">📷 Scan Bill</p>
        {preview && (
          <button onClick={reset} className="text-blue-400">
            <X size={16} />
          </button>
        )}
      </div>

      {!preview ? (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 rounded-xl py-6 cursor-pointer text-blue-500 text-sm">
          <Camera size={20} />
          Take photo or upload bill
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleScan}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <img src={preview} alt="bill" className="w-full rounded-xl max-h-48 object-cover" />
          <div className="flex items-center gap-2 text-sm text-blue-600">
            {scanning && <Loader size={14} className="animate-spin" />}
            <span>{status}</span>
          </div>
        </div>
      )}
    </div>
  )
}