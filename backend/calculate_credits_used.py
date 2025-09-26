#!/usr/bin/env python3
"""
积分消耗计算工具函数
根据total_tokens计算credits_used
"""
import math


def calculate_credits_used(total_tokens: int) -> int:
    """
    计算积分消耗

    Args:
        total_tokens: 总token数量

    Returns:
        int: 积分消耗数量（整数）

    计算规则：
    - credits_used = total_tokens / 1000，向上取整
    - total_tokens < 1000时，按1000计算
    """
    if not total_tokens or total_tokens <= 0:
        return 0

    # 如果token数小于1000，按1000计算
    effective_tokens = max(total_tokens, 1000)

    # 除以1000并向上取整
    credits_used = math.ceil(effective_tokens / 1000)

    return credits_used


if __name__ == "__main__":
    # 测试用例 (向上取整)
    test_cases = [
        (0, 0),
        (500, 1),
        (999, 1),
        (1000, 1),
        (1001, 2),
        (1500, 2),
        (2000, 2),
        (2001, 3),
        (2999, 3),
        (3000, 3),
        (10000, 10),
        (10001, 11)
    ]

    print("积分消耗计算测试:")
    print("total_tokens -> credits_used")
    print("-" * 30)

    for tokens, expected in test_cases:
        result = calculate_credits_used(tokens)
        status = "OK" if result == expected else "ERROR"
        print(f"{tokens:>5} tokens -> {result:>2} credits {status}")