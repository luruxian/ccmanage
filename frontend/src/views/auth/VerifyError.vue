<template>
  <div class="verify-error-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="auth-card">
            <div class="text-center mb-4">
              <ElIcon size="80" color="#f56c6c" class="mb-3">
                <ElIconCircleClose />
              </ElIcon>
              <h2 class="fw-bold text-danger">验证失败</h2>
              <p class="text-muted">
                😔 验证链接无效或已过期
                <br>
                请重新尝试验证
              </p>
            </div>

            <div class="error-content mb-4">
              <div class="alert alert-danger">
                <p class="mb-2">
                  <strong>可能的原因：</strong>
                </p>
                <ul class="mt-2 mb-0">
                  <li>🕐 验证链接已过期（15分钟有效期）</li>
                  <li>🔗 验证链接格式不正确</li>
                  <li>✅ 邮箱已经验证过了</li>
                  <li>🚫 验证链接已经使用过了</li>
                </ul>
              </div>
            </div>

            <div class="text-center mb-3">
              <ElButton
                type="primary"
                size="large"
                style="width: 100%"
                @click="goToRegister"
              >
                重新注册
              </ElButton>
            </div>

            <div class="text-center">
              <ElButton
                type="text"
                size="large"
                style="width: 100%"
                @click="goToLogin"
              >
                已有账户？去登录
              </ElButton>
            </div>

            <div class="text-center mt-4">
              <p class="text-muted small">
                需要帮助？请联系我们：
                <br>
                📧 support@agnets.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  ElButton,
  ElIcon
} from 'element-plus'
import {
  CircleClose as ElIconCircleClose
} from '@element-plus/icons-vue'

const router = useRouter()

const goToRegister = () => {
  router.push('/register')
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.verify-error-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.error-content {
  text-align: left;
}

.error-content ul {
  list-style: none;
  padding-left: 0;
}

.error-content li {
  margin-bottom: 8px;
  padding-left: 5px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  color: #721c24;
}

/* Dark Theme Styles */
:global(.dark-theme) .verify-error-page {
  background: #1a1a1a;
}

:global(.dark-theme) .auth-card {
  background: #161b22;
  border: 1px solid #30363d;
}

:global(.dark-theme) .alert-danger {
  background-color: #842029;
  border-color: #6c1e1e;
  color: #f8d7da;
}
</style>