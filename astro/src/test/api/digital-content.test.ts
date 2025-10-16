import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the session store
const mockSessions = new Map<string, any>();

vi.mock('src/lib/session-store', () => ({
  getSession: (sessionId: string) => mockSessions.get(sessionId),
  invalidateSession: (sessionId: string) => mockSessions.delete(sessionId),
}));

describe('digital-content API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSessions.clear();
    
    // Setup valid session
    const sessionData = {
      purchaseCode: 'ESC-12345678',
      email: 'test@example.com',
      theme: 'corporate',
      kitType: 'build',
      organization: 'Test Corp',
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000),
      browserFingerprint: 'valid-fingerprint',
      ipAddress: '127.0.0.1',
    };
    
    mockSessions.set('valid-session-id', sessionData);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return digital content page for valid session', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=valid-session-id');
    
    const mockRequest = {
      headers: new Map([
        ['cookie', 'session=valid-session-id'],
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

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.get('Cache-Control')).toContain('private, no-cache');
    
    const html = await response.text();
    expect(html).toContain('Test Corp'); // Organization name should be in content
    expect(html).toContain('ESC-12345678'); // Purchase code should be in content
  });

  it('should return 401 for missing session parameter', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content');
    const mockRequest = { headers: new Map() };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Unauthorized');
  });

  it('should return 401 for session cookie mismatch', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=valid-session-id');
    
    const mockRequest = {
      headers: new Map([
        ['cookie', 'session=different-session-id'], // Mismatched cookie
      ]),
    };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Unauthorized - Session mismatch');
  });

  it('should return 401 for invalid session ID', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=invalid-session-id');
    
    const mockRequest = {
      headers: new Map([
        ['cookie', 'session=invalid-session-id'],
      ]),
    };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Session expired');
  });

  it('should return 401 for expired session', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    // Set session as expired
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

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=expired-session-id');
    
    const mockRequest = {
      headers: new Map([
        ['cookie', 'session=expired-session-id'],
      ]),
    };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Session expired');
  });

  it('should return 401 for browser fingerprint mismatch', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=valid-session-id');
    
    const mockRequest = {
      headers: new Map([
        ['cookie', 'session=valid-session-id'],
        ['user-agent', 'Different Browser'],
        ['accept-language', 'fr-FR,fr;q=0.9'],
        ['accept-encoding', 'gzip'],
      ]),
    };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Unauthorized - Browser mismatch');
  });

  it('should handle missing cookie header gracefully', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const mockURL = new URL('http://localhost:4321/api/digital-content?session=valid-session-id');
    
    const mockRequest = {
      headers: new Map([
        // No cookie header
        ['user-agent', 'Mozilla/5.0 Test Browser'],
      ]),
    };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Unauthorized - Session mismatch');
  });

  it('should generate different content for different themes', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const themes = ['corporate', 'baking', 'picnic', 'casino'];
    
    for (const theme of themes) {
      const sessionId = `session-${theme}`;
      const mockFingerprint = Buffer.from('Mozilla/5.0 Test Browser:en-US,en;q=0.9:gzip, deflate, br').toString('base64');
      
      mockSessions.set(sessionId, {
        purchaseCode: 'ESC-12345678',
        email: 'test@example.com',
        theme: theme,
        kitType: 'build',
        organization: 'Test Corp',
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000),
        browserFingerprint: mockFingerprint,
        ipAddress: '127.0.0.1',
      });

      const mockURL = new URL(`http://localhost:4321/api/digital-content?session=${sessionId}`);
      
      const mockRequest = {
        headers: new Map([
          ['cookie', `session=${sessionId}`],
          ['user-agent', 'Mozilla/5.0 Test Browser'],
          ['accept-language', 'en-US,en;q=0.9'],
          ['accept-encoding', 'gzip, deflate, br'],
        ]),
      };

      const response = await GET({ 
        request: mockRequest, 
        url: mockURL,
        clientAddress: '127.0.0.1' 
      } as any);

      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain(theme); // Theme should be reflected in content
    }
  });

  it('should generate different content for different kit types', async () => {
    const { GET } = await import('../../pages/api/digital-content');

    const kitTypes = ['build', 'ready'];
    
    for (const kitType of kitTypes) {
      const sessionId = `session-${kitType}`;
      const mockFingerprint = Buffer.from('Mozilla/5.0 Test Browser:en-US,en;q=0.9:gzip, deflate, br').toString('base64');
      
      mockSessions.set(sessionId, {
        purchaseCode: 'ESC-12345678',
        email: 'test@example.com',
        theme: 'corporate',
        kitType: kitType,
        organization: 'Test Corp',
        createdAt: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000),
        browserFingerprint: mockFingerprint,
        ipAddress: '127.0.0.1',
      });

      const mockURL = new URL(`http://localhost:4321/api/digital-content?session=${sessionId}`);
      
      const mockRequest = {
        headers: new Map([
          ['cookie', `session=${sessionId}`],
          ['user-agent', 'Mozilla/5.0 Test Browser'],
          ['accept-language', 'en-US,en;q=0.9'],
          ['accept-encoding', 'gzip, deflate, br'],
        ]),
      };

      const response = await GET({ 
        request: mockRequest, 
        url: mockURL,
        clientAddress: '127.0.0.1' 
      } as any);

      expect(response.status).toBe(200);
      
      const html = await response.text();
      
      if (kitType === 'build') {
        expect(html).toContain('Build-your-own');
      } else {
        expect(html).toContain('Ready-made');
      }
    }
  });
});
