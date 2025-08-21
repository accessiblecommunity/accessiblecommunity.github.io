import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = ({ url }, next) => {
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

  // Continue to the next middleware or route
  return next();
};
