import { } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Key,
  Play,
  List,
  Book,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'API密钥', href: '/app', icon: Key },
  { name: '安装Claude Code', href: '/app/install-guide', icon: Play },
  { name: '订阅一览', href: '/app/packages', icon: List },
  { name: '资料中心', href: '/app/resources', icon: Book },
]

interface MobileSidebarProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onToggle, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* 悬浮菜单按钮 */}
      <button
        className={`
          fixed bottom-6 right-6 z-50 lg:hidden
          w-14 h-14 rounded-full bg-primary text-primary-foreground
          flex items-center justify-center shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          ${isOpen ? 'scale-90 rotate-45' : 'scale-100 rotate-0'}
        `}
        onClick={onToggle}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 悬浮菜单 */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 lg:hidden
          bg-background border rounded-lg shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'}
          min-w-48
        `}
      >
        {/* 导航菜单 */}
        <nav className="space-y-1 p-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}