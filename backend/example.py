from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import logging

# 创建路由实例
router = APIRouter(
    prefix="/example",
    tags=["示例"],
    responses={404: {"description": "未找到"}},
)

# 获取日志记录器
logger = logging.getLogger(__name__)

# 请求模型定义
class ExampleRequest(BaseModel):
    """示例请求数据模型"""
    name: str
    value: int

# 响应模型定义
class ExampleResponse(BaseModel):
    """示例响应数据模型"""
    id: str
    name: str
    value: int
    processed: bool

# 模拟数据库
_examples_db = []

@router.post("/", response_model=ExampleResponse)
def create_example(example: ExampleRequest):
    """
    创建示例数据
    - **name**: 示例名称
    - **value**: 示例值
    """
    logger.info(f"创建示例: {example.name}")
    
    # 实现业务逻辑
    try:
        # 模拟创建ID
        example_id = f"example_{len(_examples_db) + 1}"
        
        # 构建响应数据
        response_data = ExampleResponse(
            id=example_id,
            name=example.name,
            value=example.value,
            processed=True
        )
        
        # 保存到模拟数据库（pydantic v1使用dict()方法）
        _examples_db.append(response_data.dict())
        
        logger.info(f"示例创建成功: {example_id}")
        return response_data
    except Exception as e:
        logger.error(f"创建示例失败: {str(e)}")
        raise HTTPException(status_code=500, detail="创建示例失败")

@router.get("/", response_model=list[ExampleResponse])
def get_all_examples():
    """\获取所有示例数据"""
    logger.info("获取所有示例数据")
    return _examples_db

@router.get("/{example_id}", response_model=ExampleResponse)
def get_example(example_id: str):
    """
    根据ID获取示例数据
    - **example_id**: 示例ID
    """
    logger.info(f"获取示例: {example_id}")
    
    # 查找示例
    example = next((item for item in _examples_db if item["id"] == example_id), None)
    
    if example is None:
        logger.warning(f"示例未找到: {example_id}")
        raise HTTPException(status_code=404, detail="示例未找到")
    
    return example