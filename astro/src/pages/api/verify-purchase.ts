import type { APIRoute } from 'astro';
import { createSession, getCookieHeader, getAllSessions } from 'src/lib/session-store';
import type { PurchaseSession } from 'src/lib/session-store';
import { getPurchaseData } from '@lib/purchase-storage';

const GENERIC_ERROR_MESSAGE = 'Invalid purchase code or email address';

function jsonResponse(data: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...(headers ?? {})
    }
  });
}


function normalisePurchaseCode(input: string) {
  return input.trim().toUpperCase();
}

function normaliseEmail(input: string) {
  return input.trim().toLowerCase();
}

async function readBody(request: Request): Promise<{ purchaseCode?: string; email?: string }> {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType || contentType.includes('application/json')) {
    try {
      const json = await request.json();
      if (json && typeof json === 'object') {
        return json as any;
      }
    } catch (error) {
      console.error('[verify-purchase] Failed to parse JSON body', error);
      throw new Error('BODY_PARSE_ERROR');
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded') && typeof request.formData === 'function') {
    try {
      const form = await request.formData();
      return {
        purchaseCode: form.get('purchaseCode')?.toString(),
        email: form.get('email')?.toString()
      };
    } catch (error) {
      console.error('[verify-purchase] Failed to parse form body', error);
      throw new Error('BODY_PARSE_ERROR');
    }
  }

  return {};
}

async function verifyAndCreateSession(options: {
  purchaseCode?: string | null;
  email?: string | null;
  request: Request;
  clientAddress?: string;
  method: string;
}) {
  const { purchaseCode, email, request, clientAddress, method } = options;

  if (!purchaseCode || !email) {
    return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 400);
  }

  const normalisedCode = normalisePurchaseCode(purchaseCode);
  const normalisedEmail = normaliseEmail(email);

  if (!/^ESC-[A-Z0-9]{8}$/.test(normalisedCode) || !/.+@.+\..+/.test(normalisedEmail)) {
    return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 400);
  }

  try {
    const purchase = await getPurchaseData(normalisedCode);

    if (!purchase) {
      return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 404);
    }

    if (!purchase.email || normaliseEmail(purchase.email) !== normalisedEmail) {
      return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 403);
    }

    const session: PurchaseSession = createSession({
      purchaseCode: purchase.purchaseCode ?? normalisedCode,
      email: purchase.email,
      theme: purchase.theme,
      kitType: purchase.kitType,
      organization: purchase.organization,
      headers: request.headers,
      ipAddress: clientAddress,
    });

    const response = jsonResponse(
      {
        valid: true,
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
        purchaseCode: session.purchaseCode,
        email: purchase.email,
        kitType: purchase.kitType,
        theme: purchase.theme,
        organization: purchase.organization
      },
      200,
      { 'Set-Cookie': getCookieHeader(session) }
    );

    console.log(`[verify-purchase] ${method} success`, {
      purchaseCode: session.purchaseCode,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      // note: sessions will persist in-memory until replaced w/ Azure/Netlify store
    });

    return response;
  } catch (error) {
    console.error('[verify-purchase] Verification error', error);
    return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 500);
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await readBody(request);
    return await verifyAndCreateSession({
      purchaseCode: body.purchaseCode,
      email: body.email,
      request,
      clientAddress,
      method: 'POST'
    });
  } catch (error: any) {
    if (error?.message === 'BODY_PARSE_ERROR') {
      return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 500);
    }

    console.error('[verify-purchase] Unexpected POST error', error);
    return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 500);
  }
};

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  try {
    const purchaseCode = url.searchParams.get('purchaseCode');
    const email = url.searchParams.get('email');

    if (!purchaseCode && !email) {
      return jsonResponse({ status: 'ok', route: '/api/verify-purchase', ts: Date.now() });
    }

    return await verifyAndCreateSession({
      purchaseCode,
      email,
      request,
      clientAddress,
      method: 'GET'
    });
  } catch (error) {
    console.error('[verify-purchase] Unexpected GET error', error);
    return jsonResponse({ error: GENERIC_ERROR_MESSAGE }, 500);
  }
};

export { getAllSessions as sessions }; // TODO: Remove once downstream modules migrate to session-store directly.

