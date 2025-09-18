# 数据库集成说明

## 概述

本项目已成功集成MySQL数据库，替换了原有的模拟数据存储。现在支持完整的用户管理、API密钥验证、套餐管理和使用记录追踪。

## 数据库配置

### 环境变量配置 (.env)

```bash
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=ccmanage

# 数据库连接池配置
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### 依赖包

```bash
pip install sqlalchemy pymysql alembic
```

## 数据库表结构

### 1. users (用户表)
- `id`: 主键
- `user_id`: 用户唯一标识
- `username`: 用户名
- `email`: 邮箱
- `phone`: 手机号
- `is_active`: 账户是否激活
- `is_banned`: 账户是否被封禁

### 2. api_keys (API密钥表)
- `id`: 主键
- `user_id`: 关联用户ID
- `api_key`: 自定义API密钥
- `real_api_key`: 真实API密钥
- `key_name`: 密钥名称
- `is_active`: 密钥是否激活

### 3. user_plans (用户套餐表)
- `id`: 主键
- `user_id`: 关联用户ID
- `plan_type`: 套餐类型 (basic/premium/enterprise)
- `credits`: 剩余积分
- `expire_date`: 过期时间

### 4. usage_records (使用记录表)
- `id`: 主键
- `user_id`: 关联用户ID
- `api_key_id`: 关联API密钥ID
- `service`: 服务类型
- `credits_used`: 消耗积分

### 5. rate_limits (频率限制表)
- `id`: 主键
- `user_id`: 关联用户ID
- `service`: 服务类型
- `requests_count`: 请求次数
- `window_start/end`: 时间窗口

## 初始化数据库

### 方法1：使用初始化脚本

```bash
# 初始化数据库（创建表和测试数据）
python init_db.py

# 重置数据库（删除所有数据并重新创建）
python init_db.py --reset

# 仅创建测试数据
python init_db.py --test-data-only
```

### 方法2：自动初始化

启动应用时会自动检查并创建数据库表结构。

## 测试数据

初始化脚本会创建以下测试数据：

### 用户数据
- `user_001`: 正常用户，premium套餐
- `user_002`: 套餐过期用户
- `user_003`: 被封禁用户

### API密钥
- `test_api_key_123`: 正常可用密钥
- `expired_key_456`: 关联过期套餐的密钥
- `banned_key_789`: 关联被封禁用户的密钥

## API端点

### POST /api/v1/validate-api-key

**请求示例：**
```json
{
  "api_key": "test_api_key_123",
  "timestamp": "2024-01-01T12:00:00Z",
  "service": "llm_proxy"
}
```

**成功响应 (200)：**
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "valid": true,
    "real_api_key": "sk-deepseek-abc123def456",
    "user_id": "user_001",
    "plan_type": "premium"
  }
}
```

**错误响应 (401/403)：**
```json
{
  "status": "error",
  "code": 1001,
  "message": "Plan expired",
  "data": {
    "valid": false,
    "error_type": "plan_expired",
    "expire_date": "2024-01-01"
  }
}
```

## 错误代码

- `1001`: 套餐过期
- `1002`: 积分耗尽
- `1003`: API key无效
- `1004`: 账户被封禁
- `1005`: 请求频率超限
- `1006`: 校验服务超时
- `1007`: 校验服务不可用
- `1008`: 内部校验错误

## 启动服务

```bash
# 开发模式
python main.py

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 健康检查

访问 `GET /` 端点可以检查服务和数据库连接状态：

```json
{
  "status": "ok",
  "message": "CCManage backend service is running",
  "database": "connected",
  "version": "1.0.0"
}
```

## 注意事项

1. 确保MySQL服务正在运行
2. 创建数据库：`CREATE DATABASE ccmanage CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
3. 数据库用户需要有创建表的权限
4. 生产环境请修改默认密码和配置