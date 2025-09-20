from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from ...schemas.admin import (
    AdminLoginRequest,
    AdminCreateRequest,
    AdminUpdateRequest,
    AdminInfoResponse,
    AdminListResponse,
    AdminLoginResponse,
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserResponse,
    UserManagementResponse,
    UserListResponse,
    LoginHistoryResponse,
    LoginHistoryListResponse,
    AdminOperationResponse,
    AdminOperationListResponse,
    AdminStatisticsResponse,
    BulkUserOperation,
    SystemConfigUpdate
)
from ...schemas.auth import AuthResponse, MessageResponse
from ...core.auth_service import auth_service
from ...db.database import get_db
from ...db.crud.user import UserCRUD
from ...db.crud.admin import AdminCRUD
from ...db.crud.login_history import LoginHistoryCRUD
from ...db.crud.admin_operation import AdminOperationCRUD
from ...db.crud.package import PackageCRUD
from ...db.crud.api_key import APIKeyCRUD
from ...db.models import UserRole, Admin
from .user import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["Admin Management"])
security = HTTPBearer()


async def get_admin_user(current_user = Depends(get_current_user)):
    """获取管理员用户（权限检查）"""
    # 兼容字符串和枚举两种格式
    role_value = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
    if role_value not in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user


async def get_super_admin_user(current_user = Depends(get_current_user)):
    """获取超级管理员用户（权限检查）"""
    # 兼容字符串和枚举两种格式
    role_value = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
    if role_value != UserRole.SUPER_ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要超级管理员权限"
        )
    return current_user


async def log_admin_operation(
    admin_user_id: str,
    operation_type: str,
    target_resource: Optional[str] = None,
    target_id: Optional[str] = None,
    operation_description: Optional[str] = None,
    operation_data: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
    db: Session = Depends(get_db)
):
    """记录管理员操作"""
    try:
        admin_op_crud = AdminOperationCRUD(db)
        ip_address = None

        if request:
            ip_address = request.client.host if request.client else None

        admin_op_crud.create_operation_record(
            admin_user_id=admin_user_id,
            operation_type=operation_type,
            target_resource=target_resource,
            target_id=target_id,
            operation_description=operation_description,
            operation_data=operation_data,
            ip_address=ip_address
        )
    except Exception as e:
        logger.error(f"记录管理员操作失败: {str(e)}")


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    login_data: AdminLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """管理员登录（独立管理员表）"""
    try:
        admin_crud = AdminCRUD(db)

        # 查找管理员
        admin = admin_crud.get_admin_by_username(login_data.username)
        if not admin:
            # 记录登录失败
            logger.warning(f"管理员登录失败: 用户名不存在 - {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        # 验证密码
        if not admin_crud.verify_password(admin, login_data.password):
            # 记录登录失败 (暂时注释)
            # admin_crud.create_operation_record(
            #     admin_id=admin.id,
            #     operation_type="admin_login_failed",
            #     operation_description="管理员密码错误",
            #     ip_address=request.client.host if request.client else None
            # )
            logger.warning(f"管理员登录失败: 密码错误 - {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        # 检查账户状态
        if not admin.is_active:
            # admin_crud.create_operation_record(
            #     admin_id=admin.id,
            #     operation_type="admin_login_failed",
            #     operation_description="账户已被禁用",
            #     ip_address=request.client.host if request.client else None
            # )
            logger.warning(f"管理员登录失败: 账户已禁用 - {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="账户已被禁用"
            )

        # 生成token (使用admin.username作为subject)
        access_token = auth_service.create_access_token(data={
            "sub": f"admin_{admin.username}",
            "admin_id": admin.id,
            "username": admin.username,
            "role": admin.role.value
        })
        refresh_token = auth_service.create_refresh_token(data={
            "sub": f"admin_{admin.username}",
            "admin_id": admin.id,
            "username": admin.username,
            "role": admin.role.value
        })

        # 更新最后登录时间
        admin_crud.update_last_login(admin.id)

        # 记录登录成功 (暂时注释，因为admin_operations表结构需要更新)
        # admin_crud.create_operation_record(
        #     admin_id=admin.id,
        #     operation_type="admin_login_success",
        #     operation_description="管理员登录成功",
        #     ip_address=request.client.host if request.client else None
        # )

        logger.info(f"管理员登录成功: {admin.username}")

        return AdminLoginResponse(
            admin=AdminInfoResponse(
                id=admin.id,
                username=admin.username,
                display_name=admin.display_name,
                role=admin.role.value,
                is_active=admin.is_active,
                last_login_at=admin.last_login_at,
                created_at=admin.created_at,
                updated_at=admin.updated_at
            ),
            tokens={
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 3600
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"管理员登录失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="登录失败，请稍后重试"
        )


@router.post("/create-admin", response_model=AdminInfoResponse)
async def create_admin(
    admin_data: AdminCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """创建管理员账户（初始化用）"""
    try:
        admin_crud = AdminCRUD(db)

        # 创建管理员
        new_admin = admin_crud.create_admin(
            username=admin_data.username,
            password=admin_data.password,
            display_name=admin_data.display_name,
            role=admin_data.role
        )

        logger.info(f"创建管理员成功: {new_admin.username}")

        return AdminInfoResponse(
            id=new_admin.id,
            username=new_admin.username,
            display_name=new_admin.display_name,
            role=new_admin.role.value,
            is_active=new_admin.is_active,
            last_login_at=new_admin.last_login_at,
            created_at=new_admin.created_at,
            updated_at=new_admin.updated_at
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"创建管理员失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建管理员失败"
        )


@router.get("/admins", response_model=AdminListResponse)
async def get_all_admins(
    page: int = 1,
    page_size: int = 20,
    include_deleted: bool = False,
    current_admin = Depends(get_super_admin_user),
    db: Session = Depends(get_db)
):
    """获取所有管理员列表（仅超级管理员）"""
    try:
        admin_crud = AdminCRUD(db)

        admins = admin_crud.get_all_admins(
            include_deleted=include_deleted,
            page=page,
            page_size=page_size
        )

        total = admin_crud.count_admins(include_deleted=include_deleted)

        admin_responses = [
            AdminInfoResponse(
                id=admin.id,
                username=admin.username,
                display_name=admin.display_name,
                role=admin.role.value,
                is_active=admin.is_active,
                last_login_at=admin.last_login_at,
                created_at=admin.created_at,
                updated_at=admin.updated_at
            )
            for admin in admins
        ]

        return AdminListResponse(
            admins=admin_responses,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"获取管理员列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取管理员列表失败"
        )


@router.get("/users", response_model=UserListResponse)
async def get_all_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取所有用户列表（管理员）"""
    try:
        user_crud = UserCRUD(db)

        # 使用新的搜索方法支持分页和搜索
        users = user_crud.search_users(
            search=search,
            is_active=is_active,
            page=page,
            page_size=page_size
        )

        total_count = user_crud.count_search_users(
            search=search,
            is_active=is_active
        )

        # 添加额外信息
        user_management_list = []
        for user in users:
            # 统计用户的API密钥和套餐信息
            api_key_crud = APIKeyCRUD(db)
            user_keys = api_key_crud.get_user_api_keys(user.user_id)

            user_management_list.append({
                "id": user.id,
                "user_id": user.user_id,
                "email": user.email,
                "phone": user.phone,
                "role": "user",  # 普通用户统一角色为user
                "is_active": user.is_active,
                "is_email_verified": user.is_email_verified,
                "is_banned": user.is_banned,
                "last_login_at": user.last_login_at,
                "total_api_keys": len(user_keys),
                "active_api_keys": len([k for k in user_keys if k.is_active]),
                "total_plans": len(user.user_plans),
                "active_plans": len([p for p in user.user_plans if p.is_active]),
                "created_at": user.created_at,
                "updated_at": user.updated_at
            })

        return UserListResponse(
            users=user_management_list,
            total=total_count,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"获取用户列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取用户列表失败"
        )


@router.get("/statistics", response_model=AdminStatisticsResponse)
async def get_admin_statistics(
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取管理员统计数据"""
    try:
        user_crud = UserCRUD(db)
        package_crud = PackageCRUD(db)
        api_key_crud = APIKeyCRUD(db)
        login_history_crud = LoginHistoryCRUD(db)
        admin_op_crud = AdminOperationCRUD(db)

        # 用户统计
        all_users = user_crud.get_all_users()
        total_users = len(all_users)
        active_users = len([u for u in all_users if u.is_active])
        banned_users = len([u for u in all_users if u.is_banned])

        # 管理员统计（从独立的admins表获取）
        admin_crud = AdminCRUD(db)
        admin_stats = admin_crud.get_admin_statistics()
        admin_users = admin_stats["total_admins"]

        # 套餐统计
        package_stats = package_crud.get_package_statistics()

        # API密钥统计
        # 需要实现API密钥统计方法
        total_api_keys = 0
        active_api_keys = 0

        # 登录统计
        login_stats = login_history_crud.get_login_statistics()

        # 操作统计
        operation_stats = admin_op_crud.get_operation_statistics()

        return AdminStatisticsResponse(
            total_users=total_users,
            active_users=active_users,
            banned_users=banned_users,
            admin_users=admin_users,
            total_api_keys=total_api_keys,
            active_api_keys=active_api_keys,
            total_packages=package_stats["total_packages"],
            active_packages=package_stats["active_packages"],
            login_statistics=login_stats,
            operation_statistics=operation_stats
        )

    except Exception as e:
        logger.error(f"获取管理员统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取统计数据失败"
        )