from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import os
import json
from datetime import datetime

from ...schemas.user_keys import (
    KeyActivationRequest,
    KeyActivationResponse,
    UserKeyResponse,
    UserKeysListResponse,
    UserPlanStatusResponse,
    UserKeyActivationResponse
)
from ...schemas.auth import MessageResponse
from ...core.auth_service import auth_service
from ...db.database import get_db
from ...db.crud.user import UserCRUD
from ...db.crud.api_key import APIKeyCRUD
# UserPlanCRUD已删除，使用APIKeyCRUD替代
# UserKeyCRUD已合并到APIKeyCRUD
from .user import get_current_user
from ...services.credits_reset_client import credits_reset_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/keys", tags=["User Keys Management"])
security = HTTPBearer()


@router.post("/activate-user-key", response_model=UserKeyActivationResponse)
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
            # 解析activation_date和expire_date字符串为datetime对象
            activation_date = None
            expire_date = None

            if result.get("activation_date"):
                try:
                    activation_date = datetime.fromisoformat(result["activation_date"])
                except (ValueError, TypeError):
                    activation_date = None

            if result.get("expire_date"):
                try:
                    expire_date = datetime.fromisoformat(result["expire_date"])
                except (ValueError, TypeError):
                    expire_date = None

            return UserKeyActivationResponse(
                message=result["message"],
                is_refuel_package=result.get("is_refuel_package", False),
                credits_added=result.get("credits_added", 0),
                activation_date=activation_date,
                expire_date=expire_date
            )
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
                created_at=key["created_at"],
                activation_date=key["activation_date"],
                expire_date=key["expire_date"],
                remaining_days=key["remaining_days"],
                status=key["status"],
                total_credits=key["total_credits"],
                remaining_credits=key["remaining_credits"]
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
        # 返回默认值而不是抛出异常，避免对没有API key的用户造成错误
        return UserPlanStatusResponse(
            has_active_plan=False,
            plan_type="无订阅",
            credits_remaining=0,
            total_credits=0,
            usage_percentage=0
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


@router.put("/{key_id}/reset-credits", response_model=MessageResponse)
async def reset_api_key_credits(
    key_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """重置API密钥的积分"""
    try:
        api_key_crud = APIKeyCRUD(db)

        # 检查密钥是否属于当前用户
        api_key = api_key_crud.get_api_key_by_id(key_id)
        if not api_key or api_key.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        # 执行积分重置
        result = api_key_crud.reset_credits(key_id)

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["message"]
            )

        # 数据库重置成功后，调用外部API同步Redis数据
        try:
            # 获取重置后的API密钥信息
            api_key = api_key_crud.get_api_key_by_id(key_id)
            if api_key:
                # 调用外部积分重置API
                external_result = credits_reset_client.reset_credits(
                    api_key=api_key.api_key,
                    remaining_credits=api_key.remaining_credits,
                    last_reset_credits_at=api_key.last_reset_credits_at.isoformat() if api_key.last_reset_credits_at else None
                )

                if not external_result["success"]:
                    logger.warning(f"外部积分重置API调用失败: {external_result['message']}")
                    # 外部API调用失败不影响主要功能，继续返回成功
                else:
                    logger.info(f"外部积分重置API调用成功: {api_key.api_key[:10]}...")

        except Exception as e:
            logger.error(f"调用外部积分重置API时发生异常: {str(e)}")
            # 外部API调用异常不影响主要功能，继续返回成功

        logger.info(f"积分重置成功: {current_user.user_id}, {key_id}")
        return MessageResponse(message=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"重置积分失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="重置失败"
        )


@router.get("/{key_id}/download-config")
async def download_api_key_config(
    key_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """下载API密钥的配置文件"""
    try:
        api_key_crud = APIKeyCRUD(db)

        # 检查密钥是否属于当前用户
        api_key = api_key_crud.get_api_key_by_id(key_id)
        if not api_key or api_key.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API密钥不存在"
            )

        # 读取配置文件模板
        template_path = os.path.join(os.path.dirname(__file__), "../../../settings_template.json")

        if not os.path.exists(template_path):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="配置文件模板不存在"
            )

        with open(template_path, 'r', encoding='utf-8') as f:
            config_template = f.read()

        # 替换API密钥占位符
        config_content = config_template.replace("{{API_KEY}}", api_key.api_key)

        # 验证JSON格式
        try:
            json.loads(config_content)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"配置文件格式错误: {str(e)}"
            )

        # 返回JSON响应，前端将处理下载
        return JSONResponse(
            content={
                "config": json.loads(config_content),
                "filename": "settings.json"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"下载配置文件失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="下载配置文件失败"
        )