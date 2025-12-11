import React from 'react'
import { useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onLoginClick?: () => void
  onRegisterClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick }) => {
  const { user, logout } = useUserStore()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    // 重定向逻辑已经在logout函数中处理
  }

  // 检查是否在认证页面或管理员页面
  const isAuthPage = () => {
    const authRoutes = ['/login', '/register', '/email-verification']
    return authRoutes.includes(location.pathname)
  }

  const isAdminPage = () => {
    return location.pathname.startsWith('/admin')
  }

  // 检查是否应该显示导航栏
  const shouldShowNavbar = () => {
    return !isAuthPage() && !isAdminPage()
  }

  // 对于LandingPage，我们总是显示Header
  const isLandingPage = location.pathname === '/'

  if (!shouldShowNavbar() && !isLandingPage) {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 shadow-lg border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-foreground">
                agnets.app
              </h1>
            </div>
          </div>

          {/* Navigation and User Menu */}
          <NavigationMenu>
            <NavigationMenuList>
              {user ? (
                // 已登录用户：显示欢迎信息和退出按钮
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                      欢迎，{user?.name || user?.email}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-sm text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary/20"
                    >
                      🚪 退出登录
                    </Button>
                  </NavigationMenuItem>
                </>
              ) : (
                // 未登录用户：显示登录和注册按钮
                <>
                  <NavigationMenuItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRegisterClick}
                      className="text-sm text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary/20"
                    >
                      📝 注册
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLoginClick}
                      className="text-sm text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary/20"
                    >
                      🔑 登录
                    </Button>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}

export default Header