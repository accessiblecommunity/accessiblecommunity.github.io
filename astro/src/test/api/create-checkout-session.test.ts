import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
};

vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => mockStripe),
  };
});

// Mock UUID
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789012'),
}));

describe('create-checkout-session API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset Stripe mock with fresh implementation
    mockStripe.checkout.sessions.create.mockReset();
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_session123',
      client_secret: 'cs_test_secret456',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a checkout session successfully with valid data', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    const mockRequest = {
      json: () => Promise.resolve({
        kitType: 'build',
        theme: 'corporate',
        organization: 'Test Org',
        contactName: 'John Doe',
        email: 'test@example.com',
      }),
      url: 'http://localhost:4321/api/create-checkout-session'
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchaseCode).toMatch(/^ESC-[0-9A-F]{8}$/);
    expect(data.clientSecret).toBe('cs_test_secret456');
  });

  it('should return 400 for missing required fields', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    const mockRequest = {
      json: () => Promise.resolve({
        kitType: 'build',
        // Missing other required fields
      }),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('should correctly calculate prices for different kit types', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    // Test build kit
    const buildKitData = {
      kitType: 'build',
      theme: 'corporate',
      organization: 'Test Org',
      contactName: 'John Doe',
      email: 'test@example.com',
    };

    const mockRequest1 = new Request('http://localhost:4321/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildKitData)
    });

    const response1 = await POST({ request: mockRequest1 } as any);
    console.log('Build kit response status:', response1.status);
    
    if (response1.status !== 200) {
      const errorData = await response1.json();
      console.log('Build kit error:', errorData);
    }

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 50000,
            }),
          }),
        ]),
      })
    );
  });

  it('should map theme names correctly', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    const themes = [
      { input: 'corporate', expected: 'Corporate Conundrum' },
      { input: 'baking', expected: 'Baking Bonanza' },
      { input: 'picnic', expected: 'Puzzling Picnic' },
      { input: 'casino', expected: 'Cryptic Casino' },
    ];

    for (const theme of themes) {
      const requestData = {
        kitType: 'build',
        theme: theme.input,
        organization: 'Test Org',
        contactName: 'John Doe',
        email: 'test@example.com',
      };

      const mockRequest = new Request('http://localhost:4321/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      await POST({ request: mockRequest } as any);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: expect.objectContaining({
                  name: expect.stringContaining(theme.expected),
                }),
              }),
            }),
          ]),
        })
      );

      // Clear for next iteration
      mockStripe.checkout.sessions.create.mockClear();
    }
  });

  it('should include all metadata in the session', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    const requestData = {
      kitType: 'build',
      theme: 'corporate',
      organization: 'Acme Corp',
      contactName: 'Jane Smith',
      email: 'jane@acme.com',
      specialRequirements: 'Need wheelchair access',
    };

    const mockRequest = new Request('http://localhost:4321/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const response = await POST({ request: mockRequest } as any);
    const responseData = await response.json();

    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'jane@acme.com',
        metadata: expect.objectContaining({
          purchaseCode: responseData.purchaseCode,
          kitType: 'build',
          theme: 'corporate',
          organization: 'Acme Corp',
          contactName: 'Jane Smith',
          email: 'jane@acme.com',
          specialRequirements: 'Need wheelchair access',
        }),
      })
    );
  });

  it('should handle Stripe API errors gracefully', async () => {
    const { POST } = await import('../../pages/api/create-checkout-session');

    mockStripe.checkout.sessions.create.mockRejectedValue(
      new Error('Stripe API Error')
    );

    const requestData = {
      kitType: 'build',
      theme: 'corporate',
      organization: 'Test Org',
      contactName: 'John Doe',
      email: 'test@example.com',
    };

    const mockRequest = new Request('http://localhost:4321/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create checkout session');
  });
});
