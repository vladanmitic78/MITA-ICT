import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.environ.get('SMTP_HOST', 'es17.siteground.eu')
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

async def send_auto_response_email(name: str, email: str, phone: str, service: str):
    """Send auto-response email to user who submitted contact form"""
    try:
        # Create message
        message = MIMEMultipart('alternative')
        message['From'] = SMTP_FROM_EMAIL
        message['To'] = email
        message['Subject'] = 'Thank You for Contacting MITAICT'

        # Service name mapping for better display
        service_names = {
            'saas': 'SaaS',
            'it-consulting': 'IT consulting',
            'telco-consulting': 'Telco consulting',
            'leadership': 'Leadership',
            'pnl-optimization': 'PnL optimisation',
            'company-registration': 'Setting up a company in Sweden',
            'others': 'Others'
        }
        service_display = service_names.get(service, service)

        # Create HTML body
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
              <h2 style="color: #00FFD1; border-bottom: 2px solid #00FFD1; padding-bottom: 10px;">Thank You for Contacting MITAICT</h2>
              
              <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 5px;">
                <p>Dear <strong>{name}</strong>,</p>
                
                <p>Thank you for reaching out to MITAICT. We have received your inquiry and our team will get back to you shortly. Below are the details you submitted for our reference:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #00FFD1;">
                  <p style="margin: 5px 0;"><strong>Name:</strong> {name}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> {email}</p>
                  <p style="margin: 5px 0;"><strong>Mobile Phone:</strong> {phone}</p>
                  <p style="margin: 5px 0;"><strong>Selected Service:</strong> {service_display}</p>
                </div>
                
                <p>If any of the information above is incorrect, please reply to this email with the correct details.</p>
                
                <p>We appreciate your interest in our services and look forward to assisting you soon.</p>
                
                <p style="margin-top: 30px;">Warm regards,<br>
                <strong>MITA ICT Team</strong></p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #e8f8f5; border-radius: 5px; text-align: center;">
                <p style="margin: 5px 0; font-size: 14px;">📧 <a href="mailto:info@mitaict.com" style="color: #00FFD1; text-decoration: none;">info@mitaict.com</a></p>
                <p style="margin: 5px 0; font-size: 14px;">🌐 <a href="http://www.mitaict.com" style="color: #00FFD1; text-decoration: none;">www.mitaict.com</a></p>
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
        
        logger.info(f"Auto-response email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send auto-response email: {str(e)}")
        raise Exception(f"Auto-response email sending failed: {str(e)}")


async def send_meeting_request_email(name: str, email: str, phone: str, preferred_datetime: str, topic: str):
    """Send meeting request email to admin for approval"""
    try:
        message = MIMEMultipart('alternative')
        message['From'] = SMTP_FROM_EMAIL
        message['To'] = SMTP_TO_EMAIL
        message['Subject'] = f'🗓️ Meeting Request from {name} - Approval Required'

        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd;">
              <h2 style="color: #00FFD1; border-bottom: 2px solid #00FFD1; padding-bottom: 10px;">
                🗓️ New Meeting Request - Approval Required
              </h2>
              
              <div style="background-color: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-weight: bold; color: #856404;">
                  ⏳ This meeting request is awaiting your approval
                </p>
              </div>
              
              <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 5px;">
                <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
                <p><strong>Phone:</strong> {phone if phone else 'Not provided'}</p>
                
                <h3 style="color: #333; margin-top: 25px;">Meeting Details</h3>
                <div style="background-color: #e8f8f5; padding: 15px; border-radius: 5px; border-left: 4px solid #00FFD1;">
                  <p style="margin: 5px 0;"><strong>📅 Preferred Time:</strong> {preferred_datetime}</p>
                  <p style="margin: 5px 0;"><strong>📋 Topic:</strong> {topic if topic else 'General consultation'}</p>
                </div>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 5px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #155724;">
                  <strong>To approve this meeting:</strong><br>
                  Reply to <a href="mailto:{email}">{email}</a> with your confirmation and meeting link.
                </p>
              </div>
              
              <div style="margin-top: 15px; padding: 10px; font-size: 12px; color: #666; text-align: center;">
                This request was submitted via the MITA ICT AI Chatbot.
              </div>
            </div>
          </body>
        </html>
        """

        html_part = MIMEText(html_body, 'html')
        message.attach(html_part)

        await aiosmtplib.send(
            message,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            use_tls=True,
            start_tls=False
        )
        
        logger.info(f"Meeting request email sent for {name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send meeting request email: {str(e)}")
        raise Exception(f"Meeting request email failed: {str(e)}")