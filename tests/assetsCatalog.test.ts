import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_ASSETS } from '../src/lib/mockData.ts';

test('Expanded Assets Catalog - Integrity & Diversity Checks', async (t) => {
  await t.test('Asset count exceeds 80 institutional instruments', () => {
    assert.ok(
      INITIAL_ASSETS.length >= 80,
      `Expected at least 80 assets, got ${INITIAL_ASSETS.length}`
    );
  });

  await t.test('All 4 major prop trading asset classes are represented', () => {
    const indices = INITIAL_ASSETS.filter((a) => a.type === 'INDEX');
    const forex = INITIAL_ASSETS.filter((a) => a.type === 'FOREX');
    const commodities = INITIAL_ASSETS.filter((a) => a.type === 'COMMODITY');
    const crypto = INITIAL_ASSETS.filter((a) => a.type === 'CRYPTO');

    assert.ok(indices.length >= 15, `Expected >= 15 indices, got ${indices.length}`);
    assert.ok(forex.length >= 30, `Expected >= 30 forex pairs, got ${forex.length}`);
    assert.ok(commodities.length >= 15, `Expected >= 15 commodities, got ${commodities.length}`);
    assert.ok(crypto.length >= 18, `Expected >= 18 crypto assets, got ${crypto.length}`);
  });

  await t.test('All assets have valid positive prices, pip sizes, and point multipliers', () => {
    const symbols = new Set<string>();

    for (const asset of INITIAL_ASSETS) {
      assert.ok(!symbols.has(asset.symbol), `Duplicate asset symbol found: ${asset.symbol}`);
      symbols.add(asset.symbol);

      assert.ok(asset.price > 0, `Asset ${asset.symbol} must have positive price`);
      assert.ok(asset.pipSize > 0, `Asset ${asset.symbol} must have positive pipSize`);
      assert.ok(asset.pointMultiplier > 0, `Asset ${asset.symbol} must have positive pointMultiplier`);
      assert.ok(asset.name.length > 0, `Asset ${asset.symbol} must have a non-empty name`);

      // HTF Order Block verification
      assert.ok(
        asset.htfOrderBlock.high >= asset.htfOrderBlock.low,
        `Order block high must be >= low for ${asset.symbol}`
      );
      assert.ok(
        asset.htfOrderBlock.bias === 'DEMAND' || asset.htfOrderBlock.bias === 'SUPPLY',
        `Invalid order block bias for ${asset.symbol}`
      );

      // Asian Range verification
      assert.ok(
        asset.asianRangeHigh >= asset.asianRangeLow,
        `Asian high must be >= low for ${asset.symbol}`
      );
    }
  });

  await t.test('JPY forex pairs have correct 0.01 pipSize', () => {
    const jpyPairs = INITIAL_ASSETS.filter((a) => a.symbol.endsWith('/JPY'));
    assert.ok(jpyPairs.length >= 5, `Expected at least 5 JPY pairs, found ${jpyPairs.length}`);
    for (const pair of jpyPairs) {
      assert.equal(pair.pipSize, 0.01, `${pair.symbol} should have pipSize of 0.01`);
    }
  });
});
