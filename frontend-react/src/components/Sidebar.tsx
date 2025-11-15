import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Key, List, TrendingUp, Book } from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'getting-started', name: '安装Claude Code', icon: Play, path: '/app' },
    { id: 'keys', name: 'API密钥', icon: Key, path: '/app' },
    { id: 'packages', name: '订阅一览', icon: List, path: '/app/packages' },
    { id: 'promotion', name: '推广计划', icon: TrendingUp, path: '/app' },
    { id: 'resources', name: '资料中心', icon: Book, path: '/app/resources' },
  ]

  const isActive = (id: string) => {
    // 保持和 Vue 版本一致的激活逻辑：keys 同时匹配 keys 或 usage-history
    if (id === 'keys') return activeTab === 'keys' || activeTab === 'usage-history'
    return activeTab === id
  }

  return (
    <aside className="hidden md:block w-64">
      <div className="sidebar bg-gradient-to-b from-slate-800 to-slate-900 min-h-screen p-10">
        <div className="sidebar-content">
          <nav className="sidebar-nav flex flex-col space-y-2">
            {items.map((it) => {
              const Icon = it.icon
              return (
                <Link
                  key={it.id}
                  to={it.path}
                  onClick={() => onTabChange(it.id)}
                  className={`nav-item flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(it.id)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  <span>{it.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar