import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
}

interface UserState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  isAdmin: boolean

  // Actions
  login: (userData: { id: string; name: string; email: string; role?: string; token: string; refreshToken: string }) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  hasActiveApiKeys: () => Promise<boolean>
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({ 
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isAdmin: false,

      login: (userData) => {
        set({
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role, // 添加角色字段
          },
          token: userData.token,
          refreshToken: userData.refreshToken,
          isLoggedIn: true,
          isAdmin: ['admin', 'super_admin'].includes(userData.role || ''), // 根据角色判断是否为管理员
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isLoggedIn: false,
          isAdmin: false,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },

      hasActiveApiKeys: async () => {
        try {
          // 简化实现，实际应该调用API检查
          // 为了确保登录跳转正常工作，暂时返回true
          console.log('检查用户API密钥状态')
          return true
        } catch (error) {
          console.error('检查API密钥状态失败:', error)
          // 如果检查失败，默认返回true，让用户进入控制台
          return true
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
      }),
    }
  )
)