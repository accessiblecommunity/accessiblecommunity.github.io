import type { MiddlewareHandler } from 'astro';

import { auth } from "@lib/auth";
import { defineMiddleware } from "astro:middleware";

// Is this still needed ?
const RESTRICTED_PATHS = [
  '/materials/premium/',
  '/protected-materials/',
  '/escape-room/content',
]

const PROTECTED_PATHS = [
  '/escape-room/content',
  '/escape-room/kits',
]


export const onRequest: MiddlewareHandler = defineMiddleware(
  async (context, next) => {
    const { url, request, locals } = context;

    // Block direct access to protected materials
    if (RESTRICTED_PATHS.find(path => url.pathname.startsWith(path))) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });
    }

    if (PROTECTED_PATHS.find(path => url.pathname.startsWith(path))) {
      const isAuthed = await auth.api.getSession({
        headers: request.headers,
      })

      if (isAuthed) {
        locals.user = isAuthed.user;
        locals.session = isAuthed.session;
      } else {
        context.

        locals.user = null;
        locals.session = null;
      }
    }

    return next();
  }
);
