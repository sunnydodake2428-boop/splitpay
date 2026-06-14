import { Routes, Route } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import Home from '@/pages/Home'
import Groups from '@/pages/Groups'
import GroupDetail from '@/pages/GroupDetail'
import Split from '@/pages/Split'
import QRGenerate from '@/pages/QRGenerate'
import Analytics from '@/pages/Analytics'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:name" element={<GroupDetail />} />
          <Route path="/split" element={<Split />} />
          <Route path="/qr" element={<QRGenerate />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </ProtectedRoute>
  )
}