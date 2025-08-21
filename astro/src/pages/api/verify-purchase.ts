import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, {
  purchaseCode: string;
  email: string;
  theme: string;
  kitType: string;
  organization: string;
  createdAt: number;
  expiresAt: number;
  browserFingerprint: string; // Add browser fingerprint
  ipAddress: string; // Add IP address
}>();

// Clean up expired sessions every hour
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    const { purchaseCode, email } = body;

    if (!purchaseCode || !email) {
      return new Response(
        JSON.stringify({ error: 'Invalid purchase code or email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Look up purchase data
    const purchaseData = await getPurchaseData(purchaseCode);

    if (!purchaseData) {
      return new Response(
        JSON.stringify({ error: 'Invalid purchase code or email address' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify email matches
    if (purchaseData.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Invalid purchase code or email address' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create browser fingerprint from headers
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const browserFingerprint = Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');

    // Create secure session
    const sessionId = uuidv4();
    const sessionData = {
      purchaseCode,
      email: purchaseData.email,
      theme: purchaseData.theme,
      kitType: purchaseData.kitType,
      organization: purchaseData.organization,
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000), // Reduced to 30 minutes
      browserFingerprint,
      ipAddress: clientAddress || 'unknown'
    };

    sessions.set(sessionId, sessionData);

    // Return session ID and purchase details with security token
    const response = new Response(
      JSON.stringify({
        valid: true,
        sessionId,
        kitType: purchaseData.kitType,
        theme: purchaseData.theme,
        organization: purchaseData.organization,
        purchaseDate: purchaseData.createdAt,
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          // Set HttpOnly cookie for additional security
          'Set-Cookie': `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=1800; Path=/api/`
        } 
      }
    );

    return response;

  } catch (error) {
    console.error('Error verifying purchase:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid purchase code or email address' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function getPurchaseData(purchaseCode: string) {
  try {
    const storageDir = path.join(process.cwd(), 'local-dev', 'purchases');
    const filename = `${purchaseCode}.json`;
    const filepath = path.join(storageDir, filename);
    
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or other error
    return null;
  }
}

// Export sessions for use in other APIs
export { sessions };
