import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    readFile: vi.fn(),
  },
}));

// Mock the session store
const mockSessions = new Map<string, any>();

// Mock the downloadTokens from generate-download-token
const mockDownloadTokens = new Map();

vi.mock('src/lib/session-store', () => ({
  getSession: (sessionId: string) => mockSessions.get(sessionId),
  invalidateSession: (sessionId: string) => mockSessions.delete(sessionId),
}));

vi.mock('./generate-download-token', () => ({
  downloadTokens: mockDownloadTokens,
}));

describe('download-material API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSessions.clear();
    mockDownloadTokens.clear();
    
    // Setup valid session and token
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
    
    const tokenData = {
      sessionId: 'valid-session-id',
      materialType: 'setup-guide',
      createdAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000),
      used: false,
    };
    
    mockSessions.set('valid-session-id', sessionData);
    mockDownloadTokens.set('valid-token', tokenData);
    
    // Mock file system
    (fs.access as any).mockResolvedValue(undefined);
    (fs.readFile as any).mockResolvedValue(Buffer.from('PDF content'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should download material with valid token', async () => {
    const { GET } = await import('../../pages/api/download-material');

    const mockURL = new URL('http://localhost:4321/api/download-material?token=valid-token');
    
    const mockRequest = {
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

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    
    // Token should be marked as used
    expect(mockDownloadTokens.get('valid-token').used).toBe(true);
  });

  it('should return 401 for missing download token', async () => {
    const { GET } = await import('../../pages/api/download-material');

    const mockURL = new URL('http://localhost:4321/api/download-material');
    const mockRequest = { headers: new Map() };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Missing download token');
  });

  it('should return 401 for invalid download token', async () => {
    const { GET } = await import('../../pages/api/download-material');

    const mockURL = new URL('http://localhost:4321/api/download-material?token=invalid-token');
    const mockRequest = { headers: new Map() };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Invalid or expired download token');
  });

  it('should return 401 for expired download token', async () => {
    const { GET } = await import('../../pages/api/download-material');

    // Create expired token
    const expiredTokenData = {
      sessionId: 'valid-session-id',
      materialType: 'setup-guide',
      createdAt: Date.now() - (10 * 60 * 1000),
      expiresAt: Date.now() - (5 * 60 * 1000), // Expired 5 minutes ago
      used: false,
    };
    
    mockDownloadTokens.set('expired-token', expiredTokenData);

    const mockURL = new URL('http://localhost:4321/api/download-material?token=expired-token');
    const mockRequest = { headers: new Map() };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Invalid or expired download token');
  });

  it('should return 401 for already used token', async () => {
    const { GET } = await import('../../pages/api/download-material');

    // Mark token as used
    mockDownloadTokens.get('valid-token').used = true;

    const mockURL = new URL('http://localhost:4321/api/download-material?token=valid-token');
    const mockRequest = { headers: new Map() };

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(401);
    
    const responseText = await response.text();
    expect(responseText).toBe('Invalid or expired download token');
  });

  it('should return 401 for expired session', async () => {
    const { GET } = await import('../../pages/api/download-material');

    // Set session as expired
    mockSessions.set('valid-session-id', {
      ...mockSessions.get('valid-session-id'),
      expiresAt: Date.now() - (5 * 60 * 1000), // Expired 5 minutes ago
    });

    const mockURL = new URL('http://localhost:4321/api/download-material?token=valid-token');
    const mockRequest = { headers: new Map() };

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
    const { GET } = await import('../../pages/api/download-material');

    const mockURL = new URL('http://localhost:4321/api/download-material?token=valid-token');
    
    const mockRequest = {
      headers: new Map([
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

  it('should return 404 for invalid material type', async () => {
    const { GET } = await import('../../pages/api/download-material');

    // Create token with invalid material type
    const invalidTokenData = {
      sessionId: 'valid-session-id',
      materialType: 'invalid-material',
      createdAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000),
      used: false,
    };
    
    mockDownloadTokens.set('invalid-material-token', invalidTokenData);

    const mockURL = new URL('http://localhost:4321/api/download-material?token=invalid-material-token');
    
    const mockRequest = {
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

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(404);
    
    const responseText = await response.text();
    expect(responseText).toBe('Not Found');
  });

  it('should return 404 for missing file', async () => {
    const { GET } = await import('../../pages/api/download-material');

    (fs.access as any).mockRejectedValue(new Error('ENOENT: no such file or directory'));

    const mockURL = new URL('http://localhost:4321/api/download-material?token=valid-token');
    
    const mockRequest = {
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

    const response = await GET({ 
      request: mockRequest, 
      url: mockURL,
      clientAddress: '127.0.0.1' 
    } as any);

    expect(response.status).toBe(404);
    
    const responseText = await response.text();
    expect(responseText).toBe('File not found');
  });

  it('should set correct headers for different material types', async () => {
    const { GET } = await import('../../pages/api/download-material');

    const materialTypes = [
      { type: 'setup-guide', expectedFilename: 'setup-guide-corporate.pdf' },
      { type: 'accessibility-guide', expectedFilename: 'accessibility-guide-corporate.pdf' },
      { type: 'prop-templates', expectedFilename: 'prop-templates-corporate.pdf' },
      { type: 'assembly-instructions', expectedFilename: 'assembly-instructions-corporate.pdf' },
      { type: 'shopping-list', expectedFilename: 'shopping-list-corporate.pdf' },
    ];

    for (const material of materialTypes) {
      const tokenData = {
        sessionId: 'valid-session-id',
        materialType: material.type,
        createdAt: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000),
        used: false,
      };
      
      mockDownloadTokens.set(`token-${material.type}`, tokenData);

      const mockURL = new URL(`http://localhost:4321/api/download-material?token=token-${material.type}`);
      
      const mockRequest = {
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

      const response = await GET({ 
        request: mockRequest, 
        url: mockURL,
        clientAddress: '127.0.0.1' 
      } as any);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Disposition')).toContain(material.expectedFilename);
    }
  });
});
