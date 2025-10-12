import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email};
}

async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function sendVerificationEmail(to: string, firstName: string, verificationToken: string) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const verificationUrl = process.env.NODE_ENV === "production"
      ? `https://${process.env.REPL_SLUG}.replit.app/api/auth/verify-email?token=${verificationToken}`
      : `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

    const msg = {
      to,
      from: fromEmail,
      subject: 'Verify your Trisandhya Sadhana account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕉️ Trisandhya Sadhana Companion</h1>
            </div>
            <div class="content">
              <p>Namaste ${firstName},</p>
              <p>Welcome to Trisandhya Sadhana Companion! We're delighted to have you join our spiritual community.</p>
              <p>Please verify your email address to complete your registration and begin your daily sadhana journey:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${verificationUrl}</p>
              <p style="margin-top: 30px;">This verification link will expire in 24 hours.</p>
              <p>Jai Kalki Avatar,<br>The Trisandhya Sadhana Team</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await client.send(msg);
    console.log('Verification email sent to:', to);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();

    const msg = {
      to,
      from: fromEmail,
      subject: 'Welcome to Trisandhya Sadhana Companion!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🕉️ Welcome to Trisandhya Sadhana!</h1>
            </div>
            <div class="content">
              <p>Namaste ${firstName},</p>
              <p>Your email has been verified successfully! You can now access all the features of Trisandhya Sadhana Companion:</p>
              <div class="feature">
                <strong>🔔 Smart Alarms</strong><br>
                Set intelligent reminders for Pratah, Madhyahna, and Sayam sadhana
              </div>
              <div class="feature">
                <strong>📊 Progress Tracking</strong><br>
                Monitor your daily practice and build meaningful streaks
              </div>
              <div class="feature">
                <strong>📖 Sacred Content</strong><br>
                Access Mahapuran Path and spiritual media library
              </div>
              <p style="margin-top: 30px;">Begin your spiritual journey today!</p>
              <p>Jai Kalki Avatar,<br>The Trisandhya Sadhana Team</p>
            </div>
            <div class="footer">
              <p>May your practice bring you peace and spiritual growth.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await client.send(msg);
    console.log('Welcome email sent to:', to);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}
