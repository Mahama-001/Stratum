import { test } from 'node:test';
import assert from 'node:assert';

function cleanAndTokenize(text: string): { hasRawDoubleAsterisk: boolean } {
  // Same logic used in FormattedAIMessage
  let sanitized = text;
  const count = (sanitized.match(/\*\*/g) || []).length;
  if (count % 2 === 1) {
    sanitized += '**';
  }

  // Tokenize and clean
  const tokenRegex = /(`[^`]+`|\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__)/g;
  const parts = sanitized.split(tokenRegex);

  let outputText = '';
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('`') && part.endsWith('`')) {
      outputText += part.slice(1, -1);
    } else if (part.startsWith('***') && part.endsWith('***')) {
      outputText += part.slice(3, -3);
    } else if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      outputText += part.slice(2, -2).replace(/\*\*/g, '');
    } else {
      outputText += part.replace(/\*\*/g, '');
    }
  }

  return {
    hasRawDoubleAsterisk: outputText.includes('**')
  };
}

test('AI Copilot - Eliminates raw double asterisks from standard markdown bold', () => {
  const input = 'A **Fair Value Gap (FVG)** is a 3-candlestick price imbalance';
  const result = cleanAndTokenize(input);
  assert.strictEqual(result.hasRawDoubleAsterisk, false);
});

test('AI Copilot - Eliminates raw double asterisks from section headings like **How to Identify:**', () => {
  const input = '**How to Identify an FVG:**\n- **Bullish FVG**: Candle 1 High does not touch Candle 3 Low.';
  const result = cleanAndTokenize(input);
  assert.strictEqual(result.hasRawDoubleAsterisk, false);
});

test('AI Copilot - Eliminates raw double asterisks from unfinished streaming text', () => {
  const input = 'Here is an unclosed **streaming delta token';
  const result = cleanAndTokenize(input);
  assert.strictEqual(result.hasRawDoubleAsterisk, false);
});

test('AI Copilot - Handles math and complex characters inside bold', () => {
  const input = 'Check **100% * 2** calculation and **$50,000** balance';
  const result = cleanAndTokenize(input);
  assert.strictEqual(result.hasRawDoubleAsterisk, false);
});

test('AI Copilot - Strips stray accidental double asterisks', () => {
  const input = 'Stray ** markers ** in the text';
  const result = cleanAndTokenize(input);
  assert.strictEqual(result.hasRawDoubleAsterisk, false);
});
