/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { PurchaseSession } from './lib/session-store';

declare namespace App {
	interface Locals {
		session?: PurchaseSession;
	}
}

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
}
