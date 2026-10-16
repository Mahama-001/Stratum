import { test } from 'node:test';
import assert from 'node:assert';
import { STRATUM_THEMES, type StratumThemeId } from '../src/lib/types.ts';

test('Theme System - Minimalist Apple Pro Theme Configured as Universal Design System', () => {
  const expectedTheme: StratumThemeId = 'apple';

  assert.strictEqual(STRATUM_THEMES.length, 1, 'Should have exactly 1 unified minimalist Apple theme');

  const theme = STRATUM_THEMES.find((t) => t.id === expectedTheme);
  assert.ok(theme, 'Apple theme must exist in STRATUM_THEMES');
  assert.strictEqual(theme.name, 'Minimalist Apple Pro');
  assert.strictEqual(theme.primaryColor, '#0071e3', 'Primary color must be Apple Blue #0071e3');
  assert.strictEqual(theme.accentColor, '#2997ff', 'Accent color must be Apple Light Blue #2997ff');
  assert.ok(theme.borderColor && theme.borderColor.length > 0, 'Must have subtle frosted border');
  assert.ok(theme.glowColor && theme.glowColor.length > 0, 'Must have subtle glow color');
  assert.ok(theme.badgeBg && theme.badgeBg.length > 0, 'Must have badge background');
});

test('Theme System - WCAG AA High Contrast Text Alignment', () => {
  for (const theme of STRATUM_THEMES) {
    assert.ok(
      theme.primaryTextColor === '#ffffff' || theme.primaryTextColor === '#000000',
      `Theme "${theme.id}" primaryTextColor must be #ffffff or #000000 for high contrast`
    );
    assert.strictEqual(
      theme.primaryTextColor,
      '#ffffff',
      'Apple Blue #0071e3 requires white text (#ffffff) for WCAG AA compliance'
    );
  }
});

test('Theme System - Single Source of Truth for Website Theme', () => {
  const ids = STRATUM_THEMES.map((t) => t.id);
  assert.strictEqual(ids.length, 1);
  assert.strictEqual(ids[0], 'apple');
});
