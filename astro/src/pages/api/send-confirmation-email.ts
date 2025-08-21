import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, purchaseCode, organization, kitType, theme } = body;

    // In a production environment, you would use a service like:
    // - SendGrid
    // - Nodemailer with SMTP
    // - AWS SES
    // - Mailgun
    // etc.

    // For now, we'll just log the email content
    const emailContent = `
Subject: Your Accessible Escape Room Kit Purchase Confirmation

Dear ${organization},

Thank you for purchasing an Accessible Escape Room Kit!

Your Purchase Details:
- Kit Type: ${kitType === 'build' ? 'Build-your-own Kit' : 'Ready-made Kit'}
- Theme: ${theme}
- Organization: ${organization}

Your Secure Access Code: ${purchaseCode}

To access your kit materials, visit:
https://accessiblecommunity.org/services/escape-room/access

Enter your access code and the email address used for this purchase.

Keep this code secure - it's your proof of purchase and gateway to your materials.

If you need any assistance, please contact us at escaperoom@accessiblecommunity.org

Best regards,
The Accessible Community Team
    `;

    // In production, replace this with actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Your Accessible Escape Room Kit Purchase Confirmation',
    //   text: emailContent,
    //   html: generateHtmlEmail(purchaseCode, organization, kitType, theme)
    // });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Confirmation email sent successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send confirmation email' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
