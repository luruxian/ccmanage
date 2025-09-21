import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

// 防止重复刷新token的标志
let isRefreshing = false;
let requestQueue: Array<(token: string) => void> = [];

// 获取API基础URL
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_BASE_URL;
  // 始终使用完整的baseURL，不使用相对路径
  const baseURL = envURL || 'http://localhost:8001';

  // 在开发环境打印配置信息
  if (import.meta.env.DEV) {
    console.log('🔗 API BaseURL:', baseURL);
    console.log('🌍 Environment:', import.meta.env.MODE);
  }

  return baseURL;
};

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // 添加CSRF保护
  }
});

// Token刷新函数
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(
      `${getBaseURL()}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { access_token, refresh_token: newRefreshToken } = response.data.tokens;

    // 更新本地存储的token
    localStorage.setItem('accessToken', access_token);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // 清除无效的token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');

    // 重定向到登录页
    window.location.href = '/login';
    return null;
  }
};

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加请求时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // 添加token
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加用户信息到headers（用于审计）
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo && config.headers) {
      try {
        const user = JSON.parse(userInfo);
        config.headers['X-User-ID'] = user.id;
        config.headers['X-User-Role'] = user.role || 'user';
      } catch (e) {
        console.warn('Failed to parse user info:', e);
      }
    }

    // 添加请求标识
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return config;
  },
  (error) => {
    console.error('请求配置错误:', error);
    ElMessage.error('请求配置错误');
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 记录成功的响应（开发环境）
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, res);
    }

    return res;
  },
  async (error) => {
    const { config, response } = error;

    // 记录错误响应
    console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url}:`, error);

    if (response) {
      const { status } = response;

      switch (status) {
        case 401:
          // Token过期，尝试刷新
          if (!config._retry && !isRefreshing) {
            config._retry = true;

            if (isRefreshing) {
              // 如果正在刷新token，将请求加入队列
              return new Promise((resolve) => {
                requestQueue.push((token: string) => {
                  config.headers['Authorization'] = `Bearer ${token}`;
                  resolve(service(config));
                });
              });
            }

            isRefreshing = true;

            try {
              const newToken = await refreshToken();
              if (newToken) {
                // 更新Authorization头
                config.headers['Authorization'] = `Bearer ${newToken}`;

                // 处理队列中的请求
                requestQueue.forEach(callback => callback(newToken));
                requestQueue = [];

                return service(config);
              }
            } catch (refreshError) {
              requestQueue = [];
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }

          ElMessage.error('登录已过期，请重新登录');
          // 清除用户数据并跳转登录页
          setTimeout(() => {
            localStorage.clear();
            window.location.href = '/login';
          }, 1500);
          break;

        case 403:
          ElMessage.error('权限不足，拒绝访问');
          break;

        case 404:
          ElMessage.error('请求的资源不存在');
          break;

        case 422:
          // 验证错误
          const detail = response.data?.detail;
          if (Array.isArray(detail)) {
            const errors = detail.map(err => err.msg).join(', ');
            ElMessage.error(`输入验证失败: ${errors}`);
          } else {
            ElMessage.error(detail || '输入验证失败');
          }
          break;

        case 429:
          ElMessage.error('请求过于频繁，请稍后再试');
          break;

        case 500:
          ElMessage.error('服务器内部错误，请稍后再试');
          break;

        case 502:
        case 503:
        case 504:
          ElMessage.error('服务暂时不可用，请稍后再试');
          break;

        default:
          const message = response.data?.detail || response.data?.message || '请求失败';
          ElMessage.error(message);
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接');
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败，请检查网络设置');
    } else {
      ElMessage.error('请求失败，请稍后再试');
    }

    return Promise.reject(error);
  }
);

// 安全增强功能
export const securityUtils = {
  // 验证token有效性
  validateToken(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return false;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },

  // 清除敏感数据
  clearSensitiveData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    sessionStorage.clear();
  },

  // 检查用户权限
  hasPermission(requiredRole: string): boolean {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return false;

    try {
      const user = JSON.parse(userInfo);
      const userRole = user.role || 'user';

      const roleHierarchy = {
        'user': 1,
        'admin': 2,
        'super_admin': 3
      };

      const required = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
      const current = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;

      return current >= required;
    } catch {
      return false;
    }
  },

  // 生成安全的随机字符串
  generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
};

export default service;