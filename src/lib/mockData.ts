import { MarketAsset, EconomicEvent, StrategySetup } from './types';

export const INITIAL_ASSETS: MarketAsset[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    type: 'FOREX',
    price: 1.0848,
    change24h: 0.18,
    direction: 'BULLISH',
    dxyCorrelation: 'INVERSE',
    htfMarketStructure: 'BOS',
    liquiditySweep: 'ASIAN_LOW_SWEPT',
    pipSize: 0.0001,
    pointMultiplier: 10,
    asianRangeHigh: 1.0872,
    asianRangeLow: 1.0828,
    sessionVwap: 1.0842,
    htfOrderBlock: { high: 1.0835, low: 1.0818, bias: 'DEMAND' }
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    type: 'FOREX',
    price: 1.2982,
    change24h: -0.24,
    direction: 'BEARISH',
    dxyCorrelation: 'INVERSE',
    htfMarketStructure: 'ChoCH',
    liquiditySweep: 'ASIAN_HIGH_SWEPT',
    pipSize: 0.0001,
    pointMultiplier: 10,
    asianRangeHigh: 1.3015,
    asianRangeLow: 1.2960,
    sessionVwap: 1.2995,
    htfOrderBlock: { high: 1.3025, low: 1.3005, bias: 'SUPPLY' }
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold Spot / US Dollar',
    type: 'COMMODITY',
    price: 2654.40,
    change24h: 0.92,
    direction: 'BULLISH',
    dxyCorrelation: 'INVERSE',
    htfMarketStructure: 'BOS',
    liquiditySweep: 'ASIAN_LOW_SWEPT',
    pipSize: 0.1,
    pointMultiplier: 100, // 100 oz per lot, $1 move = $100
    asianRangeHigh: 2662.0,
    asianRangeLow: 2641.5,
    sessionVwap: 2651.2,
    htfOrderBlock: { high: 2644.0, low: 2638.0, bias: 'DEMAND' }
  },
  {
    symbol: 'US30',
    name: 'Dow Jones Industrial 30',
    type: 'INDEX',
    price: 42180.0,
    change24h: 0.42,
    direction: 'BULLISH',
    dxyCorrelation: 'UNCORRELATED',
    htfMarketStructure: 'BOS',
    liquiditySweep: 'NONE',
    pipSize: 1.0,
    pointMultiplier: 5, // $5 per index point
    asianRangeHigh: 42240.0,
    asianRangeLow: 42050.0,
    sessionVwap: 42145.0,
    htfOrderBlock: { high: 42080.0, low: 42000.0, bias: 'DEMAND' }
  },
  {
    symbol: 'NAS100',
    name: 'Nasdaq 100 E-mini',
    type: 'INDEX',
    price: 20120.5,
    change24h: -0.38,
    direction: 'BEARISH',
    dxyCorrelation: 'UNCORRELATED',
    htfMarketStructure: 'ChoCH',
    liquiditySweep: 'ASIAN_HIGH_SWEPT',
    pipSize: 0.25,
    pointMultiplier: 20, // $20 per point on standard contract
    asianRangeHigh: 20240.0,
    asianRangeLow: 20080.0,
    sessionVwap: 20185.0,
    htfOrderBlock: { high: 20260.0, low: 20210.0, bias: 'SUPPLY' }
  }
];

export const INITIAL_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'EVT-01',
    title: 'US Core CPI m/m & y/y',
    currency: 'USD',
    impact: 'HIGH',
    scheduledTimeUtc: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // in 25 mins (AMBER warning)
    minutesUntil: 25,
    status: 'AMBER',
    forecast: '0.3%',
    previous: '0.3%',
    blackoutWarning: 'WARNING: 25m to Red Folder release. Reduce position sizing; slippage protection alert.'
  },
  {
    id: 'EVT-02',
    title: 'FOMC Interest Rate Decision & Statement',
    currency: 'USD',
    impact: 'HIGH',
    scheduledTimeUtc: new Date(Date.now() + 185 * 60 * 1000).toISOString(), // in ~3 hours
    minutesUntil: 185,
    status: 'GREEN',
    forecast: '4.75%',
    previous: '5.00%'
  },
  {
    id: 'EVT-03',
    title: 'ECB Monetary Policy Statement & Presser',
    currency: 'EUR',
    impact: 'HIGH',
    scheduledTimeUtc: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago (RED blackout)
    minutesUntil: -8,
    status: 'RED',
    forecast: '3.25%',
    previous: '3.50%',
    actual: '3.25%',
    blackoutWarning: 'PROP FIRM RULE ALERT: News trading prohibited/unprotected slippage zone within 15m of release!'
  },
  {
    id: 'EVT-04',
    title: 'US Non-Farm Payrolls (NFP) & Unemployment',
    currency: 'USD',
    impact: 'HIGH',
    scheduledTimeUtc: new Date(Date.now() + 1440 * 60 * 1000).toISOString(),
    minutesUntil: 1440,
    status: 'GREEN',
    forecast: '145K',
    previous: '142K'
  }
];

export const INITIAL_STRATEGY_SETUPS: StrategySetup[] = [
  {
    id: 'SETUP-01',
    strategyType: 'STRAT_A',
    strategyName: 'Session Sweep & Displacement',
    tag: 'Asian Low Sweep + London FVG',
    asset: 'EUR/USD',
    bias: 'LONG',
    timeframe: 'M15 / H1',
    thesis: 'Asian session liquidity swept below 1.0830 at London open. Strong displacement candle created an institutional Fair Value Gap. DXY rejected 4H supply.',
    entryPrice: 1.0845,
    stopLossPrice: 1.0825, // 20 pips risk
    takeProfitPrice: 1.0885, // 40 pips reward (1:2 R:R)
    riskRewardRatio: 2.0,
    winRatePercent: 64.2,
    backtestSampleSize: 280,
    sessionTag: 'LONDON',
    isLiveValid: true,
    historicalContext: 'High edge during London session expansion when DXY exhibits clean displacement away from Asian extremes.'
  },
  {
    id: 'SETUP-02',
    strategyType: 'STRAT_B',
    strategyName: 'VWAP & Mean Reversion',
    tag: 'Session Extreme Reversion',
    asset: 'XAU/USD',
    bias: 'SHORT',
    timeframe: 'M5 / M15',
    thesis: 'Price expanded +2.5 standard deviations above session VWAP during early session rush without volume backing. Momentum divergence formed at 2662 resistance.',
    entryPrice: 2658.50,
    stopLossPrice: 2663.50, // 5.0 pts
    takeProfitPrice: 2649.50, // 9.0 pts (1:1.8 R:R)
    riskRewardRatio: 1.8,
    winRatePercent: 61.5,
    backtestSampleSize: 315,
    sessionTag: 'NEW_YORK',
    isLiveValid: true,
    historicalContext: 'Mean reversion setups require tight invalidation above the session peak and strict take-profit at central session VWAP.'
  },
  {
    id: 'SETUP-03',
    strategyType: 'STRAT_C',
    strategyName: 'Trend Continuation Discount Pullback',
    tag: '4H Order Block Retest',
    asset: 'US30',
    bias: 'LONG',
    timeframe: 'H1 / H4',
    thesis: 'Higher timeframe bullish Break of Structure (BOS) intact on daily chart. Retraced 62% into institutional discount demand order block with liquidity absorbed.',
    entryPrice: 42120.0,
    stopLossPrice: 42020.0, // 100 pts
    takeProfitPrice: 42320.0, // 200 pts (1:2 R:R)
    riskRewardRatio: 2.0,
    winRatePercent: 67.8,
    backtestSampleSize: 242,
    sessionTag: 'LONDON_NY_OVERLAP',
    isLiveValid: true,
    historicalContext: 'Order block retests in direction of daily trend exhibit highest win rate and institutional capital backing.'
  },
  {
    id: 'SETUP-04',
    strategyType: 'STRAT_A',
    strategyName: 'Session Sweep & Displacement',
    tag: 'London High Sweep + New York Reversal',
    asset: 'GBP/USD',
    bias: 'SHORT',
    timeframe: 'M15',
    thesis: 'London high at 1.3015 swept right at NY pre-market bell. Strong bearish displacement followed with break of lower internal structure (ChoCH).',
    entryPrice: 1.2985,
    stopLossPrice: 1.3018, // 33 pips
    takeProfitPrice: 1.2925, // 60 pips (1:1.82 R:R)
    riskRewardRatio: 1.82,
    winRatePercent: 59.6,
    backtestSampleSize: 198,
    sessionTag: 'NEW_YORK',
    isLiveValid: true,
    historicalContext: 'London High sweeps before NY open frequently deliver fast liquidity rebalancing.'
  }
];
