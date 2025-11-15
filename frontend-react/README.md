# CCManage React Frontend

基于React和shadcn/ui组件库构建的前端项目。

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - 组件库
- **React Router** - 路由管理
- **Lucide React** - 图标库

## 项目结构

```
frontend-react/
├── src/
│   ├── main.tsx          # 应用入口
│   ├── App.tsx           # 主应用组件
│   └── index.css         # 全局样式
├── components/
│   ├── ui/               # shadcn/ui组件
│   ├── Layout.tsx        # 布局组件
│   ├── Header.tsx        # 头部组件
│   └── Sidebar.tsx       # 侧边栏组件
├── pages/
│   ├── Home.tsx          # 首页
│   └── Login.tsx         # 登录页
├── hooks/                # 自定义Hooks
├── utils/                # 工具函数
├── types/                # TypeScript类型定义
└── lib/
    └── utils.ts          # 工具函数
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 功能特性

- ✅ 响应式设计
- ✅ 暗色/亮色主题支持
- ✅ 现代化UI组件
- ✅ TypeScript类型安全
- ✅ ESLint代码规范
- ✅ 路由管理
- ✅ 组件化架构

## 组件说明

### 基础组件

- **Button** - 按钮组件
- **Card** - 卡片容器
- **Input** - 输入框
- **Label** - 标签

### 页面组件

- **Home** - 仪表板首页
- **Login** - 登录页面

### 布局组件

- **Layout** - 主布局
- **Header** - 页面头部
- **Sidebar** - 侧边导航

## 开发规范

- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 组件采用函数式组件和Hooks
- 样式使用Tailwind CSS类名
- 组件按功能模块组织