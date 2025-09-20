from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ...schemas.user_key_management import (
    UserKeyRelationCreate,
    UserKeyRelationUpdate,
    UserKeyRelationResponse,
    KeyUserResponse,
    UserKeysListResponse,
    KeyUsersListResponse,
    UserKeyStatisticsResponse,
    BulkUserKeyOperation
)
from ...schemas.auth import MessageResponse
from ...db.database import get_db
from ...db.crud.user_key import UserKeyCRUD
from ...db.crud.user import UserCRUD
from ...db.crud.api_key import APIKeyCRUD
from .user import get_current_user
from .admin import get_admin_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/user-keys", tags=["User Key Management"])


@router.post("/relation", response_model=UserKeyRelationResponse)
async def create_user_key_relation(
    relation_data: UserKeyRelationCreate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """创建用户密钥关联（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)
        user_crud = UserCRUD(db)
        api_key_crud = APIKeyCRUD(db)

        # 验证用户是否存在
        user = user_crud.get_user_by_user_id(relation_data.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        # 验证API密钥是否存在
        api_key = api_key_crud.get_api_key_by_id(relation_data.api_key_id)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        # 创建关联
        user_key = user_key_crud.create_user_key_relation(
            user_id=relation_data.user_id,
            api_key_id=relation_data.api_key_id,
            notes=relation_data.notes
        )

        if not user_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="创建用户密钥关联失败"
            )

        # 返回完整的关联信息
        user_keys = user_key_crud.get_user_keys(relation_data.user_id)
        for uk in user_keys:
            if uk["id"] == user_key.id:
                return UserKeyRelationResponse(**uk)

        logger.info(f"管理员 {current_admin.user_id} 创建用户密钥关联: {relation_data.user_id} - {relation_data.api_key_id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取创建的关联信息失败"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建用户密钥关联失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建关联失败"
        )


@router.get("/user/{user_id}", response_model=UserKeysListResponse)
async def get_user_keys(
    user_id: str,
    status_filter: Optional[str] = None,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取用户的密钥关联列表（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)

        # 验证用户是否存在
        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_user_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        user_keys = user_key_crud.get_user_keys(user_id, status=status_filter)

        key_relations = []
        for uk in user_keys:
            key_relations.append(UserKeyRelationResponse(**uk))

        return UserKeysListResponse(
            user_keys=key_relations,
            total=len(key_relations)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户密钥列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取用户密钥列表失败"
        )


@router.get("/key/{api_key_id}/users", response_model=KeyUsersListResponse)
async def get_key_users(
    api_key_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取密钥关联的用户列表（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)
        api_key_crud = APIKeyCRUD(db)

        # 验证API密钥是否存在
        api_key = api_key_crud.get_api_key_by_id(api_key_id)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        key_users = user_key_crud.get_key_users(api_key_id)

        user_relations = []
        for ku in key_users:
            user_relations.append(KeyUserResponse(**ku))

        return KeyUsersListResponse(
            key_users=user_relations,
            total=len(user_relations)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取密钥用户列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取密钥用户列表失败"
        )


@router.get("/my-keys", response_model=UserKeysListResponse)
async def get_my_user_keys(
    status_filter: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的密钥关联列表"""
    try:
        user_key_crud = UserKeyCRUD(db)
        user_keys = user_key_crud.get_user_keys(current_user.user_id, status=status_filter)

        key_relations = []
        for uk in user_keys:
            key_relations.append(UserKeyRelationResponse(**uk))

        return UserKeysListResponse(
            user_keys=key_relations,
            total=len(key_relations)
        )

    except Exception as e:
        logger.error(f"获取用户密钥列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取密钥列表失败"
        )


@router.put("/relation/{relation_id}", response_model=MessageResponse)
async def update_user_key_relation(
    relation_id: int,
    update_data: UserKeyRelationUpdate,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """更新用户密钥关联状态（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)

        success = user_key_crud.update_user_key_status(
            relation_id=relation_id,
            status=update_data.status,
            notes=update_data.notes
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户密钥关联不存在或更新失败"
            )

        logger.info(f"管理员 {current_admin.user_id} 更新用户密钥关联: {relation_id}, 状态: {update_data.status}")
        return MessageResponse(message="用户密钥关联状态已更新")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新用户密钥关联失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新关联失败"
        )


@router.delete("/relation/{relation_id}", response_model=MessageResponse)
async def delete_user_key_relation(
    relation_id: int,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """删除用户密钥关联（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)

        success = user_key_crud.delete_user_key_relation(relation_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户密钥关联不存在"
            )

        logger.info(f"管理员 {current_admin.user_id} 删除用户密钥关联: {relation_id}")
        return MessageResponse(message="用户密钥关联已删除")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除用户密钥关联失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除关联失败"
        )


@router.post("/bulk-operation", response_model=MessageResponse)
async def bulk_user_key_operation(
    operation_data: BulkUserKeyOperation,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """批量用户密钥操作（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)
        api_key_crud = APIKeyCRUD(db)

        # 验证API密钥是否存在
        api_key = api_key_crud.get_api_key_by_id(operation_data.api_key_id)
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        success_count = 0
        failed_count = 0

        for user_id in operation_data.user_ids:
            try:
                if operation_data.operation == "activate":
                    # 检查关联是否存在，不存在则创建
                    existing = user_key_crud.get_user_key_relation(user_id, operation_data.api_key_id)
                    if not existing:
                        user_key_crud.create_user_key_relation(
                            user_id=user_id,
                            api_key_id=operation_data.api_key_id,
                            notes=operation_data.notes
                        )
                    else:
                        user_key_crud.update_user_key_status(existing.id, "active", operation_data.notes)
                    success_count += 1

                elif operation_data.operation == "deactivate":
                    success = user_key_crud.deactivate_user_key_relation(user_id, operation_data.api_key_id)
                    if success:
                        success_count += 1
                    else:
                        failed_count += 1

                elif operation_data.operation == "delete":
                    existing = user_key_crud.get_user_key_relation(user_id, operation_data.api_key_id)
                    if existing:
                        success = user_key_crud.delete_user_key_relation(existing.id)
                        if success:
                            success_count += 1
                        else:
                            failed_count += 1
                    else:
                        failed_count += 1

            except Exception as e:
                logger.error(f"批量操作失败 - 用户 {user_id}: {str(e)}")
                failed_count += 1

        message = f"批量操作完成: 成功 {success_count} 个, 失败 {failed_count} 个"
        logger.info(f"管理员 {current_admin.user_id} 执行批量用户密钥操作: {operation_data.operation}, {message}")
        return MessageResponse(message=message)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量用户密钥操作失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="批量操作失败"
        )


@router.get("/statistics", response_model=UserKeyStatisticsResponse)
async def get_user_key_statistics(
    user_id: Optional[str] = None,
    current_admin = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """获取用户密钥关联统计（管理员）"""
    try:
        user_key_crud = UserKeyCRUD(db)
        statistics = user_key_crud.get_user_key_statistics(user_id)

        return UserKeyStatisticsResponse(**statistics)

    except Exception as e:
        logger.error(f"获取用户密钥统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取统计数据失败"
        )