from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_, func, text
from ..models import UsageRecord, APIKey, User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


def calculate_credits_used(total_tokens: int) -> int:
    """
    计算积分消耗

    Args:
        total_tokens: 总token数量

    Returns:
        int: 积分消耗数量（整数）

    计算规则：
    - credits_used = total_tokens / 2000，向上取整
    - total_tokens < 2000时，按2000计算
    """
    if not total_tokens or total_tokens <= 0:
        return 0

    # 如果token数小于2000，按2000计算
    effective_tokens = max(total_tokens, 2000)

    # 除以2000并向上取整
    import math
    credits_used = math.ceil(effective_tokens / 2000)

    return credits_used


class UsageRecordCRUD:
    """使用记录CRUD操作"""

    def __init__(self, db: Session):
        self.db = db

    def create_usage_record(self, usage_data: Dict[str, Any]) -> Optional[UsageRecord]:
        """创建使用记录"""
        try:
            # 如果没有提供credits_used，根据total_tokens自动计算
            if 'credits_used' not in usage_data or usage_data['credits_used'] == 0:
                total_tokens = usage_data.get('total_tokens', 0)
                if total_tokens > 0:
                    usage_data['credits_used'] = calculate_credits_used(total_tokens)

            # 扣减API密钥的剩余积分
            api_key_id = usage_data.get('api_key_id')
            credits_used = usage_data.get('credits_used', 0)

            if api_key_id and credits_used > 0:
                api_key = self.db.query(APIKey).filter(APIKey.id == api_key_id).first()
                if api_key and api_key.remaining_credits is not None:
                    # 扣减剩余积分
                    new_remaining = max(0, api_key.remaining_credits - credits_used)
                    api_key.remaining_credits = new_remaining
                    # 记录扣减后的剩余积分到使用记录
                    usage_data['remaining_credits'] = new_remaining
                    logger.info(f"API密钥 {api_key_id} 积分扣减: {api_key.remaining_credits + credits_used} -> {new_remaining} "
                               f"(消耗: {credits_used})")

            db_usage = UsageRecord(**usage_data)
            self.db.add(db_usage)
            self.db.commit()
            self.db.refresh(db_usage)
            logger.info(f"创建使用记录成功: API密钥={usage_data.get('api_key_id')}, 服务={usage_data.get('service')}, "
                       f"tokens={usage_data.get('total_tokens', 0)}, credits={usage_data.get('credits_used', 0)}")
            return db_usage
        except Exception as e:
            self.db.rollback()
            logger.error(f"创建使用记录失败: {str(e)}")
            return None

    def get_api_key_usage_history(
        self,
        api_key: str,
        page: int = 1,
        page_size: int = 20,
        service_filter: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[UsageRecord]:
        """获取API密钥使用履历"""
        try:
            # 通过api_key获取api_key_id
            api_key_id = self.get_api_key_id_by_key(api_key)
            if api_key_id is None:
                return []

            query = self.db.query(UsageRecord).filter(UsageRecord.api_key_id == api_key_id)

            # 服务类型筛选
            if service_filter:
                query = query.filter(UsageRecord.service == service_filter)

            # 时间范围筛选
            if start_date:
                query = query.filter(UsageRecord.request_timestamp >= start_date)
            if end_date:
                query = query.filter(UsageRecord.request_timestamp <= end_date)

            # 分页
            offset = (page - 1) * page_size
            query = query.order_by(desc(UsageRecord.request_timestamp)).offset(offset).limit(page_size)

            return query.all()

        except Exception as e:
            logger.error(f"获取API密钥使用履历失败: {str(e)}")
            return []

    def count_api_key_usage_history(
        self,
        api_key: str,
        service_filter: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """统计API密钥使用记录总数"""
        try:
            # 通过api_key获取api_key_id
            api_key_id = self.get_api_key_id_by_key(api_key)
            if api_key_id is None:
                return 0

            query = self.db.query(UsageRecord).filter(UsageRecord.api_key_id == api_key_id)

            # 服务类型筛选
            if service_filter:
                query = query.filter(UsageRecord.service == service_filter)

            # 时间范围筛选
            if start_date:
                query = query.filter(UsageRecord.request_timestamp >= start_date)
            if end_date:
                query = query.filter(UsageRecord.request_timestamp <= end_date)

            return query.count()

        except Exception as e:
            logger.error(f"统计API密钥使用记录失败: {str(e)}")
            return 0

    def get_api_key_usage_stats_detailed(
        self,
        api_key: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """获取API密钥使用统计"""
        try:
            # 通过api_key获取api_key_id
            api_key_id = self.get_api_key_id_by_key(api_key)
            if api_key_id is None:
                return {
                    "total_requests": 0,
                    "total_credits": 0,
                    "total_input_tokens": 0,
                    "total_output_tokens": 0,
                    "total_tokens": 0,
                    "service_breakdown": [],
                    "daily_usage": []
                }

            query = self.db.query(UsageRecord).filter(UsageRecord.api_key_id == api_key_id)

            # 时间范围筛选
            if start_date:
                query = query.filter(UsageRecord.request_timestamp >= start_date)
            if end_date:
                query = query.filter(UsageRecord.request_timestamp <= end_date)

            # 基础统计
            total_requests = query.count()
            total_credits = query.with_entities(func.sum(UsageRecord.credits_used)).scalar() or 0
            total_input_tokens = query.with_entities(func.sum(UsageRecord.input_tokens)).scalar() or 0
            total_output_tokens = query.with_entities(func.sum(UsageRecord.output_tokens)).scalar() or 0
            total_tokens = query.with_entities(func.sum(UsageRecord.total_tokens)).scalar() or 0

            # 按服务类型统计
            service_stats = self.db.query(
                UsageRecord.service,
                func.count(UsageRecord.id).label('request_count'),
                func.sum(UsageRecord.credits_used).label('total_credits'),
                func.sum(UsageRecord.total_tokens).label('total_tokens')
            ).filter(UsageRecord.api_key_id == api_key_id)

            if start_date:
                service_stats = service_stats.filter(UsageRecord.request_timestamp >= start_date)
            if end_date:
                service_stats = service_stats.filter(UsageRecord.request_timestamp <= end_date)

            service_stats = service_stats.group_by(UsageRecord.service).all()

            # 按日期统计（最近7天）
            seven_days_ago = datetime.now() - timedelta(days=7)
            daily_stats = self.db.query(
                func.date(UsageRecord.request_timestamp).label('date'),
                func.count(UsageRecord.id).label('request_count'),
                func.sum(UsageRecord.total_tokens).label('total_tokens')
            ).filter(
                and_(
                    UsageRecord.api_key_id == api_key_id,
                    UsageRecord.request_timestamp >= seven_days_ago
                )
            ).group_by(func.date(UsageRecord.request_timestamp)).all()

            return {
                "total_requests": total_requests,
                "total_credits": total_credits,
                "total_input_tokens": total_input_tokens,
                "total_output_tokens": total_output_tokens,
                "total_tokens": total_tokens,
                "service_breakdown": [
                    {
                        "service": stat.service,
                        "request_count": stat.request_count,
                        "total_credits": stat.total_credits or 0,
                        "total_tokens": stat.total_tokens or 0
                    }
                    for stat in service_stats
                ],
                "daily_usage": [
                    {
                        "date": stat.date.isoformat(),
                        "request_count": stat.request_count,
                        "total_tokens": stat.total_tokens or 0
                    }
                    for stat in daily_stats
                ]
            }

        except Exception as e:
            logger.error(f"获取API密钥使用统计失败: {str(e)}")
            return {
                "total_requests": 0,
                "total_credits": 0,
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "total_tokens": 0,
                "service_breakdown": [],
                "daily_usage": []
            }

    def get_api_key_usage_stats(self, api_key_id: int) -> Dict[str, Any]:
        """获取特定API密钥的使用统计"""
        try:
            query = self.db.query(UsageRecord).filter(UsageRecord.api_key_id == api_key_id)

            total_requests = query.count()
            total_credits = query.with_entities(func.sum(UsageRecord.credits_used)).scalar() or 0
            total_tokens = query.with_entities(func.sum(UsageRecord.total_tokens)).scalar() or 0
            last_used = query.order_by(desc(UsageRecord.request_timestamp)).first()

            return {
                "api_key_id": api_key_id,
                "total_requests": total_requests,
                "total_credits": total_credits,
                "total_tokens": total_tokens,
                "last_used_at": last_used.request_timestamp if last_used else None
            }

        except Exception as e:
            logger.error(f"获取API密钥使用统计失败: {str(e)}")
            return {
                "api_key_id": api_key_id,
                "total_requests": 0,
                "total_credits": 0,
                "total_tokens": 0,
                "last_used_at": None
            }

    def get_usage_records_by_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        api_key: Optional[str] = None,
        service: Optional[str] = None
    ) -> List[UsageRecord]:
        """按日期范围获取使用记录"""
        try:
            query = self.db.query(UsageRecord).filter(
                and_(
                    UsageRecord.request_timestamp >= start_date,
                    UsageRecord.request_timestamp <= end_date
                )
            )

            if api_key:
                api_key_id = self.get_api_key_id_by_key(api_key)
                if api_key_id:
                    query = query.filter(UsageRecord.api_key_id == api_key_id)

            if service:
                query = query.filter(UsageRecord.service == service)

            return query.order_by(desc(UsageRecord.request_timestamp)).all()

        except Exception as e:
            logger.error(f"按日期范围获取使用记录失败: {str(e)}")
            return []

    def delete_old_records(self, days_to_keep: int = 90) -> int:
        """删除旧的使用记录（数据清理）"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            result = self.db.query(UsageRecord).filter(
                UsageRecord.request_timestamp < cutoff_date
            ).delete()

            self.db.commit()
            logger.info(f"删除了 {result} 条旧使用记录")
            return result

        except Exception as e:
            self.db.rollback()
            logger.error(f"删除旧使用记录失败: {str(e)}")
            return 0

    def get_api_key_id_by_key(self, api_key: str) -> Optional[int]:
        """通过API密钥字符串获取API密钥ID"""
        try:
            api_key_record = self.db.query(APIKey).filter(APIKey.api_key == api_key).first()
            if api_key_record:
                return api_key_record.id
            return None
        except Exception as e:
            logger.error(f"查找API密钥ID失败: {str(e)}")
            return None

    def record_api_usage(
        self,
        api_key: str,
        service: str,
        input_tokens: int = 0,
        output_tokens: int = 0,
        total_tokens: int = 0,
        credits_used: int = 0,
        response_status: str = "success",
        error_message: Optional[str] = None
    ) -> Optional[UsageRecord]:
        """记录API使用情况的便捷方法"""
        # 通过api_key获取api_key_id
        api_key_id = self.get_api_key_id_by_key(api_key)
        if api_key_id is None:
            logger.error(f"无效的API密钥: {api_key}")
            return None

        # 如果没有提供total_tokens，尝试从input_tokens和output_tokens计算
        if total_tokens == 0 and (input_tokens > 0 or output_tokens > 0):
            total_tokens = input_tokens + output_tokens

        # 如果没有提供credits_used，将根据total_tokens自动计算（在create_usage_record中处理）
        usage_data = {
            "api_key_id": api_key_id,
            "service": service,
            "request_count": 1,
            "credits_used": credits_used,  # 0或未提供时会自动计算
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": total_tokens,
            "response_status": response_status,
            "error_message": error_message
        }

        return self.create_usage_record(usage_data)