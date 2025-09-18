import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.logging import setup_logging, logger
from .db.database import check_db_connection, create_tables
from .api.routes import example, api_key_validation

# 设置日志
setup_logging()

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
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
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
        "version": settings.VERSION
    }

# 全局异常处理器
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

# 注册路由
app.include_router(example.router)
app.include_router(api_key_validation.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )