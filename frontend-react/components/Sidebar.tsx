import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  Settings,
  BarChart3,
  CreditCard
} from 'lucide-react'

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '用户管理', href: '/users', icon: Users },
  { name: '积分管理', href: '/credits', icon: CreditCard },
  { name: '统计分析', href: '/analytics', icon: BarChart3 },
  { name: '系统设置', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="sidebar bg-gradient-to-b from-background to-muted h-full p-10">
      <div className="sidebar-content">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
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
    </div>
  )
}