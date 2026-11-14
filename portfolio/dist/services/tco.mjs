// Costs accrue evenly by month. Annual bills are prorated for comparison,
// so the cumulative series does not represent cash flow or billing dates.
const horizons = [1, 3, 5];

function nonNegative(value, label, integer = false) {
  if (value === undefined) return 0;
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isSafeInteger(value))) {
    throw new RangeError(`${label} must be a nonnegative ${integer ? 'integer' : 'number'}.`);
  }
  return value;
}

function cents(amount) {
  const scaled = amount * 100;
  const midpoint = Math.floor(scaled) + 0.5;
  // Correct floating-point error just below a half-cent boundary.
  const tolerance = Math.min(Number.EPSILON * scaled, 0.000001);
  const rounded = Math.round(midpoint - scaled <= tolerance && scaled < midpoint ? midpoint : scaled);
  if (!Number.isSafeInteger(rounded)) throw new RangeError('The projected cost is too large.');
  return rounded;
}

export function calculateTco(input) {
  const { years, subscriptions = [], databaseHa = false } = input;
  if (!horizons.includes(years)) throw new RangeError('Choose a 1-, 3-, or 5-year projection.');
  if (!Array.isArray(subscriptions)) throw new TypeError('Subscriptions must be an array.');
  if (typeof databaseHa !== 'boolean') throw new TypeError('Database HA must be true or false.');

  const cost = key => nonNegative(input[key], key);
  const count = key => nonNegative(input[key], key, true);
  const months = years * 12;
  const commercialInitial = cost('commercialInitial');
  const subscriptionAnnual = subscriptions.reduce((sum, subscription) => {
    const { amount, period, quantity } = subscription;
    if (period !== 'month' && period !== 'year') {
      throw new RangeError('Use month or year for each subscription billing period.');
    }
    if (amount === undefined || quantity === undefined) {
      throw new TypeError('Each subscription needs an amount and quantity.');
    }
    return sum + nonNegative(amount, 'subscription amount') *
      nonNegative(quantity, 'subscription quantity', true) * (period === 'month' ? 12 : 1);
  }, 0);
  const commercialAnnual = subscriptionAnnual + cost('commercialMonthlyServices') * 12;
  const selfHostedInitial = cost('infrastructureInitial') + cost('modulesInitial') +
    cost('migrationInitial') + cost('addOnsInitial') + cost('hardwareInitial');
  const databaseHaMonthly = cost('databaseHaMonthly');
  const selfHostedMonthly =
    count('serverCount') * cost('serverMonthly') +
    cost('storageGb') * cost('storageRate') +
    count('databaseCount') * (cost('databaseMonthly') + (databaseHa ? databaseHaMonthly : 0)) +
    cost('backupGb') * cost('backupRate') +
    cost('controlPlaneMonthly') + cost('networkMonthly') + cost('supportMonthly') +
    cost('selfHostedMonthlyExtras');
  const selfHostedAnnual = selfHostedMonthly * 12 + cost('administratorAnnual');
  const renewalAmount = cost('renewalAmount');
  // An interval at or beyond the horizon cannot produce a renewal.
  const renewalMonths = Math.min(count('renewalIntervalYears'), years) * 12;

  const timeline = Array.from({ length: months + 1 }, (_, month) => {
    // Apply replacement at an anniversary only if the projection runs past it.
    const renewals = renewalMonths ? Math.floor(Math.min(month, months - 1) / renewalMonths) : 0;
    return {
      month,
      commercial: cents(commercialInitial + commercialAnnual * month / 12),
      selfHosted: cents(selfHostedInitial + selfHostedAnnual * month / 12 + renewals * renewalAmount),
    };
  });

  // Use the start of the final unbroken run at or below the commercial total.
  // Renewals can temporarily erase an earlier crossover.
  let breakEvenMonth = null;
  for (let index = months; index >= 0; index -= 1) {
    const point = timeline[index];
    if (point.selfHosted > point.commercial) break;
    breakEvenMonth = point.month;
  }

  const first = timeline[0];
  const last = timeline[months];
  return {
    commercial: { initial: first.commercial / 100, monthly: cents(commercialAnnual / 12) / 100, total: last.commercial / 100 },
    selfHosted: { initial: first.selfHosted / 100, monthly: cents(selfHostedAnnual / 12) / 100, total: last.selfHosted / 100 },
    difference: (last.commercial - last.selfHosted) / 100,
    breakEvenMonth,
    points: timeline.map(({ month, commercial, selfHosted }) => ({
      month,
      commercial: commercial / 100,
      selfHosted: selfHosted / 100,
    })),
  };
}
