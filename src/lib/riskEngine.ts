import type { PropFirmAccountPreset, MarketAsset, RiskCalculationInput, RiskCalculationResult } from './types.ts';

export const PROP_FIRM_PRESETS: Record<string, PropFirmAccountPreset> = {
  FTMO_50K: {
    id: 'FTMO_50K',
    firm: 'FTMO',
    tierName: 'FTMO $50,000 Standard',
    startingBalance: 50000,
    dailyLossLimitPercent: 5.0, // $2,500
    maxDrawdownPercent: 10.0, // $5,000
    trailingDrawdown: false,
    balanceBased: true,
    description: '5% Daily Loss ($2,500), 10% Max Drawdown ($5,000). Midnight CE(S)T reset.'
  },
  FTMO_100K: {
    id: 'FTMO_100K',
    firm: 'FTMO',
    tierName: 'FTMO $100,000 Standard',
    startingBalance: 100000,
    dailyLossLimitPercent: 5.0, // $5,000
    maxDrawdownPercent: 10.0, // $10,000
    trailingDrawdown: false,
    balanceBased: true,
    description: '5% Daily Loss ($5,000), 10% Max Drawdown ($10,000). Midnight CE(S)T reset.'
  },
  FTMO_200K: {
    id: 'FTMO_200K',
    firm: 'FTMO',
    tierName: 'FTMO $200,000 Standard',
    startingBalance: 200000,
    dailyLossLimitPercent: 5.0, // $10,000
    maxDrawdownPercent: 10.0, // $20,000
    trailingDrawdown: false,
    balanceBased: true,
    description: '5% Daily Loss ($10,000), 10% Max Drawdown ($20,000). Hard institutional rule.'
  },
  TOPSTEP_50K: {
    id: 'TOPSTEP_50K',
    firm: 'Topstep',
    tierName: 'Topstep $50,000 Trading Combine',
    startingBalance: 50000,
    dailyLossLimitPercent: 2.0, // $1,000 fixed
    maxDrawdownPercent: 4.0, // $2,000 trailing
    dailyLossFixedDollar: 1000,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Daily Loss Limit $1,000, Trailing Max Drawdown $2,000 (EOD calculated).'
  },
  TOPSTEP_100K: {
    id: 'TOPSTEP_100K',
    firm: 'Topstep',
    tierName: 'Topstep $100,000 Trading Combine',
    startingBalance: 100000,
    dailyLossLimitPercent: 2.0, // $2,000 fixed
    maxDrawdownPercent: 3.0, // $3,000 trailing
    dailyLossFixedDollar: 2000,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Daily Loss Limit $2,000, Trailing Max Drawdown $3,000. Strict futures rule.'
  },
  TOPSTEP_150K: {
    id: 'TOPSTEP_150K',
    firm: 'Topstep',
    tierName: 'Topstep $150,000 Trading Combine',
    startingBalance: 150000,
    dailyLossLimitPercent: 2.0, // $3,000 fixed
    maxDrawdownPercent: 3.0, // $4,500 trailing
    dailyLossFixedDollar: 3000,
    trailingDrawdown: true,
    balanceBased: false,
    description: 'Daily Loss Limit $3,000, Trailing Max Drawdown $4,500. Pro futures tier.'
  },
  FUNDEDNEXT_25K: {
    id: 'FUNDEDNEXT_25K',
    firm: 'FundedNext',
    tierName: 'FundedNext $25,000 Stellar',
    startingBalance: 25000,
    dailyLossLimitPercent: 5.0, // $1,250
    maxDrawdownPercent: 10.0, // $2,500
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Balance-based 5% Daily Loss ($1,250), 10% Max Drawdown ($2,500).'
  },
  FUNDEDNEXT_50K: {
    id: 'FUNDEDNEXT_50K',
    firm: 'FundedNext',
    tierName: 'FundedNext $50,000 Stellar',
    startingBalance: 50000,
    dailyLossLimitPercent: 5.0, // $2,500
    maxDrawdownPercent: 10.0, // $5,000
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Balance-based 5% Daily Loss ($2,500), 10% Max Drawdown ($5,000).'
  },
  FUNDEDNEXT_100K: {
    id: 'FUNDEDNEXT_100K',
    firm: 'FundedNext',
    tierName: 'FundedNext $100,000 Stellar',
    startingBalance: 100000,
    dailyLossLimitPercent: 5.0, // $5,000
    maxDrawdownPercent: 10.0, // $10,000
    trailingDrawdown: false,
    balanceBased: true,
    description: 'Balance-based 5% Daily Loss ($5,000), 10% Max Drawdown ($10,000).'
  },
  CUSTOM: {
    id: 'CUSTOM',
    firm: 'Custom',
    tierName: 'Custom Prop Account',
    startingBalance: 100000,
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    trailingDrawdown: false,
    balanceBased: true,
    description: 'User-specified parameters for proprietary prop firm tests.'
  }
};

/**
 * Calculates lot size, position sizing, dollar risk, and drawdown impact.
 * Enforces hard safety warnings when risk exceeds 25% of remaining daily buffer.
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
    manualDollarRisk
  } = input;

  // 1. Calculate SL and TP distances
  const slDistancePoints = Math.abs(entryPrice - stopLossPrice);
  const tpDistancePoints = Math.abs(takeProfitPrice - entryPrice);
  const riskRewardRatio = slDistancePoints > 0 ? Number((tpDistancePoints / slDistancePoints).toFixed(2)) : 0;

  // 2. Compute Target Dollar Risk
  const plannedDollarRisk = manualDollarRisk !== undefined && manualDollarRisk > 0
    ? manualDollarRisk
    : (accountBalance * (targetRiskPercent / 100));

  // 3. Asset Point Value & Lot Sizing
  // Forex: (EUR/USD) 1.0 standard lot = $10 per pip (0.0001) -> $100,000 per full point move
  // Gold (XAU/USD): 1.0 standard lot (100 oz) -> $100 per full dollar move
  // Indices (US30 / NAS100): 1 contract = pointMultiplier ($5 for US30, $20 for NQ)
  let rawLotOrContract = 0;
  if (slDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = slDistancePoints / (selectedAsset.pipSize || 0.0001);
      const dollarPerPipPerLot = 10; // For USD quote currency
      rawLotOrContract = plannedDollarRisk / (pips * dollarPerPipPerLot);
    } else if (selectedAsset.type === 'COMMODITY') {
      // e.g. Gold: 1 lot = 100 oz. $1 distance = $100 loss
      const dollarPerPointPerLot = selectedAsset.pointMultiplier || 100;
      rawLotOrContract = plannedDollarRisk / (slDistancePoints * dollarPerPointPerLot);
    } else if (selectedAsset.type === 'INDEX') {
      const dollarPerPointPerContract = selectedAsset.pointMultiplier || 5;
      rawLotOrContract = plannedDollarRisk / (slDistancePoints * dollarPerPointPerContract);
    }
  }

  // Format to standard trading increments (2 decimals for lots/contracts, minimum 0.01)
  const lotSize = Math.max(0.01, Number(rawLotOrContract.toFixed(2)));
  const contracts = Math.max(1, Math.round(rawLotOrContract));

  // Actual dollar risk at stop based on discretized lot size
  let actualDollarRisk = plannedDollarRisk;
  if (slDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = slDistancePoints / (selectedAsset.pipSize || 0.0001);
      actualDollarRisk = lotSize * pips * 10;
    } else if (selectedAsset.type === 'COMMODITY') {
      actualDollarRisk = lotSize * slDistancePoints * (selectedAsset.pointMultiplier || 100);
    } else if (selectedAsset.type === 'INDEX') {
      actualDollarRisk = lotSize * slDistancePoints * (selectedAsset.pointMultiplier || 5);
    }
  }
  actualDollarRisk = Number(actualDollarRisk.toFixed(2));

  // 4. Expected Dollar Reward
  let rewardDollar = 0;
  if (tpDistancePoints > 0) {
    if (selectedAsset.type === 'FOREX') {
      const pips = tpDistancePoints / (selectedAsset.pipSize || 0.0001);
      rewardDollar = Number((lotSize * pips * 10).toFixed(2));
    } else if (selectedAsset.type === 'COMMODITY') {
      rewardDollar = Number((lotSize * tpDistancePoints * (selectedAsset.pointMultiplier || 100)).toFixed(2));
    } else if (selectedAsset.type === 'INDEX') {
      rewardDollar = Number((lotSize * tpDistancePoints * (selectedAsset.pointMultiplier || 5)).toFixed(2));
    }
  }

  // 5. Drawdown Gatekeeper Math
  // Daily Max Loss Limit:
  const dailyBase = firmPreset.balanceBased ? todayStartingBalance : firmPreset.startingBalance;
  const dailyMaxLossLimitDollar = firmPreset.dailyLossFixedDollar
    ? firmPreset.dailyLossFixedDollar
    : (dailyBase * (firmPreset.dailyLossLimitPercent / 100));

  // If today's realized PnL is negative, that consumes our daily loss limit
  const dailyLossSoFarDollar = todayRealizedPnL < 0 ? Math.abs(todayRealizedPnL) : 0;
  const remainingDailyBufferDollar = Math.max(0, dailyMaxLossLimitDollar - dailyLossSoFarDollar);

  // Buffer after taking this theoretical loss
  const bufferAfterLossDollar = Math.max(0, remainingDailyBufferDollar - actualDollarRisk);

  // Ratio of buffer consumed by this single trade
  const percentageOfDailyBufferConsumedByLoss = remainingDailyBufferDollar > 0
    ? (actualDollarRisk / remainingDailyBufferDollar) * 100
    : 100;

  // Max Overall Drawdown
  const maxOverallLossLimitDollar = firmPreset.startingBalance * (firmPreset.maxDrawdownPercent / 100);
  const totalDrawdownSoFar = Math.max(0, firmPreset.startingBalance - accountBalance);
  const remainingOverallBufferDollar = Math.max(0, maxOverallLossLimitDollar - totalDrawdownSoFar);

  // 6. Hard Safety Rules and Warnings
  let isHardBlocked = false;
  let isBreachDanger = false;
  let severity: 'NORMAL' | 'WARNING' | 'CRITICAL_BLOCK' = 'NORMAL';
  let warningMessage: string | undefined = undefined;

  // Rule 1: Trade risk exceeds remaining daily buffer -> INSTANT HARD BLOCK
  if (actualDollarRisk >= remainingDailyBufferDollar) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = `HARD RULE BLOCK: Trade risk ($${actualDollarRisk.toLocaleString()}) would BREACH daily loss limit! Remaining buffer is only $${remainingDailyBufferDollar.toLocaleString()}.`;
  }
  // Rule 2: Trade risk exceeds remaining overall account drawdown buffer -> HARD BLOCK
  else if (actualDollarRisk >= remainingOverallBufferDollar) {
    isHardBlocked = true;
    severity = 'CRITICAL_BLOCK';
    warningMessage = `HARD RULE BLOCK: Trade risk ($${actualDollarRisk.toLocaleString()}) would BREACH max account drawdown ($${remainingOverallBufferDollar.toLocaleString()} left)!`;
  }
  // Rule 3: Trade risk exceeds 25% of the remaining daily loss buffer -> HARD SAFETY WARNING
  else if (percentageOfDailyBufferConsumedByLoss > 25.0) {
    isBreachDanger = true;
    severity = 'WARNING';
    warningMessage = `PROP FIRM SAFETY ALERT: Trade risks ${percentageOfDailyBufferConsumedByLoss.toFixed(1)}% of your remaining daily buffer ($${actualDollarRisk.toLocaleString()} of $${remainingDailyBufferDollar.toLocaleString()}). Stratum rules mandate risking <25% of remaining daily buffer to protect evaluation status.`;
  }

  const riskPercentOfBalance = Number(((actualDollarRisk / accountBalance) * 100).toFixed(2));

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
    isHardBlocked,
    isBreachDanger,
    warningMessage,
    severity
  };
}
