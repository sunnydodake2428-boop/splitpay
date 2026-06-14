import { motion } from 'framer-motion'
import { Wallet, Trash2, LogOut, Camera } from 'lucide-react'
import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import PageHeader from '@/components/layout/PageHeader'

export default function Profile() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [customAvatar, setCustomAvatar] = useState(() => localStorage.getItem('splitpay_avatar') || '')
  const [upiId, setUpiId] = useState(() => localStorage.getItem('splitpay_upi') || '')
  const [saved, setSaved] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { const result = reader.result as string; setCustomAvatar(result); localStorage.setItem('splitpay_avatar', result) }
    reader.readAsDataURL(file)
  }

  const saveUpi = () => { localStorage.setItem('splitpay_upi', upiId); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const clearData = () => { if (confirm('Clear all data? This cannot be undone.')) { localStorage.clear(); window.location.reload() } }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account" />
      <div className="p-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-6 mt-2">
          <div className="relative">
            <img src={customAvatar || user?.imageUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md" />
            <label className="absolute bottom-0 right-0 bg-violet-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow">
              <Camera size={12} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mt-3">{user?.fullName}</h2>
          <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
        </motion.div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4 mb-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Your UPI ID</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2 focus-within:border-violet-400">
              <Wallet size={16} className="text-gray-400" />
              <input type="text" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} className="flex-1 text-sm outline-none" />
            </div>
          </div>
          <button onClick={saveUpi} className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold text-sm">
            {saved ? 'Saved!' : 'Save UPI ID'}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <button onClick={() => signOut()} className="w-full border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-red-100">
          <p className="text-sm font-medium text-red-500 mb-3">Danger Zone</p>
          <button onClick={clearData} className="w-full border border-red-200 text-red-500 rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2">
            <Trash2 size={16} /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  )
}