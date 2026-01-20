import requests
import logging
from typing import Dict, Any
from ..core.config import settings

logger = logging.getLogger(__name__)


class CreditsResetClient:
    """积分重置外部API客户端"""

    def __init__(self):
        self.base_url = settings.CREDITS_RESET_API_BASE_URL
        self.timeout = 10  # 10秒超时

    def reset_credits(
        self,
        api_key: str,
        remaining_credits: int,
        last_reset_credits_at: str = None
    ) -> Dict[str, Any]:
        """
        调用外部API重置Redis中的积分

        Args:
            api_key: API密钥
            remaining_credits: 剩余积分
            last_reset_credits_at: 最后重置时间（ISO格式字符串，可选）

        Returns:
            包含调用结果的字典
        """
        try:
            # 构建请求URL
            url = f"{self.base_url}/v1/credits/reset"

            # 构建请求数据
            payload = {
                "api_key": api_key,
                "remaining_credits": remaining_credits
            }

            # 只有在提供了重置时间时才包含该字段
            if last_reset_credits_at:
                payload["last_reset_credits_at"] = last_reset_credits_at

            # 发送POST请求
            response = requests.post(
                url,
                json=payload,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            )

            # 检查响应状态
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    logger.info(f"外部积分重置API调用成功: {api_key[:10]}..., 剩余积分: {remaining_credits}")
                    return {
                        "success": True,
                        "message": "外部API调用成功",
                        "external_response": result
                    }
                else:
                    logger.warning(f"外部积分重置API返回失败: {result.get('message', 'Unknown error')}")
                    return {
                        "success": False,
                        "message": f"外部API返回失败: {result.get('message', 'Unknown error')}",
                        "external_response": result
                    }
            else:
                logger.error(f"外部积分重置API调用失败，状态码: {response.status_code}, 响应: {response.text}")
                return {
                    "success": False,
                    "message": f"外部API调用失败，状态码: {response.status_code}",
                    "status_code": response.status_code
                }

        except requests.exceptions.Timeout:
            logger.error(f"外部积分重置API调用超时: {self.base_url}")
            return {
                "success": False,
                "message": "外部API调用超时"
            }

        except requests.exceptions.ConnectionError:
            logger.error(f"无法连接到外部积分重置API: {self.base_url}")
            return {
                "success": False,
                "message": "无法连接到外部API"
            }

        except requests.exceptions.RequestException as e:
            logger.error(f"外部积分重置API调用异常: {str(e)}")
            return {
                "success": False,
                "message": f"外部API调用异常: {str(e)}"
            }

        except Exception as e:
            logger.error(f"外部积分重置API调用未知错误: {str(e)}")
            return {
                "success": False,
                "message": f"外部API调用未知错误: {str(e)}"
            }


# 创建全局客户端实例
credits_reset_client = CreditsResetClient()