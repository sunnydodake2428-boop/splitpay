import { NavLink } from 'react-router-dom'
import { Home, Users, Scissors, QrCode, BarChart2, User } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/split', icon: Scissors, label: 'Split' },
  { to: '/qr', icon: QrCode, label: 'QR' },
  { to: '/analytics', icon: BarChart2, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 z-50">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs ${isActive ? 'text-violet-600' : 'text-gray-400'}`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}