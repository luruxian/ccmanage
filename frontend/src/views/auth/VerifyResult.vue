<template>
  <div class="verify-result-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="auth-card">
            <!-- 成功状态 -->
            <div v-if="isSuccess" class="text-center mb-4">
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

            <!-- 失败状态 -->
            <div v-else class="text-center mb-4">
              <ElIcon size="80" color="#f56c6c" class="mb-3">
                <ElIconCircleClose />
              </ElIcon>
              <h2 class="fw-bold text-danger">验证失败</h2>
              <p class="text-muted">
                {{ failureMessage }}
              </p>
            </div>

            <!-- 成功时的用户信息 -->
            <div v-if="isSuccess && userEmail" class="welcome-content mb-4">
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

            <!-- 失败时的帮助信息 -->
            <div v-if="!isSuccess" class="help-content mb-4">
              <div class="alert alert-warning">
                <p class="mb-2">
                  <strong>💡 解决方案：</strong>
                </p>
                <ul class="mt-2 mb-0">
                  <li v-if="failureReason === 'token_invalid'">
                    • 验证链接可能已过期（15分钟有效期）
                    <br>• 请尝试重新请求验证邮件
                  </li>
                  <li v-else-if="failureReason === 'user_not_found'">
                    • 用户账户可能已被删除
                    <br>• 请重新注册账户
                  </li>
                  <li v-else>
                    • 服务器暂时无法处理请求
                    <br>• 请稍后重试或联系技术支持
                  </li>
                </ul>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="text-center">
              <ElButton
                v-if="isSuccess"
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="goToLogin"
              >
                🚀 前往登录
              </ElButton>

              <div v-else class="d-grid gap-2">
                <ElButton
                  type="primary"
                  size="large"
                  @click="goToLogin"
                >
                  前往登录
                </ElButton>
                <ElButton
                  type="default"
                  size="large"
                  @click="goToRegister"
                >
                  重新注册
                </ElButton>
              </div>
            </div>

            <!-- 底部提示 -->
            <div class="text-center mt-3">
              <p class="text-muted small">
                <span v-if="isSuccess">
                  请使用注册时的邮箱和密码登录
                </span>
                <span v-else>
                  需要帮助？请联系 support@agnets.app
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElButton,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  CircleCheck as ElIconCircleCheck,
  CircleClose as ElIconCircleClose
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const status = ref('')
const failureReason = ref('')
const userEmail = ref('')
const userId = ref('')

// 计算属性
const isSuccess = computed(() => status.value === 'success')

const failureMessage = computed(() => {
  switch (failureReason.value) {
    case 'token_invalid':
      return '验证链接无效或已过期'
    case 'user_not_found':
      return '用户不存在'
    case 'server_error':
      return '服务器错误，请稍后重试'
    default:
      return '验证失败，请重试'
  }
})

// 跳转到登录页
const goToLogin = () => {
  loading.value = true

  // 如果验证成功，传递邮箱参数以便预填充
  if (isSuccess.value && userEmail.value) {
    router.push({
      path: '/login',
      query: {
        email: userEmail.value,
        verified: 'true'
      }
    })
  } else {
    router.push('/login')
  }
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  // 从URL参数获取验证结果
  status.value = route.query.status as string || 'failed'
  failureReason.value = route.query.reason as string || ''
  userEmail.value = route.query.email as string || ''
  userId.value = route.query.user_id as string || ''

  // 显示相应的消息
  if (isSuccess.value) {
    ElMessage.success('邮箱验证成功！')

    // 如果有邮箱信息，显示个性化消息
    if (userEmail.value) {
      setTimeout(() => {
        ElMessage.info(`欢迎 ${userEmail.value}，请前往登录`)
      }, 1000)
    }
  } else {
    ElMessage.error('邮箱验证失败')
  }
})
</script>

<style scoped>
.verify-result-page {
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

.help-content {
  text-align: left;
}

.welcome-content ul,
.help-content ul {
  list-style: none;
  padding-left: 0;
}

.welcome-content li,
.help-content li {
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

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  color: #856404;
}

/* Dark Theme Styles */
:global(.dark-theme) .verify-result-page {
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

:global(.dark-theme) .alert-warning {
  background-color: #664d03;
  border-color: #997404;
  color: #ffecb5;
}
</style>