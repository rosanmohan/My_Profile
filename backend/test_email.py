import os
import asyncio
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME = "rosanmohans@gmail.com",
    MAIL_PASSWORD = "wvavpmzeibfforry",
    MAIL_FROM = "rosanmohans@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def simple_send():
    print("Attempting to send email...")
    
    html = "<p>Test email from local script</p>"

    message = MessageSchema(
        subject="Test Email",
        recipients=["rosansahoo64@gmail.com"], 
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print("Email sent successfully!")
    except Exception as e:
        print(f"FAILED to send email: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(simple_send())
    except Exception as e:
        print(f"Script error: {e}")
