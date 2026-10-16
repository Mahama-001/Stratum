import type { PropFirmAccountPreset, MarketAsset, RiskCalculationInput, RiskCalculationResult } from './types.ts';

export const PROP_FIRM_PRESETS: Record<string, PropFirmAccountPreset> = {
  // ==========================================
  // FUNDEDNEXT (CFD / FOREX)
  // ==========================================
  FUNDEDNEXT_STELLAR_6K: {
    id: 'FUNDEDNEXT_STELLAR_6K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $6K',
    startingBalance: 6000,
    challengePrice: 59.99,
    avgRewardDollar: 296.55,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0, // $300
    maxDrawdownPercent: 10.0, // $600
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    newsTradingRestrictionDetails: 'Allowed during evaluation. 40% profit cap rule in funded phase.',
    performanceRewardPercent: 15.0, // $117
    resetApplicable: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0, // Max 3% at any time
    consistencyRule: 'N/A',
    guardrailSensitivityPercent: 25.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $6K. 8% Phase 1 / 5% Phase 2. Static 5% Daily ($300) / 10% Max ($600). 15% Reward.'
  },
  FUNDEDNEXT_STELLAR_15K: {
    id: 'FUNDEDNEXT_STELLAR_15K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $15K',
    startingBalance: 15000,
    challengePrice: 119.00,
    avgRewardDollar: 742.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    performanceRewardPercent: 15.0,
    resetApplicable: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $15K. Static 5% Daily ($750) / 10% Max ($1,500). Max 3% risk per trade.'
  },
  FUNDEDNEXT_25K: {
    id: 'FUNDEDNEXT_25K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $25K',
    startingBalance: 25000,
    challengePrice: 199.00,
    avgRewardDollar: 1240.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    performanceRewardPercent: 15.0,
    resetApplicable: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $25K. Static 5% Daily ($1,250) / 10% Max ($2,500).'
  },
  FUNDEDNEXT_50K: {
    id: 'FUNDEDNEXT_50K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $50K',
    startingBalance: 50000,
    challengePrice: 299.00,
    avgRewardDollar: 2480.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    performanceRewardPercent: 15.0,
    resetApplicable: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $50K. Static 5% Daily ($2,500) / 10% Max ($5,000).'
  },
  FUNDEDNEXT_100K: {
    id: 'FUNDEDNEXT_100K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $100K',
    startingBalance: 100000,
    challengePrice: 519.00,
    avgRewardDollar: 4950.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    performanceRewardPercent: 15.0,
    resetApplicable: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $100K. Static 5% Daily ($5,000) / 10% Max ($10,000).'
  },
  FUNDEDNEXT_200K: {
    id: 'FUNDEDNEXT_200K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 2-Step',
    tierName: 'Stellar 2-Step $200K',
    startingBalance: 200000,
    challengePrice: 999.00,
    avgRewardDollar: 9800.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 5,
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    firstWithdrawalDays: 21,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Stellar 2-Step $200K. Institutional tier, static limits.'
  },
  FUNDEDNEXT_1STEP_100K: {
    id: 'FUNDEDNEXT_1STEP_100K',
    firm: 'FundedNext',
    firmDisplayName: 'FundedNext',
    instrumentType: 'CFD',
    modelName: 'Stellar 1-Step',
    tierName: 'Stellar 1-Step $100K',
    startingBalance: 100000,
    challengePrice: 549.00,
    phase1TargetPercent: 10.0,
    dailyLossLimitPercent: 3.0, // 3% Daily
    maxDrawdownPercent: 6.0, // 6% Max Trailing
    drawdownType: 'BALANCE_BASED',
    minTradingDays: 2,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    firstWithdrawalDays: 5,
    subsequentWithdrawalDays: 14,
    refundableFee: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: true,
    balanceBased: true,
    description: 'Stellar 1-Step $100K. 10% Target. 3% Daily Loss / 6% Trailing Drawdown.'
  },

  // ==========================================
  // FTMO (CFD / FOREX)
  // ==========================================
  FTMO_10K: {
    id: 'FTMO_10K',
    firm: 'FTMO',
    firmDisplayName: 'FTMO',
    instrumentType: 'CFD',
    modelName: 'Standard Challenge',
    tierName: 'FTMO $10,000 Standard',
    startingBalance: 10000,
    challengePrice: 155.00,
    phase1TargetPercent: 10.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 4,
    newsTradingAllowed: true,
    newsTradingRestrictionDetails: 'Restricted 2 mins before and after high impact news on FTMO Normal tier.',
    rewardSharePercent: 80,
    refundableFee: true,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'FTMO $10,000. 5% Daily ($500) / 10% Max Drawdown ($1,000).'
  },
  FTMO_50K: {
    id: 'FTMO_50K',
    firm: 'FTMO',
    firmDisplayName: 'FTMO',
    instrumentType: 'CFD',
    modelName: 'Standard Challenge',
    tierName: 'FTMO $50,000 Standard',
    startingBalance: 50000,
    challengePrice: 345.00,
    phase1TargetPercent: 10.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 4,
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    refundableFee: true,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'FTMO $50,000. 5% Daily Loss ($2,500), 10% Max Drawdown ($5,000).'
  },
  FTMO_100K: {
    id: 'FTMO_100K',
    firm: 'FTMO',
    firmDisplayName: 'FTMO',
    instrumentType: 'CFD',
    modelName: 'Standard Challenge',
    tierName: 'FTMO $100,000 Standard',
    startingBalance: 100000,
    challengePrice: 540.00,
    phase1TargetPercent: 10.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 4,
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    refundableFee: true,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'FTMO $100,000. 5% Daily Loss ($5,000), 10% Max Drawdown ($10,000).'
  },
  FTMO_200K: {
    id: 'FTMO_200K',
    firm: 'FTMO',
    firmDisplayName: 'FTMO',
    instrumentType: 'CFD',
    modelName: 'Standard Challenge',
    tierName: 'FTMO $200,000 Standard',
    startingBalance: 200000,
    challengePrice: 1080.00,
    phase1TargetPercent: 10.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    minTradingDays: 4,
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    refundableFee: true,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'FTMO $200,000. Institutional flagship tier.'
  },

  // ==========================================
  // FUNDING PIPS (CFD / FOREX)
  // ==========================================
  FUNDINGPIPS_5K: {
    id: 'FUNDINGPIPS_5K',
    firm: 'FundingPips',
    firmDisplayName: 'Funding Pips',
    instrumentType: 'CFD',
    modelName: '2-Step Evaluation',
    tierName: 'Funding Pips $5,000',
    startingBalance: 5000,
    challengePrice: 32.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    rewardSharePercent: 85,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Funding Pips $5K. 5% Daily ($250) / 10% Max ($500).'
  },
  FUNDINGPIPS_100K: {
    id: 'FUNDINGPIPS_100K',
    firm: 'FundingPips',
    firmDisplayName: 'Funding Pips',
    instrumentType: 'CFD',
    modelName: '2-Step Evaluation',
    tierName: 'Funding Pips $100,000',
    startingBalance: 100000,
    challengePrice: 399.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    rewardSharePercent: 85,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Funding Pips $100K. 5% Daily ($5,000) / 10% Max ($10,000).'
  },

  // ==========================================
  // THE 5%ERS (CFD / FOREX)
  // ==========================================
  THE5ERS_HIGHSTAKES_20K: {
    id: 'THE5ERS_HIGHSTAKES_20K',
    firm: 'The5ers',
    firmDisplayName: 'The 5%ers',
    instrumentType: 'CFD',
    modelName: 'High Stakes 2-Step',
    tierName: 'The5ers High Stakes $20,000',
    startingBalance: 20000,
    challengePrice: 165.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'The 5%ers High Stakes $20K. 5% Daily / 10% Max Drawdown.'
  },
  THE5ERS_HIGHSTAKES_100K: {
    id: 'THE5ERS_HIGHSTAKES_100K',
    firm: 'The5ers',
    firmDisplayName: 'The 5%ers',
    instrumentType: 'CFD',
    modelName: 'High Stakes 2-Step',
    tierName: 'The5ers High Stakes $100,000',
    startingBalance: 100000,
    challengePrice: 495.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'The 5%ers High Stakes $100K.'
  },

  // ==========================================
  // ALPHA CAPITAL GROUP (CFD / FOREX)
  // ==========================================
  ALPHA_100K: {
    id: 'ALPHA_100K',
    firm: 'AlphaCapital',
    firmDisplayName: 'Alpha Capital Group',
    instrumentType: 'CFD',
    modelName: 'Alpha Pro 2-Step',
    tierName: 'Alpha Pro $100,000',
    startingBalance: 100000,
    challengePrice: 497.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 5.0,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Alpha Capital $100K. Raw spread zero commission engine.'
  },

  // ==========================================
  // E8 MARKETS (CFD / FOREX)
  // ==========================================
  E8_CLASSIC_100K: {
    id: 'E8_CLASSIC_100K',
    firm: 'E8Markets',
    firmDisplayName: 'E8 Markets',
    instrumentType: 'CFD',
    modelName: 'E8 Classic 2-Step',
    tierName: 'E8 Classic $100,000',
    startingBalance: 100000,
    challengePrice: 498.00,
    phase1TargetPercent: 8.0,
    phase2TargetPercent: 4.0,
    dailyLossLimitPercent: 4.0, // 4% daily
    maxDrawdownPercent: 8.0, // 8% trailing
    drawdownType: 'BALANCE_BASED',
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    trailingDrawdown: true,
    balanceBased: true,
    description: 'E8 Classic $100K. 4% Daily / 8% Trailing Drawdown.'
  },

  // ==========================================
  // TOPSTEP (FUTURES - CME / CBOT / NYMEX)
  // ==========================================
  TOPSTEP_50K: {
    id: 'TOPSTEP_50K',
    firm: 'Topstep',
    firmDisplayName: 'Topstep',
    instrumentType: 'FUTURES',
    modelName: 'Trading Combine',
    tierName: 'Topstep $50,000 Trading Combine',
    startingBalance: 50000,
    challengePrice: 49.00,
    dailyLossLimitPercent: 2.0, // $1,000
    maxDrawdownPercent: 4.0, // $2,000
    dailyLossFixedDollar: 1000,
    maxDrawdownFixedDollar: 2000,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 5, // 5 Standard Minis or 50 Micros
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Topstep 50k Combine. Daily Loss Limit $1,000. Max Loss $2,000 (EOD Trailing). Max 5 Minis.'
  },
  TOPSTEP_100K: {
    id: 'TOPSTEP_100K',
    firm: 'Topstep',
    firmDisplayName: 'Topstep',
    instrumentType: 'FUTURES',
    modelName: 'Trading Combine',
    tierName: 'Topstep $100,000 Trading Combine',
    startingBalance: 100000,
    challengePrice: 99.00,
    dailyLossLimitPercent: 2.0,
    maxDrawdownPercent: 3.0,
    dailyLossFixedDollar: 2000,
    maxDrawdownFixedDollar: 3000,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 10,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Topstep 100k Combine. Daily Loss Limit $2,000. Max Loss $3,000 (EOD Trailing). Max 10 Minis.'
  },
  TOPSTEP_150K: {
    id: 'TOPSTEP_150K',
    firm: 'Topstep',
    firmDisplayName: 'Topstep',
    instrumentType: 'FUTURES',
    modelName: 'Trading Combine',
    tierName: 'Topstep $150,000 Trading Combine',
    startingBalance: 150000,
    challengePrice: 149.00,
    dailyLossLimitPercent: 2.0,
    maxDrawdownPercent: 3.0,
    dailyLossFixedDollar: 3000,
    maxDrawdownFixedDollar: 4500,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 15,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Topstep 150k Combine. Daily Loss Limit $3,000. Max Loss $4,500 (EOD Trailing). Max 15 Minis.'
  },

  // ==========================================
  // APEX TRADER FUNDING (FUTURES)
  // ==========================================
  APEX_50K: {
    id: 'APEX_50K',
    firm: 'Apex',
    firmDisplayName: 'Apex Trader Funding',
    instrumentType: 'FUTURES',
    modelName: 'Full Contract Evaluation',
    tierName: 'Apex $50,000 Full',
    startingBalance: 50000,
    challengePrice: 35.00,
    dailyLossLimitPercent: 0, // No daily loss limit on Apex
    maxDrawdownPercent: 5.0, // $2,500
    dailyLossFixedDollar: 0,
    maxDrawdownFixedDollar: 2500,
    drawdownType: 'INTRADAY_TRAILING',
    maxContracts: 10,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Apex 50k. Trailing Threshold $2,500 (Live Intraday Peak). Max 10 Contracts. No daily loss limit.'
  },
  APEX_100K: {
    id: 'APEX_100K',
    firm: 'Apex',
    firmDisplayName: 'Apex Trader Funding',
    instrumentType: 'FUTURES',
    modelName: 'Full Contract Evaluation',
    tierName: 'Apex $100,000 Full',
    startingBalance: 100000,
    challengePrice: 55.00,
    dailyLossLimitPercent: 0,
    maxDrawdownPercent: 3.0,
    maxDrawdownFixedDollar: 3000,
    drawdownType: 'INTRADAY_TRAILING',
    maxContracts: 14,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Apex 100k. Trailing Threshold $3,000. Max 14 Contracts.'
  },
  APEX_150K: {
    id: 'APEX_150K',
    firm: 'Apex',
    firmDisplayName: 'Apex Trader Funding',
    instrumentType: 'FUTURES',
    modelName: 'Full Contract Evaluation',
    tierName: 'Apex $150,000 Full',
    startingBalance: 150000,
    challengePrice: 85.00,
    dailyLossLimitPercent: 0,
    maxDrawdownPercent: 3.33,
    maxDrawdownFixedDollar: 5000,
    drawdownType: 'INTRADAY_TRAILING',
    maxContracts: 17,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Apex 150k. Trailing Threshold $5,000. Max 17 Contracts.'
  },
  APEX_300K: {
    id: 'APEX_300K',
    firm: 'Apex',
    firmDisplayName: 'Apex Trader Funding',
    instrumentType: 'FUTURES',
    modelName: 'Full Contract Evaluation',
    tierName: 'Apex $300,000 Full',
    startingBalance: 300000,
    challengePrice: 165.00,
    dailyLossLimitPercent: 0,
    maxDrawdownPercent: 2.5,
    maxDrawdownFixedDollar: 7500,
    drawdownType: 'INTRADAY_TRAILING',
    maxContracts: 35,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Apex 300k. Trailing Threshold $7,500. Max 35 Contracts.'
  },

  // ==========================================
  // MYFUNDEDFUTURES / MFFU (FUTURES)
  // ==========================================
  MFFU_STARTER_50K: {
    id: 'MFFU_STARTER_50K',
    firm: 'MyFundedFutures',
    firmDisplayName: 'MyFundedFutures',
    instrumentType: 'FUTURES',
    modelName: 'Starter EOD',
    tierName: 'MFFU 50k Starter EOD',
    startingBalance: 50000,
    challengePrice: 48.00,
    dailyLossLimitPercent: 2.0,
    dailyLossFixedDollar: 1000,
    maxDrawdownPercent: 4.0,
    maxDrawdownFixedDollar: 2000,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 5,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'MFFU 50k Starter. EOD Drawdown $2,000, Daily Loss $1,000.'
  },
  MFFU_EXPERT_100K: {
    id: 'MFFU_EXPERT_100K',
    firm: 'MyFundedFutures',
    firmDisplayName: 'MyFundedFutures',
    instrumentType: 'FUTURES',
    modelName: 'Expert Plan',
    tierName: 'MFFU 100k Expert',
    startingBalance: 100000,
    challengePrice: 110.00,
    dailyLossLimitPercent: 0, // No daily loss limit on Expert
    dailyLossFixedDollar: 0,
    maxDrawdownPercent: 3.0,
    maxDrawdownFixedDollar: 3000,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 10,
    newsTradingAllowed: true,
    rewardSharePercent: 90,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'MFFU 100k Expert. No Daily Loss Limit! EOD Max Drawdown $3,000.'
  },

  // ==========================================
  // TAKE PROFIT TRADER (FUTURES)
  // ==========================================
  TPT_PRO_50K: {
    id: 'TPT_PRO_50K',
    firm: 'TakeProfitTrader',
    firmDisplayName: 'Take Profit Trader',
    instrumentType: 'FUTURES',
    modelName: 'Pro Account',
    tierName: 'Take Profit Trader $50,000 Pro',
    startingBalance: 50000,
    challengePrice: 150.00,
    dailyLossLimitPercent: 2.2,
    dailyLossFixedDollar: 1100,
    maxDrawdownPercent: 4.0,
    maxDrawdownFixedDollar: 2000,
    drawdownType: 'EOD_TRAILING',
    maxContracts: 5,
    newsTradingAllowed: true,
    rewardSharePercent: 80,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Take Profit Trader 50k. EOD Drawdown $2,000. Daily Loss $1,100.'
  },

  // ==========================================
  // CUSTOM USER ACCOUNT (TUNABLE)
  // ==========================================
  CUSTOM: {
    id: 'CUSTOM',
    firm: 'Custom',
    firmDisplayName: 'Custom Prop Setup',
    instrumentType: 'CFD',
    modelName: 'Custom Evaluation',
    tierName: 'Custom Tuned Account',
    startingBalance: 100000,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    newsTradingAllowed: true,
    maxRiskPerTradePercent: 3.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'User-customized parameters for any prop firm test.'
  }
};

/**
 * Calculates lot size, contract sizing, dollar risk, and drawdown impact.
 * Enforces hard safety warnings when risk exceeds the guardrail percentage of remaining daily buffer,
 * or exceeds firm max risk caps / contract allowances.
 */
export function calculatePositionRisk(input: RiskCalculationInput): RiskCalculationResult {
  const {
    accountBalance,
    todayRealizedPnL,
    todayStartingBalance,
    firmPreset,
    selectedAsset,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    targetRiskPercent,
    manualDollarRisk,
    customGuardrailPercent
  } = input;

  const guardrailThreshold = customGuardrailPercent ?? (firmPreset.guardrailSensitivityPercent || 25.0);

  // 1. Calculate SL and TP distances
  const slDistancePoints = Math.abs(entryPrice - stopLossPrice);
  const tpDistancePoints = Math.abs(takeProfitPrice - entryPrice);
  const riskRewardRatio = slDistancePoints > 0 ? Number((tpDistancePoints / slDistancePoints).toFixed(2)) : 0;

  // Validate geometry: Check if SL and TP are on appropriate opposing sides of Entry
  const isLong = stopLossPrice < entryPrice && takeProfitPrice > entryPrice;
  const isShort = stopLossPrice > entryPrice && takeProfitPrice < entryPrice;
  const hasInvalidGeometry = !isLong && !isShort && slDistancePoints > 0 && tpDistancePoints > 0;

  // 2. Compute Target Dollar Risk
  const plannedDollarRisk = manualDollarRisk !== undefined && manualDollarRisk > 0
    ? manualDollarRisk
    : (accountBalance * (targetRiskPercent / 100));

  // 3. Asset Point Value & Sizing (Lots for CFDs, Contracts for Futures)
  let rawLotOrContract = 0;
  if (slDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = slDistancePoints / (selectedAsset.pipSize || 0.0001);
      const dollarPerPipPerLot = 10; // For USD quote currency
      rawLotOrContract = plannedDollarRisk / (pips * dollarPerPipPerLot);
    } else if (selectedAsset.type === 'COMMODITY') {
      const dollarPerPointPerLot = selectedAsset.pointMultiplier || 100;
      rawLotOrContract = plannedDollarRisk / (slDistancePoints * dollarPerPointPerLot);
    } else if (selectedAsset.type === 'INDEX') {
      const dollarPerPointPerContract = selectedAsset.pointMultiplier || 5;
      rawLotOrContract = plannedDollarRisk / (slDistancePoints * dollarPerPointPerContract);
    } else if (selectedAsset.type === 'CRYPTO') {
      const dollarPerPoint = selectedAsset.pointMultiplier || 1;
      rawLotOrContract = plannedDollarRisk / (slDistancePoints * dollarPerPoint);
    }
  }

  // Format sizing: 2 decimals for FX/CFD lots, whole integers for Futures contracts
  const isFutures = firmPreset.instrumentType === 'FUTURES';
  const lotSize = slDistancePoints > 0 ? Math.max(0.01, Number(rawLotOrContract.toFixed(2))) : 0;
  const contracts = slDistancePoints > 0 ? Math.max(1, Math.round(rawLotOrContract)) : 0;
  const sizeUsed = isFutures ? contracts : lotSize;

  // Actual dollar risk at stop based on discretized size
  let actualDollarRisk = plannedDollarRisk;
  if (slDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = slDistancePoints / (selectedAsset.pipSize || 0.0001);
      actualDollarRisk = sizeUsed * pips * 10;
    } else if (selectedAsset.type === 'COMMODITY') {
      actualDollarRisk = sizeUsed * slDistancePoints * (selectedAsset.pointMultiplier || 100);
    } else if (selectedAsset.type === 'INDEX') {
      actualDollarRisk = sizeUsed * slDistancePoints * (selectedAsset.pointMultiplier || 5);
    } else if (selectedAsset.type === 'CRYPTO') {
      actualDollarRisk = sizeUsed * slDistancePoints * (selectedAsset.pointMultiplier || 1);
    }
  } else {
    actualDollarRisk = 0;
  }
  actualDollarRisk = Number(actualDollarRisk.toFixed(2));

  // 4. Expected Dollar Reward
  let rewardDollar = 0;
  if (tpDistancePoints > 0 && slDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = tpDistancePoints / (selectedAsset.pipSize || 0.0001);
      rewardDollar = Number((sizeUsed * pips * 10).toFixed(2));
    } else if (selectedAsset.type === 'COMMODITY') {
      rewardDollar = Number((sizeUsed * tpDistancePoints * (selectedAsset.pointMultiplier || 100)).toFixed(2));
    } else if (selectedAsset.type === 'INDEX') {
      rewardDollar = Number((sizeUsed * tpDistancePoints * (selectedAsset.pointMultiplier || 5)).toFixed(2));
    } else if (selectedAsset.type === 'CRYPTO') {
      rewardDollar = Number((sizeUsed * tpDistancePoints * (selectedAsset.pointMultiplier || 1)).toFixed(2));
    }
  }

  // 5. Drawdown Gatekeeper Math
  // Daily Max Loss Limit (0 means no daily limit, e.g. Apex or MFFU Expert)
  const hasDailyLimit = (firmPreset.dailyLossFixedDollar !== undefined && firmPreset.dailyLossFixedDollar > 0) || firmPreset.dailyLossLimitPercent > 0;
  
  let dailyMaxLossLimitDollar = 0;
  if (hasDailyLimit) {
    if (firmPreset.dailyLossFixedDollar && firmPreset.dailyLossFixedDollar > 0) {
      dailyMaxLossLimitDollar = firmPreset.dailyLossFixedDollar;
    } else {
      const dailyBase = firmPreset.balanceBased ? todayStartingBalance : firmPreset.startingBalance;
      dailyMaxLossLimitDollar = dailyBase * (firmPreset.dailyLossLimitPercent / 100);
    }
  } else {
    // If firm has no daily loss limit (e.g. Apex), use max overall limit as daily cap
    dailyMaxLossLimitDollar = firmPreset.maxDrawdownFixedDollar ?? (firmPreset.startingBalance * (firmPreset.maxDrawdownPercent / 100));
  }

  const dailyLossSoFarDollar = todayRealizedPnL < 0 ? Math.abs(todayRealizedPnL) : 0;
  const remainingDailyBufferDollar = Math.max(0, dailyMaxLossLimitDollar - dailyLossSoFarDollar);
  const bufferAfterLossDollar = Math.max(0, remainingDailyBufferDollar - actualDollarRisk);

  const percentageOfDailyBufferConsumedByLoss = remainingDailyBufferDollar > 0
    ? (actualDollarRisk / remainingDailyBufferDollar) * 100
    : 100;

  // Max Overall Drawdown
  const maxOverallLossLimitDollar = firmPreset.maxDrawdownFixedDollar ?? (firmPreset.startingBalance * (firmPreset.maxDrawdownPercent / 100));
  const totalDrawdownSoFar = Math.max(0, firmPreset.startingBalance - accountBalance);
  const remainingOverallBufferDollar = Math.max(0, maxOverallLossLimitDollar - totalDrawdownSoFar);

  // 6. Hard Safety Rules and Warnings
  let isHardBlocked = false;
  let isBreachDanger = false;
  let severity: 'NORMAL' | 'WARNING' | 'CRITICAL_BLOCK' = 'NORMAL';
  let warningMessage: string | undefined = undefined;
  let contractExceededWarning: string | undefined = undefined;
  let maxRiskCapExceeded = false;

  // Check 0: Zero stop-loss or invalid inverted geometry
  if (slDistancePoints === 0) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = 'INVALID STOP LOSS: Stop Loss price cannot be equal to Entry Price.';
  } else if (hasInvalidGeometry) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = 'INVALID TRADE GEOMETRY: Stop Loss and Take Profit cannot be on the same side of Entry Price.';
  }

  // Check 1: Max Contracts rule for Futures
  if (!isHardBlocked && isFutures && firmPreset.maxContracts && contracts > firmPreset.maxContracts) {
    contractExceededWarning = `FUTURES RULE VIOLATION: Position size (${contracts} contracts) exceeds ${firmPreset.firmDisplayName} max limit (${firmPreset.maxContracts} contracts)!`;
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = contractExceededWarning;
  }

  // Check 2: Max Risk per trade rule (e.g. FundedNext 3% max risk rule)
  if (!isHardBlocked && firmPreset.maxRiskPerTradePercent && accountBalance > 0 && (actualDollarRisk / accountBalance) * 100 > firmPreset.maxRiskPerTradePercent) {
    maxRiskCapExceeded = true;
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = `PROP FIRM HARD CAP: Planned risk (${((actualDollarRisk / accountBalance) * 100).toFixed(1)}%) breaches ${firmPreset.firmDisplayName}'s maximum ${firmPreset.maxRiskPerTradePercent}% risk-per-trade rule!`;
  }

  // Check 3: Trade risk exceeds remaining daily buffer -> INSTANT HARD BLOCK
  if (!isHardBlocked && hasDailyLimit && actualDollarRisk >= remainingDailyBufferDollar) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = `HARD RULE BLOCK: Trade risk ($${actualDollarRisk.toLocaleString()}) would BREACH daily loss limit! Remaining buffer is only $${remainingDailyBufferDollar.toLocaleString()}.`;
  }
  // Check 4: Trade risk exceeds remaining overall account drawdown buffer -> HARD BLOCK
  else if (!isHardBlocked && actualDollarRisk >= remainingOverallBufferDollar) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = `HARD RULE BLOCK: Trade risk ($${actualDollarRisk.toLocaleString()}) would BREACH max account drawdown ($${remainingOverallBufferDollar.toLocaleString()} left)!`;
  }
  // Check 5: Trade risk exceeds Guardrail threshold of remaining buffer -> SAFETY WARNING
  else if (!isHardBlocked && percentageOfDailyBufferConsumedByLoss > guardrailThreshold) {
    isBreachDanger = true;
    severity = 'WARNING';
    warningMessage = `PROP FIRM SAFETY ALERT: Trade risks ${percentageOfDailyBufferConsumedByLoss.toFixed(1)}% of your remaining daily buffer ($${actualDollarRisk.toLocaleString()} of $${remainingDailyBufferDollar.toLocaleString()}). Stratum rules mandate risking <${guardrailThreshold}% of remaining daily buffer to protect evaluation status.`;
  }

  const riskPercentOfBalance = accountBalance > 0 ? Number(((actualDollarRisk / accountBalance) * 100).toFixed(2)) : 0;

  return {
    lotSize,
    contracts,
    dollarRisk: actualDollarRisk,
    riskPercentOfBalance,
    slDistancePoints: Number(slDistancePoints.toFixed(5)),
    tpDistancePoints: Number(tpDistancePoints.toFixed(5)),
    rewardDollar,
    riskRewardRatio,
    dailyMaxLossLimitDollar,
    dailyLossSoFarDollar,
    remainingDailyBufferDollar,
    bufferAfterLossDollar,
    percentageOfDailyBufferConsumedByLoss: Number(percentageOfDailyBufferConsumedByLoss.toFixed(1)),
    maxOverallLossLimitDollar,
    totalLossSoFarDollar: totalDrawdownSoFar,
    remainingOverallBufferDollar,
    contractExceededWarning,
    maxRiskCapExceeded,
    isHardBlocked,
    isBreachDanger,
    warningMessage,
    severity
  };
}
