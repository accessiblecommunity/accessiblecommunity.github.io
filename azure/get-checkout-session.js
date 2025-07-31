
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function withHeaders(body, status = 200) {
  return {
    status,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body
  };
}

module.exports = async function (context, req) {
  try {
    context.log('Function get-checkout-session started');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      context.res = withHeaders(null, 200);
      return;
    }

    const { sessionId } = req.body || {};

    context.log('Received sessionId:', sessionId);

    if (!sessionId) {
      context.res = withHeaders({ error: 'sessionId is required' }, 400);
      return;
    }

    // Retrieve the Stripe checkout session with expanded line_items and customer_details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details']
    });

    context.log('Stripe session retrieved:', session.id);

    // Return the full session object to the frontend
    context.res = withHeaders(session);
  } catch (error) {
    context.log.error('Error retrieving Stripe session:', error);
    context.res = withHeaders({
      error: error.message,
      stack: error.stack
    }, 500);
  }
};