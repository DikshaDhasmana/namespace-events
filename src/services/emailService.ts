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
        <img src="https://gvwkdvpdmjagdbincqmu.supabase.co/storage/v1/object/public/public-assets/email-logo-white.png" alt="NAMESPACE" style="height: 40px; width: auto;" />
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
        <!-- LinkedIn -->
        <a href="https://www.linkedin.com/company/namespaceworld/" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8100C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
        <!-- Instagram -->
        <a href="https://www.instagram.com/namespaceworld/" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8100C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
        <!-- X/Twitter -->
        <a href="https://x.com/namespaceworld" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <!-- WhatsApp -->
        <a href="https://www.whatsapp.com/channel/0029VabtgrVKLaHjzSXEL52f" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
          </svg>
        </a>
        <!-- YouTube -->
        <a href="https://www.youtube.com/@namespaceworld" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
        <!-- Discord -->
        <a href="https://discord.com/invite/z2fTnXjKMm" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0188 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189Z"/>
          </svg>
        </a>
        <!-- Telegram -->
        <a href="https://t.me/+11ngnAGsGYg4YTE1" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
        <!-- Email -->
        <a href="mailto:contact@namespacecomm.in" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8100C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </a>
        <!-- Website -->
        <a href="https://namespacecomm.in" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8100C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </a>
        <!-- Newsletter -->
        <a href="https://namespacecomm.substack.com/" class="social-link">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#8100C4">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            <path d="M12 13l-2-1.5v3l2-1.5zm0 0l2-1.5v3l-2-1.5z"/>
          </svg>
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
