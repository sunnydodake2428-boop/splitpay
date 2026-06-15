import { useState, useRef } from 'react'
import { Camera, X, Loader, CheckCircle } from 'lucide-react'

interface BillScannerProps {
  onAmountDetected: (amount: string) => void
}

export default function BillScanner({ onAmountDetected }: BillScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setPreview(imageUrl)
    setScanning(true)
    setSuccess(false)
    setStatus('Uploading image...')

    try {
      const base64 = await fileToBase64(file)
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'

      setStatus('AI is reading your bill...')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 256,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: `Look at this restaurant bill image carefully.
Find the FINAL amount the customer must pay.
Rules:
- It is usually at the BOTTOM of the bill
- It is labeled "Total", "Grand Total", "Net Payable", "Amount Due" or just "Total"
- Do NOT return subtotal, food total, or any tax amount separately
- The final Total includes all taxes and is the largest bottom-most amount
- Return ONLY the number like 357 or 357.00, nothing else`,
                },
              ],
            },
          ],
        }),
      })

      setStatus('Extracting total amount...')

      const data = await response.json()
      const text = data?.content?.[0]?.text?.trim()

      if (text && /^\d+(\.\d{1,2})?$/.test(text)) {
        setStatus(`Detected: ₹${text}`)
        setSuccess(true)
        onAmountDetected(text)
      } else if (text) {
        const match = text.match(/\d+(?:\.\d{1,2})?/)
        if (match) {
          setStatus(`Detected: ₹${match[0]}`)
          setSuccess(true)
          onAmountDetected(match[0])
        } else {
          setStatus('Could not detect amount. Enter manually.')
        }
      } else {
        setStatus('Could not detect amount. Enter manually.')
      }
    } catch {
      setStatus('Scan failed. Please enter amount manually.')
    } finally {
      setScanning(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setStatus('')
    setSuccess(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-blue-700">AI Bill Scanner</p>
          <p className="text-xs text-blue-400">Powered by Claude AI</p>
        </div>
        {preview && (
          <button onClick={reset} className="text-blue-400">
            <X size={16} />
          </button>
        )}
      </div>

      {!preview ? (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 rounded-xl py-6 cursor-pointer text-blue-500 text-sm">
          <Camera size={20} />
          Upload bill photo
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
          <div className="relative">
            <img
              src={preview}
              alt="bill"
              className={`w-full rounded-xl max-h-48 object-cover ${scanning ? 'opacity-50' : ''}`}
            />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-xl px-4 py-2 text-xs text-blue-600 font-medium">
                  {status}
                </div>
              </div>
            )}
          </div>
          <div className={`flex items-center gap-2 text-sm ${success ? 'text-green-600' : 'text-blue-600'}`}>
            {scanning ? <Loader size={14} className="animate-spin" /> : success ? <CheckCircle size={14} /> : null}
            <span>{status}</span>
          </div>
          {success && (
            <button onClick={reset} className="w-full border border-blue-200 text-blue-600 rounded-xl py-2 text-sm">
              Scan another bill
            </button>
          )}
        </div>
      )}
    </div>
  )
}