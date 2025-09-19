<template>
  <div class="verification-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="auth-card">
            <div class="text-center mb-4">
              <ElIcon size="60" color="#409eff" class="mb-3">
                <ElIconMessage />
              </ElIcon>
              <h2 class="fw-bold">邮箱验证</h2>
              <p class="text-muted">
                验证码已发送至
                <br>
                <strong>{{ email }}</strong>
              </p>
            </div>

            <div class="verification-info">
              <div class="info-card">
                <p class="info-title">🔗 <strong>点击按钮验证</strong></p>
                <p class="info-description">
                  我们已发送一封包含验证按钮的邮件到您的邮箱。
                  <br>请点击邮件中的 <strong>"🚀 验证我的邮箱"</strong> 按钮即可完成验证。
                </p>
              </div>

              <div class="info-card">
                <p class="info-title">📱 <strong>按钮无法点击？</strong></p>
                <p class="info-description">
                  如果邮件中的按钮无法点击，请复制邮件中的验证链接，
                  <br>粘贴到浏览器地址栏中打开即可完成验证。
                </p>
              </div>

              <div class="resend-section">
                <ElButton
                  type="text"
                  size="large"
                  style="width: 100%"
                  :disabled="resendCooldown > 0"
                  @click="resendVerificationCode"
                >
                  {{ resendCooldown > 0 ? `重新发送 (${resendCooldown}s)` : '📧 重新发送验证邮件' }}
                </ElButton>
              </div>
            </div>

            <div class="text-center">
              <p class="text-muted small mb-2">
                没有收到邮件？请检查垃圾邮件文件夹
              </p>
              <router-link to="/register" class="text-primary small">
                返回注册页面
              </router-link>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElButton,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  Message as ElIconMessage
} from '@element-plus/icons-vue'
import request from '../../utils/request'

const router = useRouter()
const route = useRoute()

const resendCooldown = ref(0)
const email = ref(route.query.email as string || '')

let cooldownTimer: number | null = null


const resendVerificationCode = async () => {
  if (resendCooldown.value > 0) return

  try {
    await request.post('/api/v1/auth/resend-verification', {
      email: email.value
    })

    ElMessage.success('验证码已重新发送')
    startCooldown()

  } catch (error: any) {
    console.error('重发验证码失败:', error)
    ElMessage.error('发送失败，请稍后重试')
  }
}

const startCooldown = () => {
  resendCooldown.value = 60
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer!)
      cooldownTimer = null
    }
  }, 1000)
}


onMounted(() => {
  if (!email.value) {
    ElMessage.warning('请先注册账户')
    router.push('/register')
  }
})

onBeforeUnmount(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
.verification-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.verification-info {
  margin-bottom: 30px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid #007bff;
}

.info-title {
  color: #495057;
  font-size: 16px;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.info-description {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.resend-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.text-primary {
  color: #409eff !important;
  text-decoration: none;
}

.text-primary:hover {
  text-decoration: underline;
}

/* Dark Theme Styles */
:global(.dark-theme) .verification-page {
  background: #1a1a1a;
}

:global(.dark-theme) .auth-card {
  background: #161b22;
  border: 1px solid #30363d;
}

:global(.dark-theme) .info-card {
  background: #0d1117;
  border-color: #30363d;
  border-left-color: #58a6ff;
}

:global(.dark-theme) .info-title {
  color: #f0f6fc;
}

:global(.dark-theme) .info-description {
  color: #8b949e;
}

:global(.dark-theme) .resend-section {
  border-top-color: #30363d;
}
</style>