from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ...schemas.api_key import (
    APIKeyValidationRequest,
    APIKeyValidationSuccessResponse,
    APIKeyValidationErrorResponse,
    APIKeyValidationSuccessData,
    APIKeyValidationErrorData
)
from ...schemas.common import ErrorCodes
from ...db.database import get_db
from ...db.crud.api_key import APIKeyCRUD
from ...db.crud.user import UserCRUD
# UserPlanCRUD已删除，使用APIKeyCRUD替代
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["API Key Validation"])


class APIKeyValidationService:
    """API密钥验证服务"""

    def __init__(self, db: Session):
        self.db = db
        self.api_key_crud = APIKeyCRUD(db)
        self.user_crud = UserCRUD(db)
        # user_plan_crud功能已合并到api_key_crud

    def validate_api_key(self, api_key: str, service: str = "llm_proxy"):
        """验证API密钥"""
        try:
            # 1. 检查API密钥是否存在且有效
            db_api_key = self.api_key_crud.get_api_key_by_key(api_key)
            if not db_api_key or not db_api_key.is_active:
                return self._create_error_response(
                    ErrorCodes.INVALID_API_KEY,
                    "Invalid API key",
                    "INVALID_KEY"
                )

            # 2. 检查用户状态
            user = self.user_crud.get_user_by_id(db_api_key.user_id)
            if not user:
                return self._create_error_response(
                    ErrorCodes.INVALID_API_KEY,
                    "User not found",
                    "USER_NOT_FOUND"
                )

            if not user.is_active or user.is_banned:
                return self._create_error_response(
                    ErrorCodes.ACCOUNT_BANNED,
                    "Account is banned or inactive",
                    "ACCOUNT_BANNED"
                )

            # 3. 检查API密钥的剩余积分
            if db_api_key.remaining_credits is not None and db_api_key.remaining_credits <= 0:
                return self._create_error_response(
                    ErrorCodes.CREDITS_EXHAUSTED,
                    "Insufficient credits",
                    "INSUFFICIENT_CREDITS"
                )

            # 4. 检查用户套餐
            plan_stats = self.api_key_crud.get_plan_usage_stats(user.user_id)
            if not plan_stats["has_active_plan"]:
                return self._create_error_response(
                    ErrorCodes.PLAN_EXPIRED,
                    "No active plan",
                    "PLAN_EXPIRED"
                )

            # 5. 更新API密钥最后使用时间
            self.api_key_crud.update_last_used(api_key)

            # 6. 返回成功响应
            return APIKeyValidationSuccessResponse(
                data=APIKeyValidationSuccessData(
                    valid=True,
                    real_api_key=db_api_key.real_api_key,
                    user_id=user.user_id,
                    plan_type=plan_stats["plan_type"]
                )
            )

        except Exception as e:
            logger.error(f"API密钥验证失败: {str(e)}")
            return self._create_error_response(
                ErrorCodes.INTERNAL_VALIDATION_ERROR,
                "Internal validation error",
                "INTERNAL_ERROR"
            )

    def _create_error_response(self, code: int, message: str, error_type: str):
        """创建错误响应"""
        return APIKeyValidationErrorResponse(
            code=code,
            message=message,
            data=APIKeyValidationErrorData(
                valid=False,
                error_type=error_type
            )
        )


@router.post("/validate-api-key",
            response_model=APIKeyValidationSuccessResponse,
            responses={
                200: {"model": APIKeyValidationSuccessResponse},
                401: {"model": APIKeyValidationErrorResponse},
                403: {"model": APIKeyValidationErrorResponse}
            })
async def validate_api_key_endpoint(request: APIKeyValidationRequest, db: Session = Depends(get_db)):
    """
    自定义API密钥校验端点

    - **api_key**: 要验证的API密钥
    - **timestamp**: 请求时间戳
    - **service**: 服务类型 (默认: llm_proxy)

    返回包含验证结果和真实API密钥的响应
    """

    try:
        # 创建验证服务实例
        validation_service = APIKeyValidationService(db)

        # 执行验证
        result = validation_service.validate_api_key(
            request.api_key,
            request.service
        )

        # 根据结果类型返回相应的HTTP状态码
        if isinstance(result, APIKeyValidationSuccessResponse):
            logger.info(f"API密钥验证成功: {request.api_key[:10]}...")
            return result
        else:
            # 错误响应
            status_code = 401 if result.code in [ErrorCodes.INVALID_API_KEY] else 403
            logger.warning(f"API密钥验证失败: {request.api_key[:10]}... - {result.message}")
            return JSONResponse(
                status_code=status_code,
                content=result.model_dump()
            )

    except Exception as e:
        logger.error(f"API密钥验证异常: {str(e)}")
        error_response = APIKeyValidationErrorResponse(
            code=ErrorCodes.INTERNAL_VALIDATION_ERROR,
            message="Internal server error",
            data=APIKeyValidationErrorData(
                valid=False,
                error_type="INTERNAL_ERROR"
            )
        )
        return JSONResponse(
            status_code=500,
            content=error_response.model_dump()
        )