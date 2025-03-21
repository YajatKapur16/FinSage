from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import os

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
)

mail = FastMail(conf)

async def send_unlock_email(email: str, token: str):
    unlock_link = f"http://127.0.0.1:8000/auth/unlock/{token}"
    message = MessageSchema(
        subject="Unlock Your Account",
        recipients=[email],
        body=f"Click the following link to unlock your account: {unlock_link}",
        subtype="plain"
    )
    await mail.send_message(message)
