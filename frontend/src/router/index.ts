import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'
import { securityUtils } from '../utils/request'
import { ElMessage } from 'element-plus'

// Lazy-loaded route components for better code splitting
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const EmailVerification = () => import('../views/auth/EmailVerification.vue')
const VerifySuccess = () => import('../views/auth/VerifySuccess.vue')
const VerifyError = () => import('../views/auth/VerifyError.vue')
const VerifyResult = () => import('../views/auth/VerifyResult.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const KeyActivation = () => import('../views/KeyActivation.vue')
const Packages = () => import('../views/Packages.vue')
const AdminLogin = () => import('../views/admin/AdminLogin.vue')
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/verify-email',
    name: 'EmailVerification',
    component: EmailVerification
  },
  {
    path: '/verify-success',
    name: 'VerifySuccess',
    component: VerifySuccess
  },
  {
    path: '/verify-error',
    name: 'VerifyError',
    component: VerifyError
  },
  {
    path: '/verify-result',
    name: 'VerifyResult',
    component: VerifyResult
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/key-activation',
    name: 'KeyActivation',
    component: KeyActivation,
    meta: { requiresAuth: true }
  },
  {
    path: '/packages',
    name: 'Packages',
    component: Packages,
    meta: { requiresAuth: true }
  },
  {
    path: '/meme',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 增强的路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  try {
    // 验证token有效性
    if (userStore.isLoggedIn && !securityUtils.validateToken()) {
      console.warn('Token已过期，清除用户数据')
      userStore.logout()
      securityUtils.clearSensitiveData()
    }

    // 记录路由访问（审计日志）
    console.log(`🔄 Route transition: ${from.path} → ${to.path}`, {
      user: userStore.user?.id,
      role: userStore.user?.role,
      timestamp: new Date().toISOString()
    })

    // 如果用户已登录且访问登录/注册/验证页，重定向到控制台
    const authPages = ['/login', '/register', '/verify-email', '/verify-success', '/verify-error', '/verify-result', '/meme']
    if (userStore.isLoggedIn && authPages.includes(to.path)) {
      const redirectPath = userStore.isAdmin ? '/admin/dashboard' : '/dashboard'
      console.log(`用户已登录，重定向到: ${redirectPath}`)
      next(redirectPath)
      return
    }

    // 检查认证要求
    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
      console.warn('需要认证但用户未登录')
      ElMessage.warning('请先登录')
      next('/login')
      return
    }

    // 检查管理员权限
    if (to.meta.requiresAdmin) {
      if (!userStore.isLoggedIn) {
        console.warn('访问管理页面但用户未登录')
        ElMessage.warning('请先登录管理员账户')
        next('/meme')
        return
      }

      if (!userStore.isAdmin && !securityUtils.hasPermission('admin')) {
        console.warn('用户尝试访问管理页面但权限不足', {
          user: userStore.user?.id,
          role: userStore.user?.role,
          requiredRole: 'admin'
        })
        ElMessage.error('权限不足，仅限管理员访问')
        next('/dashboard')
        return
      }
    }

    // 检查角色层级权限
    if (to.meta.requiredRole) {
      const requiredRole = to.meta.requiredRole as string
      if (!securityUtils.hasPermission(requiredRole)) {
        console.warn('用户权限不足', {
          user: userStore.user?.id,
          currentRole: userStore.user?.role,
          requiredRole
        })
        ElMessage.error(`权限不足，需要 ${requiredRole} 权限`)
        next('/dashboard')
        return
      }
    }

    // 安全检查：防止直接访问敏感路径
    const sensitiveRoutes = ['/admin']
    if (sensitiveRoutes.some(route => to.path.startsWith(route)) && !userStore.isAdmin) {
      console.warn('非管理员尝试访问敏感路径', {
        path: to.path,
        user: userStore.user?.id,
        role: userStore.user?.role
      })
      next('/dashboard')
      return
    }

    next()
  } catch (error) {
    console.error('路由守卫执行出错:', error)
    ElMessage.error('页面加载失败，请重试')
    next('/login')
  }
})

// 路由后置守卫：记录导航完成
router.afterEach((to) => {
  // 记录页面访问
  if (import.meta.env.DEV) {
    console.log(`✅ 导航完成: ${to.path}`)
  }

  // 设置页面标题
  const baseTitle = 'CCManage'
  const routeTitle = to.meta.title as string
  document.title = routeTitle ? `${routeTitle} - ${baseTitle}` : baseTitle

  // 记录页面访问时间（用于会话管理）
  sessionStorage.setItem('lastPageAccess', Date.now().toString())
})

export default router