# 使用履历页面修改测试

## 修改内容
1. 删除了"总Token数"、"总积分消耗"和"服务类型数"三个统计项
2. 只保留"总请求次数"一个统计项
3. 优化了页面布局，使其更紧凑

## 测试步骤

### 前端服务
- URL: http://localhost:5183
- 状态: ✅ 运行中

### 后端服务
- URL: http://localhost:8001
- 状态: ✅ 运行中

### 测试验证
1. 访问 http://localhost:5183
2. 登录系统
3. 进入Dashboard页面的API密钥管理
4. 点击任意密钥的"履历"按钮
5. 验证使用统计区域只显示"总请求次数"一项
6. 验证布局更紧凑合理

## 文件变更
- ✅ 修改了 `frontend/src/views/Dashboard.vue`
- ✅ 删除了 `frontend/src/views/UsageHistory.vue`
- ✅ 更新了 `frontend/src/router/index.ts`

## 预期结果
- 使用履历页面只显示"总请求次数"统计
- 页面布局更简洁紧凑
- 不再存在独立的UsageHistory页面
- 所有使用履历功能都在Dashboard页面内展示