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
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .event-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .message {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Site Shine Events</h1>
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
          
          <p>Best regards,<br>The Site Shine Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent to you because you registered for an event on Site Shine.</p>
          <p>If you have any questions, please contact our support team.</p>
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
