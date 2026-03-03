/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// import type { PurchaseSession } from './lib/session-store';

declare namespace App {
	interface Locals {
		user: import("better-auth").User | null;
		session: import("better-auth").Session | null;
		// session?: PurchaseSession;
	}
}

interface ImportMetaEnv {
	readonly BETTER_AUTH_SECRET: string;
	readonly BETTER_AUTH_URL: string;
  readonly DATABASE_URL: string;

}
