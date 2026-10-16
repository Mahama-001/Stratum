export type InstrumentCategory = 'CFD' | 'FUTURES';

export type PropFirmName = 
  | 'FundedNext' 
  | 'FTMO' 
  | 'Topstep' 
  | 'Apex' 
  | 'MyFundedFutures' 
  | 'FundingPips' 
  | 'The5ers' 
  | 'AlphaCapital' 
  | 'E8Markets' 
  | 'TakeProfitTrader'
  | 'Custom';

export type DrawdownCalculationType = 
  | 'STATIC'              // e.g. FTMO, FundedNext Stellar (fixed based on starting balance)
  | 'BALANCE_BASED'       // e.g. FundedNext Evaluation (resets daily based on start-of-day balance)
  | 'EOD_TRAILING'        // e.g. Topstep, MFFU Starter, TradeDay (trails based on EOD balance)
  | 'INTRADAY_TRAILING';  // e.g. Apex Trader Funding (trails high-water mark live during trades)

export interface PropFirmAccountPreset {
  id: string;
  firm: PropFirmName;
  firmDisplayName: string;
  instrumentType: InstrumentCategory;
  modelName: string; // e.g. 'Stellar 2-Step', 'Stellar 1-Step', 'Trading Combine', 'Standard'
  tierName: string;
  startingBalance: number;
  challengePrice?: number; // e.g. 59.99
  avgRewardDollar?: number; // e.g. 296.55
  
  // Challenge Rules
  phase1TargetPercent?: number; // e.g. 8%
  phase2TargetPercent?: number; // e.g. 5%
  dailyLossLimitPercent: number; // e.g. 5%
  maxDrawdownPercent: number; // e.g. 10%
  dailyLossFixedDollar?: number; // for Topstep $1,000, $2,000
  maxDrawdownFixedDollar?: number; // for Topstep $2,000, $3,000
  drawdownType: DrawdownCalculationType;
  minTradingDays?: number; // e.g. 5
  newsTradingAllowed: boolean;
  newsTradingRestrictionDetails?: string; // e.g. 'Allowed during challenge, 40% profit cap in funded'
  performanceRewardPercent?: number; // e.g. 15% ($117)
  resetApplicable?: boolean;
  
  // Funded & Reward Rules
  rewardSharePercent?: number; // e.g. 80% or 90%
  firstWithdrawalDays?: number; // e.g. 21
  subsequentWithdrawalDays?: number; // e.g. 14
  refundableFee?: boolean;
  maxRiskPerTradePercent?: number; // e.g. 3% (FundedNext max rule)
  maxContracts?: number; // for futures: e.g. 5 minis / 50 micros
  consistencyRule?: string; // e.g. 'N/A' or '30% max day'
  
  // Guardrail sensitivity
  guardrailSensitivityPercent?: number; // default 25%
  
  trailingDrawdown: boolean;
  balanceBased: boolean;
  description: string;
}

export type PropFirmKey = string;

// User's active or saved purchased accounts
export interface UserPurchasedAccount {
  id: string; // unique ID
  accountNickname: string; // e.g. "My Stellar $6K #1", "Topstep 50k Combine", "Apex 150k"
  presetId: string;
  instrumentType: InstrumentCategory;
  firm: PropFirmName;
  modelName: string;
  startingBalance: number;
  currentBalance: number;
  currentEquity: number;
  todayStartingBalance: number;
  todayRealizedPnL: number;
  phase: 'PHASE_1' | 'PHASE_2' | 'FUNDED_SIM' | 'LIVE_FUNDED';
  
  // Tuned parameters
  dailyLossLimitPercent: number;
  maxDrawdownPercent: number;
  drawdownType: DrawdownCalculationType;
  maxRiskPerTradePercent: number;
  maxContractsOrLots: number;
  newsTradingAllowed: boolean;
  newsBlackoutMinutes: number; // e.g. 15m
  guardrailPercent: number; // default 25%
  
  // Challenge info
  challengePrice?: number;
  avgRewardDollar?: number;
  
  isActive: boolean;
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
export type DxyCorrelation = 'INVERSE' | 'POSITIVE' | 'DIRECT' | 'UNCORRELATED';
export type StructureStatus = 'BOS' | 'ChoCH' | 'CONSOLIDATING' | 'RANGE';
export type LiquiditySweepStatus = 'ASIAN_HIGH_SWEPT' | 'ASIAN_LOW_SWEPT' | 'EQUAL_HIGHS_TAKEN' | 'NONE';

export interface MarketAsset {
  symbol: string;
  name: string;
  type: 'FOREX' | 'INDEX' | 'COMMODITY' | 'CRYPTO';
  instrumentCategory?: InstrumentCategory;
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
  sessionTag: 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP';
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
  customGuardrailPercent?: number; // default 25
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
  
  // Contract limit / Max risk rule checks
  contractExceededWarning?: string;
  maxRiskCapExceeded?: boolean;
  
  // Hard safety warnings
  isHardBlocked: boolean; // Violates firm rules directly
  isBreachDanger: boolean; // Exceeds guardrail percentage of remaining daily buffer
  warningMessage?: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL_BLOCK';
}

export interface StampedRiskTicket {
  ticketId: string;
  timestamp: string;
  accountId: string;
  accountNickname: string;
  firm: string;
  instrumentType: InstrumentCategory;
  assetSymbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  lotSize: number;
  contracts?: number;
  dollarRisk: number;
  riskPercentOfBalance: number;
  rewardDollar: number;
  riskRewardRatio: number;
  remainingDailyBufferAfterTrade: number;
  guardrailCompliant: boolean;
  isBreachDanger: boolean;
  drawdownType: DrawdownCalculationType;
}

export type StratumTab = 'LANDING' | 'TERMINAL' | 'PLAYBOOK' | 'RISK_ENGINE' | 'CHECKLIST' | 'SIMULATOR' | 'JOURNAL';

export interface PreFlightCheckItem {
  id: string;
  category: 'TIMING' | 'MACRO' | 'RISK' | 'RATIO' | 'STRUCTURE';
  title: string;
  description: string;
  passed: boolean;
  isWarning: boolean;
  detail: string;
  fixActionLabel?: string;
}

export type StratumThemeId = 'apple';

export interface StratumThemeConfig {
  id: StratumThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  primaryTextColor?: string;
  accentColor: string;
  dotColor: string;
  borderColor: string;
  badgeBg: string;
  glowColor: string;
}

export const APPLE_THEME: StratumThemeConfig = {
  id: 'apple',
  name: 'Minimalist Apple Pro',
  tagline: 'Cupertino Dark & Subdued Sapphire',
  primaryColor: '#0071e3',
  primaryTextColor: '#ffffff',
  accentColor: '#2997ff',
  dotColor: '#0071e3',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  badgeBg: 'rgba(0, 113, 227, 0.12)',
  glowColor: 'rgba(0, 113, 227, 0.25)'
};

export const STRATUM_THEMES: StratumThemeConfig[] = [APPLE_THEME];

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  twoFactorEnabled?: number;
  createdAt: string;
}


export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

