// Test setup file
import { vi } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    STRIPE_SECRET_KEY: 'sk_test_fake_stripe_key',
    STRIPE_WEBHOOK_SECRET: 'whsec_fake_webhook_secret',
  },
  writable: true,
});

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
