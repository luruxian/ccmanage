from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, func, text
from ..models import LoginHistory, User
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class LoginHistoryCRUD:
    """登录历史CRUD操作"""

    def __init__(self, db: Session):
        self.db = db

    def create_login_record(self, user_id: str, ip_address: Optional[str] = None,
                          user_agent: Optional[str] = None, device_info: Optional[str] = None,
                          login_status: str = "success", session_id: Optional[str] = None) -> Optional[LoginHistory]:
        """创建登录记录"""
        try:
            login_record = LoginHistory(
                user_id=user_id,
                ip_address=ip_address,
                user_agent=user_agent,
                device_info=device_info,
                login_status=login_status,
                session_id=session_id
            )

            self.db.add(login_record)
            self.db.commit()
            self.db.refresh(login_record)

            logger.info(f"登录记录创建成功: {user_id}, 状态: {login_status}")
            return login_record

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建登录记录失败: {str(e)}")
            return None

    def update_logout_time(self, session_id: str) -> bool:
        """更新退出时间"""
        try:
            login_record = self.db.query(LoginHistory).filter(
                and_(LoginHistory.session_id == session_id, LoginHistory.logout_time.is_(None))
            ).first()

            if login_record:
                login_record.logout_time = datetime.utcnow()
                self.db.commit()
                logger.info(f"退出时间更新成功: {session_id}")
                return True

            return False

        except Exception as e:
            self.db.rollback()
            logger.error(f"更新退出时间失败: {str(e)}")
            return False

    def get_user_login_history(self, user_id: str, limit: int = 50,
                             start_date: Optional[datetime] = None,
                             end_date: Optional[datetime] = None) -> List[LoginHistory]:
        """获取用户登录历史"""
        try:
            query = self.db.query(LoginHistory).filter(LoginHistory.user_id == user_id)

            if start_date:
                query = query.filter(LoginHistory.login_time >= start_date)
            if end_date:
                query = query.filter(LoginHistory.login_time <= end_date)

            return query.order_by(desc(LoginHistory.login_time)).limit(limit).all()

        except Exception as e:
            logger.error(f"获取用户登录历史失败: {str(e)}")
            return []

    def get_all_login_history(self, limit: int = 100, status: Optional[str] = None,
                            start_date: Optional[datetime] = None,
                            end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """获取所有登录历史（包含用户信息）"""
        try:
            query = self.db.query(LoginHistory, User).join(
                User, LoginHistory.user_id == User.user_id
            )

            if status:
                query = query.filter(LoginHistory.login_status == status)
            if start_date:
                query = query.filter(LoginHistory.login_time >= start_date)
            if end_date:
                query = query.filter(LoginHistory.login_time <= end_date)

            results = query.order_by(desc(LoginHistory.login_time)).limit(limit).all()

            login_history = []
            for history, user in results:
                login_history.append({
                    "id": history.id,
                    "user_id": history.user_id,
                    "user_email": user.email,
                    "user_role": "user",  # 普通用户统一角色为user
                    "login_time": history.login_time,
                    "logout_time": history.logout_time,
                    "ip_address": history.ip_address,
                    "user_agent": history.user_agent,
                    "device_info": history.device_info,
                    "login_status": history.login_status,
                    "session_duration": self._calculate_session_duration(history),
                    "created_at": history.created_at
                })

            return login_history

        except Exception as e:
            logger.error(f"获取登录历史失败: {str(e)}")
            return []

    def get_active_sessions(self) -> List[Dict[str, Any]]:
        """获取当前活跃会话"""
        try:
            query = self.db.query(LoginHistory, User).join(
                User, LoginHistory.user_id == User.user_id
            ).filter(
                and_(
                    LoginHistory.logout_time.is_(None),
                    LoginHistory.login_status == "success"
                )
            )

            results = query.order_by(desc(LoginHistory.login_time)).all()

            active_sessions = []
            for history, user in results:
                active_sessions.append({
                    "id": history.id,
                    "user_id": history.user_id,
                    "user_email": user.email,
                    "user_role": "user",  # 普通用户统一角色为user
                    "login_time": history.login_time,
                    "ip_address": history.ip_address,
                    "session_id": history.session_id,
                    "session_duration": self._calculate_session_duration(history)
                })

            return active_sessions

        except Exception as e:
            logger.error(f"获取活跃会话失败: {str(e)}")
            return []

    def get_login_statistics(self, days: int = 30) -> Dict[str, Any]:
        """获取登录统计"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # 总登录次数
            total_logins = self.db.query(LoginHistory).filter(
                LoginHistory.login_time >= start_date
            ).count()

            # 成功登录次数
            successful_logins = self.db.query(LoginHistory).filter(
                and_(
                    LoginHistory.login_time >= start_date,
                    LoginHistory.login_status == "success"
                )
            ).count()

            # 失败登录次数
            failed_logins = self.db.query(LoginHistory).filter(
                and_(
                    LoginHistory.login_time >= start_date,
                    LoginHistory.login_status == "failed"
                )
            ).count()

            # 独立用户数
            unique_users = self.db.query(LoginHistory.user_id).filter(
                LoginHistory.login_time >= start_date
            ).distinct().count()

            # 当前活跃会话数
            active_sessions = self.db.query(LoginHistory).filter(
                and_(
                    LoginHistory.logout_time.is_(None),
                    LoginHistory.login_status == "success"
                )
            ).count()

            # 每日登录统计
            daily_stats = self._get_daily_login_stats(days)

            return {
                "total_logins": total_logins,
                "successful_logins": successful_logins,
                "failed_logins": failed_logins,
                "unique_users": unique_users,
                "active_sessions": active_sessions,
                "success_rate": (successful_logins / total_logins * 100) if total_logins > 0 else 0,
                "daily_stats": daily_stats
            }

        except Exception as e:
            logger.error(f"获取登录统计失败: {str(e)}")
            return {
                "total_logins": 0,
                "successful_logins": 0,
                "failed_logins": 0,
                "unique_users": 0,
                "active_sessions": 0,
                "success_rate": 0,
                "daily_stats": []
            }

    def force_logout_session(self, session_id: str) -> bool:
        """强制退出会话"""
        return self.update_logout_time(session_id)

    def clean_old_records(self, days: int = 90) -> int:
        """清理旧的登录记录"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            deleted_count = self.db.query(LoginHistory).filter(
                LoginHistory.login_time < cutoff_date
            ).delete()

            self.db.commit()
            logger.info(f"清理了 {deleted_count} 条旧登录记录")
            return deleted_count

        except Exception as e:
            self.db.rollback()
            logger.error(f"清理旧登录记录失败: {str(e)}")
            return 0

    def _calculate_session_duration(self, login_record: LoginHistory) -> Optional[int]:
        """计算会话持续时间（分钟）"""
        if login_record.logout_time:
            duration = login_record.logout_time - login_record.login_time
            return int(duration.total_seconds() / 60)
        elif login_record.login_status == "success":
            # 对于未退出的成功登录，计算到当前时间的持续时间
            duration = datetime.utcnow() - login_record.login_time
            return int(duration.total_seconds() / 60)
        return None

    def _get_daily_login_stats(self, days: int) -> List[Dict[str, Any]]:
        """获取每日登录统计"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)

            # 使用原生SQL查询每日统计
            query = text("""
                SELECT
                    DATE(login_time) as login_date,
                    COUNT(*) as total_logins,
                    SUM(CASE WHEN login_status = 'success' THEN 1 ELSE 0 END) as successful_logins,
                    COUNT(DISTINCT user_id) as unique_users
                FROM login_history
                WHERE login_time >= :start_date
                GROUP BY DATE(login_time)
                ORDER BY login_date
            """)

            result = self.db.execute(query, {"start_date": start_date})

            daily_stats = []
            for row in result:
                daily_stats.append({
                    "date": str(row.login_date),
                    "total_logins": row.total_logins,
                    "successful_logins": row.successful_logins,
                    "unique_users": row.unique_users
                })

            return daily_stats

        except Exception as e:
            logger.error(f"获取每日登录统计失败: {str(e)}")
            return []