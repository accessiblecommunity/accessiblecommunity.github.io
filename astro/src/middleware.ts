import type { MiddlewareHandler } from 'astro';

import { auth } from "@lib/auth";
import { defineMiddleware } from "astro:middleware";


export const onRequest: MiddlewareHandler = defineMiddleware(
  async ({ url, request, locals }, next) => {

    // Is this still needed ?
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

    const isAuthed = await auth.api.getSession({
      headers: request.headers,
    })

    if (isAuthed) {
      locals.user = isAuthed.user;
      locals.session = isAuthed.session;
    } else {
      locals.user = null;
      locals.session = null;
    }

    return next();
  }
);
