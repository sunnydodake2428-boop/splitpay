import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users, Trash2, Pencil, X, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/layout/PageHeader'

interface Group {
  id: number
  name: string
  members: number
  total: number
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('splitpay_groups')
    return saved ? JSON.parse(saved) : []
  })
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const navigate = useNavigate()

  const saveGroups = (updated: Group[]) => {
    setGroups(updated)
    localStorage.setItem('splitpay_groups', JSON.stringify(updated))
  }

  const createGroup = () => {
    if (!groupName.trim()) return
    const newGroup = { id: Date.now(), name: groupName, members: 1, total: 0 }
    saveGroups([...groups, newGroup])
    setGroupName('')
    setShowForm(false)
  }

  const deleteGroup = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all its data.`)) return
    localStorage.removeItem(`splitpay_members_${name}`)
    localStorage.removeItem(`splitpay_expenses_${name}`)
    saveGroups(groups.filter(g => g.id !== id))
  }

  const startEdit = (group: Group) => {
    setEditId(group.id)
    setEditName(group.name)
  }

  const saveEdit = (group: Group) => {
    if (!editName.trim()) return
    const oldName = group.name
    const members = localStorage.getItem(`splitpay_members_${oldName}`)
    const expenses = localStorage.getItem(`splitpay_expenses_${oldName}`)
    if (members) localStorage.setItem(`splitpay_members_${editName}`, members)
    if (expenses) localStorage.setItem(`splitpay_expenses_${editName}`, expenses)
    localStorage.removeItem(`splitpay_members_${oldName}`)
    localStorage.removeItem(`splitpay_expenses_${oldName}`)
    saveGroups(groups.map(g => g.id === group.id ? { ...g, name: editName } : g))
    setEditId(null)
  }

  return (
    <div>
      <PageHeader title="Groups" subtitle="Your splits" />
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} /> New Group
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 mb-4"
            >
              <p className="text-sm font-medium text-gray-700 mb-3">Create Group</p>
              <input
                type="text"
                placeholder="Group name (e.g. Goa Trip)"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 mb-3"
              />
              <div className="flex gap-2">
                <button onClick={createGroup} className="flex-1 bg-violet-600 text-white rounded-xl py-2 text-sm font-medium">Create</button>
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-500">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No groups yet.</p>
            <p className="text-gray-400 text-sm">Create one to start splitting!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                {editId === group.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 border border-violet-300 rounded-xl px-3 py-2 text-sm outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(group)} className="text-green-500 p-1"><Check size={18} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 p-1"><X size={18} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => navigate(`/groups/${group.name}`)}
                    >
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                        <Users size={18} className="text-violet-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-400">{group.members} member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(group)} className="p-2 text-gray-400 hover:text-violet-500"><Pencil size={16} /></button>
                      <button onClick={() => deleteGroup(group.id, group.name)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}