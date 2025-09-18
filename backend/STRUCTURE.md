# CCManage 后端目录结构说明

## 重构后的目录结构

```
backend/
├── app/                     # 应用核心代码
│   ├── __init__.py
│   ├── main.py             # FastAPI应用主文件
│   ├── api/                # API路由层
│   │   ├── __init__.py
│   │   └── routes/         # 具体路由模块
│   │       ├── __init__.py
│   │       ├── example.py          # 示例API
│   │       └── api_key_validation.py # API密钥验证
│   ├── core/               # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py       # 应用配置
│   │   └── logging.py      # 日志配置
│   ├── db/                 # 数据库相关
│   │   ├── __init__.py
│   │   ├── database.py     # 数据库连接
│   │   ├── models.py       # SQLAlchemy数据模型
│   │   ├── init_db.py      # 数据库初始化
│   │   └── crud/           # CRUD操作
│   │       ├── __init__.py
│   │       ├── user.py     # 用户CRUD
│   │       ├── api_key.py  # API密钥CRUD
│   │       └── user_plan.py # 用户套餐CRUD
│   ├── schemas/            # Pydantic模型（请求/响应）
│   │   ├── __init__.py
│   │   ├── common.py       # 通用模型
│   │   ├── user.py         # 用户相关模型
│   │   └── api_key.py      # API密钥相关模型
│   └── utils/              # 工具函数
│       └── __init__.py
├── tests/                  # 测试代码
│   └── __init__.py
├── logs/                   # 日志目录
├── venv/                   # Python虚拟环境
├── main.py                 # 应用启动入口
├── test_app.py            # 重构测试脚本
├── .env                   # 环境配置
├── .env.production        # 生产环境配置
└── requirements.txt       # 依赖包列表
```

## 设计原则

### 1. 分层架构
- **API层**: 处理HTTP请求和响应
- **业务逻辑层**: CRUD操作和业务规则
- **数据层**: 数据库模型和连接

### 2. 职责分离
- **配置管理**: 统一在core/config.py
- **日志管理**: 统一在core/logging.py
- **数据模型**: 分为SQLAlchemy模型和Pydantic模型
- **API路由**: 按功能模块分别管理

### 3. 可维护性
- 模块化设计，便于扩展
- 清晰的导入关系
- 统一的错误处理
- 完整的类型注解

## 重构改进

### 重构前的问题
1. 所有文件都在根目录，结构混乱
2. 配置散落在各个文件中
3. 数据模型和API模型混合
4. 缺乏清晰的分层结构

### 重构后的优势
1. **清晰的目录结构**: 按功能和职责组织代码
2. **统一的配置管理**: 所有配置集中管理
3. **分离的关注点**: API、业务逻辑、数据访问分离
4. **便于测试**: 模块化设计便于单元测试
5. **易于扩展**: 新功能可以按照既定模式添加

## 使用指南

### 启动应用
```bash
cd backend
python main.py
```

### 添加新API
1. 在`app/api/routes/`下创建新的路由文件
2. 在`app/schemas/`下定义请求/响应模型
3. 在`app/db/crud/`下添加相关CRUD操作
4. 在`app/main.py`中注册新路由

### 运行测试
```bash
cd backend
python test_app.py
```