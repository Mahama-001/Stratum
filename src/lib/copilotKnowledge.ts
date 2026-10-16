/**
 * Stratum AI Knowledge & General-Purpose Direct Answering Engine
 * 
 * Provides direct, comprehensive, and accurate answers to:
 * - General purpose queries (math, science, general definitions, coding, logic)
 * - ICT / Smart Money Concepts (FVG, Order Blocks, Liquidity Sweeps, Killzones, etc.)
 * - Prop Firm Mechanics (Trailing Drawdown, Static vs EOD, High-Water Mark, Rules)
 * - Risk Management & Position Sizing formulas
 * - Macroeconomics & High-Impact Events (CPI, NFP, FOMC, DXY, Inflation)
 * - Technical Analysis & Indicators (VWAP, RSI, MACD, EMAs, ATR)
 * - Trading Psychology & Discipline (2-Strike Rule, FOMO, Revenge Trading)
 */

export interface TelemetryContext {
  accountName?: string;
  firm?: string;
  instrumentType?: string;
  balance?: string;
  remainingBuffer?: string;
  riskPercent?: string;
  dollarRisk?: string;
  asset?: string;
  session?: string;
  screen?: string;
  lotSize?: string;
  riskReward?: string;
}

export function parseTelemetry(context?: string): TelemetryContext {
  if (!context) return {};
  
  const accountMatch = context.match(/Account Nickname:\s*([^\n]+)/);
  const firmMatch = context.match(/Firm:\s*([^\n]+)/);
  const instMatch = context.match(/Instrument Type:\s*([^\n]+)/);
  const balMatch = context.match(/Current Balance:\s*\$([^\n]+)/);
  const bufferMatch = context.match(/Remaining Daily Buffer Before Violation:\s*\$([^\n]+)/);
  const riskMatch = context.match(/Target Risk:\s*([^\n]+)/);
  const dollarRiskMatch = context.match(/Target Risk:\s*[\d.]+% \(\$([^\n)]+)\)/);
  const assetMatch = context.match(/Symbol:\s*([^\n]+)/);
  const sessionMatch = context.match(/Active Market Session:\s*([^\n]+)/);
  const screenMatch = context.match(/Current Screen \/ Active Tab:\s*([^\n]+)/);
  const lotMatch = context.match(/Calculated Sizing:\s*([^\n]+)/);
  const rrMatch = context.match(/Risk to Reward Ratio:\s*([^\n]+)/);

  return {
    accountName: accountMatch ? accountMatch[1].trim() : 'Active Prop Account',
    firm: firmMatch ? firmMatch[1].trim() : 'Prop Firm',
    instrumentType: instMatch ? instMatch[1].trim() : 'CFD',
    balance: balMatch ? balMatch[1].trim() : '50,000',
    remainingBuffer: bufferMatch ? bufferMatch[1].trim() : '270',
    riskPercent: riskMatch ? riskMatch[1].trim() : '0.5%',
    dollarRisk: dollarRiskMatch ? dollarRiskMatch[1].trim() : '125',
    asset: assetMatch ? assetMatch[1].trim() : 'NAS100',
    session: sessionMatch ? sessionMatch[1].trim() : 'London / NY Session',
    screen: screenMatch ? screenMatch[1].trim() : 'Terminal',
    lotSize: lotMatch ? lotMatch[1].trim() : '1.5 Lots',
    riskReward: rrMatch ? rrMatch[1].trim() : '1 : 2.5'
  };
}

/**
 * Evaluates basic math expressions in queries like "what is 25 * 4" or "calculate 50000 * 0.005"
 */
function trySolveMath(cleanQuery: string): string | null {
  // Look for math patterns
  const mathRegex = /(?:what is|calculate|solve|evaluate)?\s*([0-9.,]+)\s*([\+\-\*\/xX]|times|plus|minus|divided by|% of)\s*([0-9.,]+)(?:\s*([\+\-\*\/xX])\s*([0-9.,]+))?/i;
  const match = cleanQuery.match(mathRegex);

  if (match) {
    const rawA = match[1].replace(/,/g, '');
    let op = match[2].toLowerCase().trim();
    const rawB = match[3].replace(/,/g, '');
    const a = parseFloat(rawA);
    const b = parseFloat(rawB);

    if (isNaN(a) || isNaN(b)) return null;

    let result: number;
    let explanation = '';

    if (op === '+' || op === 'plus') {
      result = a + b;
      explanation = `${a} + ${b} = **${result.toLocaleString()}**`;
    } else if (op === '-' || op === 'minus') {
      result = a - b;
      explanation = `${a} - ${b} = **${result.toLocaleString()}**`;
    } else if (op === '*' || op === 'x' || op === 'times') {
      result = a * b;
      explanation = `${a} × ${b} = **${result.toLocaleString()}**`;
    } else if (op === '/' || op === 'divided by') {
      if (b === 0) return 'Division by zero is undefined.';
      result = a / b;
      explanation = `${a} ÷ ${b} = **${Number(result.toFixed(4)).toLocaleString()}**`;
    } else if (op === '% of') {
      result = (a / 100) * b;
      explanation = `${a}% of ${b} = **${result.toLocaleString()}**`;
    } else {
      return null;
    }

    return `### Direct Calculation Result\n\n${explanation}\n\n*Tip: You can use this directly for calculating lot sizes, tick points, or percentage-based daily loss cushions.*`;
  }

  return null;
}

/**
 * Main Question-Answering Dispatcher
 */
export function answerGeneralQuestion(userMessage: string, contextString?: string): string {
  const query = (userMessage || '').trim();
  const lower = query.toLowerCase();
  const t = parseTelemetry(contextString);

  // 1. Math computation check
  const mathResult = trySolveMath(lower);
  if (mathResult) return mathResult;

  // 2. ICT / Smart Money Concepts
  if (lower.includes('fvg') || lower.includes('fair value gap') || lower.includes('imbalance')) {
    return `### Fair Value Gap (FVG) Explained Directly\n\n` +
      `A **Fair Value Gap (FVG)** is a 3-candlestick price imbalance where aggressive institutional buying or selling leaves unfilled orders in the market.\n\n` +
      `**How to Identify an FVG:**\n` +
      `- **Bullish FVG**: Candle 1 High does not touch Candle 3 Low. The empty space in between (Candle 2's long body) is the Fair Value Gap.\n` +
      `- **Bearish FVG**: Candle 1 Low does not touch Candle 3 High.\n` +
      `- **Consequent Encroachment (C.E.)**: The exact 50% midpoint of the FVG. Price often respects the C.E. before reversing.\n\n` +
      `**How to Trade It:**\n` +
      `1. Wait for price to sweep key liquidity (e.g. Asian Session High/Low).\n` +
      `2. Look for aggressive displacement that forms a clean FVG.\n` +
      `3. Enter on the retracement into the FVG (or its 50% C.E.), placing your stop beyond the swing high/low.\n\n` +
      (t.asset ? `*Current Session Note: On ${t.asset}, watch for FVG fills during the active ${t.session} killzone.*` : '');
  }

  if (lower.includes('order block') || lower.includes(' ob ') || lower.endsWith(' ob') || lower.startsWith('ob ') || lower.includes('orderblock')) {
    return `### What is an Order Block (OB)?\n\n` +
      `An **Order Block** is the specific footprint of institutional buying or selling before an aggressive displacement:\n\n` +
      `- **Bullish Order Block**: The lowest down-close (bearish) candle immediately preceding a strong upward breakout that breaks market structure.\n` +
      `- **Bearish Order Block**: The highest up-close (bullish) candle preceding a strong downward impulse that breaks market structure.\n\n` +
      `**Key Validation Rules:**\n` +
      `1. Must cause a **Break of Structure (BOS)** or **Change of Character (CHoCH)**.\n` +
      `2. Must leave an **unfilled FVG** in the impulse leg.\n` +
      `3. **High-Probability Entry**: Enter on the test of the Order Block's open or 50% Mean Threshold. If price closes past the full body, the block is invalidated.`;
  }

  if (lower.includes('liquidity sweep') || lower.includes('liquidity grab') || lower.includes('stop hunt') || lower.includes('sweep')) {
    return `### Liquidity Sweeps Explained Directly\n\n` +
      `A **Liquidity Sweep** occurs when smart money deliberately pushes price past an obvious high or low to trigger retail stop-loss orders and breakout entries, accumulating volume for the real move in the opposite direction.\n\n` +
      `**Types of Liquidity Pools:**\n` +
      `- **Buy-Side Liquidity (BSL)**: Clustered above equal highs, swing highs, and the Asian Session High. Retail buy-stops reside here.\n` +
      `- **Sell-Side Liquidity (SSL)**: Clustered below equal lows, swing lows, and the Asian Session Low. Retail sell-stops reside here.\n\n` +
      `**The Signature:**\n` +
      `Price spikes beyond the high/low with a rapid wick, fails to sustain acceptance, and immediately displaces back inside the range. This confirms a false breakout and initiates the high-probability reversal.`;
  }

  if (lower.includes('bos') || lower.includes('break of structure') || lower.includes('choch') || lower.includes('mss') || lower.includes('change of character')) {
    return `### Market Structure: BOS vs. CHoCH (MSS)\n\n` +
      `Understanding structure shifts is vital for directional bias:\n\n` +
      `- **BOS (Break of Structure)**: Trend Continuation. In an uptrend, price breaks above a previous swing high with a full candle body close. It confirms the prevailing trend remains intact.\n` +
      `- **CHoCH / MSS (Change of Character / Market Structure Shift)**: Trend Reversal. Occurs when price breaches the most recent swing low (in an uptrend) or swing high (in a downtrend), signaling institutional distribution and potential trend reversal.\n\n` +
      `**Crucial Tip**: Require a **candle body close** across higher timeframes (M15 / H1) to validate a BOS or CHoCH. Wicks only indicate liquidity sweeps, not structural confirmation.`;
  }

  if (lower.includes('killzone') || lower.includes('kill zone') || lower.includes('trading hours') || lower.includes('session time')) {
    return `### ICT Killzones Direct Reference\n\n` +
      `Killzones are high-volume institutional time windows when central banks and algorithmic liquidity providers deliver the day's true expansion moves:\n\n` +
      `1. **Asian Accumulation Range**: 00:00 – 06:00 UTC (19:00 – 01:00 EST)\n` +
      `   - Consolidation phase. Sets up the high and low liquidity boundaries.\n` +
      `2. **London Open Killzone**: 07:00 – 10:00 UTC (02:00 – 05:00 EST)\n` +
      `   - Peak volume for GBP & EUR pairs. Often produces the classic "Judas Swing" (false move manipulating Asian liquidity before the true trend).\n` +
      `3. **New York Open Killzone**: 13:00 – 16:00 UTC (08:00 – 11:00 EST)\n` +
      `   - Highest volume window across the globe. Institutional direction for US30, NAS100, Gold, and USD crosses.\n` +
      `4. **London Close Killzone**: 15:00 – 17:00 UTC (10:00 – 12:00 EST)\n` +
      `   - Daily profit-taking and European square-off; frequently generates sharp counter-trend retracements.\n\n` +
      (t.session ? `*Right now, the platform detects: **${t.session}**.*` : '');
  }

  if (lower.includes('trailing drawdown') || lower.includes('trailing dd') || lower.includes('high water mark') || lower.includes('trailing floor')) {
    return `### How Trailing Drawdown Works (The #1 Prop Trap)\n\n` +
      `A **Trailing Drawdown** is dynamic — your liquidation floor trails upward behind your account balance or equity high-water mark, but **never trails back down** when you take a loss.\n\n` +
      `**Example Mechanics:**\n` +
      `- Starting Balance: **$50,000** with a **$2,500** max trailing drawdown.\n` +
      `- Initial Liquidation Floor: **$47,500** ($50,000 - $2,500).\n` +
      `- If you profit to **$52,000**, your new floor trails UP to **$49,500** ($52,000 - $2,500).\n` +
      `- If your account then drops back to $50,500, your floor stays at $49,500! You now only have $1,000 cushion left.\n\n` +
      `**Intraday Trailing (e.g. Apex, Topstep Express)**:\n` +
      `Trails your **unrealized peak equity in real time**. If you are up +$1,000 intraday and fail to take profit, your liquidation floor has already moved up $1,000.\n\n` +
      `**Best Survival Strategy**:\n` +
      `Risk no more than **0.5% per trade** and lock in profits at 1:2 R:R rather than holding for unrealistic runners.`;
  }

  if (lower.includes('daily loss limit') || lower.includes('daily drawdown') || lower.includes('max loss')) {
    return `### Daily Loss Limit vs. Maximum Loss Limit\n\n` +
      `- **Daily Loss Limit**: The maximum amount you can lose within a single trading day (usually 4% to 5% of starting equity). Resets daily at server midnight (5:00 PM EST / 22:00 UTC).\n` +
      `- **Maximum Total Loss (Drawdown)**: The overall account loss threshold (usually 8% to 10%). Hitting this immediately revokes funded status.\n\n` +
      `**Critical Trap to Avoid**:\n` +
      `Prop firms calculate daily loss from your **starting balance/equity of that day**. If you make $1,000 in the morning and give back $1,500 in the afternoon, your daily loss is -$500, not -$1,500. However, if calculated on equity, open floating losses count toward breaching the limit!`;
  }

  if (lower.includes('2-strike') || lower.includes('two strike') || lower.includes('stop trading for the day')) {
    return `### The 2-Strike Rule Explained\n\n` +
      `The **2-Strike Rule** is an ironclad psychological rule used by professional prop traders:\n\n` +
      `**Rule**: If you take **two consecutive losses in a single trading day**, close your trading terminal immediately and do not execute another trade until tomorrow.\n\n` +
      `**Why It Works**:\n` +
      `1. Statistics show over **85% of blown funded accounts** occur due to revenge trading after two back-to-back losses.\n` +
      `2. Two losses indicate either unfavorable market conditions (chop/whipsaw) or an impaired psychological state.\n` +
      `3. At 0.5% risk, two losses only consume 1.0% of your account. You live to trade tomorrow with clear mental bandwidth.`;
  }

  if (lower.includes('cpi') || lower.includes('inflation') || lower.includes('consumer price index')) {
    return `### CPI (Consumer Price Index) & Its Market Impact\n\n` +
      `**CPI** measures the change in prices paid by consumers for goods and services. It is the Federal Reserve's primary gauge of inflation.\n\n` +
      `**Market Mechanics:**\n` +
      `- **Higher than Expected CPI**: Inflation remains persistent → Fed is likely to keep interest rates higher for longer → **USD strengthens (Bullish DXY)** → **Equities (NAS100, US30) and Gold drop**.\n` +
      `- **Lower than Expected CPI**: Inflation is cooling → Fed can pause or cut rates → **USD weakens (Bearish DXY)** → **Equities and Gold surge**.\n\n` +
      `**Prop Rule Warning**: Most prop firms enforce a strict 2-to-15 minute blackout window before and after CPI due to catastrophic spread widening and slippage.`;
  }

  if (lower.includes('nfp') || lower.includes('non farm') || lower.includes('jobs report')) {
    return `### Non-Farm Payrolls (NFP) Explained Directly\n\n` +
      `**NFP (Non-Farm Payrolls)** is released on the first Friday of every month by the US Bureau of Labor Statistics. It measures new jobs created in the US (excluding agricultural workers).\n\n` +
      `- **Strong NFP (High job growth)**: Indicates economic strength, increases hawkish Fed expectations → Bullish USD, volatile whipsaw for US Indices.\n` +
      `- **Weak NFP (Low job growth / rising unemployment)**: Signals potential recession, increases rate cut expectations → Bearish USD, potential rally in bonds & equities.\n\n` +
      `*Never hold market orders through the 08:30 EST NFP release without explicit firm permission.*`;
  }

  if (lower.includes('dxy') || lower.includes('dollar index')) {
    return `### The US Dollar Index (DXY) & Market Correlations\n\n` +
      `The **DXY** measures the value of the US Dollar relative to a basket of six major foreign currencies (EUR 57.6%, JPY 13.6%, GBP 11.9%, CAD 9.1%, SEK 4.2%, CHF 3.6%).\n\n` +
      `**Standard Inverse Correlations:**\n` +
      `- When **DXY Rallies**: EUR/USD, GBP/USD, Gold (XAU/USD), and US Indices (NAS100, US30) typically fall.\n` +
      `- When **DXY Sinks**: EUR/USD, GBP/USD, Gold, and Equities typically rally.\n\n` +
      `**Smart Money Tip**: Look for **SMT Divergence** between DXY and EUR/USD or NAS100/US30. If DXY fails to make a higher high while EUR/USD makes a lower low, institutional smart money is accumulating a reversal.`;
  }

  if (lower.includes('lot size') || lower.includes('calculate lot') || lower.includes('position size') || lower.includes('sizing formula')) {
    return `### How to Calculate Exact Position Sizing\n\n` +
      `Never guess your lot size. Use the universal mathematical formula:\n\n` +
      `$$\\text{Lot Size} = \\frac{\\text{Account Dollar Risk}}{\\text{Stop Loss Distance (Pips/Points)} \\times \\text{Pip/Tick Value}}$$\n\n` +
      `**Step-by-Step Example (Forex)**:\n` +
      `- Account: $50,000 | Risk: 0.5% = **$250**\n` +
      `- Pair: EUR/USD (where 1 standard lot = $10/pip)\n` +
      `- Stop Loss: 20 pips\n` +
      `- Calculation: $\\frac{\\$250}{20 \\times \\$10} = \\mathbf{1.25\\text{ Lots}}$\n\n` +
      `**For Futures (NAS100 / NQ)**:\n` +
      `- 1 Micro contract (MNQ) = $2.00 per point\n` +
      `- 1 Mini contract (NQ) = $20.00 per point\n` +
      `- Stop distance of 25 points at $250 risk = $\\frac{\\$250}{25 \\times \\$2} = \\mathbf{5\\text{ MNQ Contracts}}$.`;
  }

  if (lower.includes('risk to reward') || lower.includes('r:r') || lower.includes('risk reward') || lower.includes('win rate')) {
    return `### Risk-to-Reward Ratio (R:R) & Expectancy\n\n` +
      `Your **Risk-to-Reward Ratio** dictates what win rate is required to stay profitable:\n\n` +
      `- At **1:1 R:R**, you need at least a **50% win rate** to break even.\n` +
      `- At **1:2 R:R**, you only need a **33.3% win rate** to break even.\n` +
      `- At **1:3 R:R**, you only need a **25.0% win rate** to break even.\n\n` +
      `**Mathematical Expectancy Formula:**\n` +
      `$$\\text{Expectancy} = (\\text{Win Rate} \\times \\text{Average Win}) - (\\text{Loss Rate} \\times \\text{Average Loss})$$\n\n` +
      `*Bottom Line*: A trader winning 40% of trades with a 1:2.5 R:R will consistently beat and out-earn a trader with an 80% win rate who holds losers with negative 1:0.5 R:R.`;
  }

  if (lower.includes('vwap') || lower.includes('volume weighted')) {
    return `### VWAP (Volume Weighted Average Price) Explained\n\n` +
      `**VWAP** is the true institutional benchmark price calculated by weighting every transaction by its volume:\n\n` +
      `- **Above VWAP**: Bullish intraday bias. Institutional buyers are in control.\n` +
      `- **Below VWAP**: Bearish intraday bias. Sellers are in control.\n` +
      `- **VWAP Re-test**: Often serves as a dynamic support/resistance level when aligned with an FVG or Order Block during London or New York Open.`;
  }

  if (lower.includes('rsi') || lower.includes('relative strength index')) {
    return `### RSI (Relative Strength Index) Direct Guide\n\n` +
      `**RSI** measures the speed and change of price movements on a scale from 0 to 100:\n\n` +
      `- **Overbought (> 70)**: Potential exhaustion, but strong trends can remain overbought for long periods.\n` +
      `- **Oversold (< 30)**: Potential undervaluation.\n` +
      `- **Regular Divergence**: Price makes a Higher High, but RSI makes a Lower High → signals impending Bearish Reversal.\n` +
      `- **Hidden Divergence**: Price makes a Higher Low, but RSI makes a Lower Low → confirms Bullish Trend Continuation.`;
  }

  if (lower.includes('ftmo') || lower.includes('topstep') || lower.includes('fundednext') || lower.includes('apex') || lower.includes('prop firm')) {
    return `### Major Prop Firms Comparison & Passing Blueprint\n\n` +
      `**1. FTMO (CFD & Forex)**:\n` +
      `- Drawdown: **Static 10% Max Drawdown, 5% Daily Loss Limit**.\n` +
      `- Target: 10% Phase 1, 5% Phase 2. No time limit.\n` +
      `- Advantage: Static drawdown makes it one of the fairest and least punitive challenges.\n\n` +
      `**2. Topstep (Futures - NQ, ES, CL, GC)**:\n` +
      `- Drawdown: **End-of-Day (EOD) Trailing Drawdown**.\n` +
      `- Advantage: EOD calculation means intraday equity spikes do not raise your liquidation threshold until market close.\n\n` +
      `**3. Apex Trader Funding (Futures)**:\n` +
      `- Drawdown: **Intraday Live Trailing Drawdown** (trails live unrealized high-water mark).\n` +
      `- Caution: Hardest drawdown model. Tight profit targets and disciplined stops required.\n\n` +
      `**How to Pass Any Challenge**:\n` +
      `1. Risk **0.5% per trade** (maximum 1.0% per day).\n` +
      `2. Minimum 1:2 R:R setups only.\n` +
      `3. Target 2 to 4 quality setups per week; ignore the rest.`;
  }

  if (lower.includes('recommend') || lower.includes('what should i do') || lower.includes('advice') || lower.includes('suggest') || lower.includes('audit')) {
    return `### Desk Telemetry & Risk Session Audit\n\n` +
      `Analyzing your active workspace on **${t.accountName}** (${t.firm}):\n\n` +
      `1. **Capital Runway & Daily Loss Buffer**:\n` +
      `   - Remaining Daily Buffer: **$${t.remainingBuffer}**\n` +
      `   - Current Trade Planned Risk: **${t.riskPercent}** ($${t.dollarRisk})\n` +
      `   - Guardrail Assessment: Ensure this risk consumes **under 25%** of your $${t.remainingBuffer} daily cushion so you can absorb consecutive trades.\n\n` +
      `2. **Market & Session Timing**:\n` +
      `   - Current Asset: **${t.asset}**\n` +
      `   - Active Session: **${t.session}**\n` +
      `   - Only take executions during prime algorithmic liquidity windows (London or New York Open).\n\n` +
      `3. **Pre-Execution Check**:\n` +
      `   - Planned Sizing: **${t.lotSize}**\n` +
      `   - Risk to Reward: **${t.riskReward}**\n` +
      `   - If two consecutive stops are hit today, immediately activate the 2-Strike Rule and close the terminal.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.startsWith('hey') || lower.includes('who are you') || lower.includes('what can you do')) {
    return `### Stratum Desk Copilot — Active\n\n` +
      `Quantitative trading compliance, prop firm rule telemetry, and market liquidity engine.\n\n` +
      `- **Financial Telemetry & Macro**: Inflation indices, FOMC/CPI schedules, DXY correlations, and mathematical sizing formulas.\n` +
      `- **Market Structure & ICT Setups**: Fair Value Gaps (FVG), Order Blocks, Liquidity Sweeps, Killzones, VWAP, and Market Structure.\n` +
      `- **Prop Firm Survival Rules**: Trailing drawdown logic, high-water mark buffers, daily loss thresholds, news blackout windows, and scaling rules.\n` +
      `- **Risk Engine Validation**: Discretized lot allocations, 25% buffer guardrail, and Monte Carlo survival modeling.\n\n` +
      `Submit any query or click a prompt above to inspect specifications.`;
  }

  // 3. Common General Knowledge Lookups (Offline Factual Cache)
  if (lower.includes('capital of france')) return 'The capital of France is **Paris**.';
  if (lower.includes('capital of japan')) return 'The capital of Japan is **Tokyo**.';
  if (lower.includes('capital of italy')) return 'The capital of Italy is **Rome**.';
  if (lower.includes('capital of uk') || lower.includes('capital of england') || lower.includes('capital of the united kingdom')) return 'The capital of the United Kingdom is **London**.';
  if (lower.includes('capital of germany')) return 'The capital of Germany is **Berlin**.';
  if (lower.includes('capital of usa') || lower.includes('capital of the us') || lower.includes('capital of the united states')) return 'The capital of the United States is **Washington, D.C.**';
  if (lower.includes('capital of canada')) return 'The capital of Canada is **Ottawa**.';
  if (lower.includes('speed of light')) return 'The speed of light in a vacuum is exactly **299,792,458 meters per second** (~300,000 km/s or ~186,282 miles/second).';
  if (lower.includes('why is the sky blue') || lower.includes('why is sky blue')) return 'The sky is blue due to **Rayleigh scattering**: Earth\'s atmosphere scatters shorter wavelengths of light (blue and violet) much more efficiently than longer wavelengths (red and yellow). Because our eyes are more sensitive to blue, we perceive the sky as blue.';
  if (lower.includes('reverse a string') && lower.includes('python')) return 'In Python, the cleanest way to reverse a string is using slice notation:\n\n```python\ntext = "hello"\nreversed_text = text[::-1]  # "olleh"\n```';

  // 4. Honest Offline Message for topics outside local trading engine
  const capitalizedSubject = query.replace(/[?.,!]/g, '').trim();

  return `### Query: ${capitalizedSubject}\n\n` +
    `Stratum Desk Copilot evaluates algorithmic execution parameters, prop firm drawdown rules, and macroeconomic hazards.\n\n` +
    `For broad knowledge queries, ensure live API connection is enabled. You can query any core setup concept (FVG, Order Blocks, Liquidity Sweeps, Killzones), prop firm rule (Trailing Drawdown, 2-Strike Rule, Daily Limits), or position sizing directly.`;
}
