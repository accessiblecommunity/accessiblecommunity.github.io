const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to add standard headers
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
    context.log('Escape Room checkout function started');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        context.res = withHeaders(null, 200);
        return;
    }

    try {
        const { items, customerEmail, returnUrl, shippingAddress, metadata } = req.body;

        context.log('Processing checkout for:', { 
            itemsCount: items?.length, 
            customerEmail, 
            hasShipping: !!shippingAddress,
            metadata 
        });

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            context.res = withHeaders({ 
                error: 'Invalid items data' 
            }, 400);
            return;
        }

        if (!customerEmail) {
            context.res = withHeaders({ 
                error: 'Customer email is required' 
            }, 400);
            return;
        }

        if (!returnUrl) {
            context.res = withHeaders({ 
                error: 'Return URL is required' 
            }, 400);
            return;
        }

        // Build line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description || '',
                    metadata: {
                        kit_version: item.version || 'standard',
                        product_type: 'escape_room_kit'
                    }
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity || 1,
        }));

        // Create session config
        const sessionConfig = {
            ui_mode: 'embedded',
            line_items: lineItems,
            mode: 'payment',
            return_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            customer_email: customerEmail,
            metadata: {
                source: 'escape_room_kit_purchase',
                timestamp: new Date().toISOString(),
                order_type: 'physical_product',
                // Add custom metadata from the form
                ...(metadata && {
                    kitType: metadata.kitType,
                    theme: metadata.theme,
                    organization: metadata.organization,
                    contactName: metadata.contactName,
                    specialRequirements: metadata.specialRequirements || ''
                })
            }
        };

        // Add shipping if requested
        if (shippingAddress) {
            sessionConfig.shipping_address_collection = {
                allowed_countries: ['US', 'CA'],
            };
            
            sessionConfig.shipping_options = [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 999, // $9.99 in cents
                            currency: 'usd',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 5 },
                            maximum: { unit: 'business_day', value: 7 },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 1999, // $19.99 in cents
                            currency: 'usd',
                        },
                        display_name: 'Express Shipping',
                        delivery_estimate: {
                            minimum: { unit: 'business_day', value: 2 },
                            maximum: { unit: 'business_day', value: 3 },
                        },
                    },
                },
            ];
        }

        // Create the Stripe session
        const session = await stripe.checkout.sessions.create(sessionConfig);

        context.log('Stripe session created successfully:', session.id);

        context.res = withHeaders({ 
            clientSecret: session.client_secret,
            sessionId: session.id 
        }, 200);

    } catch (error) {
        context.log.error('Stripe error:', error.message);
        context.res = withHeaders({ 
            error: 'Failed to create checkout session',
            details: error.message 
        }, 500);
    }
};