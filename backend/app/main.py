import os
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore
from pytz import timezone

from .core.config import settings
from .core.logging import setup_logging, logger
from .db.database import check_db_connection, create_tables, SessionLocal
from .api.routes import api_key_validation, auth, user, user_keys, packages, admin, usage_history
from .services.credits_reset_service import CreditsResetService

# 设置日志
setup_logging()

# 全局定时任务调度器
scheduler = None


def execute_daily_credits_reset():
    """执行每日积分重置任务"""
    try:
        logger.info("开始执行每日积分重置任务...")

        # 创建数据库会话
        db = SessionLocal()
        try:
            # 创建积分重置服务
            reset_service = CreditsResetService(db)

            # 执行重置任务
            result = reset_service.execute_daily_reset(batch_size=100)

            if result["success"]:
                logger.info(
                    f"每日积分重置任务执行成功: "
                    f"处理总数={result['total_processed']}, "
                    f"成功={result['total_success']}, "
                    f"失败={result['total_failed']}, "
                    f"耗时={result['execution_time_seconds']:.2f}秒"
                )
            else:
                logger.warning(
                    f"每日积分重置任务执行完成但有失败: "
                    f"处理总数={result['total_processed']}, "
                    f"成功={result['total_success']}, "
                    f"失败={result['total_failed']}, "
                    f"消息={result.get('message', '未知错误')}"
                )

        except Exception as e:
            logger.error(f"执行每日积分重置任务时发生异常: {str(e)}", exc_info=True)
        finally:
            db.close()

    except Exception as e:
        logger.error(f"每日积分重置任务执行失败: {str(e)}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global scheduler

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

    # 初始化定时任务调度器
    try:
        # 配置调度器使用+8时区（北京时间）
        beijing_tz = timezone('Asia/Shanghai')
        scheduler = BackgroundScheduler(
            jobstores={'default': MemoryJobStore()},
            timezone=beijing_tz
        )

        # 配置每日0时执行积分重置任务（北京时间）
        scheduler.add_job(
            execute_daily_credits_reset,
            trigger=CronTrigger(hour=0, minute=0, second=0, timezone=beijing_tz),  # 每天北京时间0:00:00执行
            id="daily_credits_reset",
            name="每日积分重置任务",
            replace_existing=True,
            misfire_grace_time=300,  # 允许错过执行时间300秒
            coalesce=True  # 合并多次错过执行
        )

        # 启动调度器
        scheduler.start()
        logger.info(f"定时任务调度器启动成功，每日积分重置任务已注册，时区: {beijing_tz}")

        # 立即执行一次测试（可选，用于调试）
        # scheduler.add_job(execute_daily_credits_reset, trigger='date', run_date=datetime.now())

    except Exception as e:
        logger.error(f"定时任务调度器启动失败: {str(e)}", exc_info=True)
        scheduler = None

    yield

    # 关闭时
    logger.info("应用正在关闭...")

    # 关闭定时任务调度器
    if scheduler:
        try:
            scheduler.shutdown(wait=False)
            logger.info("定时任务调度器已关闭")
        except Exception as e:
            logger.error(f"关闭定时任务调度器时发生错误: {str(e)}")

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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "X-User-ID",
        "X-User-Role",
        "X-Request-ID",
        "X-Forwarded-Proto",
        "X-Forwarded-For",
        "X-Real-IP"
    ],
    expose_headers=["X-Request-ID"],
)

# 根路由健康检查
@app.get("/")
def read_root():
    """根路由，用于系统健康检查"""
    logger.info("系统健康检查请求")

    # 检查数据库连接状态
    db_status = "connected" if check_db_connection() else "disconnected"

    # 检查定时任务状态
    scheduler_status = "running" if scheduler and scheduler.running else "stopped"

    return {
        "status": "ok",
        "message": "agnets.app backend service is running",
        "database": db_status,
        "scheduler": scheduler_status,
        "version": settings.VERSION
    }


@app.post("/api/v1/admin/trigger-daily-reset")
async def trigger_daily_reset():
    """
    手动触发每日积分重置任务（仅用于测试和监控）
    注意：需要管理员权限
    """
    try:
        logger.info("收到手动触发每日积分重置请求")

        # 这里可以添加权限检查，例如检查请求头中的管理员令牌
        # 暂时先允许所有请求用于测试

        # 执行任务
        execute_daily_credits_reset()

        # 使用+8时区时间
        beijing_tz = timezone('Asia/Shanghai')
        now = datetime.now(beijing_tz)

        return {
            "success": True,
            "message": "手动触发每日积分重置任务已执行",
            "timestamp": now.isoformat(),
            "timezone": "Asia/Shanghai (+8)"
        }

    except Exception as e:
        logger.error(f"手动触发每日积分重置任务失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"任务执行失败: {str(e)}")


@app.get("/api/v1/admin/scheduler-status")
async def get_scheduler_status():
    """获取定时任务调度器状态"""
    try:
        if not scheduler:
            return {
                "success": False,
                "message": "定时任务调度器未初始化",
                "scheduler_running": False
            }

        jobs = []
        for job in scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })

        return {
            "success": True,
            "scheduler_running": scheduler.running,
            "jobs": jobs,
            "job_count": len(jobs)
        }

    except Exception as e:
        logger.error(f"获取定时任务状态失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取状态失败: {str(e)}")

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
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(user_keys.router)
app.include_router(api_key_validation.router)
app.include_router(packages.router)
app.include_router(admin.router)
app.include_router(usage_history.router)
# user_key_management.router 已删除（功能合并到其他路由）

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG
    )