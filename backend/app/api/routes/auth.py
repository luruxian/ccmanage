from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ...schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    EmailVerificationRequest,
    ResendVerificationRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    RefreshTokenRequest,
    RegisterResponse,
    EmailVerificationResponse,
    AuthResponse,
    TokenResponse,
    UserResponse,
    MessageResponse,
    ErrorResponse
)
from ...core.auth_service import auth_service
from ...core.email_service import email_service
from ...db.database import get_db
from ...db.crud.user import UserCRUD
from ...core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
async def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """用户注册"""
    user_crud = UserCRUD(db)

    # 检查邮箱是否已存在（忽略大小写）
    email_lower = request.email.lower().strip()
    existing_user = user_crud.get_user_by_email(email_lower)
    if existing_user:
        logger.warning(f"邮箱重复注册尝试: {email_lower}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册，请使用其他邮箱或尝试登录"
        )

    try:
        # 创建用户
        user_id = auth_service.generate_user_id()
        password_hash = auth_service.get_password_hash(request.password)

        user_data = {
            "user_id": user_id,
            "email": email_lower,  # 使用小写邮箱保存
            "password_hash": password_hash,
            "is_active": False,  # 注册后需要验证邮箱
            "is_email_verified": False
        }

        user = user_crud.create_user(user_data)

        # 创建邮箱验证码
        verification_code = auth_service.create_email_verification(
            db, user_id, email_lower, "register"
        )

        # 发送验证邮件
        await email_service.send_verification_email(
            email_lower, email_lower, verification_code
        )

        logger.info(f"用户注册成功: {email_lower}")
        return RegisterResponse(
            message="注册成功，请检查邮箱验证码",
            user_id=user_id,
            email=email_lower
        )

    except Exception as e:
        logger.error(f"用户注册失败: {str(e)}")
        # 检查是否是唯一性约束错误
        if "Duplicate entry" in str(e) and "email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该邮箱已被注册，请使用其他邮箱"
            )
        elif "Duplicate entry" in str(e) and "user_id" in str(e):
            # 用户ID重复，重试一次
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="系统繁忙，请稍后重试"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="注册失败，请稍后重试"
            )


@router.post("/verify-email", response_model=EmailVerificationResponse)
async def verify_email(request: EmailVerificationRequest, db: Session = Depends(get_db)):
    """验证邮箱"""
    try:
        # 规范化邮箱
        email_lower = request.email.lower().strip()

        # 验证邮箱验证码
        is_valid = auth_service.verify_email_code(db, email_lower, request.verification_code)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码无效或已过期"
            )

        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_email(email_lower)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        # 生成令牌
        access_token = auth_service.create_access_token(
            data={"sub": user.user_id, "email": user.email}
        )
        refresh_token = auth_service.create_refresh_token(
            data={"sub": user.user_id, "email": user.email}
        )

        # 发送欢迎邮件
        await email_service.send_welcome_email(user.email, user.email)

        logger.info(f"邮箱验证成功: {email_lower}")
        return EmailVerificationResponse(
            message="邮箱验证成功",
            user=UserResponse.from_orm(user),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"邮箱验证失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="验证失败，请稍后重试"
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    try:
        # 规范化邮箱（忽略大小写和前后空格）
        email_lower = request.email.lower().strip()

        # 用户认证
        user = auth_service.authenticate_user(db, email_lower, request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="邮箱或密码错误"
            )

        # 生成令牌
        access_token = auth_service.create_access_token(
            data={"sub": user.user_id, "email": user.email}
        )
        refresh_token = auth_service.create_refresh_token(
            data={"sub": user.user_id, "email": user.email}
        )

        # 更新最后登录时间
        user_crud = UserCRUD(db)
        user_crud.update_last_login(user.user_id)

        logger.info(f"用户登录成功: {email_lower}")
        return AuthResponse(
            user=UserResponse.from_orm(user),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"登录失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="登录失败，请稍后重试"
        )


@router.get("/verify-email-token")
async def verify_email_token(token: str, db: Session = Depends(get_db)):
    """通过URL token验证邮箱"""
    try:
        # 验证token
        email = auth_service.verify_email_token(db, token)
        if not email:
            # 重定向到验证失败页面 - Token无效
            from fastapi.responses import RedirectResponse
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/verify-result?status=failed&reason=token_invalid",
                status_code=400
            )

        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_email(email)
        if not user:
            # 重定向到验证失败页面 - 用户不存在
            from fastapi.responses import RedirectResponse
            return RedirectResponse(
                url=f"{settings.FRONTEND_URL}/verify-result?status=failed&reason=user_not_found",
                status_code=404
            )

        # 生成令牌
        access_token = auth_service.create_access_token(
            data={"sub": user.user_id, "email": user.email}
        )
        refresh_token = auth_service.create_refresh_token(
            data={"sub": user.user_id, "email": user.email}
        )

        # 发送欢迎邮件
        await email_service.send_welcome_email(user.email, user.email)

        logger.info(f"邮箱验证成功: {email}")

        # 重定向到验证成功页面
        redirect_url = f"{settings.FRONTEND_URL}/verify-result?status=success&email={user.email}&user_id={user.user_id}"

        from fastapi.responses import RedirectResponse
        return RedirectResponse(
            url=redirect_url,
            status_code=302
        )

    except Exception as e:
        logger.error(f"邮箱验证失败: {str(e)}")
        # 重定向到验证失败页面 - 服务器错误
        from fastapi.responses import RedirectResponse
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/verify-result?status=failed&reason=server_error",
            status_code=500
        )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    """重新发送验证邮件"""
    # 规范化邮箱
    email_lower = request.email.lower().strip()

    user_crud = UserCRUD(db)
    user = user_crud.get_user_by_email(email_lower)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已验证"
        )

    try:
        # 创建新的验证码
        verification_code = auth_service.create_email_verification(
            db, user.user_id, email_lower, "register"
        )

        # 发送验证邮件
        await email_service.send_verification_email(
            email_lower, user.email, verification_code
        )

        logger.info(f"重新发送验证邮件: {email_lower}")
        return MessageResponse(message="验证邮件已重新发送")

    except Exception as e:
        logger.error(f"重新发送验证邮件失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="发送失败，请稍后重试"
        )


@router.post("/password-reset", response_model=MessageResponse)
async def password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """发送密码重置邮件"""
    # 规范化邮箱
    email_lower = request.email.lower().strip()

    user_crud = UserCRUD(db)
    user = user_crud.get_user_by_email(email_lower)

    if not user:
        # 为了安全，即使用户不存在也返回成功消息
        return MessageResponse(message="如果邮箱存在，重置邮件已发送")

    try:
        # 创建密码重置验证码
        verification_code = auth_service.create_email_verification(
            db, user.user_id, email_lower, "reset_password"
        )

        # 发送密码重置邮件
        await email_service.send_password_reset_email(
            email_lower, user.email, verification_code
        )

        logger.info(f"发送密码重置邮件: {email_lower}")
        return MessageResponse(message="密码重置邮件已发送")

    except Exception as e:
        logger.error(f"发送密码重置邮件失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="发送失败，请稍后重试"
        )


@router.post("/password-reset-confirm", response_model=MessageResponse)
async def password_reset_confirm(request: PasswordResetConfirmRequest, db: Session = Depends(get_db)):
    """确认密码重置"""
    try:
        # 规范化邮箱
        email_lower = request.email.lower().strip()

        # 验证重置码
        is_valid = auth_service.verify_email_code(db, email_lower, request.verification_code)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="验证码无效或已过期"
            )

        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_email(email_lower)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )

        # 更新密码
        password_hash = auth_service.get_password_hash(request.new_password)
        user_crud.update_user_info(user.user_id, {"password_hash": password_hash})

        logger.info(f"密码重置成功: {email_lower}")
        return MessageResponse(message="密码重置成功")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"密码重置失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="重置失败，请稍后重试"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """刷新访问令牌"""
    try:
        # 验证刷新令牌
        payload = auth_service.verify_token(request.refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌"
            )

        user_id = payload.get("sub")
        email = payload.get("email")

        # 生成新的访问令牌
        access_token = auth_service.create_access_token(
            data={"sub": user_id, "email": email}
        )

        # 生成新的刷新令牌
        refresh_token = auth_service.create_refresh_token(
            data={"sub": user_id, "email": email}
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"刷新令牌失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌刷新失败"
        )