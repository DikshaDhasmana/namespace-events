import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface BulkEmailRequest {
  recipients: Array<{ email: string; name: string }>;
  subject: string;
  htmlTemplate: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    if (body.recipients) {
      // Handle bulk email
      const { recipients, subject, htmlTemplate, from }: BulkEmailRequest = body;
      console.log(`Starting bulk email to ${recipients.length} recipients:`, recipients.map(r => r.email));
      const results = [];
      
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        console.log(`Processing recipient ${i + 1}/${recipients.length}: ${recipient.email}`);
        
        try {
          const personalizedHtml = htmlTemplate
            .replace(/\$\{data\.applicantName\}/g, recipient.name)
            .replace(/{{name}}/g, recipient.name)
            .replace(/{{email}}/g, recipient.email);

          console.log(`Sending email to: ${recipient.email}, name: ${recipient.name}`);

          const emailResponse = await resend.emails.send({
            from: from || 'Site Shine <onboarding@resend.dev>',
            to: recipient.email,
            subject,
            html: personalizedHtml,
          });

          console.log(`Email sent successfully to ${recipient.email}:`, emailResponse);
          
          results.push({
            email: recipient.email,
            status: 'success',
            data: emailResponse,
          });
        } catch (error) {
          console.error(`Error sending email to ${recipient.email}:`, error);
          results.push({
            email: recipient.email,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('Bulk email results:', results);
      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      // Handle single email
      const { to, subject, html, from }: EmailRequest = body;

      const emailResponse = await resend.emails.send({
        from: from || 'Site Shine <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);