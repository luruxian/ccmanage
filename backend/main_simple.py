import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title="CCManage API",
    description="CCManage系统的后端API服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 根路由健康检查
@app.get("/")
def read_root():
    """根路由，用于系统健康检查"""
    logger.info("系统健康检查请求")
    return {
        "status": "ok",
        "message": "CCManage backend service is running",
        "version": "1.0.0"
    }

# 测试API密钥验证端点（使用模拟数据）
@app.post("/api/v1/validate-api-key")
def validate_api_key_endpoint(request: dict):
    """简化的API密钥验证端点"""
    api_key = request.get("api_key", "")

    # 模拟验证逻辑
    if api_key == "test_api_key_123":
        return {
            "status": "success",
            "code": 200,
            "data": {
                "valid": True,
                "real_api_key": "sk-deepseek-abc123def456",
                "user_id": "user_001",
                "plan_type": "premium"
            }
        }
    else:
        return JSONResponse(
            status_code=401,
            content={
                "status": "error",
                "code": 1003,
                "message": "API key is invalid",
                "data": {
                    "valid": False,
                    "error_type": "invalid_api_key"
                }
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_simple:app",
        host=os.getenv("SERVER_HOST", "127.0.0.1"),
        port=int(os.getenv("SERVER_PORT", "8002")),
        reload=True
    )