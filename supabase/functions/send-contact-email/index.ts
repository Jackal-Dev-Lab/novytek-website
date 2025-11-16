import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, service, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email for:", { name, email, service });

    // Envoyer l'email à nahmematthieu@gmail.com
    const emailResponse = await resend.emails.send({
      from: "NovyTek Contact <onboarding@resend.dev>",
      to: ["nahmematthieu@gmail.com"],
      replyTo: email,
      subject: `Nouvelle demande de devis - ${service}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .info-row {
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #3B82F6;
              }
              .label {
                font-weight: 600;
                color: #3B82F6;
                margin-bottom: 5px;
              }
              .value {
                color: #1f2937;
              }
              .message-box {
                background: white;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🔧 Nouvelle Demande de Devis</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">NovyTek - Services Tech</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">Nom du client</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}" style="color: #3B82F6;">${email}</a></div>
              </div>
              
              <div class="info-row">
                <div class="label">Téléphone</div>
                <div class="value"><a href="tel:${phone}" style="color: #3B82F6;">${phone}</a></div>
              </div>
              
              <div class="info-row">
                <div class="label">Service demandé</div>
                <div class="value"><strong>${service}</strong></div>
              </div>
              
              <div class="message-box">
                <div class="label" style="margin-bottom: 10px;">Message</div>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>
              
              <div class="footer">
                <p>Ce message a été envoyé depuis le formulaire de contact de votre site NovyTek.</p>
                <p>Vous pouvez répondre directement à cet email pour contacter ${name}.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Envoyer également un email de confirmation au client
    await resend.emails.send({
      from: "NovyTek <onboarding@resend.dev>",
      to: [email],
      subject: "Demande de devis bien reçue - NovyTek",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
              }
              .content {
                padding: 20px;
              }
              .cta-button {
                display: inline-block;
                background: #3B82F6;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">✅ Demande bien reçue !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              
              <p>Merci pour votre demande de devis concernant <strong>${service}</strong>.</p>
              
              <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais, généralement sous 24h.</p>
              
              <p>En attendant, n'hésitez pas à nous contacter directement :</p>
              <ul>
                <li>📞 Téléphone : <a href="tel:+33123456789" style="color: #3B82F6;">01 23 45 67 89</a></li>
                <li>💬 WhatsApp : <a href="https://wa.me/33123456789" style="color: #3B82F6;">Cliquez ici</a></li>
              </ul>
              
              <p>À très bientôt,<br><strong>L'équipe NovyTek</strong></p>
            </div>
          </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
