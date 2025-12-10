import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { handleSuccessfulPayment } from './stripe-webhook';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the full session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use the existing secure webhook handler
    await handleSuccessfulPayment(session);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing purchase:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process purchase' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
