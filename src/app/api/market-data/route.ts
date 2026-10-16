import { NextResponse } from 'next/server';
import { INITIAL_ASSETS } from '@/lib/mockData';

export async function GET() {
  // Simulate live micro-fluctuations in institutional assets
  const randomizedAssets = INITIAL_ASSETS.map((asset) => {
    const jitter = (Math.random() - 0.49) * (asset.pipSize * 2);
    const decimals = asset.type === 'FOREX' ? (asset.pipSize === 0.01 ? 2 : 4) : asset.type === 'COMMODITY' ? 2 : 1;
    const updatedPrice = Number((asset.price + jitter).toFixed(decimals));
    return {
      ...asset,
      price: updatedPrice
    };
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    assets: randomizedAssets
  });
}
