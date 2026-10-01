import { NextResponse } from 'next/server';
import { INITIAL_ASSETS } from '@/lib/mockData';

export async function GET() {
  // Simulate live micro-fluctuations in institutional assets
  const randomizedAssets = INITIAL_ASSETS.map((asset) => {
    const jitter = (Math.random() - 0.49) * (asset.pipSize * 2);
    const updatedPrice = Number((asset.price + jitter).toFixed(asset.type === 'FOREX' ? 4 : asset.type === 'COMMODITY' ? 2 : 1));
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
