<template>
  <div class="tab-content">
    <h2 class="mb-4">推广计划</h2>
    <ElCard>
      <div class="promotion-content">
        <div class="promotion-header">
          <h3>邀请好友，共享收益</h3>
          <p class="text-muted">通过推广计划获得更多收益和优惠</p>
        </div>

        <div class="promotion-stats mt-4">
          <div class="row">
            <div class="col-md-4">
              <div class="promotion-stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">邀请人数</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="promotion-stat-card">
                <div class="stat-number">¥0</div>
                <div class="stat-label">累计收益</div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="promotion-stat-card">
                <div class="stat-number">¥0</div>
                <div class="stat-label">本月收益</div>
              </div>
            </div>
          </div>
        </div>

        <div class="promotion-actions mt-4">
          <ElButton type="primary" @click="$emit('getPromotionLink')">获取推广链接</ElButton>
          <ElButton type="default" @click="$emit('viewPromotionRules')">查看推广规则</ElButton>
        </div>

        <div class="promotion-notice mt-4">
          <p class="text-muted">
            <small>
              ⚠️ 推广计划功能即将上线，敬请期待！
            </small>
          </p>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElButton } from 'element-plus'

interface Emits {
  (e: 'getPromotionLink'): void
  (e: 'viewPromotionRules'): void
}

defineEmits<Emits>()
</script>

<style scoped>
.tab-content {
  padding: 20px 0;
}

.promotion-content {
  padding: 20px 0;
}

.promotion-header {
  text-align: center;
  margin-bottom: 30px;
}

.promotion-header h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.promotion-stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 16px;
  border-left: 4px solid #27ae60;
}

.promotion-stat-card .stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 8px;
}

.promotion-stat-card .stat-label {
  color: #666;
  font-size: 0.9rem;
}

.promotion-actions {
  text-align: center;
}

.promotion-actions .el-button {
  margin: 0 10px;
}

.promotion-notice {
  text-align: center;
  padding: 15px;
  background: #fff3cd;
  border-radius: 8px;
}
</style>