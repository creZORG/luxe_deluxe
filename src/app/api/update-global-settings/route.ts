
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { GlobalSettings } from '@/lib/global-settings';

const jsonFilePath = path.resolve(process.cwd(), 'src/lib/global-settings.ts');

export async function POST(request: Request) {
  try {
    const { settings: updatedSettings }: { settings: GlobalSettings } = await request.json();

    if (!updatedSettings) {
      return NextResponse.json({ error: 'No settings data provided.' }, { status: 400 });
    }

    const fileContent = `
export type ProductSize = {
    id: string;
    name: string; // e.g., '40ml', '500ml'
};

export type FeeSettings = {
    transactionPercent: number; // e.g. 2.9 for 2.9%
    fixed: number; // e.g. 30 for KES 30
};

export type DeliveryFee = {
    county: string;
    fee: number;
};

export type GlobalSettings = {
    productSizes: ProductSize[];
    fees: FeeSettings;
    deliveryFees: DeliveryFee[];
};

export const globalSettings: GlobalSettings = ${JSON.stringify(updatedSettings, null, 4)};
`;

    await fs.writeFile(jsonFilePath, fileContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Global settings updated.' });

  } catch (error) {
    console.error('Error updating global settings file:', error);
    return NextResponse.json({ error: 'Failed to update global settings.' }, { status: 500 });
  }
}
