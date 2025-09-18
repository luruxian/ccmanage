import { defineStore } from 'pinia';

// 定义用户信息接口
interface UserState {
  id: string | null;
  name: string | null;
  avatar: string | null;
  isLoggedIn: boolean;
}

// 创建用户信息store
export const useUserStore = defineStore('user', {
  // 状态
  state: (): UserState => ({
    id: null,
    name: null,
    avatar: null,
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
      avatar: state.avatar
    })
  },

  // 方法
  actions: {
    // 登录
    login(userData: { id: string; name: string; avatar?: string }) {
      this.id = userData.id;
      this.name = userData.name;
      this.avatar = userData.avatar || null;
      this.isLoggedIn = true;
      
      // 保存用户信息到localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        id: this.id,
        name: this.name,
        avatar: this.avatar
      }));
    },
    
    // 登出
    logout() {
      this.id = null;
      this.name = null;
      this.avatar = null;
      this.isLoggedIn = false;
      
      // 清除localStorage中的用户信息
      localStorage.removeItem('userInfo');
    },
    
    // 从localStorage加载用户信息
    loadUserInfo() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          this.id = parsedUserInfo.id;
          this.name = parsedUserInfo.name;
          this.avatar = parsedUserInfo.avatar;
          this.isLoggedIn = true;
        } catch (error) {
          console.error('加载用户信息失败:', error);
          this.logout();
        }
      }
    }
  }
});