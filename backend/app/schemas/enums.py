from enum import Enum


class PackageType(str, Enum):
    """订阅类型枚举"""
    STANDARD = "01"  # 标准订阅
    MAX_SERIES = "02"  # Max系列订阅
    FUEL_PACK = "91"  # 加油包（只累加积分）

    @classmethod
    def get_display_name(cls, package_type: str) -> str:
        """获取订阅类型的显示名称"""
        if package_type == cls.STANDARD:
            return "标准订阅"
        elif package_type == cls.MAX_SERIES:
            return "Max系列订阅"
        elif package_type == cls.FUEL_PACK:
            return "加油包"
        else:
            return "未知类型"

    @classmethod
    def get_default_daily_reset_credits(cls, package_type: str) -> int:
        """获取订阅类型的默认每日重置积分数"""
        if package_type == cls.STANDARD:
            return 10000
        elif package_type == cls.MAX_SERIES:
            return 15000
        elif package_type == cls.FUEL_PACK:
            return 0
        else:
            return 0

    @classmethod
    def get_all_types(cls) -> list[str]:
        """获取所有订阅类型"""
        return [cls.STANDARD, cls.MAX_SERIES, cls.FUEL_PACK]

    @classmethod
    def is_valid_type(cls, package_type: str) -> bool:
        """检查订阅类型是否有效"""
        return package_type in cls.get_all_types()