<template>
  <div class="verify-success-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="auth-card">
            <div class="text-center mb-4">
              <ElIcon size="80" color="#67c23a" class="mb-3">
                <ElIconCircleCheck />
              </ElIcon>
              <h2 class="fw-bold text-success">验证成功!</h2>
              <p class="text-muted">
                🎉 欢迎加入 agnets.app | agnet club
                <br>
                您的邮箱已成功验证，账户已激活
              </p>
            </div>

            <div class="welcome-content mb-4">
              <div class="alert alert-success">
                <p class="mb-2">
                  <strong>Hi {{ userEmail }} 👋</strong>
                </p>
                <p class="mb-0">
                  您现在可以享受以下功能：
                </p>
                <ul class="mt-2 mb-0">
                  <li>🚀 创建和管理智能代理</li>
                  <li>🔗 无缝集成各种API服务</li>
                  <li>📊 实时监控使用情况</li>
                  <li>🎯 享受专业级的技术支持</li>
                </ul>
              </div>
            </div>

            <div class="text-center">
              <ElButton
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="goToDashboard"
              >
                ✨ 进入控制台 ✨
              </ElButton>
            </div>

            <div class="text-center mt-3">
              <p class="text-muted small">
                自动登录中，请稍候...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElButton,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  CircleCheck as ElIconCircleCheck
} from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const userEmail = ref('')

const goToDashboard = () => {
  loading.value = true
  router.push('/dashboard')
}

onMounted(() => {
  // 从URL参数获取token和用户信息
  const accessToken = route.query.access_token as string
  const refreshToken = route.query.refresh_token as string
  const userId = route.query.user_id as string
  const email = route.query.email as string

  if (accessToken && refreshToken && userId && email) {
    // 自动登录
    userStore.login({
      id: userId,
      name: email,
      email: email,
      token: accessToken,
      refreshToken: refreshToken
    })

    userEmail.value = email
    ElMessage.success('邮箱验证成功，欢迎使用 agnets.app!')

    // 3秒后自动跳转到控制台
    setTimeout(() => {
      goToDashboard()
    }, 3000)
  } else {
    ElMessage.error('验证参数不完整')
    router.push('/login')
  }
})
</script>

<style scoped>
.verify-success-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.welcome-content {
  text-align: left;
}

.welcome-content ul {
  list-style: none;
  padding-left: 0;
}

.welcome-content li {
  margin-bottom: 8px;
  padding-left: 5px;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 15px;
  color: #155724;
}

/* Dark Theme Styles */
:global(.dark-theme) .verify-success-page {
  background: #1a1a1a;
}

:global(.dark-theme) .auth-card {
  background: #161b22;
  border: 1px solid #30363d;
}

:global(.dark-theme) .alert-success {
  background-color: #0f5132;
  border-color: #0a3622;
  color: #d1e7dd;
}
</style>