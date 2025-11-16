import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'

const Header: React.FC = () => {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()

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

  // 导航到控制台
  const goToDashboard = () => {
    navigate('/app/dashboard')
  }

  // 导航到密钥激活
  const goToKeyActivation = () => {
    navigate('/key-activation')
  }

  // 检查当前路由是否激活
  const isActive = (path: string) => {
    return location.pathname === path
  }

  if (!shouldShowNavbar()) {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 shadow-lg border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1
                className="text-xl font-bold text-primary-foreground cursor-pointer hover:scale-105 transition-transform"
                onClick={goToDashboard}
              >
                agnets.app
              </h1>
            </div>
          </div>

          {/* 导航菜单 - 控制台和密钥激活按钮 */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant={isActive('/app/dashboard') ? "secondary" : "ghost"}
              size="sm"
              onClick={goToDashboard}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/20"
            >
              🖥️ 控制台
            </Button>
            <Button
              variant={isActive('/key-activation') ? "secondary" : "ghost"}
              size="sm"
              onClick={goToKeyActivation}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary/20"
            >
              🔑 密钥激活
            </Button>
          </div>

          {/* 移动端导航菜单 */}
          <div className="md:hidden">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-2">
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToDashboard}
                    className="text-primary-foreground"
                  >
                    🖥️
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToKeyActivation}
                    className="text-primary-foreground"
                  >
                    🔑
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* User menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-sm text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                >
                  欢迎，{user?.name || user?.email}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-sm text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary/20"
                >
                  🚪 退出登录
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}

export default Header