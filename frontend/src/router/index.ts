import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

// Lazy-loaded route components for better code splitting
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const EmailVerification = () => import('../views/auth/EmailVerification.vue')
const VerifySuccess = () => import('../views/auth/VerifySuccess.vue')
const VerifyError = () => import('../views/auth/VerifyError.vue')
const VerifyResult = () => import('../views/auth/VerifyResult.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const KeyActivation = () => import('../views/KeyActivation.vue')

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // 如果用户已登录且访问登录/注册/验证页，重定向到控制台
  if (userStore.isLoggedIn && ['/login', '/register', '/verify-email', '/verify-success', '/verify-error', '/verify-result'].includes(to.path)) {
    next('/dashboard')
    return
  }

  // 如果访问需要认证的页面但未登录，重定向到登录页
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router