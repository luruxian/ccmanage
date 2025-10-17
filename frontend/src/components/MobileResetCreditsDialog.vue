<template>
  <div
    v-if="visible"
    class="mobile-reset-dialog-overlay"
    @click="handleOverlayClick"
  >
    <div
      class="mobile-reset-dialog"
      @click.stop
    >
      <!-- 头部拖拽区域 -->
      <div class="dialog-header">
        <div class="drag-handle"></div>
      </div>

      <!-- 内容区域 -->
      <div class="dialog-content">
        <!-- 图标 -->
        <div class="dialog-icon">
          <div class="icon-wrapper">
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>

        <!-- 文本内容 -->
        <div class="dialog-text">
          <h3 class="dialog-title">确认重置积分</h3>
          <p class="dialog-subtitle">您即将重置以下订阅的积分</p>

          <!-- 订阅信息 -->
          <div class="key-info">
            <div class="info-item">
              <span class="label">订阅名称：</span>
              <span class="value">{{ keyData?.package_name || '未知订阅' }}</span>
            </div>
            <div class="info-item">
              <span class="label">当前积分：</span>
              <span class="value">{{ keyData?.remaining_credits || 0 }} / {{ keyData?.total_credits || 0 }}</span>
            </div>
          </div>

          <!-- 警告提示 -->
          <div class="warning-note">
            <i class="fas fa-exclamation-triangle"></i>
            <span>重置后积分将恢复到总积分数量，每天只能重置一次！</span>
          </div>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="dialog-footer">
        <button
          @click="handleCancel"
          class="cancel-btn"
          :disabled="loading"
        >
          取消
        </button>
        <button
          @click="handleConfirm"
          class="confirm-btn"
          :disabled="loading"
        >
          {{ loading ? '重置中...' : '确认重置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface ApiKey {
  user_key_id: string
  package_name?: string
  remaining_credits?: number
  total_credits?: number
}

interface Props {
  modelValue: boolean
  keyData?: ApiKey | null
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', key: ApiKey | null): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  keyData: null,
  loading: false
})

const emit = defineEmits<Emits>()

const visible = ref(props.modelValue)


// 监听外部visible变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 监听内部visible变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleConfirm = () => {
  emit('confirm', props.keyData)
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}

const handleOverlayClick = () => {
  handleCancel()
}


onMounted(() => {
  // 监听键盘事件
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && visible.value) {
      handleCancel()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  })
})
</script>

<style scoped>
.mobile-reset-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.mobile-reset-dialog {
  background: white;
  width: 100%;
  max-width: 100vw;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 16px 0 8px;
  display: flex;
  justify-content: center;
  cursor: grab;
}

.drag-handle {
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
}

.dialog-content {
  flex: 1;
  padding: 0 20px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-icon {
  margin-bottom: 20px;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.dialog-text {
  text-align: center;
  width: 100%;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.dialog-subtitle {
  color: #64748b;
  margin-bottom: 20px;
  font-size: 14px;
}

.key-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  width: 100%;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
}

.info-item .value {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}

.warning-note {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.4;
  width: 100%;
}

.warning-note i {
  margin-right: 8px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 1px;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e5e7eb;
}

.cancel-btn:active {
  background: #f1f5f9;
}

.confirm-btn {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.confirm-btn:active {
  background: #1e40af;
}

.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .dialog-content {
    padding: 0 16px 16px;
  }

  .dialog-footer {
    padding: 16px;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .dialog-title {
    font-size: 18px;
  }

  .dialog-subtitle {
    font-size: 13px;
  }
}
</style>