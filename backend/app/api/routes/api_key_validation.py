from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime

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
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["API Key Validation"])


class APIKeyValidationService:
    """API密钥验证服务"""

    def __init__(self, db: Session):
        self.db = db
        self.api_key_crud = APIKeyCRUD(db)

    def validate_api_key(self, api_key: str, service: str = "llm_proxy"):
        """验证API密钥"""
        try:
            # 1. 一次性获取API密钥所有信息
            db_api_key = self.api_key_crud.get_api_key_by_key(api_key)

            # 2. 基础验证
            if not db_api_key:
                return self._create_error_response(
                    ErrorCodes.INVALID_API_KEY,
                    "Invalid API key",
                    "INVALID_KEY"
                )

            if not db_api_key.is_active:
                return self._create_error_response(
                    ErrorCodes.INVALID_API_KEY,
                    "API key is inactive",
                    "INACTIVE_KEY"
                )

            # 3. 有效期验证
            if db_api_key.expire_date and db_api_key.expire_date < datetime.now():
                return self._create_error_response(
                    ErrorCodes.PLAN_EXPIRED,
                    "API key has expired",
                    "EXPIRED_KEY"
                )

            # 4. 积分验证
            if db_api_key.remaining_credits is not None and db_api_key.remaining_credits <= 0:
                return self._create_error_response(
                    ErrorCodes.CREDITS_EXHAUSTED,
                    "Insufficient credits",
                    "INSUFFICIENT_CREDITS"
                )

            # 5. 返回成功响应
            return APIKeyValidationSuccessResponse(
                data=APIKeyValidationSuccessData(
                    valid=True,
                    real_api_key=db_api_key.real_api_key,
                    user_id=db_api_key.user_id
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


async def update_last_used_async(api_key: str, db: Session):
    """异步更新API密钥最后使用时间"""
    try:
        api_key_crud = APIKeyCRUD(db)
        api_key_crud.update_last_used(api_key)
        logger.info(f"异步更新API密钥最后使用时间: {api_key[:10]}...")
    except Exception as e:
        logger.error(f"异步更新最后使用时间失败: {str(e)}")


@router.post("/validate-api-key",
            response_model=APIKeyValidationSuccessResponse,
            responses={
                200: {"model": APIKeyValidationSuccessResponse},
                401: {"model": APIKeyValidationErrorResponse},
                403: {"model": APIKeyValidationErrorResponse}
            })
async def validate_api_key_endpoint(
    request: APIKeyValidationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
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
            # 异步更新最后使用时间，不阻塞主流程
            background_tasks.add_task(update_last_used_async, request.api_key, db)
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