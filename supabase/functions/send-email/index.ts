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
      // Handle bulk email using Resend's batch API
      const { recipients, subject, htmlTemplate, from }: BulkEmailRequest = body;
      console.log(`Starting batch email to ${recipients.length} recipients:`, recipients.map(r => r.email));
      
      try {
        // Prepare batch emails
        const batchEmails = recipients.map(recipient => {
          const personalizedHtml = htmlTemplate
            .replace(/\$\{data\.applicantName\}/g, recipient.name)
            .replace(/{{name}}/g, recipient.name)
            .replace(/{{email}}/g, recipient.email);

          return {
            from: from || 'Site Shine <onboarding@resend.dev>',
            to: recipient.email,
            subject,
            html: personalizedHtml,
          };
        });

        console.log('Sending batch emails:', batchEmails.length);
        
        // Send batch emails
        const batchResponse = await resend.batch.send(batchEmails);
        
        console.log('Batch email response:', batchResponse);
        
        // Transform response to match expected format
        const results = batchResponse.data?.map((response, index) => ({
          email: recipients[index].email,
          status: response.error ? 'error' : 'success',
          data: response.error ? undefined : response,
          error: response.error?.message,
        })) || [];

        return new Response(JSON.stringify({ results }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Batch email error:', error);
        // Fallback to individual sending if batch fails
        const results = [];
        
        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];
          try {
            const personalizedHtml = htmlTemplate
              .replace(/\$\{data\.applicantName\}/g, recipient.name)
              .replace(/{{name}}/g, recipient.name)
              .replace(/{{email}}/g, recipient.email);

            const emailResponse = await resend.emails.send({
              from: from || 'Site Shine <onboarding@resend.dev>',
              to: recipient.email,
              subject,
              html: personalizedHtml,
            });
            
            results.push({
              email: recipient.email,
              status: 'success',
              data: emailResponse,
            });
          } catch (individualError) {
            console.error(`Error sending individual email to ${recipient.email}:`, individualError);
            results.push({
              email: recipient.email,
              status: 'error',
              error: individualError instanceof Error ? individualError.message : 'Unknown error',
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return new Response(JSON.stringify({ results }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
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