import logging
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from ..core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """邮件服务类"""

    def __init__(self):
        # 设置模板环境
        template_dir = Path(__file__).parent.parent / "templates" / "email"
        template_dir.mkdir(parents=True, exist_ok=True)
        self.template_env = Environment(loader=FileSystemLoader(str(template_dir)))

    async def send_email(self, recipients: List[str], subject: str,
                        html_content: str, text_content: str = None) -> bool:
        """发送邮件"""
        try:
            # 创建邮件
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
            msg["To"] = ", ".join(recipients)

            # 添加文本和HTML版本
            if text_content:
                text_part = MIMEText(text_content, "plain", "utf-8")
                msg.attach(text_part)

            html_part = MIMEText(html_content, "html", "utf-8")
            msg.attach(html_part)

            # 发送邮件
            with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT) as server:
                server.starttls()
                server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
                server.send_message(msg)

            logger.info(f"邮件发送成功: {recipients}, 主题: {subject}")
            return True

        except Exception as e:
            logger.error(f"邮件发送失败: {recipients}, 错误: {str(e)}")
            return False

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """渲染邮件模板"""
        try:
            template = self.template_env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            logger.error(f"模板渲染失败: {template_name}, 错误: {str(e)}")
            return ""

    async def send_verification_email(self, email: str, username: str,
                                    verification_token: str) -> bool:
        """发送邮箱验证邮件"""
        context = {
            "username": username,
            "verification_token": verification_token,
            "app_name": "agnets.app|agnet club",
            "verification_url": f"{settings.BACKEND_URL}/api/v1/auth/verify-email-token?token={verification_token}"
        }

        # 使用更热情的HTML邮件模板
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>🎉 欢迎加入 agnets.app | agnet club 🎉</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <!-- 主容器 -->
                <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- 顶部装饰 -->
                    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #feca57 100%); height: 8px;"></div>

                    <!-- 内容区域 -->
                    <div style="padding: 40px 30px;">
                        <!-- 品牌标识 -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #718096; padding: 15px 25px; border-radius: 50px; font-weight: 700; font-size: 18px; margin-bottom: 15px;">
                                🤖 agnets.app | agnet club
                            </div>
                        </div>

                        <!-- 欢迎信息 -->
                        <div style="text-align: center; margin-bottom: 35px;">
                            <h1 style="color: #2d3748; font-size: 32px; font-weight: 700; margin: 0 0 15px 0; line-height: 1.2;">🎉 欢迎加入我们！</h1>
                            <p style="color: #718096; font-size: 18px; margin: 0; line-height: 1.5;">感谢您选择 agnets.app，您即将开启智能代理的奇妙之旅</p>
                        </div>

                        <!-- 个性化问候 -->
                        <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #667eea;">
                            <p style="color: #2d3748; font-size: 16px; margin: 0; line-height: 1.6;">
                                <strong>Hi {context['username']} 👋</strong><br><br>
                                我们很高兴您决定加入 agnets.app 社区！作为 agnet club 的新成员，您将能够：
                            </p>
                            <ul style="color: #4a5568; margin: 15px 0 0 0; padding-left: 20px; line-height: 1.8;">
                                <li>🚀 利用Claude Code更高效地完成编程工作</li>
                                <li>🔗 实现开发工作流的无缝整合</li>
                                <li>📊 实时监控使用情况</li>
                                <li>🎯 享受专业级的技术支持</li>
                            </ul>
                        </div>

                        <!-- CTA按钮 -->
                        <div style="text-align: center; margin: 35px 0;">
                            <p style="color: #4a5568; font-size: 16px; margin-bottom: 20px;">
                                <strong>⚡ 一键验证邮箱</strong><br>
                                点击下面的按钮立即完成验证，开始您的智能代理之旅：
                            </p>

                            <!-- 主要验证按钮 (兼容所有邮件客户端) -->
                            <div style="margin-bottom: 20px;">
                                <table cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="background: #10b981; border-radius: 8px; padding: 0;">
                                            <a href="{context['verification_url']}"
                                               style="display: block; color: white; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; font-family: Arial, sans-serif;">
                                                ✅ 立即验证邮箱
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <p style="color: #10b981; font-size: 14px; margin: 10px 0; font-weight: 600;">
                                👆 点击按钮后将自动完成验证并跳转到登录页面
                            </p>

                            <!-- 备用链接 -->
                            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #6c757d;">
                                <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                                    <strong>📱 按钮无法点击？</strong>
                                </p>
                                <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.5;">
                                    请复制以下链接到您的浏览器地址栏中打开：<br>
                                    <span style="word-break: break-all; font-family: monospace; background: #e9ecef; padding: 2px 4px; border-radius: 3px;">
                                        {context['verification_url']}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <!-- 安全提示 -->
                        <div style="background: #fff5f5; border: 1px solid #fed7d7; border-radius: 10px; padding: 20px; margin: 25px 0;">
                            <p style="color: #c53030; font-size: 14px; margin: 0; text-align: center;">
                                🔒 <strong>安全提示：</strong>验证链接将在15分钟后失效，请尽快完成验证
                            </p>
                        </div>

                        <!-- 联系信息 -->
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">需要帮助？我们随时为您服务</p>
                            <p style="color: #667eea; font-size: 14px; margin: 0;">
                                📧 club.agnet@gmail.com | 🌐 https://agnets.app
                            </p>
                        </div>
                    </div>

                    <!-- 底部装饰 -->
                    <div style="background: #f7fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                            如果您没有注册 agnets.app 账户，请忽略此邮件。<br>
                            此邮件由系统自动发送，请勿直接回复。<br><br>
                            © 2025 agnets.app | agnet club. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            recipients=[email],
            subject="agnets.app|agnet club - 🎉 欢迎加入，请验证您的邮箱",
            html_content=html_content,
            text_content=f"欢迎加入 agnets.app！请点击链接验证邮箱：{context['verification_url']}"
        )

    async def send_password_reset_email(self, email: str, username: str,
                                      reset_token: str) -> bool:
        """发送密码重置邮件"""
        context = {
            "username": username,
            "reset_token": reset_token,
            "app_name": "agnets.app|agnet club",
            "reset_url": f"{settings.FRONTEND_URL}/reset-password?email={email}"
        }

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>密码重置 - {context['app_name']}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #dc3545; text-align: center;">{context['app_name']}</h1>
                <h2 style="color: #333;">密码重置请求</h2>
                <p>尊敬的 {context['username']}，</p>
                <p>我们收到了您的密码重置请求。请使用以下6位验证码重置您的密码：</p>

                <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin: 0; font-size: 32px; letter-spacing: 8px; font-family: 'Courier New', monospace;">{context['reset_token']}</h3>
                    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">6位验证码</p>
                </div>

                <p><strong>验证码将在15分钟后失效，请手动输入验证码。</strong></p>
                <p>点击以下按钮跳转到密码重置页面，然后手动输入上面的6位验证码：</p>
                <div style="text-align: center; margin: 20px 0;">
                    <table cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                            <td style="background: #dc3545; border-radius: 8px; padding: 0;">
                                <a href="{context['reset_url']}"
                                   style="display: block; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; font-family: Arial, sans-serif;">
                                   🔐 跳转到重置页面
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6c757d; margin: 20px 0;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>📱 按钮无法点击？</strong>
                    </p>
                    <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.5;">
                        请复制以下链接到您的浏览器地址栏中打开，然后手动输入验证码：<br>
                        <span style="word-break: break-all; font-family: 'Courier New', monospace; background: #e9ecef; padding: 2px 4px; border-radius: 3px; font-size: 12px;">
                            {context['reset_url']}
                        </span>
                    </p>
                </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    如果您没有请求重置密码，请忽略此邮件。<br>
                    此邮件由系统自动发送，请勿回复。
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            recipients=[email],
            subject="agnets.app|agnet club - 🔐 密码重置请求",
            html_content=html_content,
            text_content=f"您的密码重置验证码是：{context['reset_token']}。请访问以下链接并手动输入验证码：{context['reset_url']}"
        )

    async def send_welcome_email(self, email: str, username: str) -> bool:
        """发送欢迎邮件"""
        context = {
            "username": username,
            "app_name": "agnets.app|agnet club",
            "dashboard_url": f"{settings.FRONTEND_URL}/dashboard"
        }

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>欢迎使用 - {context['app_name']}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745; text-align: center;">{context['app_name']}</h1>
                <h2 style="color: #333;">欢迎加入！</h2>
                <p>尊敬的 {context['username']}，</p>
                <p>恭喜您成功注册 {context['app_name']}！您现在可以：</p>

                <ul style="line-height: 1.6;">
                    <li>管理您的API密钥</li>
                    <li>查看使用情况和套餐状态</li>
                    <li>享受我们的专业服务</li>
                </ul>

                <div style="text-align: center; margin: 20px 0;">
                    <table cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                            <td style="background: #28a745; border-radius: 8px; padding: 0;">
                                <a href="{context['dashboard_url']}"
                                   style="display: block; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; font-family: Arial, sans-serif;">
                                   进入控制台
                                </a>
                            </td>
                        </tr>
                    </table>
                </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">
                    感谢您选择 {context['app_name']}！<br>
                    此邮件由系统自动发送，请勿回复。
                </p>
            </div>
        </body>
        </html>
        """

        return await self.send_email(
            recipients=[email],
            subject="agnets.app|agnet club - 🎊 欢迎来到智能代理俱乐部！",
            html_content=html_content,
            text_content=f"欢迎使用 {context['app_name']}！"
        )

# 创建全局邮件服务实例
email_service = EmailService()