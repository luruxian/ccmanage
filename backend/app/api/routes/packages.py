from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ...schemas.package import (
    PackageCreate,
    PackageUpdate,
    PackageResponse,
    PackageListResponse,
    PackagePurchaseRequest,
    PackagePurchaseResponse,
    PackageStatisticsResponse
)
from ...schemas.auth import MessageResponse
from ...db.database import get_db
from ...db.crud.package import PackageCRUD
from ...db.crud.user_plan import UserPlanCRUD
from .user import get_current_user
from .admin import get_admin_user
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/packages", tags=["Package Management"])


@router.get("/", response_model=PackageListResponse)
async def get_packages(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """获取套餐列表"""
    try:
        package_crud = PackageCRUD(db)

        if include_inactive:
            packages = package_crud.get_all_packages(include_inactive=True)
        else:
            packages = package_crud.get_active_packages()

        return PackageListResponse(
            packages=packages,
            total=len(packages)
        )

    except Exception as e:
        logger.error(f"获取套餐列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取套餐列表失败"
        )


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package_detail(
    package_id: int,
    db: Session = Depends(get_db)
):
    """获取套餐详情"""
    try:
        package_crud = PackageCRUD(db)
        package = package_crud.get_package_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="套餐不存在"
            )

        return package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取套餐详情失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取套餐详情失败"
        )


@router.post("/", response_model=PackageResponse)
async def create_package(
    package_data: PackageCreate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """创建套餐（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查套餐代码是否已存在
        existing_package = package_crud.get_package_by_code(package_data.package_code)
        if existing_package:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="套餐代码已存在"
            )

        package = package_crud.create_package(package_data.dict())
        if not package:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="创建套餐失败"
            )

        logger.info(f"管理员 {current_admin.user_id} 创建套餐: {package.package_code}")
        return package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建套餐失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建套餐失败"
        )


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int,
    package_data: PackageUpdate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """更新套餐（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查套餐是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="套餐不存在"
            )

        # 更新套餐
        update_data = {k: v for k, v in package_data.dict().items() if v is not None}
        success = package_crud.update_package(package_id, update_data)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新套餐失败"
            )

        # 返回更新后的套餐
        updated_package = package_crud.get_package_by_id(package_id)
        logger.info(f"管理员 {current_admin.user_id} 更新套餐: {package.package_code}")
        return updated_package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新套餐失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新套餐失败"
        )


@router.put("/{package_id}/toggle", response_model=MessageResponse)
async def toggle_package_status(
    package_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """切换套餐状态（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查套餐是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="套餐不存在"
            )

        success = package_crud.toggle_package_status(package_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="切换套餐状态失败"
            )

        new_status = "激活" if not package.is_active else "禁用"
        logger.info(f"管理员 {current_admin.user_id} 切换套餐状态: {package.package_code} -> {new_status}")
        return MessageResponse(message=f"套餐已{new_status}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"切换套餐状态失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="切换套餐状态失败"
        )


@router.delete("/{package_id}", response_model=MessageResponse)
async def delete_package(
    package_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """删除套餐（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查套餐是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="套餐不存在"
            )

        success = package_crud.delete_package(package_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除套餐失败"
            )

        logger.info(f"管理员 {current_admin.user_id} 删除套餐: {package.package_code}")
        return MessageResponse(message="套餐已删除")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除套餐失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除套餐失败"
        )


@router.post("/purchase", response_model=PackagePurchaseResponse)
async def purchase_package(
    purchase_data: PackagePurchaseRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """购买套餐"""
    try:
        package_crud = PackageCRUD(db)
        user_plan_crud = UserPlanCRUD(db)

        # 检查套餐是否存在且可用
        package = package_crud.get_package_by_id(purchase_data.package_id)
        if not package or not package.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="套餐不存在或不可用"
            )

        # 创建用户套餐
        start_date = datetime.utcnow()
        expire_date = start_date + timedelta(days=package.duration_days)

        plan_data = {
            "user_id": current_user.user_id,
            "package_id": package.id,
            "plan_type": package.package_code,
            "credits": package.credits,
            "total_credits": package.credits,
            "start_date": start_date,
            "expire_date": expire_date,
            "is_active": True,
            "auto_renew": purchase_data.auto_renew
        }

        user_plan = user_plan_crud.create_user_plan(plan_data)
        if not user_plan:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="购买套餐失败"
            )

        logger.info(f"用户 {current_user.user_id} 购买套餐: {package.package_code}")
        return PackagePurchaseResponse(
            message="套餐购买成功",
            user_plan_id=user_plan.id,
            package_code=package.package_code,
            credits_added=package.credits,
            expire_date=expire_date
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"购买套餐失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="购买套餐失败"
        )


@router.get("/statistics/overview", response_model=PackageStatisticsResponse)
async def get_package_statistics(
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取套餐统计（管理员）"""
    try:
        package_crud = PackageCRUD(db)
        statistics = package_crud.get_package_statistics()

        return PackageStatisticsResponse(**statistics)

    except Exception as e:
        logger.error(f"获取套餐统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取套餐统计失败"
        )