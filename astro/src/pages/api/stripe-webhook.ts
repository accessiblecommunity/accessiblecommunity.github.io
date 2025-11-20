import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { storePurchaseData } from '@lib/purchase-storage';
import { sendConfirmationEmail } from '@lib/email';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      console.warn('Stripe webhook secret not configured, skipping signature verification');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response('Webhook handled successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
};

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata!;
  const purchaseData = {
    sessionId: session.id,
    purchaseCode: metadata.purchaseCode,
    kitType: metadata.kitType,
    theme: metadata.theme,
    organization: metadata.organization,
    contactName: metadata.contactName,
    email: metadata.email,
    specialRequirements: metadata.specialRequirements,
    amountPaid: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    createdAt: new Date().toISOString(),
  };

  // Store purchase data securely on server
  await storePurchaseData(purchaseData);

  // Send confirmation email with secure purchase code
  try {
    await sendConfirmationEmail({
      email: metadata.email,
      purchaseCode: metadata.purchaseCode,
      organization: metadata.organization,
      theme: metadata.theme,
    });
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Export for use in save-purchase-data
export { handleSuccessfulPayment };
