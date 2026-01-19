import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import pytz

from ..db.models import APIKey, Package
from ..db.crud.api_key import APIKeyCRUD
from .credits_reset_client import credits_reset_client
from ..schemas.enums import PackageType

logger = logging.getLogger(__name__)


class CreditsResetService:
    """积分重置服务 - 负责每日自动重置积分"""

    def __init__(self, db: Session):
        self.db = db
        self.api_key_crud = APIKeyCRUD(db)

    def get_api_keys_for_daily_reset(self, batch_size: int = 100, offset: int = 0) -> List[APIKey]:
        """
        获取需要每日重置积分的API密钥

        Args:
            batch_size: 批量大小
            offset: 偏移量

        Returns:
            需要重置的API密钥列表
        """
        try:
            # 使用+8时区（北京时间）计算今天开始时间
            beijing_tz = pytz.timezone('Asia/Shanghai')
            now = datetime.now(beijing_tz)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

            # 查询条件：
            # 1. 状态为"active"
            # 2. 关联的套餐类型为"01"或"02"（标准订阅或Max系列订阅）
            # 3. 套餐的daily_reset_credits > 0
            # 4. 今天还没有重置过（last_reset_credits_at < today_start 或为NULL）
            # 注意：数据库中的时间可能是UTC，这里比较时需要考虑时区转换
            query = (
                self.db.query(APIKey)
                .join(Package, APIKey.package_id == Package.id)
                .filter(
                    and_(
                        APIKey.status == 'active',
                        Package.package_type.in_([PackageType.STANDARD, PackageType.MAX_SERIES]),
                        Package.daily_reset_credits > 0,
                        or_(
                            APIKey.last_reset_credits_at < today_start,
                            APIKey.last_reset_credits_at.is_(None)
                        )
                    )
                )
                .order_by(APIKey.id)
                .limit(batch_size)
                .offset(offset)
            )

            return query.all()

        except Exception as e:
            logger.error(f"查询需要重置的API密钥失败: {str(e)}")
            return []

    def reset_api_key_credits(self, api_key: APIKey) -> Dict[str, Any]:
        """
        重置单个API密钥的积分

        Args:
            api_key: API密钥对象

        Returns:
            重置结果
        """
        try:
            # 获取关联的套餐信息
            package = self.db.query(Package).filter(Package.id == api_key.package_id).first()
            if not package:
                return {
                    "success": False,
                    "message": f"API密钥 {api_key.id} 关联的套餐不存在",
                    "api_key_id": api_key.id
                }

            # 获取应重置的积分数
            reset_credits = package.daily_reset_credits
            if reset_credits <= 0:
                return {
                    "success": False,
                    "message": f"API密钥 {api_key.id} 关联的套餐没有设置每日重置积分",
                    "api_key_id": api_key.id
                }

            # 记录旧积分
            old_remaining = api_key.remaining_credits or 0

            # 更新数据库中的积分（使用+8时区时间）
            beijing_tz = pytz.timezone('Asia/Shanghai')
            now = datetime.now(beijing_tz)
            api_key.remaining_credits = reset_credits
            api_key.last_reset_credits_at = now

            # 提交数据库更改
            self.db.commit()

            # 调用外部API更新Redis
            external_result = credits_reset_client.reset_credits(
                api_key=api_key.api_key,
                remaining_credits=reset_credits,
                last_reset_credits_at=now.isoformat()
            )

            # 记录日志
            logger.info(
                f"API密钥 {api_key.id} (用户: {api_key.user_id}) 积分重置成功: "
                f"{old_remaining} -> {reset_credits}, 外部API结果: {external_result.get('success', False)}"
            )

            return {
                "success": True,
                "message": "积分重置成功",
                "api_key_id": api_key.id,
                "user_id": api_key.user_id,
                "old_credits": old_remaining,
                "new_credits": reset_credits,
                "external_api_success": external_result.get("success", False),
                "external_api_message": external_result.get("message", ""),
                "reset_time": now.isoformat()
            }

        except Exception as e:
            self.db.rollback()
            logger.error(f"重置API密钥 {api_key.id} 积分失败: {str(e)}")
            return {
                "success": False,
                "message": f"重置失败: {str(e)}",
                "api_key_id": api_key.id
            }

    def execute_daily_reset(self, batch_size: int = 100) -> Dict[str, Any]:
        """
        执行每日积分重置任务

        Args:
            batch_size: 每批处理的数量

        Returns:
            任务执行统计
        """
        logger.info("开始执行每日积分重置任务")

        beijing_tz = pytz.timezone('Asia/Shanghai')
        start_time = datetime.now(beijing_tz)
        total_processed = 0
        total_success = 0
        total_failed = 0
        results = []

        try:
            offset = 0
            has_more = True

            while has_more:
                # 获取一批需要重置的API密钥
                api_keys = self.get_api_keys_for_daily_reset(batch_size, offset)

                if not api_keys:
                    has_more = False
                    break

                # 处理当前批次
                for api_key in api_keys:
                    total_processed += 1

                    # 重置积分
                    result = self.reset_api_key_credits(api_key)
                    results.append(result)

                    if result["success"]:
                        total_success += 1
                    else:
                        total_failed += 1

                # 更新偏移量
                offset += batch_size

                # 如果返回的数量小于批次大小，说明没有更多数据了
                if len(api_keys) < batch_size:
                    has_more = False

            # 计算执行时间
            end_time = datetime.now(beijing_tz)
            execution_time = (end_time - start_time).total_seconds()

            # 生成统计报告
            stats = {
                "success": total_failed == 0,  # 只有当所有都成功时才返回true
                "total_processed": total_processed,
                "total_success": total_success,
                "total_failed": total_failed,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "execution_time_seconds": execution_time,
                "timezone": "Asia/Shanghai (+8)",
                "results": results
            }

            # 记录任务执行统计
            logger.info(
                f"每日积分重置任务执行完成: "
                f"处理总数={total_processed}, 成功={total_success}, 失败={total_failed}, "
                f"耗时={execution_time:.2f}秒"
            )

            return stats

        except Exception as e:
            logger.error(f"每日积分重置任务执行失败: {str(e)}")
            end_time = datetime.now(beijing_tz)
            return {
                "success": False,
                "message": f"任务执行失败: {str(e)}",
                "total_processed": total_processed,
                "total_success": total_success,
                "total_failed": total_failed,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "execution_time_seconds": (end_time - start_time).total_seconds(),
                "timezone": "Asia/Shanghai (+8)",
                "results": results
            }

    def get_reset_statistics(self, days: int = 7) -> Dict[str, Any]:
        """
        获取最近N天的积分重置统计

        Args:
            days: 统计天数

        Returns:
            统计信息
        """
        try:
            # 使用+8时区计算日期范围
            beijing_tz = pytz.timezone('Asia/Shanghai')
            end_date = datetime.now(beijing_tz)
            start_date = end_date - timedelta(days=days)

            # 查询最近N天有重置记录的API密钥
            query = (
                self.db.query(APIKey)
                .filter(
                    and_(
                        APIKey.last_reset_credits_at >= start_date,
                        APIKey.last_reset_credits_at <= end_date
                    )
                )
                .order_by(APIKey.last_reset_credits_at.desc())
            )

            reset_keys = query.all()

            # 按日期分组统计（使用+8时区日期）
            daily_stats = {}
            for key in reset_keys:
                if key.last_reset_credits_at:
                    # 将数据库时间转换为+8时区
                    if key.last_reset_credits_at.tzinfo is None:
                        # 如果数据库时间没有时区信息，假设为UTC并转换为+8时区
                        utc_time = key.last_reset_credits_at.replace(tzinfo=pytz.UTC)
                        beijing_time = utc_time.astimezone(beijing_tz)
                    else:
                        beijing_time = key.last_reset_credits_at.astimezone(beijing_tz)

                    date_str = beijing_time.date().isoformat()
                    if date_str not in daily_stats:
                        daily_stats[date_str] = {
                            "count": 0,
                            "total_credits_reset": 0
                        }

                    daily_stats[date_str]["count"] += 1
                    # 这里需要知道重置了多少积分，可以从package表获取
                    package = self.db.query(Package).filter(Package.id == key.package_id).first()
                    if package:
                        daily_stats[date_str]["total_credits_reset"] += package.daily_reset_credits

            return {
                "success": True,
                "period": {
                    "start_date": start_date.date().isoformat(),
                    "end_date": end_date.date().isoformat(),
                    "timezone": "Asia/Shanghai (+8)"
                },
                "total_resets": len(reset_keys),
                "daily_stats": daily_stats
            }

        except Exception as e:
            logger.error(f"获取积分重置统计失败: {str(e)}")
            return {
                "success": False,
                "message": f"获取统计失败: {str(e)}"
            }