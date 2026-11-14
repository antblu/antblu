import assert from 'node:assert/strict';
import test from 'node:test';
import { comparisons, billableSeats } from '../dist/services/comparisons.mjs';
import { calculateTco } from '../dist/services/tco.mjs';

test('vendor minimums and seat bands affect billed costs', () => {
  const dropbox = comparisons.find(plan => plan.id === 'dropbox');
  const asana = comparisons.find(plan => plan.id === 'asana');
  assert.equal(billableSeats(dropbox, 1), 3);
  for (const [requested, billed] of [[1, 2], [5, 5], [6, 10], [30, 30], [31, 40], [101, 125], [501, 550]]) {
    assert.equal(billableSeats(asana, requested), billed);
  }
  const result = calculateTco({ years: 1, subscriptions: [{ ...asana.prices[0], quantity: billableSeats(asana, 7) }] });
  assert.equal(result.commercial.total, 1318.80);
});

test('annual plan amounts are full-year charges, not monthly equivalents', () => {
  for (const [id, quantity, expected] of [['microsoft-365', 30, 2520], ['salesforce-starter', 8, 2400], ['shopify', 2, 696]]) {
    const plan = comparisons.find(plan => plan.id === id);
    const rate = plan.prices.find(price => price.period === 'year');
    const result = calculateTco({ years: 1, subscriptions: [{ ...rate, quantity }] });
    assert.equal(result.commercial.total, expected);
  }
});
