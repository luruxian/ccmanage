<template>
  <ElDialog
    v-model="visible"
    title="重置积分确认"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
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
import { ref, watch } from 'vue'
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

.cancel-btn {
  border-radius: 8px;
}

.confirm-btn {
  border-radius: 8px;
  font-weight: 600;
}
</style>