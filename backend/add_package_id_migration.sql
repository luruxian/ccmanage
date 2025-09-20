-- 为user_plans表添加package_id字段
USE ccmanage;

-- 添加package_id字段到user_plans表
ALTER TABLE user_plans
ADD COLUMN package_id INT NULL COMMENT '套餐ID' AFTER user_id;

-- 添加外键约束
ALTER TABLE user_plans
ADD CONSTRAINT fk_user_plans_package_id
FOREIGN KEY (package_id) REFERENCES packages(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- 创建索引以提高查询性能
CREATE INDEX idx_user_plans_package_id ON user_plans(package_id);

-- 显示表结构确认修改成功
DESCRIBE user_plans;