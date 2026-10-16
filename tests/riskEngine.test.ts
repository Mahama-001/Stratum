import assert from 'node:assert';
import test from 'node:test';
import { calculatePositionRisk, PROP_FIRM_PRESETS } from '../src/lib/riskEngine.ts';
import type { MarketAsset } from '../src/lib/types.ts';

const mockEurUsd: MarketAsset = {
  symbol: 'EUR/USD',
  name: 'Euro / US Dollar',
  type: 'FOREX',
  price: 1.0850,
  change24h: 0.15,
  direction: 'BULLISH',
  dxyCorrelation: 'INVERSE',
  htfMarketStructure: 'BOS',
  liquiditySweep: 'ASIAN_LOW_SWEPT',
  pipSize: 0.0001,
  pointMultiplier: 10,
  asianRangeHigh: 1.0870,
  asianRangeLow: 1.0830,
  sessionVwap: 1.0845,
  htfOrderBlock: { high: 1.0835, low: 1.0820, bias: 'DEMAND' }
};

const mockGold: MarketAsset = {
  symbol: 'XAU/USD',
  name: 'Gold Spot / USD',
  type: 'COMMODITY',
  price: 2650.00,
  change24h: 0.85,
  direction: 'BULLISH',
  dxyCorrelation: 'INVERSE',
  htfMarketStructure: 'BOS',
  liquiditySweep: 'ASIAN_LOW_SWEPT',
  pipSize: 0.1,
  pointMultiplier: 100,
  asianRangeHigh: 2658.0,
  asianRangeLow: 2642.0,
  sessionVwap: 2648.5,
  htfOrderBlock: { high: 2645.0, low: 2640.0, bias: 'DEMAND' }
};

test('FTMO 100k - Safe 0.5% risk calculation', () => {
  const preset = PROP_FIRM_PRESETS['FTMO_100K'];
  const res = calculatePositionRisk({
    accountBalance: 100000,
    currentEquity: 100000,
    todayRealizedPnL: 0,
    todayStartingBalance: 100000,
    firmPreset: preset,
    selectedAsset: mockEurUsd,
    entryPrice: 1.0850,
    stopLossPrice: 1.0830, // 20 pips
    takeProfitPrice: 1.0890, // 40 pips (1:2 R:R)
    targetRiskPercent: 0.5 // $500
  });

  // Target risk is $500. 20 pips at $10/pip/lot => 2.5 lots
  assert.strictEqual(res.lotSize, 2.5);
  assert.strictEqual(res.dollarRisk, 500);
  assert.strictEqual(res.riskRewardRatio, 2.0);
  assert.strictEqual(res.dailyMaxLossLimitDollar, 5000);
  assert.strictEqual(res.remainingDailyBufferDollar, 5000);
  assert.strictEqual(res.bufferAfterLossDollar, 4500);
  // $500 is 10% of $5,000 buffer (<= 25% threshold)
  assert.strictEqual(res.isBreachDanger, false);
  assert.strictEqual(res.isHardBlocked, false);
  assert.strictEqual(res.severity, 'NORMAL');
});

test('Stratum 25% Buffer Guardrail triggers safety warning', () => {
  const preset = PROP_FIRM_PRESETS['FTMO_100K'];
  // Trader already lost $3,500 today, so remaining buffer is $1,500
  const res = calculatePositionRisk({
    accountBalance: 96500,
    currentEquity: 96500,
    todayRealizedPnL: -3500,
    todayStartingBalance: 100000,
    firmPreset: preset,
    selectedAsset: mockEurUsd,
    entryPrice: 1.0850,
    stopLossPrice: 1.0830, // 20 pips
    takeProfitPrice: 1.0880,
    targetRiskPercent: 0.5 // $482.50 planned risk
  });

  assert.strictEqual(res.remainingDailyBufferDollar, 1500);
  // Risking ~$480 out of $1,500 is ~32% of remaining buffer (> 25%)
  assert.strictEqual(res.isBreachDanger, true);
  assert.strictEqual(res.severity, 'WARNING');
  assert.match(res.warningMessage || '', /PROP FIRM SAFETY ALERT/);
});

test('Hard Block triggers when risk breaches remaining daily loss limit', () => {
  const preset = PROP_FIRM_PRESETS['TOPSTEP_50K']; // $1,000 daily limit
  // Trader already down $800 today, remaining daily buffer is $200
  const res = calculatePositionRisk({
    accountBalance: 49200,
    currentEquity: 49200,
    todayRealizedPnL: -800,
    todayStartingBalance: 50000,
    firmPreset: preset,
    selectedAsset: mockGold,
    entryPrice: 2650.00,
    stopLossPrice: 2645.00, // 5 points
    takeProfitPrice: 2660.00,
    targetRiskPercent: 1.0 // 1% = $492 risk, which exceeds remaining $200 buffer!
  });

  assert.strictEqual(res.remainingDailyBufferDollar, 200);
  assert.strictEqual(res.isHardBlocked, true);
  assert.strictEqual(res.severity, 'CRITICAL_BLOCK');
  assert.match(res.warningMessage || '', /HARD RULE BLOCK/);
});

test('FundedNext Stellar 6K - Challenge rules and 3% max risk rule', () => {
  const preset = PROP_FIRM_PRESETS['FUNDEDNEXT_STELLAR_6K'];
  assert.strictEqual(preset.startingBalance, 6000);
  assert.strictEqual(preset.dailyLossLimitPercent, 5.0); // $300
  assert.strictEqual(preset.maxDrawdownPercent, 10.0); // $600
  assert.strictEqual(preset.maxRiskPerTradePercent, 3.0);

  // Normal 0.5% risk ($30)
  const safeRes = calculatePositionRisk({
    accountBalance: 6000,
    currentEquity: 6000,
    todayRealizedPnL: 0,
    todayStartingBalance: 6000,
    firmPreset: preset,
    selectedAsset: mockEurUsd,
    entryPrice: 1.0850,
    stopLossPrice: 1.0835, // 15 pips
    takeProfitPrice: 1.0880, // 30 pips
    targetRiskPercent: 0.5 // $30
  });

  assert.strictEqual(safeRes.dollarRisk, 30);
  assert.strictEqual(safeRes.dailyMaxLossLimitDollar, 300);
  assert.strictEqual(safeRes.maxOverallLossLimitDollar, 600);
  assert.strictEqual(safeRes.isHardBlocked, false);

  // Attempting 4% risk (exceeds FundedNext 3% max risk cap)
  const breachRes = calculatePositionRisk({
    accountBalance: 6000,
    currentEquity: 6000,
    todayRealizedPnL: 0,
    todayStartingBalance: 6000,
    firmPreset: preset,
    selectedAsset: mockEurUsd,
    entryPrice: 1.0850,
    stopLossPrice: 1.0835,
    takeProfitPrice: 1.0880,
    targetRiskPercent: 4.0 // 4% > 3%
  });

  assert.strictEqual(breachRes.isHardBlocked, true);
  assert.strictEqual(breachRes.maxRiskCapExceeded, true);
  assert.match(breachRes.warningMessage || '', /3% risk-per-trade rule/);
});

test('Topstep Futures - Sizing in contracts and enforcing max contract limit', () => {
  const preset = PROP_FIRM_PRESETS['TOPSTEP_50K']; // max 5 contracts
  assert.strictEqual(preset.instrumentType, 'FUTURES');
  assert.strictEqual(preset.maxContracts, 5);

  const mockIndex: MarketAsset = {
    symbol: 'US30',
    name: 'Dow Jones 30 E-mini',
    type: 'INDEX',
    instrumentCategory: 'FUTURES',
    price: 42000,
    change24h: 0.4,
    direction: 'BULLISH',
    dxyCorrelation: 'UNCORRELATED',
    htfMarketStructure: 'BOS',
    liquiditySweep: 'NONE',
    pipSize: 1.0,
    pointMultiplier: 5, // $5 per point
    asianRangeHigh: 42100,
    asianRangeLow: 41900,
    sessionVwap: 42020,
    htfOrderBlock: { high: 41950, low: 41900, bias: 'DEMAND' }
  };

  // 1% risk on $50,000 = $500 risk. 50 point stop loss. 50 * $5 = $250/contract => 2 contracts (<= 5 max)
  const validRes = calculatePositionRisk({
    accountBalance: 50000,
    currentEquity: 50000,
    todayRealizedPnL: 0,
    todayStartingBalance: 50000,
    firmPreset: preset,
    selectedAsset: mockIndex,
    entryPrice: 42000,
    stopLossPrice: 41950, // 50 points
    takeProfitPrice: 42100,
    targetRiskPercent: 1.0
  });

  assert.strictEqual(validRes.contracts, 2);
  assert.strictEqual(validRes.isHardBlocked, false);
});

