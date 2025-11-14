import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onRequest } from '../../middleware';
import { upsertSession, clearSessions, type PurchaseSession } from '../../lib/session-store';

const TEST_HEADERS = {
  'user-agent': 'Mozilla/5.0 Test Browser',
  'accept-language': 'en-US,en;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
};

function createRequest(path: string, options: { cookie?: string; headers?: Record<string, string> } = {}) {
  const headers = new Headers();
  const merged = { ...TEST_HEADERS, ...(options.headers ?? {}) };
  for (const [key, value] of Object.entries(merged)) {
    headers.set(key, value);
  }
  if (options.cookie) {
    headers.set('cookie', options.cookie);
  }
  return new Request(`http://localhost:4321${path}`, { headers });
}

describe('middleware access control', () => {
  beforeEach(() => {
    clearSessions();
  });

  afterEach(() => {
    clearSessions();
    vi.unstubAllGlobals();
  });

  it('returns 404 for protected route without session', async () => {
    const request = createRequest('/services/escape-room/content/corporate');
    const context: any = {
      url: new URL(request.url),
      request,
      locals: {},
    };

  const next = vi.fn().mockResolvedValue(new Response('next'));

  const response = await onRequest(context, next);

  expect(next).not.toHaveBeenCalled();
  expect(response).toBeInstanceOf(Response);
  expect((response as Response).status).toBe(404);
  });

  it('allows protected route with valid session', async () => {
    const session: PurchaseSession = {
      sessionId: 'valid-session',
      purchaseCode: 'ESC-12345678',
      email: 'test@example.com',
      theme: 'corporate',
      kitType: 'build',
      organization: 'Test Corp',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1_800_000,
      browserFingerprint: Buffer.from(
        `${TEST_HEADERS['user-agent']}:${TEST_HEADERS['accept-language']}:${TEST_HEADERS['accept-encoding']}`
      ).toString('base64'),
      ipAddress: '127.0.0.1',
    };

    upsertSession(session);

    const request = createRequest('/services/escape-room/content/corporate', {
      cookie: `session=${session.sessionId}`,
    });

    const context: any = {
      url: new URL(request.url),
      request,
      locals: {},
    };

    const next = vi.fn().mockResolvedValue(new Response('ok'));

  const response = await onRequest(context, next);

  expect(next).toHaveBeenCalledOnce();
  expect(response).toBeInstanceOf(Response);
  expect((response as Response).status).toBe(200);
  expect(await (response as Response).text()).toBe('ok');
    expect(context.locals.session?.sessionId).toBe(session.sessionId);
  });
});
