from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from ..models import APIKey
from datetime import datetime
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class APIKeyCRUD:
    """API密钥相关的数据库操作"""

    def __init__(self, db: Session):
        self.db = db

    def get_api_key_by_key(self, api_key: str) -> Optional[APIKey]:
        """根据API密钥获取记录"""
        return self.db.query(APIKey).filter(APIKey.api_key == api_key).first()

    def get_api_key_by_id(self, api_key_id: int) -> Optional[APIKey]:
        """根据ID获取API密钥记录"""
        return self.db.query(APIKey).filter(APIKey.id == api_key_id).first()

    def get_user_api_keys(self, user_id: str, active_only: bool = True) -> List[APIKey]:
        """获取用户的所有API密钥"""
        query = self.db.query(APIKey).filter(APIKey.user_id == user_id)

        if active_only:
            query = query.filter(APIKey.is_active == True)

        return query.all()

    def create_api_key(self, api_key_data: Dict[str, Any]) -> APIKey:
        """创建新的API密钥"""
        db_api_key = APIKey(**api_key_data)
        self.db.add(db_api_key)
        self.db.commit()
        self.db.refresh(db_api_key)
        logger.info(f"创建新API密钥: {api_key_data.get('api_key')}")
        return db_api_key

    def update_api_key_status(self, api_key: str, is_active: bool) -> bool:
        """更新API密钥状态"""
        db_api_key = self.get_api_key_by_key(api_key)
        if not db_api_key:
            return False

        db_api_key.is_active = is_active
        db_api_key.updated_at = datetime.now()
        self.db.commit()
        logger.info(f"更新API密钥状态: {api_key}")
        return True

    def update_last_used(self, api_key: str) -> bool:
        """更新API密钥最后使用时间"""
        db_api_key = self.get_api_key_by_key(api_key)
        if not db_api_key:
            return False

        db_api_key.last_used_at = datetime.now()
        self.db.commit()
        return True

    def update_api_key_info(self, api_key_id: int, update_data: Dict[str, Any]) -> Optional[APIKey]:
        """更新API密钥信息"""
        db_api_key = self.get_api_key_by_id(api_key_id)
        if not db_api_key:
            return None

        # 更新允许修改的字段
        allowed_fields = ['key_name', 'description', 'real_api_key']
        for field, value in update_data.items():
            if field in allowed_fields and value is not None:
                setattr(db_api_key, field, value)

        db_api_key.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(db_api_key)
        logger.info(f"更新API密钥信息: {api_key_id}")
        return db_api_key

    def delete_api_key(self, api_key: str) -> bool:
        """软删除API密钥（设置为非激活状态）"""
        return self.update_api_key_status(api_key, False)

    def is_api_key_valid(self, api_key: str) -> bool:
        """检查API密钥是否有效"""
        db_api_key = self.get_api_key_by_key(api_key)
        return db_api_key and db_api_key.is_active if db_api_key else False

    def get_real_api_key(self, api_key: str) -> Optional[str]:
        """获取真实的API密钥"""
        db_api_key = self.get_api_key_by_key(api_key)
        if db_api_key and db_api_key.is_active:
            return db_api_key.real_api_key
        return None

    def count_user_api_keys(self, user_id: str, active_only: bool = True) -> int:
        """统计用户的API密钥数量"""
        query = self.db.query(APIKey).filter(APIKey.user_id == user_id)

        if active_only:
            query = query.filter(APIKey.is_active == True)

        return query.count()

    def get_api_keys_list(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[APIKey]:
        """获取API密钥列表"""
        query = self.db.query(APIKey)

        if active_only:
            query = query.filter(APIKey.is_active == True)

        return query.offset(skip).limit(limit).all()