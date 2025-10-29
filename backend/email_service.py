import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get('SMTP_HOST', 'mail.mitaict.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 465))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', 'info@mitaict.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', 'info@mitaict.com')
SMTP_TO_EMAIL = os.environ.get('SMTP_TO_EMAIL', 'info@mitaict.com')

async def send_contact_email(name: str, email: str, phone: str, service: str, comment: str):
    """Send contact form submission via email"""
    try:
        # Create message
        message = MIMEMultipart('alternative')
        message['From'] = SMTP_FROM_EMAIL
        message['To'] = SMTP_TO_EMAIL
        message['Subject'] = f'New Contact Form Submission from {name}'

        # Create HTML body
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
              <h2 style="color: #00FFD1; border-bottom: 2px solid #00FFD1; padding-bottom: 10px;">New Contact Form Submission</h2>
              
              <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 5px;">
                <p><strong>Name/Company:</strong> {name}</p>
                <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Service Interested:</strong> {service}</p>
                <p><strong>Comment:</strong></p>
                <p style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #00FFD1;">
                  {comment if comment else 'No comment provided'}
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #e8f8f5; border-radius: 5px;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  This email was sent from the MITA ICT contact form.<br>
                  Please respond to the customer at: <a href="mailto:{email}">{email}</a>
                </p>
              </div>
            </div>
          </body>
        </html>
        """

        # Attach HTML body
        html_part = MIMEText(html_body, 'html')
        message.attach(html_part)

        # Send email using SSL
        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            use_tls=True,
            start_tls=False
        )
        
        logger.info(f"Email sent successfully to {SMTP_TO_EMAIL}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise Exception(f"Email sending failed: {str(e)}")