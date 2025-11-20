import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileSidebar from '@/components/MobileSidebar'

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        {/* 桌面端侧边栏 */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* 移动端悬浮菜单 */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onToggle={handleMobileMenuToggle}
          onClose={handleMobileSidebarClose}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}