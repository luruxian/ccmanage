# 安装指南

## 解决依赖问题

项目启动时出现了依赖缺失的错误，这是因为缺少Radix UI相关包。我已经更新了package.json文件，现在需要安装依赖。

## 安装步骤

1. **删除现有的node_modules和package-lock.json**（如果存在）：
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **安装所有依赖**：
   ```bash
   npm install
   ```

3. **启动开发服务器**：
   ```bash
   npm run dev
   ```

## 新增的依赖包

为了解决组件导入错误，我添加了以下依赖：

- `@radix-ui/react-slot` - Button组件需要
- `@radix-ui/react-label` - Label组件需要

## 验证安装

安装完成后，项目应该能够正常启动，不再出现以下错误：
- "Failed to resolve import \"@radix-ui/react-slot\""
- "Failed to resolve import \"@radix-ui/react-label\""

## 如果仍有问题

如果安装后仍有问题，请尝试：

1. 清除npm缓存：
   ```bash
   npm cache clean --force
   ```

2. 重新安装：
   ```bash
   npm install
   ```

3. 检查Node.js版本（推荐使用Node.js 18+）