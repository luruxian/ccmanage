import axios from 'axios'
import { useUserStore } from '@/store/user'

// 防止重复刷新token的标志
let isRefreshing = false
let requestQueue: Array<(token: string) => void> = []

// 获取API基础URL
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL

  // 如果有环境变量配置，直接使用
  if (envURL) {
    return envURL
  }

  // 自动检测协议和主机
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

  let baseURL: string

  if (isLocalhost) {
    // 本地开发环境，使用HTTP
    baseURL = 'http://localhost:8001'
  } else {
    // 生产环境，使用当前页面的协议和主机
    const port = protocol === 'https:' ? '' : ':8001'
    baseURL = `${protocol}//${hostname}${port}`
  }

  return baseURL
}

// Token刷新函数
const refreshToken = async (): Promise<string | null> => {
  try {
    const { refreshToken } = useUserStore.getState()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(
      `${getBaseURL()}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const { access_token, refresh_token: newRefreshToken } = response.data.tokens

    // 更新用户状态中的token和refreshToken
    const state = useUserStore.getState();
    state.token = access_token;
    state.refreshToken = newRefreshToken;

    return access_token
  } catch (error) {
    console.error('Token refresh failed:', error)
    // 清除用户状态
    useUserStore.getState().logout()
    // 重定向到登录页
    window.location.href = '/login'
    return null
  }
}

// 创建axios实例
const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // 添加CSRF保护
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加请求时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // 添加token
    const { token } = useUserStore.getState()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 添加用户信息到headers（用于审计）
    const { user } = useUserStore.getState()
    if (user && config.headers) {
      config.headers['X-User-ID'] = user.id
      config.headers['X-User-Role'] = user.role || 'user'
    }

    // 添加请求标识
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return config
  },
  (error) => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data

    return res
  },
  async (error) => {
    const { config, response } = error

    // 记录错误响应
    console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url}:`, error)

    if (response) {
      const { status } = response

      switch (status) {
        case 401:
          // 检查是否是登录请求
          const isLoginRequest = config?.url?.includes('/auth/login')
          const isAdminLoginRequest = config?.url?.includes('/admin/login')

          if (isLoginRequest || isAdminLoginRequest) {
            // 登录请求的401错误，不需要跳转，由登录组件处理
            break
          }

          // Token过期，尝试刷新
          if (!config._retry && !isRefreshing) {
            config._retry = true

            if (isRefreshing) {
              // 如果正在刷新token，将请求加入队列
              return new Promise((resolve) => {
                requestQueue.push((token: string) => {
                  config.headers['Authorization'] = `Bearer ${token}`
                  resolve(request(config))
                })
              })
            }

            isRefreshing = true

            try {
              const newToken = await refreshToken()
              if (newToken) {
                // 更新Authorization头
                config.headers['Authorization'] = `Bearer ${newToken}`

                // 处理队列中的请求
                requestQueue.forEach(callback => callback(newToken))
                requestQueue = []

                return request(config)
              }
            } catch (refreshError) {
              requestQueue = []
              return Promise.reject(refreshError)
            } finally {
              isRefreshing = false
            }
          }

          // 清除用户状态并跳转登录页
          setTimeout(() => {
            useUserStore.getState().logout()
            window.location.href = '/login'
          }, 1500)
          break

        case 403:
          console.error('权限不足，拒绝访问')
          break

        case 404:
          console.error('请求的资源不存在')
          break

        case 422:
          // 验证错误
          const detail = response.data?.detail
          if (Array.isArray(detail)) {
            const errors = detail.map(err => err.msg).join(', ')
            console.error(`输入验证失败: ${errors}`)
          } else {
            console.error(detail || '输入验证失败')
          }
          break

        case 429:
          console.error('请求过于频繁，请稍后再试')
          break

        case 500:
          console.error('服务器内部错误，请稍后再试')
          break

        case 502:
        case 503:
        case 504:
          console.error('服务暂时不可用，请稍后再试')
          break

        default:
          const message = response.data?.detail || response.data?.message || '请求失败'
          console.error(message)
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请检查网络连接')
    } else if (error.message === 'Network Error') {
      console.error('网络连接失败，请检查网络设置')
    } else {
      console.error('请求失败，请稍后再试')
    }

    return Promise.reject(error)
  }
)

export default request