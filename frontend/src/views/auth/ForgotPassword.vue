<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <!-- 左侧品牌展示区 (桌面端70%) -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <i class="fas fa-lock"></i>
            </div>
            <h1 class="brand-title">agnets.app</h1>
          </div>

          <div class="brand-slogan">
            <h2>重置密码</h2>
            <p class="lead">我们将发送重置链接到您的邮箱</p>
          </div>
        </div>
      </div>

      <!-- 右侧忘记密码表单区 (桌面端30%) -->
      <div class="auth-section">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">忘记密码？</h2>
            <p class="auth-subtitle">输入您的邮箱地址，我们将发送重置链接</p>
          </div>

          <!-- 成功消息显示 -->
          <div v-if="emailSent" class="success-message">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>邮件已发送</h3>
            <p>
              我们已向 <strong>{{ forgotForm.email }}</strong> 发送了密码重置链接。
              <br>请检查您的邮箱并点击链接重置密码。
            </p>
            <p class="help-text">
              没有收到邮件？请检查垃圾邮件文件夹，或
              <a href="#" @click="resendEmail" class="resend-link">重新发送</a>
            </p>
          </div>

          <!-- 忘记密码表单 -->
          <ElForm
            v-if="!emailSent"
            :model="forgotForm"
            :rules="forgotRules"
            ref="forgotFormRef"
            @submit.prevent="handleForgotPassword"
            class="auth-form"
          >
            <ElFormItem prop="email">
              <ElInput
                v-model="forgotForm.email"
                placeholder="请输入您的邮箱地址"
                type="email"
                size="large"
                :prefix-icon="ElIconMessage"
              />
            </ElFormItem>

            <ElFormItem>
              <ElButton
                type="primary"
                size="large"
                class="auth-submit-btn"
                :loading="loading"
                @click="handleForgotPassword"
              >
                发送重置邮件
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div class="auth-footer">
            <router-link to="/login" class="back-link">
              <i class="fas fa-arrow-left"></i>
              返回登录
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
// import { useRouter } from 'vue-router' // 未使用，已注释
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { Message as ElIconMessage } from '@element-plus/icons-vue'
import request from '../../utils/request'

// const router = useRouter() // 未使用，已注释

const loading = ref(false)
const emailSent = ref(false)
const forgotFormRef = ref()

const forgotForm = reactive({
  email: ''
})

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

const handleForgotPassword = async () => {
  if (!forgotFormRef.value) return

  try {
    await forgotFormRef.value.validate()
    loading.value = true

    await request.post('/api/v1/auth/password-reset', {
      email: forgotForm.email
    })

    emailSent.value = true
    ElMessage.success('重置邮件发送成功')

  } catch (error: any) {
    console.error('发送重置邮件失败:', error)

    if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('发送失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const resendEmail = async () => {
  await handleForgotPassword()
}
</script>

<style scoped>
.forgot-password-page {
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
}

.forgot-password-container {
  display: flex;
  height: 100vh;
}

/* 左侧品牌区域 (桌面端70%) */
.brand-section {
  flex: 0 0 70%;
  background: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: white;
  position: relative;
}

.brand-content {
  text-align: center;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.brand-logo {
  margin-bottom: 40px;
}

.logo-icon {
  width: 120px;
  height: 120px;
  background: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  border: 3px solid #3498db;
}

.logo-icon i {
  font-size: 48px;
  color: #3498db;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
  color: white;
}

.brand-slogan {
  margin-bottom: 0;
}

.brand-slogan h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ecf0f1;
}

.brand-slogan .lead {
  font-size: 1.25rem;
  color: #bdc3c7;
  font-weight: 300;
}

/* 右侧表单区域 (桌面端30%) */
.auth-section {
  flex: 0 0 30%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  position: relative;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

.auth-form {
  margin-bottom: 30px;
}

.auth-form .el-form-item {
  margin-bottom: 24px;
}

.auth-submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #3498db;
  border: none;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;
}

.auth-submit-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.5);
}

/* 成功消息样式 */
.success-message {
  text-align: center;
  padding: 30px 20px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
  margin-bottom: 30px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon i {
  font-size: 48px;
  color: #059669;
}

.success-message h3 {
  color: #065f46;
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: 600;
}

.success-message p {
  color: #047857;
  margin-bottom: 10px;
  line-height: 1.6;
}

.help-text {
  font-size: 14px;
  color: #6b7280;
}

.resend-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.resend-link:hover {
  text-decoration: underline;
}

.auth-footer {
  text-align: center;
}

.back-link {
  color: #7f8c8d;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #3498db;
  text-decoration: none;
}

/* 平板端适配 (768px - 1024px) */
@media (max-width: 1024px) {
  .brand-section {
    flex: 0 0 60%;
    padding: 40px;
  }

  .auth-section {
    flex: 0 0 40%;
    padding: 40px 30px;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-slogan h2 {
    font-size: 1.5rem;
  }
}

/* 移动端适配 (隐藏品牌区域) */
@media (max-width: 768px) {
  .forgot-password-container {
    flex-direction: column;
  }

  .brand-section {
    display: none;
  }

  .auth-section {
    flex: 1;
    min-height: 100vh;
    padding: 40px 20px;
    background: #f8f9fa;
    box-shadow: none;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid #e1e8ed;
  }

  .auth-title {
    color: #2c3e50;
  }

  .auth-subtitle {
    color: #5a6c7d;
  }
}

/* 小屏移动端 */
@media (max-width: 480px) {
  .auth-section {
    padding: 20px 15px;
  }

  .auth-card {
    padding: 30px 20px;
  }

  .auth-title {
    font-size: 1.5rem;
  }
}

/* Element Plus组件样式 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #3498db;
  box-shadow: 0 2px 12px rgba(52, 152, 219, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

:deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
}

:deep(.el-form-item__error) {
  margin-top: 8px;
}

/* Dark Theme Styles */
:global(.dark-theme) .forgot-password-page {
  background: #1a1a1a;
}

:global(.dark-theme) .brand-section {
  background: #0f1419;
}

:global(.dark-theme) .auth-section {
  background: #161b22;
  box-shadow: -10px 0 30px rgba(0,0,0,0.3);
}

:global(.dark-theme) .auth-card {
  background: #0d1117;
  border: 1px solid #30363d;
}

:global(.dark-theme) .auth-title {
  color: #f0f6fc;
}

:global(.dark-theme) .auth-subtitle {
  color: #8b949e;
}

:global(.dark-theme) .success-message {
  background: #0d2818;
  border-color: #1e3a2e;
}

:global(.dark-theme) .success-message h3 {
  color: #22c55e;
}

:global(.dark-theme) .success-message p {
  color: #16a34a;
}

:global(.dark-theme) .help-text {
  color: #8b949e;
}

:global(.dark-theme) .resend-link {
  color: #58a6ff;
}

:global(.dark-theme) .back-link {
  color: #8b949e;
}

:global(.dark-theme) .back-link:hover {
  color: #58a6ff;
}

:global(.dark-theme) .auth-submit-btn {
  background: #238636;
  box-shadow: 0 4px 15px rgba(35, 134, 54, 0.4);
}

:global(.dark-theme) .auth-submit-btn:hover {
  background: #2ea043;
  box-shadow: 0 6px 20px rgba(35, 134, 54, 0.5);
}

/* Dark theme Element Plus overrides */
:global(.dark-theme) :deep(.el-input__wrapper) {
  background: #0d1117;
  border-color: #30363d;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

:global(.dark-theme) :deep(.el-input__wrapper:hover) {
  border-color: #58a6ff;
  box-shadow: 0 2px 12px rgba(88, 166, 255, 0.15);
}

:global(.dark-theme) :deep(.el-input__wrapper.is-focus) {
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
}

:global(.dark-theme) :deep(.el-input__inner) {
  background: transparent;
  color: #f0f6fc;
}

:global(.dark-theme) :deep(.el-input__inner::placeholder) {
  color: #6e7681;
}

/* Mobile dark theme adjustments */
@media (max-width: 768px) {
  :global(.dark-theme) .auth-section {
    background: #0d1117;
  }

  :global(.dark-theme) .auth-card {
    background: #161b22;
    border: 1px solid #30363d;
  }
}
</style>