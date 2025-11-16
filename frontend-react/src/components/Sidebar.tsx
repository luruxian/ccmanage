import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Key, List, Book } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'getting-started', name: '安装Claude Code', icon: Play, path: '/app' },
    { id: 'keys', name: 'API密钥', icon: Key, path: '/app' },
    { id: 'packages', name: '订阅一览', icon: List, path: '/app' },
    { id: 'resources', name: '资料中心', icon: Book, path: '/app/resources' },
  ]

  const isActive = (id: string) => {
    // 保持和 Vue 版本一致的激活逻辑：keys 同时匹配 keys 或 usage-history
    if (id === 'keys') return activeTab === 'keys' || activeTab === 'usage-history'
    return activeTab === id
  }

  return (
    <aside className="hidden md:block w-64">
      <div className="sidebar bg-gradient-to-b from-background to-muted min-h-screen p-10">
        <div className="sidebar-content">
          <NavigationMenu orientation="vertical" className="w-full">
            <NavigationMenuList className="flex flex-col space-y-2">
              {items.map((it) => {
                const Icon = it.icon
                return (
                  <NavigationMenuItem key={it.id} className="w-full">
                    <NavigationMenuLink asChild>
                      <Link
                        to={it.path}
                        onClick={() => onTabChange(it.id)}
                        className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all w-full ${
                          isActive(it.id)
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <Icon className="mr-3 w-5 h-5" />
                        <span>{it.name}</span>
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar