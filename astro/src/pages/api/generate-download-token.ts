import type { APIRoute } from 'astro';
import { sessions } from './verify-purchase';
import { v4 as uuidv4 } from 'uuid';

// Store for one-time download tokens
const downloadTokens = new Map<string, {
  sessionId: string;
  materialType: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [tokenId, token] of downloadTokens.entries()) {
    if (now > token.expiresAt || token.used) {
      downloadTokens.delete(tokenId);
    }
  }
}, 10 * 60 * 1000);

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    const { sessionId, materialType } = body;

    if (!sessionId || !materialType) {
      return new Response('Missing parameters', { status: 400 });
    }

    // Verify session exists and is valid
    const sessionData = sessions.get(sessionId);
    
    if (!sessionData || Date.now() > sessionData.expiresAt) {
      return new Response('Invalid session', { status: 401 });
    }

    // Verify browser fingerprint
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const currentFingerprint = Buffer.from(`${userAgent}:${acceptLanguage}:${acceptEncoding}`).toString('base64');

    if (currentFingerprint !== sessionData.browserFingerprint) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create one-time download token (expires in 5 minutes)
    const downloadToken = uuidv4();
    downloadTokens.set(downloadToken, {
      sessionId,
      materialType,
      createdAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
      used: false
    });

    return new Response(
      JSON.stringify({ downloadToken }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating download token:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

// Export for use in download endpoint
export { downloadTokens };
