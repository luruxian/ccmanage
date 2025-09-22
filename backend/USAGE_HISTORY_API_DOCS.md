# Usage History API 使用文档

## 概述

Usage History API 提供了完整的用户API使用履历记录和查询功能，支持记录每次API调用的详细信息，包括调用时间、消耗的token数据等。

## 基础信息

- **Base URL**: `http://localhost:8001/api/v1/usage`
- **认证方式**: 无需认证，支持直接调用
- **内容类型**: `application/json`

## API端点列表

### 1. 记录API使用履历

**POST** `/api/v1/usage/record`

记录一次API调用的使用情况。

#### 请求参数

```json
{
  "user_id": "user_abc123",              // 用户ID，必填
  "api_key_id": 456,                     // API密钥ID，必填
  "service": "chat-completion",          // 服务类型，必填
  "input_tokens": 100,                   // 输入token数量，必填
  "output_tokens": 50,                   // 输出token数量，必填
  "total_tokens": 150,                   // 总token数量，可选（自动计算）
  "credits_used": 10,                    // 消耗积分，默认0
  "response_status": "success",          // 响应状态，默认"success"
  "error_message": null                  // 错误信息，可选
}
```

#### 响应示例

```json
{
  "message": "使用记录创建成功",
  "record_id": 123,
  "timestamp": "2025-09-22T15:30:00.000Z"
}
```

#### cURL示例

```bash
curl -X POST "http://localhost:8001/api/v1/usage/record" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_abc123",
    "api_key_id": 456,
    "service": "chat-completion",
    "input_tokens": 100,
    "output_tokens": 50,
    "credits_used": 10
  }'
```

---

### 2. 获取使用履历

**GET** `/api/v1/usage/history`

获取当前用户的API使用履历，支持分页和筛选。

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `user_id` | string | 必填 | 用户ID |
| `page` | int | 1 | 页码（≥1） |
| `page_size` | int | 20 | 每页数量（1-100） |
| `service` | string | null | 服务类型筛选 |
| `start_date` | datetime | null | 开始时间（ISO格式） |
| `end_date` | datetime | null | 结束时间（ISO格式） |

#### 响应示例

```json
{
  "records": [
    {
      "id": 123,
      "user_id": "user_abc123",
      "api_key_id": 456,
      "service": "chat-completion",
      "request_count": 1,
      "credits_used": 10,
      "input_tokens": 100,
      "output_tokens": 50,
      "total_tokens": 150,
      "request_timestamp": "2025-09-22T15:30:00.000Z",
      "response_status": "success",
      "error_message": null
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20,
  "pages": 3,
  "has_next": true,
  "has_prev": false
}
```

#### cURL示例

```bash
# 基础查询
curl -X GET "http://localhost:8001/api/v1/usage/history?user_id=user_abc123"

# 带筛选条件的查询
curl -X GET "http://localhost:8001/api/v1/usage/history?user_id=user_abc123&page=1&page_size=10&service=chat-completion&start_date=2025-09-01T00:00:00Z"
```

---

### 3. 获取使用统计

**GET** `/api/v1/usage/stats`

获取当前用户的使用统计数据，包括总体统计、服务分类统计和每日使用趋势。

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `user_id` | string | 必填 | 用户ID |
| `start_date` | datetime | 30天前 | 统计开始时间 |
| `end_date` | datetime | 当前时间 | 统计结束时间 |

#### 响应示例

```json
{
  "total_requests": 150,
  "total_credits": 1000,
  "total_input_tokens": 15000,
  "total_output_tokens": 7500,
  "total_tokens": 22500,
  "service_breakdown": [
    {
      "service": "chat-completion",
      "request_count": 100,
      "total_credits": 800,
      "total_tokens": 18000
    },
    {
      "service": "embedding",
      "request_count": 50,
      "total_credits": 200,
      "total_tokens": 4500
    }
  ],
  "daily_usage": [
    {
      "date": "2025-09-22",
      "request_count": 10,
      "total_tokens": 1500
    },
    {
      "date": "2025-09-21",
      "request_count": 8,
      "total_tokens": 1200
    }
  ]
}
```

#### cURL示例

```bash
# 默认统计（最近30天）
curl -X GET "http://localhost:8001/api/v1/usage/stats?user_id=user_abc123"

# 指定时间范围统计
curl -X GET "http://localhost:8001/api/v1/usage/stats?user_id=user_abc123&start_date=2025-09-01T00:00:00Z&end_date=2025-09-22T23:59:59Z"
```

---

### 4. 获取API密钥使用统计

**GET** `/api/v1/usage/api-key/{api_key_id}/stats`

获取特定API密钥的使用统计信息。

#### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `api_key_id` | int | API密钥ID |

#### 响应示例

```json
{
  "api_key_id": 456,
  "total_requests": 75,
  "total_credits": 500,
  "total_tokens": 11250,
  "last_used_at": "2025-09-22T15:30:00.000Z"
}
```

#### cURL示例

```bash
curl -X GET "http://localhost:8001/api/v1/usage/api-key/456/stats"
```

---

### 5. 获取可用服务类型

**GET** `/api/v1/usage/services`

获取可用的服务类型列表。可选择性地提供用户ID来获取用户使用过的服务类型。

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `user_id` | string | null | 用户ID（可选，不提供则返回所有服务类型） |

#### 响应示例

```json
[
  "chat-completion",
  "embedding",
  "image-generation",
  "text-completion",
  "code-completion",
  "translation",
  "summarization"
]
```

#### cURL示例

```bash
# 获取所有服务类型
curl -X GET "http://localhost:8001/api/v1/usage/services"

# 获取特定用户使用过的服务类型
curl -X GET "http://localhost:8001/api/v1/usage/services?user_id=user_abc123"
```

---

### 6. 清理旧记录

**DELETE** `/api/v1/usage/cleanup`

清理旧的使用记录。

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `days_to_keep` | int | 90 | 保留天数（1-365） |

#### 响应示例

```json
{
  "message": "成功删除 150 条旧记录"
}
```

#### cURL示例

```bash
curl -X DELETE "http://localhost:8001/api/v1/usage/cleanup?days_to_keep=90"
```

---

## 常见服务类型

| 服务类型 | 说明 |
|----------|------|
| `chat-completion` | 聊天对话生成 |
| `text-completion` | 文本补全 |
| `embedding` | 文本嵌入向量 |
| `image-generation` | 图像生成 |
| `code-completion` | 代码补全 |
| `translation` | 文本翻译 |
| `summarization` | 文本摘要 |

---

## 错误响应

API调用失败时会返回错误信息：

```json
{
  "detail": "错误描述信息"
}
```

常见HTTP状态码：
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 使用示例

### Python示例

```python
import requests
import json
from datetime import datetime, timedelta

# 配置
BASE_URL = "http://localhost:8001/api/v1"

headers = {
    "Content-Type": "application/json"
}

# 记录使用情况
def record_usage(user_id, api_key_id, service, input_tokens, output_tokens, credits_used=0):
    data = {
        "user_id": user_id,
        "api_key_id": api_key_id,
        "service": service,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "credits_used": credits_used
    }

    response = requests.post(
        f"{BASE_URL}/usage/record",
        headers=headers,
        json=data
    )

    return response.json()

# 获取使用履历
def get_usage_history(user_id, page=1, page_size=20, service=None):
    params = {"user_id": user_id, "page": page, "page_size": page_size}
    if service:
        params["service"] = service

    response = requests.get(
        f"{BASE_URL}/usage/history",
        params=params
    )

    return response.json()

# 获取使用统计
def get_usage_stats(user_id, days=30):
    start_date = datetime.now() - timedelta(days=days)
    params = {"user_id": user_id, "start_date": start_date.isoformat()}

    response = requests.get(
        f"{BASE_URL}/usage/stats",
        params=params
    )

    return response.json()

# 使用示例
if __name__ == "__main__":
    user_id = "user_abc123"
    api_key_id = 456

    # 记录一次API调用
    result = record_usage(user_id, api_key_id, "chat-completion", 100, 50, 10)
    print("记录结果:", result)

    # 获取最近使用履历
    history = get_usage_history(user_id, page=1, page_size=10)
    print("使用履历:", history)

    # 获取使用统计
    stats = get_usage_stats(user_id, days=7)
    print("使用统计:", stats)
```

### JavaScript示例

```javascript
const BASE_URL = 'http://localhost:8001/api/v1';

const headers = {
    'Content-Type': 'application/json'
};

// 记录使用情况
async function recordUsage(userId, apiKeyId, service, inputTokens, outputTokens, creditsUsed = 0) {
    const response = await fetch(`${BASE_URL}/usage/record`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            user_id: userId,
            api_key_id: apiKeyId,
            service: service,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            credits_used: creditsUsed
        })
    });

    return await response.json();
}

// 获取使用履历
async function getUsageHistory(userId, page = 1, pageSize = 20, service = null) {
    const params = new URLSearchParams({
        user_id: userId,
        page: page,
        page_size: pageSize
    });

    if (service) {
        params.append('service', service);
    }

    const response = await fetch(`${BASE_URL}/usage/history?${params}`);

    return await response.json();
}

// 获取使用统计
async function getUsageStats(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params = new URLSearchParams({
        user_id: userId,
        start_date: startDate.toISOString()
    });

    const response = await fetch(`${BASE_URL}/usage/stats?${params}`);

    return await response.json();
}

// 使用示例
(async () => {
    try {
        const userId = 'user_abc123';
        const apiKeyId = 456;

        // 记录一次API调用
        const result = await recordUsage(userId, apiKeyId, 'chat-completion', 100, 50, 10);
        console.log('记录结果:', result);

        // 获取最近使用履历
        const history = await getUsageHistory(userId, 1, 10);
        console.log('使用履历:', history);

        // 获取使用统计
        const stats = await getUsageStats(userId, 7);
        console.log('使用统计:', stats);
    } catch (error) {
        console.error('API调用错误:', error);
    }
})();
```

---

## 注意事项

1. **无需认证**: 所有API调用都无需认证，可直接调用
2. **用户识别**: 需要在请求中提供正确的user_id和api_key_id
3. **数据保留**: 系统会定期清理旧的使用记录
4. **时区**: 所有时间戳使用UTC时区
5. **分页**: 大量数据查询请使用分页参数
6. **错误处理**: 请在客户端实现适当的错误处理逻辑
7. **数据安全**: 虽然无需认证，但请妥善保护用户ID和API密钥ID信息

---

## 更新日志

- **v1.1.0** (2025-09-22): 移除JWT认证限制，支持无认证直接调用所有API端点
- **v1.0.0** (2025-09-22): 初始版本发布，支持基础的使用记录和查询功能