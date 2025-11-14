import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      retrieve: vi.fn(),
    },
  },
};

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => mockStripe),
}));

describe('session-status API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should retrieve and filter Stripe session data correctly', async () => {
    const { GET } = await import('../../pages/api/session-status');

    const mockStripeSession = {
      id: 'cs_test_session123',
      status: 'complete',
      customer_email: 'test@example.com',
      metadata: {
        purchaseCode: 'ESC-12345678',
        kitType: 'build',
        theme: 'corporate',
      },
      payment_intent: 'pi_secret_dont_expose',
      client_secret: 'cs_secret_dont_expose',
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession);

    const mockURL = new URL('http://localhost:4321/api/session-status?session_id=cs_test_session123');
    const request = { url: mockURL.toString() };

    const response = await GET({ url: mockURL, request } as any);
    expect(response.status).toBe(200);

    const data = await response.json();

    // Should only return safe, non-sensitive data
    expect(data).toEqual({
      status: 'complete',
      metadata: {
        purchaseCode: 'ESC-12345678',
        kitType: 'build',
        theme: 'corporate',
      },
      customer_email: 'test@example.com',
    });

    // Should NOT include sensitive fields
    expect(data.payment_intent).toBeUndefined();
    expect(data.client_secret).toBeUndefined();
  });

  it('should return 400 for missing session_id', async () => {
    const { GET } = await import('../../pages/api/session-status');

    const mockURL = new URL('http://localhost:4321/api/session-status');
    const request = { url: mockURL.toString() };

    const response = await GET({ url: mockURL, request } as any);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Session ID is required');
  });

  it('should handle Stripe retrieval errors', async () => {
    const { GET } = await import('../../pages/api/session-status');

    mockStripe.checkout.sessions.retrieve.mockRejectedValue(
      new Error('No such checkout session: cs_invalid')
    );

    const mockURL = new URL('http://localhost:4321/api/session-status?session_id=cs_invalid');
    const request = { url: mockURL.toString() };

    const response = await GET({ url: mockURL, request } as any);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Failed to retrieve session');
  });

  it('should handle sessions with null metadata', async () => {
    const { GET } = await import('../../pages/api/session-status');

    const mockStripeSession = {
      id: 'cs_test_session123',
      status: 'incomplete',
      customer_email: null,
      metadata: null,
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession);

    const mockURL = new URL('http://localhost:4321/api/session-status?session_id=cs_test_session123');
    const request = { url: mockURL.toString() };

    const response = await GET({ url: mockURL, request } as any);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      status: 'incomplete',
      metadata: null,
      customer_email: null,
    });
  });

  it('should handle sessions with incomplete status', async () => {
    const { GET } = await import('../../pages/api/session-status');

    const mockStripeSession = {
      id: 'cs_test_session123',
      status: 'expired',
      customer_email: 'test@example.com',
      metadata: {
        purchaseCode: 'ESC-12345678',
      },
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockStripeSession);

    const mockURL = new URL('http://localhost:4321/api/session-status?session_id=cs_test_session123');
    const request = { url: mockURL.toString() };

    const response = await GET({ url: mockURL, request } as any);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('expired');
  });
});
