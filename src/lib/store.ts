import { create } from 'zustand';
import { 
  PropFirmKey, 
  PropFirmAccountPreset, 
  UserPurchasedAccount,
  InstrumentCategory,
  MarketAsset, 
  EconomicEvent, 
  StrategySetup, 
  RiskCalculationResult,
  StampedRiskTicket,
  StratumTab,
  StratumThemeId,
  AuthUser,
  ToastNotification,
  TrafficLightStatus
} from './types';
import { PROP_FIRM_PRESETS, calculatePositionRisk } from './riskEngine';
import { INITIAL_ASSETS, INITIAL_ECONOMIC_EVENTS, INITIAL_STRATEGY_SETUPS, generateLiveEconomicEvents } from './mockData';
import { soundEngine } from './soundEngine';

const INITIAL_PURCHASED_ACCOUNTS: UserPurchasedAccount[] = [
  {
    id: 'ACC-01',
    accountNickname: 'FundedNext Stellar $6K',
    presetId: 'FUNDEDNEXT_STELLAR_6K',
    instrumentType: 'CFD',
    firm: 'FundedNext',
    modelName: 'Stellar 2-Step',
    startingBalance: 6000,
    currentBalance: 6000,
    currentEquity: 6000,
    todayStartingBalance: 6000,
    todayRealizedPnL: 0,
    phase: 'PHASE_1',
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    maxRiskPerTradePercent: 3.0,
    maxContractsOrLots: 5.0,
    newsTradingAllowed: true,
    newsBlackoutMinutes: 15,
    guardrailPercent: 25.0,
    challengePrice: 59.99,
    avgRewardDollar: 296.55,
    isActive: true
  },
  {
    id: 'ACC-02',
    accountNickname: 'Topstep $50k Futures',
    presetId: 'TOPSTEP_50K',
    instrumentType: 'FUTURES',
    firm: 'Topstep',
    modelName: 'Trading Combine',
    startingBalance: 50000,
    currentBalance: 50000,
    currentEquity: 50000,
    todayStartingBalance: 50000,
    todayRealizedPnL: 0,
    phase: 'PHASE_1',
    dailyLossLimitPercent: 2.0,
    maxDrawdownPercent: 4.0,
    drawdownType: 'EOD_TRAILING',
    maxRiskPerTradePercent: 2.0,
    maxContractsOrLots: 5,
    newsTradingAllowed: true,
    newsBlackoutMinutes: 5,
    guardrailPercent: 25.0,
    challengePrice: 49.00,
    isActive: false
  },
  {
    id: 'ACC-03',
    accountNickname: 'FTMO $100k Standard',
    presetId: 'FTMO_100K',
    instrumentType: 'CFD',
    firm: 'FTMO',
    modelName: 'Standard Challenge',
    startingBalance: 100000,
    currentBalance: 100000,
    currentEquity: 100000,
    todayStartingBalance: 100000,
    todayRealizedPnL: 0,
    phase: 'PHASE_1',
    dailyLossLimitPercent: 5.0,
    maxDrawdownPercent: 10.0,
    drawdownType: 'STATIC',
    maxRiskPerTradePercent: 2.0,
    maxContractsOrLots: 50.0,
    newsTradingAllowed: true,
    newsBlackoutMinutes: 2,
    guardrailPercent: 25.0,
    challengePrice: 540.00,
    isActive: false
  },
  {
    id: 'ACC-04',
    accountNickname: 'Apex $150k Full Trailing',
    presetId: 'APEX_150K',
    instrumentType: 'FUTURES',
    firm: 'Apex',
    modelName: 'Full Contract',
    startingBalance: 150000,
    currentBalance: 150000,
    currentEquity: 150000,
    todayStartingBalance: 150000,
    todayRealizedPnL: 0,
    phase: 'PHASE_1',
    dailyLossLimitPercent: 0, // No daily limit on Apex
    maxDrawdownPercent: 3.33,
    drawdownType: 'INTRADAY_TRAILING',
    maxRiskPerTradePercent: 2.0,
    maxContractsOrLots: 17,
    newsTradingAllowed: true,
    newsBlackoutMinutes: 0,
    guardrailPercent: 25.0,
    challengePrice: 85.00,
    isActive: false
  }
];

interface StratumState {
  // Navigation
  activeTab: StratumTab;
  setActiveTab: (tab: StratumTab) => void;

  // Visual Theme & Color Appearance Mode
  currentTheme: StratumThemeId;
  setTheme: (theme: StratumThemeId) => void;
  colorMode: 'light' | 'dark';
  setColorMode: (mode: 'light' | 'dark') => void;
  toggleColorMode: () => void;

  // Beginner Friendly Guidance Mode
  beginnerMode: boolean;
  toggleBeginnerMode: () => void;
  setBeginnerMode: (val: boolean) => void;

  // Institutional Audio Telemetry Sound Effects
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (val: boolean) => void;

  // Desk Copilot Button & Console state
  copilotVisible: boolean;
  toggleCopilotVisible: () => void;
  setCopilotVisible: (visible: boolean) => void;
  copilotOpen: boolean;
  toggleCopilotOpen: () => void;
  setCopilotOpen: (open: boolean) => void;

  // Percentage vs Dollar view toggle (as shown in FundedNext screenshot)
  showPercentageView: boolean;
  setShowPercentageView: (show: boolean) => void;

  // Interactive Onboarding Tutorial
  tutorialOpen: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  closeTutorial: () => void;
  setTutorialStep: (step: number) => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;

  // Account selector modal open
  accountModalOpen: boolean;
  setAccountModalOpen: (open: boolean) => void;

  // User Authentication
  currentUser: AuthUser | null;
  authLoading: boolean;
  authModalOpen: boolean;
  authModalMode: 'LOGIN' | 'SIGNUP';
  setAuthModalOpen: (open: boolean, mode?: 'LOGIN' | 'SIGNUP') => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  fetchSession: () => Promise<void>;
  logoutUser: () => Promise<void>;

  // Toast Notifications
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'> | ToastNotification) => void;
  removeToast: (id: string) => void;

  // Instrument filter (CFD vs FUTURES vs ALL)
  instrumentFilter: 'ALL' | 'CFD' | 'FUTURES';
  setInstrumentFilter: (filter: 'ALL' | 'CFD' | 'FUTURES') => void;

  // User Purchased Accounts list & active account
  userPurchasedAccounts: UserPurchasedAccount[];
  activeAccountId: string;
  selectPurchasedAccount: (accountId: string) => void;
  addPurchasedAccount: (account: UserPurchasedAccount) => void;
  updateAccountTuning: (accountId: string, updates: Partial<UserPurchasedAccount>) => void;
  applyPresetAsPurchasedAccount: (presetId: string, nickname?: string) => void;

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
  setEconomicEvents: (events: EconomicEvent[]) => void;
  refreshEconomicEvents: () => void;
  syncLiveNewsTick: () => void;

  // Computed Risk
  riskResult: RiskCalculationResult;

  // Stamped Risk Execution Ticket
  lastStampedTicket: StampedRiskTicket | null;
  stampRiskParameters: () => StampedRiskTicket | null;
  clearStampedTicket: () => void;
}

export const useStratumStore = create<StratumState>((set, get) => {
  const initialPreset = PROP_FIRM_PRESETS['FUNDEDNEXT_STELLAR_6K'] || PROP_FIRM_PRESETS['FTMO_100K'];
  const initialAsset = INITIAL_ASSETS[0]; // EUR/USD
  const initialEntry = initialAsset.price;
  const initialSL = initialAsset.price - 0.0015; // 15 pips
  const initialTP = initialAsset.price + 0.0030; // 30 pips
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
    activeTab: 'LANDING',
    setActiveTab: (tab) => set({ activeTab: tab }),

    currentTheme: 'apple',
    setTheme: (theme) => {
      set({ currentTheme: 'apple' });
    },

    colorMode: 'light',
    setColorMode: (mode) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stratum-color-mode', mode);
        } catch (e) {}
        document.documentElement.setAttribute('data-theme', mode);
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      set({ colorMode: mode });
    },
    toggleColorMode: () => {
      const next = get().colorMode === 'dark' ? 'light' : 'dark';
      get().setColorMode(next);
    },

    beginnerMode: true,
    toggleBeginnerMode: () => set((state) => ({ beginnerMode: !state.beginnerMode })),
    setBeginnerMode: (val) => set({ beginnerMode: val }),

    soundEnabled: true,
    toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    setSoundEnabled: (val) => set({ soundEnabled: val }),

    copilotVisible: true,
    toggleCopilotVisible: () => set((state) => {
      const nextVisible = !state.copilotVisible;
      return {
        copilotVisible: nextVisible,
        copilotOpen: false, // Toggling the button visibility never opens the console dialog
      };
    }),
    setCopilotVisible: (visible) => set({
      copilotVisible: visible,
      copilotOpen: false,
    }),

    copilotOpen: false,
    toggleCopilotOpen: () => set((state) => ({
      copilotOpen: !state.copilotOpen,
    })),
    setCopilotOpen: (open) => set({
      copilotOpen: open,
    }),

    showPercentageView: true,
    setShowPercentageView: (show) => set({ showPercentageView: show }),

    // Interactive Onboarding Tutorial
    tutorialOpen: false,
    tutorialStep: 0,
    startTutorial: () => set({ tutorialOpen: true, tutorialStep: 0, activeTab: 'LANDING' }),
    closeTutorial: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stratum_tutorial_completed', 'true');
        } catch (e) {
          // ignore
        }
      }
      set({ tutorialOpen: false });
    },
    setTutorialStep: (step: number) => set({ tutorialStep: step }),
    nextTutorialStep: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),
    prevTutorialStep: () => set((state) => ({ tutorialStep: Math.max(0, state.tutorialStep - 1) })),

    accountModalOpen: false,
    setAccountModalOpen: (open) => set({ accountModalOpen: open }),

    // User Authentication
    currentUser: null,
    authLoading: true,
    authModalOpen: false,
    authModalMode: 'LOGIN',
    setAuthModalOpen: (open, mode = 'LOGIN') => set({ authModalOpen: open, authModalMode: mode }),
    profileModalOpen: false,
    setProfileModalOpen: (open) => set({ profileModalOpen: open }),
    setCurrentUser: (user) => set({ currentUser: user }),
    fetchSession: async () => {
      try {
        set({ authLoading: true });
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          set({ currentUser: data.user || null, authLoading: false });
        } else {
          set({ currentUser: null, authLoading: false });
        }
      } catch {
        set({ currentUser: null, authLoading: false });
      }
    },
    logoutUser: async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ currentUser: null });
        get().addToast({
          type: 'info',
          title: 'Signed Out',
          message: 'You have been safely signed out.'
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    },

    toasts: [],
    addToast: (toast) => {
      const id = 'id' in toast && toast.id ? toast.id : `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastNotification = { ...toast, id };
      set((state) => ({ toasts: [...state.toasts, newToast] }));
      setTimeout(() => {
        get().removeToast(id);
      }, 4500);
    },
    removeToast: (id) => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    instrumentFilter: 'ALL',
    setInstrumentFilter: (filter) => set({ instrumentFilter: filter }),

    userPurchasedAccounts: INITIAL_PURCHASED_ACCOUNTS,
    activeAccountId: 'ACC-01',

    selectPurchasedAccount: (accountId) => {
      const state = get();
      const account = state.userPurchasedAccounts.find((a) => a.id === accountId);
      if (!account) return;

      const preset = PROP_FIRM_PRESETS[account.presetId] || {
        ...PROP_FIRM_PRESETS['CUSTOM'],
        id: account.presetId,
        firm: account.firm,
        firmDisplayName: account.firm,
        instrumentType: account.instrumentType,
        modelName: account.modelName,
        tierName: account.accountNickname,
        startingBalance: account.startingBalance,
        dailyLossLimitPercent: account.dailyLossLimitPercent,
        maxDrawdownPercent: account.maxDrawdownPercent,
        drawdownType: account.drawdownType,
        maxRiskPerTradePercent: account.maxRiskPerTradePercent,
        maxContracts: account.instrumentType === 'FUTURES' ? account.maxContractsOrLots : undefined,
        guardrailSensitivityPercent: account.guardrailPercent
      };

      const updatedAccounts = state.userPurchasedAccounts.map((a) => ({
        ...a,
        isActive: a.id === accountId
      }));

      const newRisk = calculatePositionRisk({
        accountBalance: account.currentBalance,
        currentEquity: account.currentEquity,
        todayRealizedPnL: account.todayRealizedPnL,
        todayStartingBalance: account.todayStartingBalance,
        firmPreset: preset,
        selectedAsset: state.selectedAsset,
        entryPrice: state.entryPrice,
        stopLossPrice: state.stopLossPrice,
        takeProfitPrice: state.takeProfitPrice,
        targetRiskPercent: state.targetRiskPercent,
        manualDollarRisk: state.manualDollarRisk,
        customGuardrailPercent: account.guardrailPercent
      });

      set({
        activeAccountId: accountId,
        userPurchasedAccounts: updatedAccounts,
        selectedPresetKey: preset.id,
        currentPreset: preset,
        accountBalance: account.currentBalance,
        currentEquity: account.currentEquity,
        todayStartingBalance: account.todayStartingBalance,
        todayRealizedPnL: account.todayRealizedPnL,
        riskResult: newRisk
      });

      get().addToast({
        type: 'info',
        title: 'Account Switched',
        message: `Active: ${account.accountNickname} (${account.firm})`
      });
    },

    addPurchasedAccount: (newAcc) => {
      set((state) => {
        const accounts = [...state.userPurchasedAccounts, newAcc];
        return { userPurchasedAccounts: accounts };
      });
    },

    updateAccountTuning: (accountId, updates) => {
      set((state) => {
        const updatedAccounts = state.userPurchasedAccounts.map((a) => {
          if (a.id === accountId) {
            return { ...a, ...updates };
          }
          return a;
        });

        const activeAcc = updatedAccounts.find((a) => a.id === state.activeAccountId) || updatedAccounts[0];
        const activePreset = {
          ...state.currentPreset,
          startingBalance: activeAcc.startingBalance,
          dailyLossLimitPercent: activeAcc.dailyLossLimitPercent,
          maxDrawdownPercent: activeAcc.maxDrawdownPercent,
          drawdownType: activeAcc.drawdownType,
          maxRiskPerTradePercent: activeAcc.maxRiskPerTradePercent,
          maxContracts: activeAcc.instrumentType === 'FUTURES' ? activeAcc.maxContractsOrLots : undefined,
          guardrailSensitivityPercent: activeAcc.guardrailPercent
        };

        const newRisk = calculatePositionRisk({
          accountBalance: activeAcc.currentBalance,
          currentEquity: activeAcc.currentEquity,
          todayRealizedPnL: activeAcc.todayRealizedPnL,
          todayStartingBalance: activeAcc.todayStartingBalance,
          firmPreset: activePreset,
          selectedAsset: state.selectedAsset,
          entryPrice: state.entryPrice,
          stopLossPrice: state.stopLossPrice,
          takeProfitPrice: state.takeProfitPrice,
          targetRiskPercent: state.targetRiskPercent,
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: activeAcc.guardrailPercent
        });

        return {
          userPurchasedAccounts: updatedAccounts,
          currentPreset: activePreset,
          accountBalance: activeAcc.currentBalance,
          currentEquity: activeAcc.currentEquity,
          todayStartingBalance: activeAcc.todayStartingBalance,
          todayRealizedPnL: activeAcc.todayRealizedPnL,
          riskResult: newRisk
        };
      });
    },

    applyPresetAsPurchasedAccount: (presetId, nickname) => {
      const state = get();
      const preset = PROP_FIRM_PRESETS[presetId] || PROP_FIRM_PRESETS['FUNDEDNEXT_STELLAR_6K'];
      const newId = `ACC-${Date.now().toString().slice(-4)}`;
      const newAccount: UserPurchasedAccount = {
        id: newId,
        accountNickname: nickname || preset.tierName,
        presetId: preset.id,
        instrumentType: preset.instrumentType,
        firm: preset.firm,
        modelName: preset.modelName,
        startingBalance: preset.startingBalance,
        currentBalance: preset.startingBalance,
        currentEquity: preset.startingBalance,
        todayStartingBalance: preset.startingBalance,
        todayRealizedPnL: 0,
        phase: 'PHASE_1',
        dailyLossLimitPercent: preset.dailyLossLimitPercent,
        maxDrawdownPercent: preset.maxDrawdownPercent,
        drawdownType: preset.drawdownType,
        maxRiskPerTradePercent: preset.maxRiskPerTradePercent || 3.0,
        maxContractsOrLots: preset.maxContracts || (preset.startingBalance / 10000),
        newsTradingAllowed: preset.newsTradingAllowed,
        newsBlackoutMinutes: preset.newsTradingAllowed ? 0 : 15,
        guardrailPercent: preset.guardrailSensitivityPercent || 25.0,
        challengePrice: preset.challengePrice,
        avgRewardDollar: preset.avgRewardDollar,
        isActive: true
      };

      const updatedAccounts = state.userPurchasedAccounts.map((a) => ({
        ...a,
        isActive: false
      })).concat(newAccount);

      const newRisk = calculatePositionRisk({
        accountBalance: newAccount.startingBalance,
        currentEquity: newAccount.startingBalance,
        todayRealizedPnL: 0,
        todayStartingBalance: newAccount.startingBalance,
        firmPreset: preset,
        selectedAsset: state.selectedAsset,
        entryPrice: state.entryPrice,
        stopLossPrice: state.stopLossPrice,
        takeProfitPrice: state.takeProfitPrice,
        targetRiskPercent: state.targetRiskPercent,
        manualDollarRisk: state.manualDollarRisk,
        customGuardrailPercent: newAccount.guardrailPercent
      });

      set({
        activeAccountId: newId,
        userPurchasedAccounts: updatedAccounts,
        selectedPresetKey: preset.id,
        currentPreset: preset,
        accountBalance: newAccount.startingBalance,
        currentEquity: newAccount.startingBalance,
        todayStartingBalance: newAccount.startingBalance,
        todayRealizedPnL: 0,
        riskResult: newRisk,
        accountModalOpen: false
      });
    },

    selectedPresetKey: 'FUNDEDNEXT_STELLAR_6K',
    currentPreset: initialPreset,
    accountBalance: initialBalance,
    currentEquity: initialBalance,
    todayStartingBalance: initialBalance,
    todayRealizedPnL: 0,

    setPropFirmPreset: (key) => {
      const preset = PROP_FIRM_PRESETS[key] || PROP_FIRM_PRESETS['FUNDEDNEXT_STELLAR_6K'];
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
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: preset.guardrailSensitivityPercent
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
          firmDisplayName: 'Custom Prop Setup',
          instrumentType: 'CFD',
          modelName: 'Custom Evaluation',
          tierName: `Custom ($${balance.toLocaleString()})`,
          startingBalance: balance,
          dailyLossLimitPercent: dailyMaxLossPercent,
          maxDrawdownPercent: totalMaxLossPercent,
          drawdownType: 'STATIC',
          newsTradingAllowed: true,
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
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
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: activeAcc?.guardrailPercent
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
        const entry = asset.price;
        const slDiff = asset.type === 'FOREX'
          ? (asset.pipSize === 0.01 ? 0.35 : 0.0020)
          : asset.type === 'COMMODITY'
          ? (asset.price > 1000 ? 6.0 : 0.6)
          : asset.type === 'CRYPTO'
          ? (asset.price > 10000 ? 450.0 : 25.0)
          : (asset.price > 10000 ? 50.0 : 15.0);
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
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: activeAcc?.guardrailPercent
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
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
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: activeAcc?.guardrailPercent
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
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
          manualDollarRisk: state.manualDollarRisk,
          customGuardrailPercent: activeAcc?.guardrailPercent
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
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
          manualDollarRisk: undefined,
          customGuardrailPercent: activeAcc?.guardrailPercent
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
        const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
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
          manualDollarRisk: dollar,
          customGuardrailPercent: activeAcc?.guardrailPercent
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

    setEconomicEvents: (events) => set({ economicEvents: events }),
    refreshEconomicEvents: () => {
      const fresh = generateLiveEconomicEvents(Date.now());
      set({ economicEvents: fresh });
    },
    syncLiveNewsTick: () => {
      const now = Date.now();
      set((state) => {
        const updated = state.economicEvents.map((evt) => {
          const scheduled = new Date(evt.scheduledTimeUtc).getTime();
          const diffMinutes = Math.round((scheduled - now) / 60000);
          let status: TrafficLightStatus = 'GREEN';
          let warning: string | undefined = undefined;

          if (evt.impact === 'HIGH') {
            if (diffMinutes >= -15 && diffMinutes <= 15) {
              status = 'RED';
              const remainingBlackout = diffMinutes <= 0 ? 15 - Math.abs(diffMinutes) : diffMinutes + 15;
              warning = diffMinutes <= 0
                ? `PROP FIRM BLACKOUT ACTIVE: Released ${Math.abs(diffMinutes)}m ago. Post-news blackout lifts in ${Math.max(1, remainingBlackout)}m.`
                : `PROP FIRM BLACKOUT ACTIVE: ${diffMinutes}m to release. News trading strictly prohibited (±15m window).`;
            } else if (diffMinutes > 15 && diffMinutes <= 60) {
              status = 'AMBER';
              warning = `HIGH VOLATILITY WARNING: ${diffMinutes}m to Red Folder release. Reduce position size by 50%.`;
            } else {
              status = 'GREEN';
            }
          } else if (evt.impact === 'MEDIUM') {
            if (diffMinutes >= -10 && diffMinutes <= 10) {
              status = 'AMBER';
              warning = `MEDIUM IMPACT RELEASE WINDOW: Spread widening caution (${Math.abs(diffMinutes)}m ${diffMinutes <= 0 ? 'ago' : 'remaining'}).`;
            } else {
              status = 'GREEN';
            }
          }

          return {
            ...evt,
            minutesUntil: diffMinutes,
            status,
            blackoutWarning: warning
          };
        });
        return { economicEvents: updated };
      });
    },

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

    riskResult: initialRisk,

    lastStampedTicket: null,
    stampRiskParameters: () => {
      const state = get();
      if (state.riskResult.isHardBlocked) return null;

      const activeAcc = state.userPurchasedAccounts.find((a) => a.id === state.activeAccountId) || state.userPurchasedAccounts[0];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `STAMP-${randomSuffix}`;
      const isShort = state.stopLossPrice > state.entryPrice;

      const ticket: StampedRiskTicket = {
        ticketId,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
        accountId: activeAcc.id,
        accountNickname: activeAcc.accountNickname,
        firm: activeAcc.firm,
        instrumentType: activeAcc.instrumentType,
        assetSymbol: state.selectedAsset.symbol,
        direction: isShort ? 'SHORT' : 'LONG',
        entryPrice: state.entryPrice,
        stopLossPrice: state.stopLossPrice,
        takeProfitPrice: state.takeProfitPrice,
        lotSize: state.riskResult.lotSize,
        contracts: state.riskResult.contracts,
        dollarRisk: state.riskResult.dollarRisk,
        riskPercentOfBalance: state.riskResult.riskPercentOfBalance,
        rewardDollar: state.riskResult.rewardDollar,
        riskRewardRatio: state.riskResult.riskRewardRatio,
        remainingDailyBufferAfterTrade: state.riskResult.bufferAfterLossDollar,
        guardrailCompliant: !state.riskResult.isBreachDanger,
        isBreachDanger: state.riskResult.isBreachDanger,
        drawdownType: activeAcc.drawdownType
      };

      set({ lastStampedTicket: ticket });
      get().addToast({
        type: 'success',
        title: 'Risk Ticket Stamped',
        message: `${ticket.direction} ${ticket.assetSymbol} | Lot: ${ticket.lotSize || ticket.contracts} | R:R 1:${ticket.riskRewardRatio.toFixed(1)}`
      });
      return ticket;
    },
    clearStampedTicket: () => set({ lastStampedTicket: null })
  };
});
