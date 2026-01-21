<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# 项目整体规则
## 1.生成代码时要参照最佳工程实践。
## 3.严禁调用不存在的方法，属性，变量。
## 4.前后端分离，后端在backend文件夹下面，前端在frontend-react文件夹下面。
## 5.代码职责分离，符合Clean Architecture原则

# 后端规则
## 1.在backend里面创建venv环境，用于管理后端依赖。
## 2.在main.py里面只api管理路由，不管理业务逻辑。
## 3.每个api的业务逻辑都要放到单独的文件里面，文件名要和api的endpoint名字一致。
## 4.依赖管理：使用requirements.txt文件管理后端依赖。
## 5.环境变量：使用.env文件管理环境变量，如API密钥等。
## 6.日志配置：使用logging模块配置日志，记录应用运行信息。log文件存储在logs文件夹下面。每天rotation一次，保留14天。
## 7.异常处理：在路由中使用try-except捕获异常，返回友好的错误信息。
## 8.性能优化：根据需要使用缓存、异步处理等技术优化性能。
## 9.文档编写：使用Swagger或ReDoc编写API文档，方便开发人员使用。
## 10.数据库连接采用数据库连接池，提高效率。

# 前端规则
## 1.前端依赖的管理用npm，依赖列表在package.json里面。

# 数据库相关
## 1.设计数据库和表结构、主键。不要设计外键制约。
## 2.做数据操作时用数据库连接池
## 3.数据删除时，不要做物理删除。
