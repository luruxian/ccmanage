import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUserStore } from '@/store/user'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { isLoggedIn, isAdmin } = useUserStore()
  const location = useLocation()

  if (!isLoggedIn) {
    // 未登录，重定向到登录页，并保存当前路径
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    // 需要管理员权限但用户不是管理员
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute