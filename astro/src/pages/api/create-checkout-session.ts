import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { kitType, theme, organization, contactName, email, specialRequirements } = body;

    // Validate required fields
    if (!kitType || !theme || !organization || !contactName || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique purchase code
    const purchaseCode = `ESC-${uuidv4().split('-')[0].toUpperCase()}`;

    // Determine price based on kit type
    const price = kitType === 'build' ? 50000 : 350000; // Stripe uses cents
    const kitTypeName = kitType === 'build' ? 'Build-your-own Kit' : 'Ready-made Kit';

    // Map theme values to display names
    const themeNames: Record<string, string> = {
      'corporate': 'Corporate Conundrum',
      'baking': 'Baking Bonanza',
      'picnic': 'Puzzling Picnic',
      'casino': 'Cryptic Casino'
    };

    const themeName = themeNames[theme] || theme;

    // Create Stripe checkout session with embedded checkout
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${kitTypeName} - ${themeName}`,
              description: `Accessible Escape Room Kit for ${organization}`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${new URL(request.url).origin}/services/escape-room/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: {
        purchaseCode,
        kitType,
        theme,
        organization,
        contactName,
        email,
        specialRequirements: specialRequirements || '',
      },
    });

    return new Response(
      JSON.stringify({ 
        clientSecret: session.client_secret,
        purchaseCode
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
