import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateTco } from '../dist/services/tco.mjs';

test('accrues monthly and annual subscriptions independently at the selected quantities', () => {
  const result = calculateTco({
    years: 3,
    subscriptions: [
      { amount: 90.08, period: 'month', quantity: 5 },
      { amount: 199.99, period: 'year', quantity: 2 },
    ],
    commercialInitial: 180,
    commercialMonthlyServices: 34.30,
  });
  assert.deepEqual(result.commercial, { initial: 180, monthly: 518.03, total: 18829.14 });
  assert.deepEqual(result.points[1], { month: 1, commercial: 698.03, selfHosted: 0 });
  assert.equal(result.points.length, 37);
  assert.equal(result.breakEvenMonth, 0);
});

test('includes deployment, migration, applications, add-ons, hardware, and operating expenses', () => {
  const result = calculateTco({
    years: 1,
    infrastructureInitial: 3000,
    modulesInitial: 650,
    migrationInitial: 800,
    addOnsInitial: 2000,
    hardwareInitial: 100,
    serverCount: 3,
    serverMonthly: 50,
    storageGb: 120,
    storageRate: 0.10,
    databaseCount: 2,
    databaseHa: true,
    databaseMonthly: 15,
    databaseHaMonthly: 20,
    backupGb: 120,
    backupRate: 0.025,
    controlPlaneMonthly: 26,
    networkMonthly: 10,
    supportMonthly: 45,
    administratorAnnual: 780,
    selfHostedMonthlyExtras: 24,
  });
  assert.deepEqual(result.selfHosted, { initial: 6550, monthly: 405, total: 11410 });
  assert.equal(result.difference, -11410);
  assert.equal(result.breakEvenMonth, null);
});

test('applies database HA surcharge only when selected', () => {
  const result = calculateTco({
    years: 1,
    databaseCount: 2,
    databaseHa: false,
    databaseMonthly: 19.25,
    databaseHaMonthly: 10,
  });
  assert.equal(result.selfHosted.monthly, 38.50);
});

test('adds hardware renewal inside the term and excludes a renewal at its end', () => {
  const result = calculateTco({
    years: 3,
    hardwareInitial: 700,
    renewalAmount: 700,
    renewalIntervalYears: 1,
  });
  for (const [month, cost] of [[0, 700], [11, 700], [12, 1400], [23, 1400], [24, 2100], [36, 2100]]) {
    assert.equal(result.points[month].selfHosted, cost);
  }
  assert.equal(result.selfHosted.total, 2100);
});

test('finds sustained break-even after a renewal reverses the first crossover', () => {
  const result = calculateTco({
    years: 3,
    commercialMonthlyServices: 100,
    infrastructureInitial: 700,
    renewalAmount: 1000,
    renewalIntervalYears: 1,
  });
  assert.equal(result.points[7].commercial, result.points[7].selfHosted);
  assert.ok(result.points[12].commercial < result.points[12].selfHosted);
  assert.ok(result.points[24].commercial < result.points[24].selfHosted);
  assert.equal(result.breakEvenMonth, 27);
  assert.equal(result.difference, 900);
});

test('includes break-even at the exact end of the selected horizon', () => {
  const result = calculateTco({
    years: 5,
    commercialMonthlyServices: 100,
    infrastructureInitial: 6000,
  });
  assert.equal(result.breakEvenMonth, 60);
  assert.equal(result.difference, 0);
});

test('rounds currency at display points and keeps fractional rates during accrual', () => {
  const result = calculateTco({
    years: 1,
    commercialInitial: 10.075,
    backupGb: 1,
    backupRate: 0.005,
  });
  assert.equal(result.commercial.initial, 10.08);
  assert.equal(result.selfHosted.monthly, 0.01);
  assert.equal(result.selfHosted.total, 0.06);
  assert.equal(result.difference, 10.02);
});

test('rejects unsupported periods, fractional seats, invalid costs, and unsafe totals', () => {
  assert.throws(() => calculateTco({ years: 2 }), RangeError);
  assert.throws(() => calculateTco({ years: 1, serverCount: 1.5 }), RangeError);
  assert.throws(() => calculateTco({ years: 1, infrastructureInitial: -1 }), RangeError);
  assert.throws(() => calculateTco({ years: 1, administratorAnnual: Infinity }), RangeError);
  assert.throws(() => calculateTco({ years: 1, hardwareInitial: Number.MAX_VALUE }), RangeError);
  assert.throws(() => calculateTco({ years: 1, databaseHa: 'true' }), TypeError);
  assert.throws(() => calculateTco({ years: 1, subscriptions: [{ period: 'week', amount: 10, quantity: 1 }] }), RangeError);
  assert.throws(() => calculateTco({ years: 1, subscriptions: [{ period: 'year', amount: 10, quantity: 1.5 }] }), RangeError);
  assert.throws(() => calculateTco({ years: 1, subscriptions: [{ period: 'year', amount: 10 }] }), TypeError);
});

test('zero costs stay zero across every supported horizon', () => {
  for (const years of [1, 3, 5]) {
    const result = calculateTco({ years });
    assert.equal(result.difference, 0);
    assert.equal(result.breakEvenMonth, 0);
    assert.ok(result.points.every(point => point.commercial === 0 && point.selfHosted === 0));
  }
});

test('renewal is disabled at interval zero or beyond the projection', () => {
  for (const renewalIntervalYears of [0, 3, 5]) {
    const result = calculateTco({ years: 3, hardwareInitial: 1000, renewalAmount: 900, renewalIntervalYears });
    assert.equal(result.selfHosted.total, 1000);
  }
});
