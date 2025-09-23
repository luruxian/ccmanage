import logging
import logging.handlers
import sys
import os
from .config import settings

def setup_logging():
    """设置日志配置"""

    # 确保日志目录存在
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)

    # 创建TimedRotatingFileHandler，每天rotation一次，保留14天
    rotating_handler = logging.handlers.TimedRotatingFileHandler(
        filename=settings.LOG_FILE,
        when='midnight',
        interval=1,
        backupCount=14,
        encoding='utf-8'
    )
    rotating_handler.suffix = '%Y-%m-%d'

    # 创建控制台输出handler
    console_handler = logging.StreamHandler(sys.stdout)

    # 配置根日志记录器
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            rotating_handler,
            console_handler
        ]
    )

# 获取日志记录器
logger = logging.getLogger(__name__)