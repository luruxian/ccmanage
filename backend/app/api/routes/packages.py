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
from ...schemas.user_key_management import (
    UserKeyRelationResponse,
    UserKeysListResponse,
    BulkUserKeyOperation
)
from ...schemas.auth import MessageResponse
from ...db.database import get_db
from ...db.crud.package import PackageCRUD
from ...db.crud.user_plan import UserPlanCRUD
from ...db.crud.user_key import UserKeyCRUD
from .user import get_current_user
from .admin import get_admin_user
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/packages", tags=["Subscription Management"])


@router.get("/", response_model=PackageListResponse)
async def get_packages(
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """获取订阅列表"""
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
        logger.error(f"获取订阅列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取订阅列表失败"
        )


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package_detail(
    package_id: int,
    db: Session = Depends(get_db)
):
    """获取订阅详情"""
    try:
        package_crud = PackageCRUD(db)
        package = package_crud.get_package_by_id(package_id)

        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        return package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取订阅详情失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取订阅详情失败"
        )


@router.post("/", response_model=PackageResponse)
async def create_package(
    package_data: PackageCreate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """创建订阅（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查订阅代码是否已存在
        existing_package = package_crud.get_package_by_code(package_data.package_code)
        if existing_package:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="订阅代码已存在"
            )

        package = package_crud.create_package(package_data.dict())
        if not package:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="创建订阅失败"
            )

        logger.info(f"管理员 {current_admin.user_id} 创建订阅: {package.package_code}")
        return package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建订阅失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建订阅失败"
        )


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: int,
    package_data: PackageUpdate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """更新订阅（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        # 更新订阅
        update_data = {k: v for k, v in package_data.dict().items() if v is not None}
        success = package_crud.update_package(package_id, update_data)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新订阅失败"
            )

        # 返回更新后的订阅
        updated_package = package_crud.get_package_by_id(package_id)
        logger.info(f"管理员 {current_admin.user_id} 更新订阅: {package.package_code}")
        return updated_package

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新订阅失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新订阅失败"
        )


@router.put("/{package_id}/toggle", response_model=MessageResponse)
async def toggle_package_status(
    package_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """切换订阅状态（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        success = package_crud.toggle_package_status(package_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="切换订阅状态失败"
            )

        new_status = "激活" if not package.is_active else "禁用"
        logger.info(f"管理员 {current_admin.user_id} 切换订阅状态: {package.package_code} -> {new_status}")
        return MessageResponse(message=f"订阅已{new_status}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"切换订阅状态失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="切换订阅状态失败"
        )


@router.delete("/{package_id}", response_model=MessageResponse)
async def delete_package(
    package_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """删除订阅（管理员）"""
    try:
        package_crud = PackageCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        success = package_crud.delete_package(package_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除订阅失败"
            )

        logger.info(f"管理员 {current_admin.user_id} 删除订阅: {package.package_code}")
        return MessageResponse(message="订阅已删除")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除订阅失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除订阅失败"
        )


@router.post("/purchase", response_model=PackagePurchaseResponse)
async def purchase_package(
    purchase_data: PackagePurchaseRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """购买订阅"""
    try:
        package_crud = PackageCRUD(db)
        user_plan_crud = UserPlanCRUD(db)

        # 检查订阅是否存在且可用
        package = package_crud.get_package_by_id(purchase_data.package_id)
        if not package or not package.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在或不可用"
            )

        # 创建用户订阅
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
                detail="购买订阅失败"
            )

        logger.info(f"用户 {current_user.user_id} 购买订阅: {package.package_code}")
        return PackagePurchaseResponse(
            message="订阅购买成功",
            user_plan_id=user_plan.id,
            package_code=package.package_code,
            credits_added=package.credits,
            expire_date=expire_date
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"购买订阅失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="购买订阅失败"
        )


@router.get("/statistics/overview", response_model=PackageStatisticsResponse)
async def get_package_statistics(
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取订阅统计（管理员）"""
    try:
        package_crud = PackageCRUD(db)
        statistics = package_crud.get_package_statistics()

        return PackageStatisticsResponse(**statistics)

    except Exception as e:
        logger.error(f"获取订阅统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取订阅统计失败"
        )


@router.get("/{package_id}/userkeys", response_model=UserKeysListResponse)
async def get_subscription_userkeys(
    package_id: int,
    page: int = 1,
    page_size: int = 50,
    status_filter: Optional[str] = None,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取订阅关联的用户密钥列表（管理员）"""
    try:
        package_crud = PackageCRUD(db)
        user_key_crud = UserKeyCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        # 获取用户密钥列表（支持分页和状态过滤）
        user_keys = user_key_crud.get_package_user_keys(
            package_id=package_id,
            page=page,
            page_size=page_size,
            status_filter=status_filter
        )

        total_count = user_key_crud.count_package_user_keys(
            package_id=package_id,
            status_filter=status_filter
        )

        logger.info(f"管理员 {current_admin.user_id} 查看订阅用户密钥: {package.package_code}")
        return UserKeysListResponse(
            user_keys=user_keys,
            total=total_count
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取订阅用户密钥失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取订阅用户密钥失败"
        )


@router.post("/{package_id}/userkeys/batch-generate", response_model=MessageResponse)
async def batch_generate_userkeys(
    package_id: int,
    generate_data: dict,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """批量生成用户密钥（管理员）"""
    try:
        package_crud = PackageCRUD(db)
        user_key_crud = UserKeyCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        count = generate_data.get('count', 10)
        key_status = generate_data.get('status', 'inactive')

        # 批量生成用户密钥
        success_count = user_key_crud.bulk_generate_standalone_user_keys(
            package_id=package_id,
            count=count,
            status=key_status
        )

        message = f"成功生成 {success_count} 个用户密钥"
        logger.info(f"管理员 {current_admin.user_id} 批量生成用户密钥: {package.package_code}, 数量: {success_count}")
        return MessageResponse(message=message)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量生成用户密钥失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="批量生成失败"
        )


@router.post("/{package_id}/userkeys/batch", response_model=MessageResponse)
async def batch_userkey_operations(
    package_id: int,
    operation_data: BulkUserKeyOperation,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """批量用户密钥操作（管理员）"""
    try:
        package_crud = PackageCRUD(db)
        user_key_crud = UserKeyCRUD(db)

        # 检查订阅是否存在
        package = package_crud.get_package_by_id(package_id)
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅不存在"
            )

        # 执行批量操作
        if operation_data.operation == "generate":
            # 批量生成用户密钥
            success_count = user_key_crud.bulk_generate_user_keys(
                package_id=package_id,
                user_ids=operation_data.user_ids,
                notes=operation_data.notes
            )
            message = f"成功为 {success_count} 个用户生成密钥关联"

        elif operation_data.operation == "activate":
            # 批量激活用户密钥
            success_count = user_key_crud.bulk_update_user_key_status(
                package_id=package_id,
                user_ids=operation_data.user_ids,
                status="active",
                notes=operation_data.notes
            )
            message = f"成功激活 {success_count} 个用户密钥"

        elif operation_data.operation == "deactivate":
            # 批量禁用用户密钥
            success_count = user_key_crud.bulk_update_user_key_status(
                package_id=package_id,
                user_ids=operation_data.user_ids,
                status="inactive",
                notes=operation_data.notes
            )
            message = f"成功禁用 {success_count} 个用户密钥"

        elif operation_data.operation == "delete":
            # 批量删除用户密钥关联
            success_count = user_key_crud.bulk_delete_user_keys(
                package_id=package_id,
                user_ids=operation_data.user_ids
            )
            message = f"成功删除 {success_count} 个用户密钥关联"

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不支持的操作类型"
            )

        logger.info(f"管理员 {current_admin.user_id} 批量操作订阅用户密钥: {package.package_code}, 操作: {operation_data.operation}")
        return MessageResponse(message=message)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量用户密钥操作失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="批量操作失败"
        )