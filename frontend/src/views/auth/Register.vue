<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧品牌展示区 (桌面端70%) -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <h1 class="brand-title">agnets.app</h1>
          </div>

          <div class="brand-slogan">
            <h2>开始使用agnets.app</h2>
            <p class="lead">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单区 (桌面端30%) -->
      <div class="auth-section">
        <div class="auth-card">
          <div class="auth-header">
            <h2 class="auth-title">创建账户</h2>
            <p class="auth-subtitle">注册您的agnets.app账户</p>
          </div>

          <ElForm
            :model="registerForm"
            :rules="registerRules"
            ref="registerFormRef"
            @submit.prevent="handleRegister"
            class="auth-form"
          >
              <ElFormItem prop="email">
                <ElInput
                  v-model="registerForm.email"
                  placeholder="邮箱地址"
                  type="email"
                  size="large"
                  :prefix-icon="ElIconMessage"
                />
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  v-model="registerForm.password"
                  placeholder="密码"
                  type="password"
                  size="large"
                  :prefix-icon="ElIconLock"
                  show-password
                />
              </ElFormItem>

              <ElFormItem prop="confirmPassword">
                <ElInput
                  v-model="registerForm.confirmPassword"
                  placeholder="确认密码"
                  type="password"
                  size="large"
                  :prefix-icon="ElIconLock"
                  show-password
                />
              </ElFormItem>

              <ElFormItem>
                <ElCheckbox v-model="registerForm.agreement">
                  我已阅读并同意
                  <a href="#" class="text-primary">服务条款</a>
                  和
                  <a href="#" class="text-primary">隐私政策</a>
                </ElCheckbox>
              </ElFormItem>

            <ElFormItem>
              <ElButton
                type="primary"
                size="large"
                class="auth-submit-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注册账户
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div class="auth-footer">
            <p class="auth-link">
              已有账户？
              <router-link to="/login" class="link-primary">立即登录</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 注册成功提示 -->
    <ElDialog
      v-model="showSuccessDialog"
      title="注册成功"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="text-center">
        <ElIcon size="60" color="#67c23a" class="mb-3">
          <ElIconCircleCheck />
        </ElIcon>
        <p class="mb-3">🎉 验证邮件已发送到您的邮箱</p>
        <p class="text-muted small">
          请查收邮件并点击验证链接完成注册
          <br>
          <strong>📧 {{ registerForm.email }}</strong>
        </p>
        <div class="alert alert-info mt-3">
          <p class="mb-1"><strong>📌 温馨提示：</strong></p>
          <ul class="mb-0 small">
            <li>请检查您的邮箱收件箱</li>
            <li>如未收到，请查看垃圾邮件文件夹</li>
            <li>验证链接有效期为15分钟</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <ElButton type="primary" @click="goToLogin">
          完成注册
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElCheckbox,
  ElDialog,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  Lock as ElIconLock,
  Message as ElIconMessage,
  CircleCheck as ElIconCircleCheck
} from '@element-plus/icons-vue'
import { useThemeStore } from '../../store/theme'
import request from '../../utils/request'

const router = useRouter()
const themeStore = useThemeStore()

const loading = ref(false)
const showSuccessDialog = ref(false)
const registerFormRef = ref()

const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()

    if (!registerForm.agreement) {
      ElMessage.warning('请先同意服务条款和隐私政策')
      return
    }

    loading.value = true

    await request.post('/api/v1/auth/register', {
      email: registerForm.email,
      password: registerForm.password
    })

    ElMessage.success('注册成功，请查收邮件完成验证！')
    showSuccessDialog.value = true

  } catch (error: any) {
    console.error('注册失败:', error)

    if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  showSuccessDialog.value = false
  router.push('/login')
}

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>
.register-page {
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
}

.register-container {
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


/* 右侧注册区域 (桌面端30%) */
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

.auth-footer {
  text-align: center;
}

.auth-link {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.link-primary {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-primary:hover {
  color: #2980b9;
  text-decoration: underline;
}

.alert-info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 15px;
  color: #0c5460;
}

.alert-info ul {
  list-style: none;
  padding-left: 0;
}

.alert-info li {
  margin-bottom: 5px;
  padding-left: 15px;
  position: relative;
}

.alert-info li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #0c5460;
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

  .feature-item {
    padding: 20px;
    margin-bottom: 30px;
  }
}

/* 移动端适配 (隐藏品牌区域) */
@media (max-width: 768px) {
  .register-container {
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

/* 确保Element Plus组件样式 */
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
:global(.dark-theme) .register-page {
  background: #1a1a1a;
}

:global(.dark-theme) .brand-section {
  background: #0f1419;
}

:global(.dark-theme) .brand-title {
  color: #ffffff;
}

:global(.dark-theme) .brand-slogan h2 {
  color: #e1e8ed;
}

:global(.dark-theme) .brand-slogan .lead {
  color: #8b949e;
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

:global(.dark-theme) .auth-link {
  color: #8b949e;
}

:global(.dark-theme) .link-primary {
  color: #58a6ff;
}

:global(.dark-theme) .link-primary:hover {
  color: #79c0ff;
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

:global(.dark-theme) :deep(.el-checkbox__label) {
  color: #8b949e;
}

:global(.dark-theme) :deep(.el-checkbox__inner) {
  background: #0d1117;
  border-color: #30363d;
}

:global(.dark-theme) :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #238636;
  border-color: #238636;
}

/* Dialog dark theme */
:global(.dark-theme) :deep(.el-dialog) {
  background: #0d1117;
  border: 1px solid #30363d;
}

:global(.dark-theme) :deep(.el-dialog__title) {
  color: #f0f6fc;
}

:global(.dark-theme) :deep(.el-dialog__body) {
  color: #8b949e;
}

:global(.dark-theme) .alert-info {
  background-color: #0f3460;
  border-color: #1e4976;
  color: #9bd4f5;
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