import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  },
}));

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => mockStripe),
}));

// Mock fetch for email sending
global.fetch = vi.fn();

describe('stripe-webhook API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful file operations
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.writeFile as any).mockResolvedValue(undefined);
    
    // Mock successful email sending
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle checkout.session.completed event successfully', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'build',
            theme: 'corporate',
            organization: 'Test Corp',
            contactName: 'John Doe',
            email: 'test@example.com',
            specialRequirements: 'Wheelchair access',
          },
          amount_total: 50000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.status).toBe(200);
    
    const responseText = await response.text();
    expect(responseText).toBe('Webhook handled successfully');
    
    // Verify purchase data was stored
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/ESC-12345678\.json$/),
      expect.stringContaining('"purchaseCode":"ESC-12345678"')
    );
  });

  it('should handle webhook without signature verification when secret not configured', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'build',
            theme: 'corporate',
            organization: 'Test Corp',
            contactName: 'John Doe',
            email: 'test@example.com',
            specialRequirements: '',
          },
          amount_total: 50000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    // Simulate missing webhook secret
    Object.defineProperty(import.meta, 'env', {
      value: {
        STRIPE_SECRET_KEY: 'sk_test_fake_stripe_key',
        STRIPE_WEBHOOK_SECRET: undefined, // No webhook secret
      },
      writable: true,
    });

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.status).toBe(200);
    expect(mockStripe.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid webhook signature', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const mockRequest = {
      text: () => Promise.resolve('invalid event body'),
      headers: new Map([
        ['stripe-signature', 'invalid_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.status).toBe(400);
    
    const responseText = await response.text();
    expect(responseText).toBe('Webhook signature verification failed');
  });

  it('should ignore unhandled event types', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    const mockEvent = {
      type: 'payment_intent.succeeded', // Different event type
      data: {
        object: {
          id: 'pi_test_payment123',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.status).toBe(200);
    
    const responseText = await response.text();
    expect(responseText).toBe('Webhook handled successfully');
    
    // Should not store any purchase data for unhandled events
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should handle file system errors gracefully', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    (fs.mkdir as any).mockRejectedValue(new Error('Permission denied'));

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'build',
            theme: 'corporate',
            organization: 'Test Corp',
            contactName: 'John Doe',
            email: 'test@example.com',
            specialRequirements: '',
          },
          amount_total: 50000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    expect(response.status).toBe(500);
    
    const responseText = await response.text();
    expect(responseText).toBe('Webhook handler failed');
  });

  it('should handle email sending failures gracefully', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    // Mock email sending failure
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'build',
            theme: 'corporate',
            organization: 'Test Corp',
            contactName: 'John Doe',
            email: 'test@example.com',
            specialRequirements: '',
          },
          amount_total: 50000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    const response = await POST({ request: mockRequest } as any);

    // Should still succeed even if email fails
    expect(response.status).toBe(200);
    
    // Purchase data should still be stored
    expect(fs.writeFile).toHaveBeenCalled();
  });

  it('should store complete purchase data with all metadata', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'ready',
            theme: 'baking',
            organization: 'Bakery Corp',
            contactName: 'Jane Baker',
            email: 'jane@bakery.com',
            specialRequirements: 'Gluten-free options',
          },
          amount_total: 350000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    await POST({ request: mockRequest } as any);

    // Verify all data is included
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/ESC-12345678\.json$/),
      expect.stringMatching(/"purchaseCode":"ESC-12345678"/)
    );

    const writeCall = (fs.writeFile as any).mock.calls[0];
    const savedData = JSON.parse(writeCall[1]);

    expect(savedData).toMatchObject({
      sessionId: 'cs_test_session123',
      purchaseCode: 'ESC-12345678',
      kitType: 'ready',
      theme: 'baking',
      organization: 'Bakery Corp',
      contactName: 'Jane Baker',
      email: 'jane@bakery.com',
      specialRequirements: 'Gluten-free options',
      amountPaid: 350000,
      currency: 'usd',
      paymentStatus: 'paid',
    });

    expect(savedData.createdAt).toBeDefined();
  });

  it('should send confirmation email with correct data', async () => {
    const { POST } = await import('../../pages/api/stripe-webhook');

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session123',
          metadata: {
            purchaseCode: 'ESC-12345678',
            kitType: 'build',
            theme: 'corporate',
            organization: 'Test Corp',
            contactName: 'John Doe',
            email: 'test@example.com',
            specialRequirements: '',
          },
          amount_total: 50000,
          currency: 'usd',
          payment_status: 'paid',
        },
      },
    };

    mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

    const mockRequest = {
      text: () => Promise.resolve(JSON.stringify(mockEvent)),
      headers: new Map([
        ['stripe-signature', 'test_signature'],
      ]),
    };

    await POST({ request: mockRequest } as any);

    expect(global.fetch).toHaveBeenCalledWith('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        purchaseCode: 'ESC-12345678',
        organization: 'Test Corp',
        kitType: 'build',
        theme: 'corporate',
      }),
    });
  });
});
