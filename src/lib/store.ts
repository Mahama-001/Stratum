import { create } from 'zustand';
import { 
  PropFirmKey, 
  PropFirmAccountPreset, 
  MarketAsset, 
  EconomicEvent, 
  StrategySetup, 
  RiskCalculationResult 
} from './types';
import { PROP_FIRM_PRESETS, calculatePositionRisk } from './riskEngine';
import { INITIAL_ASSETS, INITIAL_ECONOMIC_EVENTS, INITIAL_STRATEGY_SETUPS } from './mockData';

interface StratumState {
  // Navigation
  activeTab: 'LANDING' | 'TERMINAL' | 'PLAYBOOK' | 'RISK_ENGINE';
  setActiveTab: (tab: 'LANDING' | 'TERMINAL' | 'PLAYBOOK' | 'RISK_ENGINE') => void;

  // Account & Prop Firm Settings
  selectedPresetKey: PropFirmKey;
  currentPreset: PropFirmAccountPreset;
  accountBalance: number;
  currentEquity: number;
  todayStartingBalance: number;
  todayRealizedPnL: number;
  setPropFirmPreset: (key: PropFirmKey) => void;
  updateCustomAccount: (balance: number, dailyMaxLossPercent: number, totalMaxLossPercent: number) => void;
  updatePnL: (todayPnL: number) => void;

  // Trade Inputs & Selection
  selectedAsset: MarketAsset;
  setSelectedAsset: (asset: MarketAsset) => void;
  selectedSetup: StrategySetup | null;
  selectSetupForRiskEngine: (setup: StrategySetup) => void;
  
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  targetRiskPercent: number; // e.g. 0.5 or 1.0
  manualDollarRisk?: number;
  
  setTradeLevels: (entry: number, sl: number, tp: number) => void;
  setTargetRiskPercent: (percent: number) => void;
  setManualDollarRisk: (dollar?: number) => void;

  // Live Data Feeds
  assets: MarketAsset[];
  economicEvents: EconomicEvent[];
  setups: StrategySetup[];
  updateAssetPrice: (symbol: string, newPrice: number) => void;

  // Computed Risk
  riskResult: RiskCalculationResult;
}

export const useStratumStore = create<StratumState>((set, get) => {
  const initialPreset = PROP_FIRM_PRESETS['FTMO_100K'];
  const initialAsset = INITIAL_ASSETS[0]; // EUR/USD
  const initialEntry = initialAsset.price;
  const initialSL = initialAsset.price - 0.0020; // 20 pips
  const initialTP = initialAsset.price + 0.0040; // 40 pips
  const initialBalance = initialPreset.startingBalance;

  const initialRisk = calculatePositionRisk({
    accountBalance: initialBalance,
    currentEquity: initialBalance,
    todayRealizedPnL: 0,
    todayStartingBalance: initialBalance,
    firmPreset: initialPreset,
    selectedAsset: initialAsset,
    entryPrice: initialEntry,
    stopLossPrice: initialSL,
    takeProfitPrice: initialTP,
    targetRiskPercent: 0.5
  });

  return {
    activeTab: 'TERMINAL',
    setActiveTab: (tab) => set({ activeTab: tab }),

    selectedPresetKey: 'FTMO_100K',
    currentPreset: initialPreset,
    accountBalance: initialBalance,
    currentEquity: initialBalance,
    todayStartingBalance: initialBalance,
    todayRealizedPnL: 0,

    setPropFirmPreset: (key) => {
      const preset = PROP_FIRM_PRESETS[key] || PROP_FIRM_PRESETS['FTMO_100K'];
      const balance = preset.startingBalance;
      set((state) => {
        const risk = calculatePositionRisk({
          accountBalance: balance,
          currentEquity: balance + state.todayRealizedPnL,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: balance,
          firmPreset: preset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          selectedPresetKey: key,
          currentPreset: preset,
          accountBalance: balance,
          currentEquity: balance + state.todayRealizedPnL,
          todayStartingBalance: balance,
          riskResult: risk
        };
      });
    },

    updateCustomAccount: (balance, dailyMaxLossPercent, totalMaxLossPercent) => {
      set((state) => {
        const customPreset: PropFirmAccountPreset = {
          id: 'CUSTOM',
          firm: 'Custom',
          tierName: `Custom ($${balance.toLocaleString()})`,
          startingBalance: balance,
          dailyLossLimitPercent: dailyMaxLossPercent,
          maxDrawdownPercent: totalMaxLossPercent,
          trailingDrawdown: false,
          balanceBased: true,
          description: `Custom Prop rules: ${dailyMaxLossPercent}% Daily / ${totalMaxLossPercent}% Max Overall.`
        };
        const risk = calculatePositionRisk({
          accountBalance: balance,
          currentEquity: balance + state.todayRealizedPnL,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: balance,
          firmPreset: customPreset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          selectedPresetKey: 'CUSTOM',
          currentPreset: customPreset,
          accountBalance: balance,
          todayStartingBalance: balance,
          currentEquity: balance + state.todayRealizedPnL,
          riskResult: risk
        };
      });
    },

    updatePnL: (todayPnL) => {
      set((state) => {
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.accountBalance + todayPnL,
          todayRealizedPnL: todayPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          todayRealizedPnL: todayPnL,
          currentEquity: state.accountBalance + todayPnL,
          riskResult: risk
        };
      });
    },

    selectedAsset: initialAsset,
    setSelectedAsset: (asset) => {
      set((state) => {
        // Auto adjust default SL/TP to reasonable values for this asset
        const entry = asset.price;
        const slDiff = asset.type === 'FOREX' ? 0.0020 : asset.type === 'COMMODITY' ? 5.0 : 50.0;
        const sl = asset.direction === 'BEARISH' ? entry + slDiff : entry - slDiff;
        const tp = asset.direction === 'BEARISH' ? entry - slDiff * 2 : entry + slDiff * 2;
        
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.currentEquity,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: asset,
          entryPrice: entry,
          stopLossPrice: sl,
          takeProfitPrice: tp,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          selectedAsset: asset,
          entryPrice: entry,
          stopLossPrice: sl,
          takeProfitPrice: tp,
          riskResult: risk
        };
      });
    },

    selectedSetup: null,
    selectSetupForRiskEngine: (setup) => {
      set((state) => {
        const matchedAsset = state.assets.find((a) => a.symbol === setup.asset) || state.selectedAsset;
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.currentEquity,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: matchedAsset,
          entryPrice: setup.entryPrice,
          stopLossPrice: setup.stopLossPrice,
          takeProfitPrice: setup.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          selectedSetup: setup,
          selectedAsset: matchedAsset,
          entryPrice: setup.entryPrice,
          stopLossPrice: setup.stopLossPrice,
          takeProfitPrice: setup.takeProfitPrice,
          activeTab: 'RISK_ENGINE',
          riskResult: risk
        };
      });
    },

    entryPrice: initialEntry,
    stopLossPrice: initialSL,
    takeProfitPrice: initialTP,
    targetRiskPercent: 0.5,
    manualDollarRisk: undefined,

    setTradeLevels: (entry, sl, tp) => {
      set((state) => {
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.currentEquity,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: state.selectedAsset,
          entryPrice: entry,
          stopLossPrice: sl,
          takeProfitPrice: tp,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk
        });
        return {
          entryPrice: entry,
          stopLossPrice: sl,
          takeProfitPrice: tp,
          riskResult: risk
        };
      });
    },

    setTargetRiskPercent: (percent) => {
      set((state) => {
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.currentEquity,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: percent,
          manualDollarRisk: undefined
        });
        return {
          targetRiskPercent: percent,
          manualDollarRisk: undefined,
          riskResult: risk
        };
      });
    },

    setManualDollarRisk: (dollar) => {
      set((state) => {
        const risk = calculatePositionRisk({
          accountBalance: state.accountBalance,
          currentEquity: state.currentEquity,
          todayRealizedPnL: state.todayRealizedPnL,
          todayStartingBalance: state.todayStartingBalance,
          firmPreset: state.currentPreset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: dollar
        });
        return {
          manualDollarRisk: dollar,
          riskResult: risk
        };
      });
    },

    assets: INITIAL_ASSETS,
    economicEvents: INITIAL_ECONOMIC_EVENTS,
    setups: INITIAL_STRATEGY_SETUPS,

    updateAssetPrice: (symbol, newPrice) => {
      set((state) => {
        const updatedAssets = state.assets.map((a) =>
          a.symbol === symbol ? { ...a, price: newPrice } : a
        );
        let updatedSelected = state.selectedAsset;
        if (state.selectedAsset.symbol === symbol) {
          updatedSelected = { ...state.selectedAsset, price: newPrice };
        }
        return {
          assets: updatedAssets,
          selectedAsset: updatedSelected
        };
      });
    },

    riskResult: initialRisk
  };
});
