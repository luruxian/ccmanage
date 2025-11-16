import React from 'react'
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

  return (
    <header className="bg-background shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-foreground">agnets.app</h1>
            </div>
          </div>

          {/* User menu */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  欢迎，{user?.name || user?.email}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  退出登录
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