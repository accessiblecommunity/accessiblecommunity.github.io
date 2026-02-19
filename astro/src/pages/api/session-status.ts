import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const sessionId = new URL(url).searchParams.get('session_id');
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Add authentication check here before exposing session data
    // Should verify the request is authorized to access this session
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Return only non-sensitive fields the frontend needs
    const safeSession = {
      status: session.status,
      metadata: session.metadata || null,
      customer_email: session.customer_email || null,
    };

    return new Response(
      JSON.stringify(safeSession),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error retrieving session:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
