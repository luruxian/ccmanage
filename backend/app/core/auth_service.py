import secrets
import random
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..core.config import settings
from ..db.models import User, EmailVerification
from ..db.crud.user import UserCRUD
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """认证服务类"""

    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """获取密码哈希值"""
        return self.pwd_context.hash(password)

    def generate_verification_code(self) -> str:
        """生成6位数字验证码"""
        return f"{random.randint(100000, 999999)}"

    def generate_verification_token(self, email: str, verification_type: str = "register") -> str:
        """生成验证令牌"""
        data = {
            "email": email,
            "type": verification_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        expire = datetime.utcnow() + timedelta(minutes=15)  # 15分钟有效期
        data.update({"exp": expire})
        token = jwt.encode(data, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return token

    def generate_user_id(self) -> str:
        """生成用户唯一标识"""
        return f"user_{secrets.token_hex(8)}"

    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """创建访问令牌"""
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """创建刷新令牌"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """验证令牌"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError as e:
            logger.warning(f"Token验证失败: {str(e)}")
            return None

    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """用户认证"""
        user_crud = UserCRUD(db)
        user = user_crud.get_user_by_email(email)

        if not user:
            logger.warning(f"用户不存在: {email}")
            return None

        if not self.verify_password(password, user.password_hash):
            logger.warning(f"密码错误: {email}")
            return None

        if not user.is_email_verified:
            logger.warning(f"邮箱未验证: {email}")
            return None

        if not user.is_active or user.is_banned:
            logger.warning(f"账户被禁用或封禁: {email}")
            return None

        return user

    def create_email_verification(self, db: Session, user_id: str, email: str,
                                verification_type: str = "register") -> str:
        """创建邮箱验证记录（基于token）"""
        verification_token = self.generate_verification_token(email, verification_type)
        expire_at = datetime.now() + timedelta(minutes=15)  # 15分钟有效期，使用本地时间

        # 删除该用户之前未使用的验证记录
        db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.verification_type == verification_type,
            EmailVerification.is_used == False
        ).delete()

        # 使用token作为verification_code存储
        email_verification = EmailVerification(
            user_id=user_id,
            email=email,
            verification_code=verification_token,
            verification_type=verification_type,
            expire_at=expire_at
        )

        db.add(email_verification)
        db.commit()
        db.refresh(email_verification)

        logger.info(f"创建邮箱验证记录: {email}, token已生成，过期时间: {expire_at}")
        return verification_token

    def verify_email_code(self, db: Session, email: str, verification_code: str) -> bool:
        """验证邮箱验证码（兼容旧版本）"""
        verification = db.query(EmailVerification).filter(
            EmailVerification.email == email,
            EmailVerification.verification_code == verification_code,
            EmailVerification.is_used == False,
            EmailVerification.expire_at > datetime.now()
        ).first()

        if not verification:
            logger.warning(f"验证码无效或已过期: {email}, {verification_code}")
            return False

        # 标记验证码为已使用
        verification.is_used = True
        db.commit()

        # 如果是注册验证，激活用户账户
        if verification.verification_type == "register":
            user_crud = UserCRUD(db)
            user = user_crud.get_user_by_id(verification.user_id)
            if user:
                user.is_email_verified = True
                user.is_active = True
                db.commit()
                logger.info(f"用户邮箱验证完成，账户已激活: {email}")

        return True

    def verify_email_token(self, db: Session, token: str) -> Optional[str]:
        """验证邮箱验证token"""
        try:
            # 解码token
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get("email")
            verification_type = payload.get("type")

            if not email:
                logger.warning("Token中缺少邮箱信息")
                return None

            # 查找对应的验证记录
            verification = db.query(EmailVerification).filter(
                EmailVerification.email == email,
                EmailVerification.verification_code == token,
                EmailVerification.is_used == False,
                EmailVerification.expire_at > datetime.now()
            ).first()

            if not verification:
                logger.warning(f"验证记录不存在或已过期: {email}")
                return None

            # 标记为已使用
            verification.is_used = True
            db.commit()

            # 如果是注册验证，激活用户账户
            if verification.verification_type == "register":
                user_crud = UserCRUD(db)
                user = user_crud.get_user_by_id(verification.user_id)
                if user:
                    user.is_email_verified = True
                    user.is_active = True
                    db.commit()
                    logger.info(f"用户邮箱验证完成，账户已激活: {email}")

            return email

        except JWTError as e:
            logger.warning(f"Token验证失败: {str(e)}")
            return None

# 创建全局认证服务实例
auth_service = AuthService()