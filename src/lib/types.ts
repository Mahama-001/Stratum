export type PropFirmKey = 'FTMO_50K' | 'FTMO_100K' | 'FTMO_200K' | 'TOPSTEP_50K' | 'TOPSTEP_100K' | 'TOPSTEP_150K' | 'FUNDEDNEXT_25K' | 'FUNDEDNEXT_50K' | 'FUNDEDNEXT_100K' | 'CUSTOM';

export interface PropFirmAccountPreset {
  id: PropFirmKey;
  firm: 'FTMO' | 'Topstep' | 'FundedNext' | 'Custom';
  tierName: string;
  startingBalance: number;
  dailyLossLimitPercent: number; // e.g. 5%
  maxDrawdownPercent: number; // e.g. 10%
  dailyLossFixedDollar?: number; // e.g. Topstep $1,000 or $2,000
  trailingDrawdown: boolean;
  balanceBased: boolean;
  description: string;
}

export type TrafficLightStatus = 'GREEN' | 'AMBER' | 'RED';

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledTimeUtc: string; // ISO string
  minutesUntil: number;
  status: TrafficLightStatus;
  forecast?: string;
  previous?: string;
  actual?: string;
  blackoutWarning?: string;
}

export type MarketBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type DxyCorrelation = 'INVERSE' | 'POSITIVE' | 'UNCORRELATED';
export type StructureStatus = 'BOS' | 'ChoCH' | 'CONSOLIDATING';
export type LiquiditySweepStatus = 'ASIAN_HIGH_SWEPT' | 'ASIAN_LOW_SWEPT' | 'EQUAL_HIGHS_TAKEN' | 'NONE';

export interface MarketAsset {
  symbol: string;
  name: string;
  type: 'FOREX' | 'INDEX' | 'COMMODITY';
  price: number;
  change24h: number;
  direction: MarketBias;
  dxyCorrelation: DxyCorrelation;
  htfMarketStructure: StructureStatus;
  liquiditySweep: LiquiditySweepStatus;
  pipSize: number; // 0.0001 for FX, 0.1 for Gold, 1.0 for Indices
  pointMultiplier: number; // dollar per standard point / lot
  asianRangeHigh: number;
  asianRangeLow: number;
  sessionVwap: number;
  htfOrderBlock: { high: number; low: number; bias: 'DEMAND' | 'SUPPLY' };
}

export type StrategySetupId = 'STRAT_A' | 'STRAT_B' | 'STRAT_C';

export interface StrategySetup {
  id: string;
  strategyType: StrategySetupId;
  strategyName: string;
  tag: string;
  asset: string;
  bias: 'LONG' | 'SHORT';
  timeframe: string;
  thesis: string;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
  winRatePercent: number;
  backtestSampleSize: number;
  sessionTag: 'LONDON' | 'NEW_YORK' | 'ASIAN' | 'LONDON_NY_OVERLAP';
  isLiveValid: boolean;
  historicalContext: string;
}

export interface RiskCalculationInput {
  accountBalance: number;
  currentEquity: number;
  todayRealizedPnL: number;
  todayStartingBalance: number;
  firmPreset: PropFirmAccountPreset;
  selectedAsset: MarketAsset;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  targetRiskPercent: number; // e.g. 0.5 or 1.0
  manualDollarRisk?: number;
}

export interface RiskCalculationResult {
  lotSize: number;
  contracts: number;
  dollarRisk: number;
  riskPercentOfBalance: number;
  slDistancePoints: number;
  tpDistancePoints: number;
  rewardDollar: number;
  riskRewardRatio: number;
  
  // Daily Drawdown checks
  dailyMaxLossLimitDollar: number;
  dailyLossSoFarDollar: number;
  remainingDailyBufferDollar: number;
  bufferAfterLossDollar: number;
  percentageOfDailyBufferConsumedByLoss: number;
  
  // Max Overall Drawdown checks
  maxOverallLossLimitDollar: number;
  totalLossSoFarDollar: number;
  remainingOverallBufferDollar: number;
  
  // Hard safety warnings
  isHardBlocked: boolean; // Violates firm rules directly
  isBreachDanger: boolean; // Exceeds 25% of remaining daily buffer
  warningMessage?: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL_BLOCK';
}
