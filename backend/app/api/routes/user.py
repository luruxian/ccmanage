from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ...schemas.auth import UserResponse
from ...schemas.user import UserUpdateRequest, UserProfileResponse
from ...core.auth_service import auth_service
from ...db.database import get_db
from ...db.crud.user import UserCRUD
from ...db.crud.user_plan import UserPlanCRUD
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/user", tags=["User Management"])
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """获取当前登录用户"""
    token = credentials.credentials
    payload = auth_service.verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的访问令牌"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌格式错误"
        )

    user_crud = UserCRUD(db)
    user = user_crud.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    if not user.is_active or user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账户已被禁用"
        )

    return user


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user = Depends(get_current_user)):
    """获取用户个人信息"""
    try:
        db = current_user._sa_instance_state.session
        user_plan_crud = UserPlanCRUD(db)
        plan_stats = user_plan_crud.get_plan_usage_stats(current_user.user_id)

        return UserProfileResponse(
            user=UserResponse.from_orm(current_user),
            plan_info={
                "plan_type": plan_stats.get("plan_type", "无套餐"),
                "credits_remaining": plan_stats.get("credits_remaining", 0),
                "total_credits": plan_stats.get("total_credits", 0),
                "has_active_plan": plan_stats.get("has_active_plan", False)
            }
        )

    except Exception as e:
        logger.error(f"获取用户信息失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取信息失败"
        )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    request: UserUpdateRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户个人信息"""
    try:
        user_crud = UserCRUD(db)

        # 检查新邮箱是否已被使用
        if request.email and request.email != current_user.email:
            existing_user = user_crud.get_user_by_email(request.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱已被使用"
                )

        # 检查新用户名是否已被使用
        if request.username and request.username != current_user.username:
            existing_user = user_crud.get_user_by_username(request.username)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="用户名已被使用"
                )

        # 准备更新数据
        update_data = {}
        if request.username:
            update_data["username"] = request.username
        if request.email:
            update_data["email"] = request.email
        if request.phone:
            update_data["phone"] = request.phone

        # 如果修改了邮箱，需要重新验证
        if request.email and request.email != current_user.email:
            update_data["is_email_verified"] = False
            # TODO: 发送新邮箱验证邮件

        # 更新用户信息
        updated_user = user_crud.update_user_info(current_user.user_id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        logger.info(f"用户信息更新成功: {current_user.user_id}")
        return UserResponse.from_orm(updated_user)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新用户信息失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新失败"
        )