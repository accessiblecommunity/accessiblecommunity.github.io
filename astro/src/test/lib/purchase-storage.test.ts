import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import { storePurchaseData, getPurchaseData } from '@lib/purchase-storage';
import type { PurchaseData } from '@lib/purchase-storage';

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe('purchase-storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful file operations
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.writeFile as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('storePurchaseData', () => {
    it('should store purchase data to JSON file', async () => {
      const purchaseData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-12345678',
        theme: 'corporate',
        organization: 'Test Corp',
        contactName: 'John Doe',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      };

      await storePurchaseData(purchaseData);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringMatching(/local-dev[\/\\]purchases$/),
        { recursive: true }
      );

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/ESC-12345678\.json$/),
        expect.stringContaining('"purchaseCode":"ESC-12345678"')
      );
    });

    it('should store complete purchase data with all fields', async () => {
      const purchaseData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-87654321',
        kitType: 'build',
        theme: 'kitchen',
        organization: 'Bakery Inc',
        contactName: 'Jane Baker',
        email: 'jane@bakery.com',
        specialRequirements: 'Gluten-free options',
        amountPaid: 50000,
        currency: 'usd',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
      };

      await storePurchaseData(purchaseData);

      const writeCall = (fs.writeFile as any).mock.calls[0];
      const savedData = JSON.parse(writeCall[1]);

      expect(savedData).toMatchObject({
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-87654321',
        kitType: 'build',
        theme: 'kitchen',
        organization: 'Bakery Inc',
        contactName: 'Jane Baker',
        email: 'jane@bakery.com',
        specialRequirements: 'Gluten-free options',
        amountPaid: 50000,
        currency: 'usd',
        paymentStatus: 'paid',
      });
    });

    it('should handle file system errors', async () => {
      (fs.mkdir as any).mockRejectedValue(new Error('Permission denied'));

      const purchaseData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-12345678',
        theme: 'corporate',
        organization: 'Test Corp',
        contactName: 'John Doe',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      };

      await expect(storePurchaseData(purchaseData)).rejects.toThrow('Permission denied');
    });

    it('should create directory if it does not exist', async () => {
      const purchaseData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-12345678',
        theme: 'corporate',
        organization: 'Test Corp',
        contactName: 'John Doe',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
      };

      await storePurchaseData(purchaseData);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });
  });

  describe('getPurchaseData', () => {
    it('should retrieve purchase data by code', async () => {
      const mockData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-12345678',
        theme: 'corporate',
        organization: 'Test Corp',
        contactName: 'John Doe',
        email: 'test@example.com',
        createdAt: '2025-11-20T00:00:00.000Z',
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockData));

      const result = await getPurchaseData('ESC-12345678');

      expect(result).toEqual(mockData);
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringMatching(/ESC-12345678\.json$/),
        'utf-8'
      );
    });

    it('should return null for non-existent purchase code', async () => {
      const error: NodeJS.ErrnoException = new Error('File not found');
      error.code = 'ENOENT';
      (fs.readFile as any).mockRejectedValue(error);

      const result = await getPurchaseData('ESC-NOTFOUND');

      expect(result).toBeNull();
    });

    it('should throw error for other file system errors', async () => {
      (fs.readFile as any).mockRejectedValue(new Error('Permission denied'));

      await expect(getPurchaseData('ESC-12345678')).rejects.toThrow('Permission denied');
    });

    it('should parse JSON data correctly', async () => {
      const mockData: PurchaseData = {
        sessionId: 'cs_test_session123',
        purchaseCode: 'ESC-99999999',
        kitType: 'build',
        theme: 'kitchen',
        organization: 'Test Org',
        contactName: 'Test User',
        email: 'test@test.com',
        specialRequirements: 'Test requirements',
        amountPaid: 50000,
        currency: 'usd',
        paymentStatus: 'paid',
        createdAt: '2025-11-20T00:00:00.000Z',
      };

      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockData, null, 2));

      const result = await getPurchaseData('ESC-99999999');

      expect(result).toEqual(mockData);
    });
  });
});
