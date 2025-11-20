import fs from 'fs/promises';
import path from 'path';

export interface PurchaseData {
  sessionId: string;
  purchaseCode: string;
  kitType?: string;
  theme: string;
  organization: string;
  contactName: string;
  email: string;
  specialRequirements?: string;
  amountPaid?: number | null;
  currency?: string | null;
  paymentStatus?: string | null;
  createdAt: string;
}

export async function storePurchaseData(purchaseData: PurchaseData): Promise<void> {
  try {
    // TODO: For user accounts/login system, also store purchase by email:
    // - Link purchase codes to customer email addresses
    // - Store in database: { email, purchaseCode, productId, purchaseDate }
    // - Enable "view all my purchases" functionality
    
    // TODO?: For Google OAuth integration:
    // - Add optional account linking after purchase
    // - Store OAuth user ID with purchase data
    // - Allow login to see purchase history
    
    // Create local storage directory if it doesn't exist
    const storageDir = path.join(process.cwd(), '..', 'local-dev', 'purchases');
    await fs.mkdir(storageDir, { recursive: true });

    // Store purchase data as JSON file
    const filename = `${purchaseData.purchaseCode}.json`;
    const filepath = path.join(storageDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(purchaseData, null, 2));
    // Purchase data stored successfully
  } catch (error) {
    console.error('Error storing purchase data:', error);
    throw error;
  }
}

function getCandidatePurchaseDirs(): string[] {
  const env = import.meta.env as Record<string, string | undefined>;
  const candidates = [
    env.PURCHASES_DATA_DIR,
    process.env.PURCHASES_DATA_DIR,
    path.resolve(process.cwd(), '..', 'local-dev', 'purchases'),
    path.resolve(process.cwd(), 'local-dev', 'purchases')
  ];
  return [...new Set(candidates.filter(Boolean) as string[])];
}

export async function getPurchaseData(purchaseCode: string): Promise<PurchaseData | null> {
  const candidates = getCandidatePurchaseDirs();
  const filename = `${purchaseCode}.json`;

  for (const dir of candidates) {
    const filepath = path.join(dir, filename);
    try {
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        continue;
      }
      console.error('Error reading purchase data:', { filepath, error });
      throw error;
    }
  }

  return null;
}
