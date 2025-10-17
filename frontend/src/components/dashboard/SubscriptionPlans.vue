<template>
  <div class="tab-content">
    <h2 class="mb-4">订阅一览</h2>
    <div class="packages-content">
      <div class="packages-header mb-4">
        <p class="text-muted">选择最适合您的订阅计划，每日10000积分，支持每天重置一次</p>
      </div>

      <div class="row">
        <div class="col-md-4">
          <ElCard class="package-card">
            <template #header>
              <div class="package-header">
                <h4>一日体验卡</h4>
                <div class="package-price">
                  <span class="price">¥9.8</span>
                  <span class="period">/日</span>
                </div>
              </div>
            </template>
            <div class="package-content">
              <ul class="package-features">
                <li>✓ 24小时有效期</li>
                <li>✓ 每日10000积分</li>
                <li>✓ 支持每天重置一次</li>
                <li>✓ 即买即用</li>
                <li>✓ 适合短期试用</li>
              </ul>
              <ElButton type="primary" class="package-btn" @click="$emit('day-card-click')">立即购买</ElButton>
            </div>
          </ElCard>
        </div>

        <div class="col-md-4">
          <ElCard class="package-card">
            <template #header>
              <div class="package-header">
                <h4>七日行</h4>

                <div class="package-price">
                  <span class="price">¥49.8</span>
                  <span class="period">/周</span>
                </div>
              </div>
            </template>
            <div class="package-content">
              <ul class="package-features">
                <li>✓ 7天有效期 (168小时)</li>
                <li>✓ 每日10000积分</li>
                <li>✓ 支持每天重置一次</li>
                <li>✓ 性价比超值</li>
                <li>✓ 适合中短期项目</li>
              </ul>
              <ElButton type="primary" class="package-btn" @click="$emit('week-card-click')">立即购买</ElButton>
            </div>
          </ElCard>
        </div>

        <div class="col-md-4">
          <ElCard class="package-card featured">
            <template #header>
              <div class="package-header">
                <h4>月享卡</h4>
                <div class="package-badge">推荐</div>
                <div class="package-price">
                  <span class="price">¥199</span>
                  <span class="period">/月</span>
                </div>
              </div>
            </template>
            <div class="package-content">
              <ul class="package-features">
                <li>✓ 30天有效期 (720小时)</li>
                <li>✓ 每日10000积分</li>
                <li>✓ 支持每天重置一次</li>
                <li>✓ 最超值选择</li>
                <li>✓ 适合长期使用</li>
                <li>✓ 专属客服支持</li>
              </ul>
              <ElButton type="primary" class="package-btn" @click="$emit('month-card-click')">立即购买</ElButton>
            </div>
          </ElCard>
        </div>
      </div>

      <div class="packages-notice mt-4">
        <ElCard>
          <div class="notice-content">
            <h5>💡 订阅说明</h5>
            <p class="text-muted">
              • 日卡：适合临时使用和功能体验<br>
              • 周卡：适合短期项目开发和测试<br>
              • 月卡：适合长期开发和持续使用<br>
              • 所有计划均提供每日10000积分，每天可重置一次<br>
              • 购买后不生效，激活后才开始生效计时。
            </p>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElButton } from 'element-plus'

interface Emits {
  (e: 'day-card-click'): void
  (e: 'week-card-click'): void
  (e: 'month-card-click'): void
}

const emit = defineEmits<Emits>()
</script>