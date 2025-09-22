from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import math

from ...schemas.usage_history import (
    UsageRecordCreate,
    UsageRecordResponse,
    UsageHistoryQuery,
    UsageHistoryListResponse,
    UsageStatsResponse,
    UsageStatsQuery,
    TokenUsageRequest,
    UsageRecordSuccess,
    ApiKeyUsageResponse,
    ErrorResponse
)
from ...schemas.auth import MessageResponse
from ...db.database import get_db
from ...db.crud.usage_record import UsageRecordCRUD
from ...db.crud.api_key import APIKeyCRUD
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/usage", tags=["Usage History"])


@router.post("/record", response_model=UsageRecordSuccess)
async def record_usage(
    request: TokenUsageRequest,
    db: Session = Depends(get_db)
):
    """记录API使用履历"""
    try:
        usage_crud = UsageRecordCRUD(db)

        # 计算total_tokens（如果未提供）
        total_tokens = request.total_tokens
        if total_tokens is None:
            total_tokens = request.input_tokens + request.output_tokens

        # 记录使用履历
        usage_record = usage_crud.record_api_usage(
            api_key=request.api_key,
            service=request.service,
            input_tokens=request.input_tokens,
            output_tokens=request.output_tokens,
            total_tokens=total_tokens,
            credits_used=request.credits_used,
            response_status=request.response_status,
            error_message=request.error_message
        )

        if not usage_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的API密钥或记录使用履历失败"
            )

        logger.info(f"记录使用履历成功: API密钥={request.api_key}, 服务={request.service}, tokens={total_tokens}")
        return UsageRecordSuccess(
            record_id=usage_record.id,
            timestamp=usage_record.request_timestamp
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"记录使用履历失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器内部错误"
        )


@router.get("/history", response_model=UsageHistoryListResponse)
async def get_usage_history(
    api_key: str = Query(..., description="API密钥"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    service: Optional[str] = Query(None, description="服务类型筛选"),
    start_date: Optional[datetime] = Query(None, description="开始时间"),
    end_date: Optional[datetime] = Query(None, description="结束时间"),
    db: Session = Depends(get_db)
):
    """获取指定API密钥的使用履历"""
    try:
        usage_crud = UsageRecordCRUD(db)

        # 获取使用记录
        records = usage_crud.get_api_key_usage_history(
            api_key=api_key,
            page=page,
            page_size=page_size,
            service_filter=service,
            start_date=start_date,
            end_date=end_date
        )

        # 获取总数
        total = usage_crud.count_api_key_usage_history(
            api_key=api_key,
            service_filter=service,
            start_date=start_date,
            end_date=end_date
        )

        # 计算总页数
        pages = math.ceil(total / page_size) if total > 0 else 1

        # 转换为响应模型
        record_responses = [
            UsageRecordResponse(
                id=record.id,
                api_key_id=record.api_key_id,
                service=record.service,
                request_count=record.request_count,
                credits_used=record.credits_used,
                input_tokens=record.input_tokens,
                output_tokens=record.output_tokens,
                total_tokens=record.total_tokens,
                request_timestamp=record.request_timestamp,
                response_status=record.response_status,
                error_message=record.error_message
            )
            for record in records
        ]

        return UsageHistoryListResponse(
            records=record_responses,
            total=total,
            page=page,
            page_size=page_size,
            pages=pages
        )

    except Exception as e:
        logger.error(f"获取使用履历失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取失败"
        )


@router.get("/stats", response_model=UsageStatsResponse)
async def get_usage_stats(
    api_key: str = Query(..., description="API密钥"),
    start_date: Optional[datetime] = Query(None, description="开始时间"),
    end_date: Optional[datetime] = Query(None, description="结束时间"),
    db: Session = Depends(get_db)
):
    """获取指定API密钥的使用统计"""
    try:
        usage_crud = UsageRecordCRUD(db)

        # 如果没有指定时间范围，默认获取最近30天的数据
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        stats = usage_crud.get_api_key_usage_stats_detailed(
            api_key=api_key,
            start_date=start_date,
            end_date=end_date
        )

        return UsageStatsResponse(**stats)

    except Exception as e:
        logger.error(f"获取使用统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取统计失败"
        )


@router.get("/api-key/{api_key_id}/stats", response_model=ApiKeyUsageResponse)
async def get_api_key_usage_stats(
    api_key_id: int,
    db: Session = Depends(get_db)
):
    """获取特定API密钥的使用统计"""
    try:
        usage_crud = UsageRecordCRUD(db)

        stats = usage_crud.get_api_key_usage_stats(api_key_id)
        return ApiKeyUsageResponse(**stats)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取API密钥使用统计失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取统计失败"
        )


@router.get("/services", response_model=list)
async def get_available_services(
    api_key: Optional[str] = Query(None, description="API密钥（可选，不提供则返回所有服务类型）"),
    db: Session = Depends(get_db)
):
    """获取可用的服务类型列表"""
    try:
        if api_key:
            usage_crud = UsageRecordCRUD(db)

            # 查询API密钥使用过的服务类型
            records = usage_crud.get_api_key_usage_history(
                api_key=api_key,
                page=1,
                page_size=1000  # 获取足够多的记录来收集所有服务类型
            )

            # 提取唯一的服务类型
            services = list(set(record.service for record in records))
            services.sort()

            # 如果API密钥没有使用记录，返回常见的服务类型
            if not services:
                services = [
                    "chat-completion",
                    "embedding",
                    "image-generation",
                    "text-completion",
                    "code-completion"
                ]
        else:
            # 返回所有常见的服务类型
            services = [
                "chat-completion",
                "embedding",
                "image-generation",
                "text-completion",
                "code-completion",
                "translation",
                "summarization"
            ]

        return services

    except Exception as e:
        logger.error(f"获取服务类型列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取失败"
        )


@router.delete("/cleanup", response_model=MessageResponse)
async def cleanup_old_records(
    days_to_keep: int = Query(90, ge=1, le=365, description="保留天数"),
    db: Session = Depends(get_db)
):
    """清理旧的使用记录"""
    try:
        usage_crud = UsageRecordCRUD(db)
        deleted_count = usage_crud.delete_old_records(days_to_keep)

        logger.info(f"清理旧记录完成: 删除了 {deleted_count} 条记录")
        return MessageResponse(message=f"成功删除 {deleted_count} 条旧记录")

    except Exception as e:
        logger.error(f"清理旧记录失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="清理失败"
        )