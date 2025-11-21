import { supabase } from '@/integrations/supabase/client';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface EmailTemplateData {
  eventName: string;
  applicantName: string;
  message: string;
  eventDate?: string;
  eventVenue?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          from: options.from,
        },
      });

      if (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  static generateEventEmailTemplate(data: EmailTemplateData & { subject?: string }): string {
    // Cache-busting parameter to force email clients to load new images
    const cacheBuster = `?v=${Date.now()}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject || 'Event Update'}</title>
  <style>
    /* Brand Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap');

    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #2E2E2E; /* NAMESPACE Black */
      max-width: 640px;
      margin: 0 auto;
      padding: 0;
      background: #F4F4F6;
    }

    .container {
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      margin: 30px 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .header {
      background: linear-gradient(135deg, #8100C4 0%, #A240E6 100%);
      color: #E6E6E6; /* NAMESPACE White */
      padding: 40px 24px;
      text-align: center;
    }
    .header h1 {
      font-family: 'Sora', sans-serif;
      font-size: 28px;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .content {
      padding: 32px 28px;
      background: #FFFFFF;
    }

    .content h2 {
      font-family: 'Sora', sans-serif;
      font-size: 20px;
      margin-bottom: 16px;
      color: #8100C4;
    }

    .event-info {
      background: #F9F5FF;
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      border-left: 5px solid #8100C4;
    }
    .event-info h3 {
      font-family: 'Sora', sans-serif;
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 8px;
      color: #2E2E2E;
    }
    .event-info p {
      margin: 6px 0;
      font-size: 15px;
    }

    .message {
      background: #FDFDFE;
      border: 1px solid #EEE;
      padding: 20px;
      border-radius: 10px;
      margin: 24px 0;
      font-size: 15px;
      line-height: 1.6;
    }

    .signature {
      margin-top: 28px;
      font-size: 15px;
      font-weight: 500;
    }

    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 13px;
      background: #F9F9FB;
      border-top: 1px solid #EEE;
    }

    .footer p {
      margin: 12px 0;
      line-height: 1.5;
    }

    .social-links {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .social-link {
      display: inline-block;
      text-decoration: none;
    }

    .social-icon {
      width: 32px;
      height: 32px;
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://namespace.world" style="display: inline-block;">
        <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/email-logo-white.png${cacheBuster}" alt="NAMESPACE" style="height: 40px; width: auto;" />
      </a>
    </div>

    <div class="content">
      <h2>Hello ${data.applicantName},</h2>

      <div class="event-info">
        <h3>${data.eventName}</h3>
        ${data.eventDate ? `<p><strong>Date:</strong> ${data.eventDate}</p>` : ''}
        ${data.eventVenue ? `<p><strong>Venue:</strong> ${data.eventVenue}</p>` : ''}
      </div>

      <div class="message">
        ${data.message}
      </div>

      <p class="signature">Best regards,<br>Team NAMESPACE</p>
    </div>

    <div class="footer">
      <p>NAMESPACE is building a global human-centric tech ecosystem and empowering 50,000+ builders through hackathons, fellowships, bootcamps, workshops, open-source fests and other tech events.</p>
      
      <div class="social-links">
        <a href="https://www.linkedin.com/company/namespaceworld/" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/linkedin-icon.png${cacheBuster}" alt="LinkedIn" class="social-icon" />
        </a>
        <a href="https://www.instagram.com/namespaceworld/" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/instagram-icon.png${cacheBuster}" alt="Instagram" class="social-icon" />
        </a>
        <a href="https://x.com/namespaceworld" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/x-icon.png${cacheBuster}" alt="X" class="social-icon" />
        </a>
        <a href="https://www.whatsapp.com/channel/0029VabtgrVKLaHjzSXEL52f" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/whatsapp-icon.png${cacheBuster}" alt="WhatsApp" class="social-icon" />
        </a>
        <a href="https://www.youtube.com/@namespaceworld" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/youtube-icon.png${cacheBuster}" alt="YouTube" class="social-icon" />
        </a>
        <a href="https://discord.com/invite/z2fTnXjKMm" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/discord-icon.png${cacheBuster}" alt="Discord" class="social-icon" />
        </a>
        <a href="https://t.me/+11ngnAGsGYg4YTE1" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/telegram-icon.png${cacheBuster}" alt="Telegram" class="social-icon" />
        </a>
        <a href="mailto:contact@namespacecomm.in" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/email-icon.png${cacheBuster}" alt="Email" class="social-icon" />
        </a>
        <a href="https://namespacecomm.in" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/website-icon.png${cacheBuster}" alt="Website" class="social-icon" />
        </a>
        <a href="https://namespacecomm.substack.com/" class="social-link">
          <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/newsletter-icon.png${cacheBuster}" alt="Newsletter" class="social-icon" />
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  static async sendBulkEmails(
    recipients: Array<{ email: string; name: string }>,
    subject: string,
    htmlTemplate: string,
    from?: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          recipients,
          subject,
          htmlTemplate,
          from,
        },
      });

      if (error) {
        console.error('Error sending bulk emails:', error);
        throw new Error(`Failed to send bulk emails: ${error.message}`);
      }

      return data.results;
    } catch (error) {
      console.error('Bulk email service error:', error);
      throw error;
    }
  }
}
