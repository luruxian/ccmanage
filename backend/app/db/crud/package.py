from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ..models import Package
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PackageCRUD:
    """套餐管理CRUD操作"""

    def __init__(self, db: Session):
        self.db = db

    def create_package(self, package_data: Dict[str, Any]) -> Optional[Package]:
        """创建套餐"""
        try:
            package = Package(
                package_code=package_data["package_code"],
                package_name=package_data["package_name"],
                description=package_data.get("description"),
                price=package_data["price"],
                credits=package_data["credits"],
                duration_days=package_data["duration_days"],
                is_active=package_data.get("is_active", True),
                sort_order=package_data.get("sort_order", 0)
            )

            self.db.add(package)
            self.db.commit()
            self.db.refresh(package)

            logger.info(f"套餐创建成功: {package.package_code}")
            return package

        except Exception as e:
            self.db.rollback()
            logger.error(f"创建套餐失败: {str(e)}")
            return None

    def get_package_by_id(self, package_id: int) -> Optional[Package]:
        """根据ID获取套餐"""
        try:
            return self.db.query(Package).filter(Package.id == package_id).first()
        except Exception as e:
            logger.error(f"获取套餐失败: {str(e)}")
            return None

    def get_package_by_code(self, package_code: str) -> Optional[Package]:
        """根据套餐代码获取套餐"""
        try:
            return self.db.query(Package).filter(Package.package_code == package_code).first()
        except Exception as e:
            logger.error(f"获取套餐失败: {str(e)}")
            return None

    def get_active_packages(self, limit: Optional[int] = None) -> List[Package]:
        """获取激活的套餐列表"""
        try:
            query = self.db.query(Package).filter(Package.is_active == True).order_by(asc(Package.sort_order))

            if limit:
                query = query.limit(limit)

            return query.all()
        except Exception as e:
            logger.error(f"获取套餐列表失败: {str(e)}")
            return []

    def get_all_packages(self, include_inactive: bool = False) -> List[Package]:
        """获取所有套餐"""
        try:
            query = self.db.query(Package)

            if not include_inactive:
                query = query.filter(Package.is_active == True)

            return query.order_by(asc(Package.sort_order)).all()
        except Exception as e:
            logger.error(f"获取套餐列表失败: {str(e)}")
            return []

    def update_package(self, package_id: int, update_data: Dict[str, Any]) -> bool:
        """更新套餐信息"""
        try:
            package = self.get_package_by_id(package_id)
            if not package:
                return False

            for key, value in update_data.items():
                if hasattr(package, key):
                    setattr(package, key, value)

            package.updated_at = datetime.utcnow()
            self.db.commit()

            logger.info(f"套餐更新成功: {package.package_code}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"更新套餐失败: {str(e)}")
            return False

    def toggle_package_status(self, package_id: int) -> bool:
        """切换套餐激活状态"""
        try:
            package = self.get_package_by_id(package_id)
            if not package:
                return False

            package.is_active = not package.is_active
            package.updated_at = datetime.utcnow()
            self.db.commit()

            logger.info(f"套餐状态切换成功: {package.package_code}, 新状态: {package.is_active}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"切换套餐状态失败: {str(e)}")
            return False

    def delete_package(self, package_id: int) -> bool:
        """软删除套餐（设置为非激活状态）"""
        try:
            package = self.get_package_by_id(package_id)
            if not package:
                return False

            package.is_active = False
            package.updated_at = datetime.utcnow()
            self.db.commit()

            logger.info(f"套餐删除成功: {package.package_code}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"删除套餐失败: {str(e)}")
            return False

    def get_package_statistics(self) -> Dict[str, Any]:
        """获取套餐统计信息"""
        try:
            total_packages = self.db.query(Package).count()
            active_packages = self.db.query(Package).filter(Package.is_active == True).count()

            return {
                "total_packages": total_packages,
                "active_packages": active_packages,
                "inactive_packages": total_packages - active_packages
            }
        except Exception as e:
            logger.error(f"获取套餐统计失败: {str(e)}")
            return {
                "total_packages": 0,
                "active_packages": 0,
                "inactive_packages": 0
            }