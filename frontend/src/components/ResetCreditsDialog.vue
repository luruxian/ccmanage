<template>
  <ElDialog
    v-model="visible"
    title="重置积分确认"
    :width="dialogWidth"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :custom-class="dialogClass"
    class="reset-credits-dialog"
  >
    <div class="dialog-content">
      <div class="dialog-icon">
        <div class="icon-wrapper">
          <i class="fas fa-sync-alt"></i>
        </div>
      </div>
      <div class="dialog-text">
        <h3 class="dialog-title">确认重置积分</h3>
        <p class="dialog-subtitle">您即将重置以下订阅的积分</p>
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
        <div class="warning-note">
          <i class="fas fa-exclamation-triangle"></i>
          <span>重置后积分将恢复到总积分数量，每天只能重置一次！</span>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel" class="cancel-btn">
          取消
        </ElButton>
        <ElButton
          type="primary"
          @click="handleConfirm"
          :loading="loading"
          class="confirm-btn"
        >
          {{ loading ? '重置中...' : '确认重置' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElDialog, ElButton } from 'element-plus'

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

// 响应式对话框宽度
const dialogWidth = computed(() => {
  // 移动端使用自适应宽度，桌面端使用500px
  return window.innerWidth < 768 ? undefined : '500px'
})

// 响应式对话框类名
const dialogClass = computed(() => {
  return window.innerWidth < 768 ? 'mobile-dialog' : 'desktop-dialog'
})

// 监听外部visible变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
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
</script>

<style scoped>
.reset-credits-dialog {
  border-radius: 16px;
}

/* 移动端对话框样式 */
:deep(.mobile-dialog) {
  .el-dialog {
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    border-radius: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .el-dialog__header {
    padding: 16px 20px 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .el-dialog__body {
    padding: 16px 20px;
    flex: 1;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid #e5e7eb;
  }

  /* 移动端内容优化 */
  .dialog-content {
    padding: 10px 0;
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

  .key-info {
    padding: 12px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .info-item .label {
    margin-bottom: 4px;
    font-size: 13px;
  }

  .info-item .value {
    font-size: 14px;
  }

  .warning-note {
    padding: 10px 12px;
    font-size: 13px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
    margin: 0;
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
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
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #64748b;
  font-weight: 500;
}

.info-item .value {
  color: #1e293b;
  font-weight: 600;
}

.warning-note {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 16px;
  color: #92400e;
  font-size: 14px;
}

.warning-note i {
  margin-right: 8px;
  color: #f59e0b;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* 移动端响应式适配 */
@media (max-width: 768px) {
  .dialog-content {
    padding: 15px 0;
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

  .key-info {
    padding: 12px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .info-item:last-child {
    margin-bottom: 0;
  }

  .info-item .label {
    margin-bottom: 4px;
    font-size: 13px;
  }

  .info-item .value {
    font-size: 14px;
  }

  .warning-note {
    padding: 10px 12px;
    font-size: 13px;
  }

  .dialog-footer {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
    margin: 0;
  }
}

.cancel-btn {
  border-radius: 8px;
}

.confirm-btn {
  border-radius: 8px;
  font-weight: 600;
}
</style>