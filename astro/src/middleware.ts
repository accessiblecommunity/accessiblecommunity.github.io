import type { MiddlewareHandler } from 'astro';
import { getSessionFromRequest } from './lib/session-store';

const PROTECTED_ESCAPE_ROOM_PREFIX = '/services/escape-room/content/';

export const onRequest: MiddlewareHandler = async ({ url, request, locals }, next) => {
  // Block direct access to protected materials
  if (url.pathname.startsWith('/materials/premium/') || 
      url.pathname.startsWith('/protected-materials/')) {
    return new Response('Unauthorized', { 
      status: 401,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  if (url.pathname.startsWith(PROTECTED_ESCAPE_ROOM_PREFIX)) {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return new Response(null, { status: 404 });
    }

    locals.session = session;
  }

  // Continue to the next middleware or route
  return next();
};
