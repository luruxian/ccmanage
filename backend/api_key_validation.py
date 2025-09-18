from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from models import (
    APIKeyValidationRequest,
    APIKeyValidationSuccessResponse,
    APIKeyValidationErrorResponse,
    APIKeyValidationSuccessData,
    APIKeyValidationErrorData,
    ErrorCodes
)
from database import get_db
from crud import APIKeyValidationService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["API Key Validation"])


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

    根据提供的API密钥返回校验结果，包括真实的API密钥和用户信息
    """
    try:
        logger.info(f"收到API密钥校验请求: service={request.service}")

        # 使用数据库执行校验逻辑
        validation_result = APIKeyValidationService.validate_api_key(
            db, request.api_key, request.service
        )

        if validation_result["valid"]:
            # 成功响应
            success_data = APIKeyValidationSuccessData(
                valid=True,
                real_api_key=validation_result["real_api_key"],
                user_id=validation_result["user_id"],
                plan_type=validation_result["plan_type"]
            )

            response = APIKeyValidationSuccessResponse(
                status="success",
                code=200,
                data=success_data
            )

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content=response.dict()
            )
        else:
            # 错误响应
            error_data = APIKeyValidationErrorData(
                valid=False,
                error_type=validation_result["error_type"],
                expire_date=validation_result.get("expire_date")
            )

            error_response = APIKeyValidationErrorResponse(
                status="error",
                code=validation_result["error_code"],
                message=validation_result["message"],
                data=error_data
            )

            # 根据错误类型返回不同的HTTP状态码
            if validation_result["error_code"] in [ErrorCodes.PLAN_EXPIRED, ErrorCodes.CREDITS_EXHAUSTED]:
                http_status = status.HTTP_401_UNAUTHORIZED
            elif validation_result["error_code"] in [ErrorCodes.ACCOUNT_BANNED, ErrorCodes.RATE_LIMIT_EXCEEDED]:
                http_status = status.HTTP_403_FORBIDDEN
            else:
                http_status = status.HTTP_401_UNAUTHORIZED

            return JSONResponse(
                status_code=http_status,
                content=error_response.dict()
            )

    except Exception as e:
        logger.error(f"API密钥校验过程中发生异常: {str(e)}", exc_info=True)

        # 内部错误响应
        error_data = APIKeyValidationErrorData(
            valid=False,
            error_type="internal_validation_error"
        )

        error_response = APIKeyValidationErrorResponse(
            status="error",
            code=ErrorCodes.INTERNAL_VALIDATION_ERROR,
            message="Internal validation error",
            data=error_data
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response.dict()
        )