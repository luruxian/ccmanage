import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  console.log('Layout组件渲染')
  const [activeTab, setActiveTab] = useState('keys')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="flex-1">
          {children || <Outlet context={{ activeTab, setActiveTab }} />}
        </main>
      </div>
    </div>
  )
}

export default Layout