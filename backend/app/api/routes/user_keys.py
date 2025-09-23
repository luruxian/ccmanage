from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ...schemas.user_keys import (
    KeyActivationRequest,
    KeyActivationResponse,
    UserKeyResponse,
    UserKeysListResponse,
    UserPlanStatusResponse
)
from ...schemas.auth import MessageResponse
from ...core.auth_service import auth_service
from ...db.database import get_db
from ...db.crud.user import UserCRUD
from ...db.crud.api_key import APIKeyCRUD
# UserPlanCRUD已删除，使用APIKeyCRUD替代
# UserKeyCRUD已合并到APIKeyCRUD
from .user import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/keys", tags=["User Keys Management"])
security = HTTPBearer()


@router.post("/activate-user-key", response_model=MessageResponse)
async def activate_user_key(
    request: dict,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """激活用户Key"""
    try:
        api_key_crud = APIKeyCRUD(db)
        user_key = request.get("user_key")

        if not user_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="请提供用户Key"
            )

        # 激活用户Key
        result = api_key_crud.activate_user_key(user_key, current_user.email)

        if result["success"]:
            return MessageResponse(message=result["message"])
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"激活用户Key失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="激活失败，请稍后重试"
        )


@router.post("/activate", response_model=KeyActivationResponse)
async def activate_custom_key(
    request: KeyActivationRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """激活自定义API密钥"""
    try:
        api_key_crud = APIKeyCRUD(db)

        # 检查用户是否有激活的套餐
        plan_stats = api_key_crud.get_plan_usage_stats(current_user.user_id)

        if not plan_stats.get("has_active_plan", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="请先购买套餐才能激活API密钥"
            )

        # 检查自定义密钥是否已存在
        existing_key = api_key_crud.get_api_key_by_key(request.custom_api_key)
        if existing_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该自定义密钥已被使用"
            )

        # 创建API密钥记录
        key_data = {
            "user_id": current_user.user_id,
            "api_key": request.custom_api_key,
            "real_api_key": request.real_api_key,
            "key_name": request.key_name or "默认密钥",
            "description": request.description,
            "is_active": True
        }

        api_key = api_key_crud.create_api_key(key_data)

        logger.info(f"API密钥激活成功: {current_user.user_id}, {request.custom_api_key[:10]}...")
        return KeyActivationResponse(
            message="API密钥激活成功",
            key_id=api_key.id,
            custom_api_key=api_key.api_key,
            key_name=api_key.key_name,
            is_active=api_key.is_active
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API密钥激活失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="激活失败，请稍后重试"
        )


@router.get("/", response_model=UserKeysListResponse)
async def get_user_keys(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的API密钥列表"""
    try:
        api_key_crud = APIKeyCRUD(db)
        keys = api_key_crud.get_user_api_keys_with_package_info(current_user.user_id)

        key_list = []
        for key in keys:
            key_list.append(UserKeyResponse(
                id=key["id"],
                api_key=key["api_key"],
                key_name=key["key_name"],
                package_name=key["package_name"],
                description=key["description"],
                is_active=key["is_active"],
                last_used_at=key["last_used_at"],
                created_at=key["created_at"]
            ))

        return UserKeysListResponse(
            keys=key_list,
            total=len(key_list)
        )

    except Exception as e:
        logger.error(f"获取用户密钥列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取失败"
        )


@router.get("/plan-status", response_model=UserPlanStatusResponse)
async def get_user_plan_status(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户套餐状态"""
    try:
        api_key_crud = APIKeyCRUD(db)
        plan_stats = api_key_crud.get_plan_usage_stats(current_user.user_id)

        return UserPlanStatusResponse(
            has_active_plan=plan_stats.get("has_active_plan", False),
            plan_type=plan_stats.get("plan_type", "无套餐"),
            credits_remaining=plan_stats.get("credits_remaining", 0),
            total_credits=plan_stats.get("total_credits", 0),
            usage_percentage=plan_stats.get("usage_percentage", 0)
        )

    except Exception as e:
        logger.error(f"获取用户套餐状态失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取失败"
        )


@router.put("/{key_id}/toggle", response_model=MessageResponse)
async def toggle_key_status(
    key_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """切换API密钥激活状态"""
    try:
        api_key_crud = APIKeyCRUD(db)

        # 检查密钥是否属于当前用户
        api_key = api_key_crud.get_api_key_by_id(key_id)
        if not api_key or api_key.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        # 切换激活状态
        new_status = not api_key.is_active
        success = api_key_crud.update_api_key_status(key_id, new_status)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="状态更新失败"
            )

        status_text = "激活" if new_status else "禁用"
        logger.info(f"API密钥状态切换: {current_user.user_id}, {key_id}, {status_text}")
        return MessageResponse(message=f"API密钥已{status_text}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"切换密钥状态失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="操作失败"
        )


@router.delete("/{key_id}", response_model=MessageResponse)
async def delete_user_key(
    key_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除API密钥"""
    try:
        api_key_crud = APIKeyCRUD(db)

        # 检查密钥是否属于当前用户
        api_key = api_key_crud.get_api_key_by_id(key_id)
        if not api_key or api_key.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        # 软删除（设置为非激活状态）
        success = api_key_crud.update_api_key_status(key_id, False)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除失败"
            )

        logger.info(f"API密钥删除: {current_user.user_id}, {key_id}")
        return MessageResponse(message="API密钥已删除")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除密钥失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="删除失败"
        )