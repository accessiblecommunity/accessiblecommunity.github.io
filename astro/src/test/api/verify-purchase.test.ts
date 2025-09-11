import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

// Mock UUID
const mockUuid = vi.fn().mockReturnValue('test-session-id-1234');

vi.mock('uuid', () => ({
  v4: mockUuid,
}));

describe('verify-purchase API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset UUID mock
    mockUuid.mockReturnValue('test-session-id-1234');
    
    // Mock successful file read
    const mockPurchaseData = {
      purchaseCode: 'ESC-12345678',
      email: 'test@example.com',
      theme: 'corporate',
      kitType: 'build',
      organization: 'Test Corp',
      createdAt: Date.now(),
    };
    
    (fs.readFile as any).mockResolvedValue(JSON.stringify(mockPurchaseData));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should verify a valid purchase successfully', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-12345678',
        email: 'test@example.com',
      }),
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            'user-agent': 'Mozilla/5.0 Test Browser',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
          };
          return headers[key] || '';
        },
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
    expect(data.sessionId).toBe('test-session-id-1234');
    expect(data.kitType).toBe('build');
    expect(data.theme).toBe('corporate');
    expect(data.organization).toBe('Test Corp');
  });

  it('should return 400 for missing purchase code', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.resolve({
        email: 'test@example.com',
      }),
      headers: {
        get: () => '',
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid purchase code or email address');
  });

  it('should return 400 for missing email', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-12345678',
      }),
      headers: {
        get: () => '',
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid purchase code or email address');
  });

  it('should return 404 for non-existent purchase code', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    // Mock file read error (file not found)
    (fs.readFile as any).mockRejectedValue(new Error('ENOENT: no such file or directory'));

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-INVALID',
        email: 'test@example.com',
      }),
      headers: {
        get: () => '',
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Invalid purchase code or email address');
  });

  it('should return 403 for email mismatch', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-12345678',
        email: 'wrong@example.com',
      }),
      headers: {
        get: () => '',
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Invalid purchase code or email address');
  });

  it('should handle case-insensitive email comparison', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-12345678',
        email: 'TEST@EXAMPLE.COM', // Uppercase email
      }),
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            'user-agent': 'Mozilla/5.0 Test Browser',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
          };
          return headers[key] || '';
        },
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.valid).toBe(true);
  });

  it('should create a secure session with proper expiration', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const currentTime = Date.now();
    vi.setSystemTime(currentTime);

    const mockRequest = {
      json: () => Promise.resolve({
        purchaseCode: 'ESC-12345678',
        email: 'test@example.com',
      }),
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            'user-agent': 'Mozilla/5.0 Test Browser',
            'accept-language': 'en-US,en;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
          };
          return headers[key] || '';
        },
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(200);
    
    // Check that session cookie is set
    const cookies = response.headers.get('Set-Cookie');
    expect(cookies).toContain('session=test-session-id-1234');
    expect(cookies).toContain('HttpOnly');
    expect(cookies).toContain('Secure');
    expect(cookies).toContain('SameSite=Strict');
  });

  it('should handle JSON parsing errors gracefully', async () => {
    const { POST } = await import('../../pages/api/verify-purchase');

    const mockRequest = {
      json: () => Promise.reject(new Error('Invalid JSON')),
      headers: {
        get: () => '',
      },
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Invalid purchase code or email address');
  });
});
