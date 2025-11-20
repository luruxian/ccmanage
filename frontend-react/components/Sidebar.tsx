import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
  Home,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '用户管理', href: '/users', icon: Users },
  { name: '积分管理', href: '/credits', icon: CreditCard },
  { name: '统计分析', href: '/analytics', icon: BarChart3 },
  { name: '系统设置', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* 侧边栏 */}
      <div className={`
        fixed lg:static top-0 left-0 h-screen lg:h-auto z-40
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 border-r bg-background shadow-lg lg:shadow-none
      `}>
        <nav className="space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* 移动端遮罩层 */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}