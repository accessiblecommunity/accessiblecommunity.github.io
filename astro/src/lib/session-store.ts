import { v4 as uuidv4 } from 'uuid';

export interface PurchaseSession {
  sessionId: string;
  purchaseCode: string;
  email: string;
  theme?: string;
  kitType?: string;
  organization?: string;
  createdAt: number;
  expiresAt: number;
  browserFingerprint: string;
  ipAddress?: string;
}

const SESSION_DURATION_MS = 30 * 60 * 1000;

const sessions = new Map<string, PurchaseSession>();

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(sessionId);
    }
  }
}

function createFingerprint(headers: Headers) {
  const userAgent = headers.get('user-agent') ?? '';
  const acceptLanguage = headers.get('accept-language') ?? '';
  const acceptEncoding = headers.get('accept-encoding') ?? '';
  return Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');
}

export function createSession(data: {
  purchaseCode: string;
  email: string;
  theme?: string;
  kitType?: string;
  organization?: string;
  headers: Headers;
  ipAddress?: string;
}): PurchaseSession {
  cleanupExpiredSessions();

  const sessionId = uuidv4();
  const createdAt = Date.now();
  const expiresAt = createdAt + SESSION_DURATION_MS;
  const browserFingerprint = createFingerprint(data.headers);

  const session: PurchaseSession = {
    sessionId,
    purchaseCode: data.purchaseCode,
    email: data.email,
    theme: data.theme,
    kitType: data.kitType,
    organization: data.organization,
    createdAt,
    expiresAt,
    browserFingerprint,
    ipAddress: data.ipAddress,
  };

  sessions.set(sessionId, session);
  return session;
}

export async function getSessionFromRequest(request: Request) {
  cleanupExpiredSessions();

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.split('=');
        return [name, rest.join('=')];
      }),
  );

  const sessionId = cookies.session;
  if (!sessionId) return null;

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  const fingerprint = createFingerprint(request.headers);
  if (fingerprint !== session.browserFingerprint) {
    return null;
  }

  return session;
}

export function getSession(sessionId: string) {
  cleanupExpiredSessions();
  return sessions.get(sessionId) ?? null;
}

export function invalidateSession(sessionId: string) {
  sessions.delete(sessionId);
}

export function getCookieHeader(session: PurchaseSession) {
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000);
  return [
    `session=${session.sessionId}`,
    'Path=/',
    `Max-Age=${Math.max(maxAge, 0)}`,
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
  ].join('; ');
}

export function getAllSessions() {
  cleanupExpiredSessions();
  return sessions;
}

export function upsertSession(session: PurchaseSession) {
  sessions.set(session.sessionId, session);
}

export function clearSessions() {
  sessions.clear();
}

// TODO: Persist sessions via Azure Table Storage or Netlify Blobs for multi-instance resilience.
