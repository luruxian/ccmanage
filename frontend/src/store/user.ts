import { defineStore } from 'pinia';
import request from '../utils/request';

// 定义用户信息接口
interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  avatar: string | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
}

// 创建用户信息store
export const useUserStore = defineStore('user', {
  // 状态
  state: (): UserState => ({
    id: null,
    name: null,
    email: null,
    role: null,
    avatar: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false
  }),

  // 计算属性
  getters: {
    // 获取用户是否登录
    isAuthenticated: (state) => state.isLoggedIn,
    
    // 获取用户信息
    userInfo: (state) => ({
      id: state.id,
      name: state.name,
      email: state.email,
      role: state.role,
      avatar: state.avatar
    }),

    // 获取访问令牌
    accessToken: (state) => state.token,

    // 检查是否是管理员
    isAdmin: (state) => ['admin', 'super_admin'].includes(state.role || ''),

    // 获取用户对象（包含完整信息）
    user: (state) => state.isLoggedIn ? {
      id: state.id,
      name: state.name,
      email: state.email,
      role: state.role,
      avatar: state.avatar
    } : null
  },

  // 方法
  actions: {
    // 登录
    login(userData: {
      id: string;
      name: string;
      email?: string;
      role?: string;
      avatar?: string;
      token?: string;
      refreshToken?: string;
    }) {
      this.id = userData.id;
      this.name = userData.name;
      this.email = userData.email || null;
      this.role = userData.role || null;
      this.avatar = userData.avatar || null;
      this.token = userData.token || null;
      this.refreshToken = userData.refreshToken || null;
      this.isLoggedIn = true;

      // 保存用户信息到localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar
      }));

      // 保存token到localStorage
      if (this.token) {
        localStorage.setItem('accessToken', this.token);
      }
      if (this.refreshToken) {
        localStorage.setItem('refreshToken', this.refreshToken);
      }
    },
    
    // 登出
    logout() {
      this.id = null;
      this.name = null;
      this.email = null;
      this.role = null;
      this.avatar = null;
      this.token = null;
      this.refreshToken = null;
      this.isLoggedIn = false;

      // 清除localStorage中的用户信息
      localStorage.removeItem('userInfo');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    
    // 从localStorage加载用户信息
    loadUserInfo() {
      const userInfo = localStorage.getItem('userInfo');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (userInfo && accessToken) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          this.id = parsedUserInfo.id;
          this.name = parsedUserInfo.name;
          this.email = parsedUserInfo.email;
          this.role = parsedUserInfo.role;
          this.avatar = parsedUserInfo.avatar;
          this.token = accessToken;
          this.refreshToken = refreshToken;
          this.isLoggedIn = true;
        } catch (error) {
          console.error('加载用户信息失败:', error);
          this.logout();
        }
      }
    },

    // 检查用户是否有激活的API密钥
    async hasActiveApiKeys(): Promise<boolean> {
      try {
        if (!this.isLoggedIn) {
          return false;
        }

        const response: any = await request.get('/api/v1/keys/');
        const activeKeys = response.keys?.filter((key: any) => key.is_active) || [];
        return activeKeys.length > 0;
      } catch (error) {
        console.error('检查激活密钥失败:', error);
        return false;
      }
    }
  }
});