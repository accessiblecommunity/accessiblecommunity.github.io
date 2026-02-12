import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock UUID
vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('test-token-id-1234'),
}));

// Mock the session store module
const mockSessions = new Map<string, any>();

vi.mock('src/lib/session-store', () => ({
  getSession: (sessionId: string) => mockSessions.get(sessionId),
  upsertSession: (session: any) => mockSessions.set(session.sessionId, session),
  clearSessions: () => mockSessions.clear(),
}));

describe('generate-download-token API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSessions.clear();
    
    // Setup a valid session
    mockSessions.set('valid-session-id', {
      purchaseCode: 'ESC-12345678',
      email: 'test@example.com',
      theme: 'corporate',
      kitType: 'build',
      organization: 'Test Corp',
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // 30 minutes from now
      browserFingerprint: 'valid-fingerprint',
      ipAddress: '127.0.0.1',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should generate a download token for valid session and material type', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'valid-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map([
        ['user-agent', 'Mozilla/5.0 Test Browser'],
        ['accept-language', 'en-US,en;q=0.9'],
        ['accept-encoding', 'gzip, deflate, br'],
      ]),
    };

    const mockFingerprint = Buffer.from('Mozilla/5.0 Test Browser:en-US,en;q=0.9:gzip, deflate, br').toString('base64');
    mockSessions.set('valid-session-id', {
      ...mockSessions.get('valid-session-id'),
      browserFingerprint: mockFingerprint,
    });

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.downloadToken).toBe('test-token-id-1234');
    expect(data.expiresAt).toBeDefined();
  });

  it('should return 400 for missing parameters', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const testCases = [
      { sessionId: null, materialType: 'setup-guide' },
      { sessionId: 'valid-session-id', materialType: null },
      { sessionId: null, materialType: null },
    ];

    for (const testCase of testCases) {
      const mockRequest = {
        json: () => Promise.resolve(testCase),
        headers: new Map(),
      };

      const response = await POST({ 
        request: mockRequest, 
        clientAddress: '127.0.0.1' 
      } as any);

      expect(response.status).toBe(400);
      
      const responseText = await response.text();
      expect(responseText).toBe('Missing parameters');
    }
  });

  it('should return 401 for invalid session ID', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'invalid-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map(),
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Invalid session');
  });

  it('should return 401 for expired session', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    // Set expired session
    mockSessions.set('expired-session-id', {
      purchaseCode: 'ESC-12345678',
      email: 'test@example.com',
      theme: 'corporate',
      kitType: 'build',
      organization: 'Test Corp',
      createdAt: Date.now() - (60 * 60 * 1000), // 1 hour ago
      expiresAt: Date.now() - (30 * 60 * 1000), // Expired 30 minutes ago
      browserFingerprint: 'valid-fingerprint',
      ipAddress: '127.0.0.1',
    });

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'expired-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map(),
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Invalid session');
  });

  it('should return 401 for browser fingerprint mismatch', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'valid-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map([
        ['user-agent', 'Different Browser'],
        ['accept-language', 'fr-FR,fr;q=0.9'],
        ['accept-encoding', 'gzip'],
      ]),
    };

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Unauthorized');
  });

  it('should create token with correct expiration time', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const currentTime = Date.now();
    vi.setSystemTime(currentTime);

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'valid-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map([
        ['user-agent', 'Mozilla/5.0 Test Browser'],
        ['accept-language', 'en-US,en;q=0.9'],
        ['accept-encoding', 'gzip, deflate, br'],
      ]),
    };

    const mockFingerprint = Buffer.from('Mozilla/5.0 Test Browser:en-US,en;q=0.9:gzip, deflate, br').toString('base64');
    mockSessions.set('valid-session-id', {
      ...mockSessions.get('valid-session-id'),
      browserFingerprint: mockFingerprint,
    });

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(200);
    
    // Token should expire in 5 minutes (300,000 ms)
    const expectedExpiration = currentTime + (5 * 60 * 1000);
    expect(data.expiresAt).toBe(expectedExpiration);
  });

  it('should handle missing headers gracefully', async () => {
    const { POST } = await import('../../pages/api/generate-download-token');

    const mockRequest = {
      json: () => Promise.resolve({
        sessionId: 'valid-session-id',
        materialType: 'setup-guide',
      }),
      headers: new Map(), // No headers provided
    };

    // Set session with empty fingerprint to match
    const emptyFingerprint = Buffer.from('::').toString('base64');
    mockSessions.set('valid-session-id', {
      ...mockSessions.get('valid-session-id'),
      browserFingerprint: emptyFingerprint,
    });

    const response = await POST({ 
      request: mockRequest, 
      clientAddress: '127.0.0.1' 
    } as any);
    
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
