import { NavLink } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import {
  FileText,
  Hash,
  Image as ImageIcon,
  Eraser,
  Wand2,
  FileSearch,
  House,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: House, end: true },
  { to: '/dashboard/article', label: 'Write article', icon: FileText },
  { to: '/dashboard/blog-titles', label: 'Blog titles', icon: Hash },
  { to: '/dashboard/image', label: 'Generate images', icon: ImageIcon },
  { to: '/dashboard/remove-background', label: 'Remove background', icon: Eraser },
 { to: '/dashboard/resume', label: 'Resume review', icon: FileSearch },
]

const Sidebar = ({ user }) => {
  return (
    <div className="w-60 min-h-screen border-r border-gray-200 flex flex-col justify-between bg-white">
      <div className="px-4 py-6">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition ${
                isActive
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200">
        <UserButton />
        <div className="text-sm">
          <p className="font-medium text-gray-800">{user?.fullName || 'User'}</p>
          <p className="text-gray-400 text-xs">Free plan</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar