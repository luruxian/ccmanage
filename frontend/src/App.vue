<script setup lang="ts">
import { onMounted } from 'vue';
import { ElButton } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from './store/user';

// 使用用户store
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

// 应用名称
const appName = import.meta.env.VITE_APP_NAME || 'agnets.app';

// 初始化加载用户信息
onMounted(() => {
  userStore.loadUserInfo();
});

// 导航到控制台
const goHome = () => {
  if (userStore.isLoggedIn) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
};

// 登出
const logout = () => {
  userStore.logout();
  router.push('/login');
};

// 检查是否在认证页面或管理员页面
const isAuthPage = () => {
  const authRoutes = ['/login', '/register', '/verify-email'];
  return authRoutes.includes(route.path);
};

// 检查是否在管理员页面
const isAdminPage = () => {
  return route.path.startsWith('/admin') || route.path === '/meme';
};

// 检查是否应该显示导航栏
const shouldShowNavbar = () => {
  return !isAuthPage() && !isAdminPage();
};
</script>

<template>
  <div class="app">
    <!-- 导航栏 (仅在普通用户页面显示，排除认证页面和管理员页面) -->
    <nav v-if="shouldShowNavbar()" class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#" @click="goHome">{{ appName }}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-label="切换导航">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="userStore.isLoggedIn">
              <router-link class="nav-link" to="/dashboard" :class="{ active: route.path === '/dashboard' }">
                <i class="fas fa-tachometer-alt d-lg-none me-2"></i>
                控制台
              </router-link>
            </li>
            <li class="nav-item" v-if="userStore.isLoggedIn">
              <router-link class="nav-link" to="/key-activation" :class="{ active: route.path === '/key-activation' }">
                <i class="fas fa-key d-lg-none me-2"></i>
                密钥激活
              </router-link>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <div v-if="userStore.isLoggedIn" class="me-3 text-white d-none d-lg-block">
              欢迎，{{ userStore.name }}
            </div>
            <div v-if="userStore.isLoggedIn" class="d-lg-none user-info-mobile me-3 text-white">
              <small>{{ userStore.name }}</small>
            </div>
            <ElButton v-if="userStore.isLoggedIn" type="text" @click="logout" class="logout-btn">
              <span class="logout-icon">🚪</span>
              <span class="d-none d-md-inline">退出登录</span>
            </ElButton>
            <div v-else class="auth-buttons">
              <router-link to="/login" class="btn btn-outline-light me-2">
                登录
              </router-link>
              <router-link to="/register" class="btn btn-light">
                注册
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<style>
/* 全局字体导入 */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* 全局样式重置 */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}

.logout-btn {
  color: #ffffff !important;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px);
}

.logout-icon {
  margin-right: 6px;
}

/* 导航栏样式优化 */
.navbar {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
  padding: 12px 0;
}

.navbar-brand {
  font-weight: 800;
  font-size: 1.4rem;
  color: white !important;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 4px;
  padding: 8px 16px !important;
}

.nav-link:hover,
.nav-link.active {
  color: white !important;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.btn-outline-light {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-outline-light:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.btn-light {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-light:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

/* 移动端导航栏优化 */
@media (max-width: 768px) {
  .navbar {
    padding: 8px 0;
  }

  .navbar-brand {
    font-size: 1.2rem;
  }

  .navbar-collapse {
    margin-top: 8px;
  }

  .navbar-nav {
    margin-bottom: 12px;
  }

  .nav-link {
    padding: 12px 16px !important;
    margin: 2px 0;
  }

  .user-info-mobile {
    font-size: 14px;
  }

  .auth-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .auth-buttons .btn {
    width: 100%;
    margin: 0;
  }

  .logout-btn {
    padding: 10px 16px !important;
    font-size: 14px;
  }
}
</style>
