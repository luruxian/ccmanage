import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('keys')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }
  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }
  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false)
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        {/* 桌面端侧边栏 */}
        <div className="hidden lg:block">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        {/* 移动端悬浮菜单 */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onToggle={handleMobileMenuToggle}
          onClose={handleMobileSidebarClose}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
          {children || <Outlet context={{ activeTab, setActiveTab }} />}
        </main>
      </div>
    </div>
  )
}
export default Layout