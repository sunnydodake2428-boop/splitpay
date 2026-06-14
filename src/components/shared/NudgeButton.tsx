import { MessageCircle } from 'lucide-react'

interface NudgeButtonProps {
  name: string
  amount: number
  upiId?: string
}

export default function NudgeButton({ name, amount, upiId }: NudgeButtonProps) {
  const upiLink = upiId ? `upi://pay?pa=${upiId}&am=${amount}&tn=SplitPay&cu=INR` : ''

  const sendNudge = () => {
    const message = `Hey ${name}! 👋\n\nJust a friendly reminder that you owe *₹${amount.toFixed(2)}* for a recent split on SplitPay.\n\n${upiLink ? `Pay directly here: ${upiLink}\n\n` : ''}Please settle when you get a chance! 🙏`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <button
      onClick={sendNudge}
      className="flex items-center gap-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded-lg px-2 py-1"
    >
      <MessageCircle size={12} /> Nudge
    </button>
  )
}