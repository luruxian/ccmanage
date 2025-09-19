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
const appName = import.meta.env.VITE_APP_NAME || 'CCManage';

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

// 检查是否在认证页面
const isAuthPage = () => {
  const authRoutes = ['/login', '/register', '/verify-email'];
  return authRoutes.includes(route.path);
};
</script>

<template>
  <div class="app">
    <!-- 导航栏 (仅在非认证页面显示) -->
    <nav v-if="!isAuthPage()" class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#" @click="goHome">{{ appName }}</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="userStore.isLoggedIn">
              <router-link class="nav-link" to="/dashboard" :class="{ active: route.path === '/dashboard' }">
                控制台
              </router-link>
            </li>
            <li class="nav-item" v-if="userStore.isLoggedIn">
              <router-link class="nav-link" to="/key-activation" :class="{ active: route.path === '/key-activation' }">
                密钥激活
              </router-link>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <div v-if="userStore.isLoggedIn" class="me-3 text-white">
              欢迎，{{ userStore.name }}
            </div>
            <ElButton v-if="userStore.isLoggedIn" type="danger" @click="logout">
              登出
            </ElButton>
            <div v-else>
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

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}
</style>
