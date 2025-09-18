"""
Core module

包含应用核心配置和工具
"""

from .config import settings
from .logging import setup_logging, logger

__all__ = ["settings", "setup_logging", "logger"]