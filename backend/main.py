import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import sys
from contextlib import asynccontextmanager

# 加载环境变量
load_dotenv()

# 导入数据库相关模块
from database import check_db_connection, create_tables

# 配置日志
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('LOG_FILE', 'logs/app.log')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info("应用启动中...")

    # 检查数据库连接
    if check_db_connection():
        logger.info("数据库连接成功")
        try:
            # 创建数据库表（如果不存在）
            create_tables()
            logger.info("数据库表检查完成")
        except Exception as e:
            logger.error(f"创建数据库表失败: {str(e)}")
    else:
        logger.error("数据库连接失败，请检查配置")

    yield

    # 关闭时
    logger.info("应用正在关闭...")

# 创建FastAPI应用
app = FastAPI(
    title="CCManage API",
    description="CCManage系统的后端API服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 根路由健康检查
@app.get("/")
def read_root():
    """根路由，用于系统健康检查"""
    logger.info("系统健康检查请求")

    # 检查数据库连接状态
    db_status = "connected" if check_db_connection() else "disconnected"

    return {
        "status": "ok",
        "message": "CCManage backend service is running",
        "database": db_status,
        "version": "1.0.0"
    }

# 异常处理中间件
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器，捕获所有未处理的异常"""
    logger.error(f"发生未处理异常: {str(exc)}", exc_info=True)
    # 区分HTTP异常和其他异常
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "服务器内部错误，请稍后再试"}
    )

# 导入各个API模块
# 注意：这里只导入路由，业务逻辑在各自的文件中
from example import router as example_router
from api_key_validation import router as api_key_router

# 注册路由
app.include_router(example_router)
app.include_router(api_key_router)




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("SERVER_HOST", "127.0.0.1"),
        port=int(os.getenv("SERVER_PORT", "8001")),
        reload=os.getenv("ENVIRONMENT") == "development"
    )