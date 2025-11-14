import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the stripe-webhook module
const mockHandleSuccessfulPayment = vi.fn();

vi.mock('../../pages/api/stripe-webhook', () => ({
  handleSuccessfulPayment: mockHandleSuccessfulPayment,
}));

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

describe('save-purchase-data API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock for each test
    mockHandleSuccessfulPayment.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should save purchase data for a valid paid session', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    const mockSession = {
      id: 'cs_test_session123',
      payment_status: 'paid',
      metadata: {
        purchaseCode: 'ESC-12345678',
      },
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'cs_test_session123',
      }),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockHandleSuccessfulPayment).toHaveBeenCalledWith(mockSession);
  });

  it('should return 400 for missing session ID', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    const mockRequest = {
      json: () => Promise.resolve({}),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Session ID required');
  });

  it('should return 400 for unpaid session', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    const mockSession = {
      id: 'cs_test_session123',
      payment_status: 'unpaid',
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'cs_test_session123',
      }),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Payment not completed');
  });

  it('should handle Stripe API errors', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    mockStripe.checkout.sessions.retrieve.mockRejectedValue(
      new Error('No such checkout session')
    );

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'cs_invalid',
      }),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process purchase');
  });

  it('should handle webhook handler errors', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    const mockSession = {
      id: 'cs_test_session123',
      payment_status: 'paid',
    };

    mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);
    mockHandleSuccessfulPayment.mockRejectedValue(new Error('Failed to save data'));

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'cs_test_session123',
      }),
    };

    const response = await POST({ request: mockRequest } as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process purchase');
  });

  it('should validate payment status correctly', async () => {
    const { POST } = await import('../../pages/api/save-purchase-data');

    const testCases = [
      { payment_status: 'paid', expectedStatus: 200 },
      { payment_status: 'unpaid', expectedStatus: 400 },
      { payment_status: 'no_payment_required', expectedStatus: 400 },
    ];

    for (const testCase of testCases) {
      const mockSession = {
        id: 'cs_test_session123',
        payment_status: testCase.payment_status,
      };

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);
      
      // Reset the mock for successful cases
      if (testCase.payment_status === 'paid') {
        mockHandleSuccessfulPayment.mockResolvedValue(undefined);
      }

      const mockRequest = {
        json: () => Promise.resolve({
          sessionId: 'cs_test_session123',
        }),
      };

      const response = await POST({ request: mockRequest } as any);

      expect(response.status).toBe(testCase.expectedStatus);
    }
  });
});
