import React from 'react'
import { useUserStore } from '@/store/user'

const Header: React.FC = () => {
  const { user, logout } = useUserStore()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">agnets.app</h1>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              欢迎，{user?.name || user?.email}
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header