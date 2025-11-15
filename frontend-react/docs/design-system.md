# 设计系统文档

## 概述

这是 agnets.app AI工具管理平台的官方设计系统文档。所有UI设计都必须遵循这个系统的规范。

## 设计原则

### 1. 一致性 (Consistency)
- 所有组件使用统一的设计令牌
- 保持视觉语言的一致性
- 确保交互模式统一

### 2. 可访问性 (Accessibility)
- 颜色对比度符合WCAG标准
- 支持键盘导航
- 提供清晰的视觉层次

### 3. 模块化 (Modularity)
- 组件可复用
- 设计令牌可扩展
- 系统易于维护

## 色彩系统

### 主色调
- **科技蓝**：用于主要按钮、重要链接、品牌标识
- **紫色**：用于辅助元素、次要按钮

### 语义色
- **成功色**：用于成功状态、完成操作
- **警告色**：用于警告状态、需要注意的操作
- **错误色**：用于错误状态、危险操作

### 中性色
- 用于文本、背景、边框等中性元素

### 使用规范
```typescript
// ✅ 正确 - 使用设计令牌
import { colors } from '@/design-tokens'

// ❌ 错误 - 使用硬编码颜色
const color = '#3b82f6'
```

## 字体系统

### 字体族
- **主字体**：Inter (sans-serif)
- **等宽字体**：JetBrains Mono (monospace)

### 字号
- xs: 12px - 辅助文本、标签
- sm: 14px - 正文、表单标签
- base: 16px - 主要文本
- lg: 18px - 小标题
- xl: 20px - 标题
- 2xl: 24px - 大标题
- 3xl: 30px - 特大标题

### 字重
- normal: 400 - 常规文本
- medium: 500 - 中等强调
- semibold: 600 - 较强强调
- bold: 700 - 最强强调

## 间距系统

### 间距比例
基于4px的倍数系统：
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### 使用规范
```typescript
// ✅ 正确 - 使用标准间距
<div className="p-4"> // 16px
<div className="m-2"> // 8px

// ❌ 错误 - 使用任意间距
<div className="p-[10px]">
```

## 圆角系统

### 圆角值
- none: 0px
- sm: 2px
- base: 4px
- md: 6px
- lg: 8px
- xl: 12px
- 2xl: 16px
- full: 完全圆角

## 阴影系统

### 阴影层级
- soft: 轻微阴影，用于卡片悬停
- medium: 中等阴影，用于模态框
- large: 强烈阴影，用于重要元素

## 动画系统

### 持续时间
- fast: 150ms - 快速交互
- normal: 300ms - 标准过渡
- slow: 500ms - 强调动画

### 缓动函数
- ease: 标准缓动
- easeIn: 加速进入
- easeOut: 减速退出
- easeInOut: 加速进入减速退出

## 组件规范

### 按钮组件
```typescript
// 主要按钮 - 用于主要操作
<Button variant="default">主要操作</Button>

// 次要按钮 - 用于次要操作
<Button variant="secondary">次要操作</Button>

// 轮廓按钮 - 用于非主要操作
<Button variant="outline">轮廓按钮</Button>

// 幽灵按钮 - 用于工具栏
<Button variant="ghost">幽灵按钮</Button>

// 链接按钮 - 用于导航
<Button variant="link">链接按钮</Button>
```

### 卡片组件
```typescript
// 基础卡片
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
</Card>
```

### 表单组件
```typescript
// 输入框
<Input placeholder="请输入内容" />

// 标签
<Label htmlFor="input">标签</Label>
```

## 设计令牌使用

### 导入设计令牌
```typescript
import { colors, spacing, typography } from '@/design-tokens'
```

### 在组件中使用
```typescript
// 使用颜色
const primaryColor = colors.primary[500]

// 使用间距
const padding = spacing.md

// 使用字体
const fontSize = typography.fontSize.lg
```

## 代码审查检查清单

### 设计系统合规性
- [ ] 颜色使用设计令牌
- [ ] 间距使用标准值
- [ ] 字体使用标准设置
- [ ] 圆角使用标准值
- [ ] 阴影使用标准层级

### 可访问性
- [ ] 颜色对比度足够
- [ ] 支持键盘导航
- [ ] 有适当的焦点状态
- [ ] 图片有alt文本

### 响应式设计
- [ ] 移动端适配
- [ ] 平板端适配
- [ ] 桌面端适配

## 版本管理

### 设计系统版本
- 当前版本：1.0.0
- 基于语义化版本控制

### 变更日志
- 1.0.0 (2024-11-12): 初始版本发布

## 贡献指南

### 新增设计令牌
1. 在 `src/design-tokens.ts` 中添加新令牌
2. 更新相关文档
3. 创建测试用例
4. 提交Pull Request

### 修改现有令牌
1. 评估影响范围
2. 更新所有使用位置
3. 更新文档
4. 进行回归测试

## 常见问题

### Q: 如何添加新的颜色？
A: 在 `design-tokens.ts` 的 `colors` 对象中添加，然后更新CSS变量和Tailwind配置。

### Q: 如何自定义组件样式？
A: 使用设计令牌和标准CSS类，避免使用硬编码值。

### Q: 设计系统不满足需求怎么办？
A: 首先检查是否可以扩展现有系统，如果确实需要新功能，请提交Issue讨论。

---

**最后更新**: 2024-11-12
**维护者**: 前端团队