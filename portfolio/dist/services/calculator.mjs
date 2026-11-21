import { applications } from './applications.mjs';
import { comparisons, billableSeats } from './comparisons.mjs';
import { hosting, hostingProfiles, pricing, tiers } from './pricing.mjs';
import { calculateTco } from './tco.mjs';
import { escapeHtml, money, range, readSession, writeSession } from './common.mjs';

const root = document.querySelector('#tco-calculator');
const maxAmount = 1e7;
const groups = { employees: 30, users: 25, admins: 2, sales: 8, agents: 4 };
const groupLabels = { employees: 'Employees', users: 'Application users', admins: 'Administrators', sales: 'Sales users', agents: 'Helpdesk agents' };
const numberField = (name, label, value, step = '0.01', min = 0, max = maxAmount) =>
  `<label>${label}<input type="number" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}" required></label>`;
const countField = (name, label, value, min = 0) => numberField(name, label, value, 1, min, 100000);
const checkbox = (name, label) => `<label class="svc-choice"><input type="checkbox" name="${name}"> ${label}</label>`;
const fields = (...items) => `<div class="svc-fields">${items.join('')}</div>`;
const disclosure = (title, body) => `<details class="svc-fold"><summary>${title}</summary>${body}</details>`;
const savedApplications = readSession('antblu-applications');
const applicationIds = (new URLSearchParams(location.search).get('apps') ?? (Array.isArray(savedApplications) ? savedApplications : []).join(',')).split(',');
const appChoices = applications.map(app => `<label class="svc-choice"><input type="checkbox" name="applications" value="${app.id}" ${applicationIds.includes(app.id) ? 'checked' : ''}> <span>${app.name} <small>${range(pricing[app.price])}</small></span></label>`).join('');

root.innerHTML = `<div class="svc-calc">
  <section class="svc-panel svc-calc-preview" aria-labelledby="preview-title">
    <h2 id="preview-title">Sample scenario</h2>
    <dl id="preview-totals">
      <div><dt>Commercial</dt><dd id="preview-commercial"></dd></div>
      <div><dt>Self-hosted</dt><dd id="preview-self-hosted"></dd></div>
    </dl>
    <a href="#result-title">View estimate details</a>
  </section>
  <form class="svc-calculator-fields">
    <section class="svc-panel" aria-labelledby="estimate-inputs">
      <h2 id="estimate-inputs">Estimate inputs</h2>
      ${fields(
        '<label>Term<select name="years"><option value="1">1 year</option><option value="3" selected>3 years</option><option value="5">5 years</option></select></label>',
        '<label>Infrastructure tier<select name="tier"><option value="standard">Standard · Non-HA</option><option value="ha">High Availability · HA</option></select></label>',
        '<label>Hosting<select name="hosting"><option value="hardware">Own hardware</option><option value="vps" selected>Cloud VPS</option><option value="managed" disabled>Managed Kubernetes</option></select></label>',
        numberField('serverMonthly', 'Server / month ($ each)', 35))}
      ${disclosure('Commercial subscriptions', `
        <p class="svc-muted">Replace the two sample plans with your bills. Add taxes and fees under additional services.</p>
        <div class="svc-flow" id="subscriptions"></div>
        <div class="svc-cta"><button class="svc-btn" type="button" id="add-subscription">Add subscription</button></div>
        ${fields(numberField('commercialInitial', 'Implementation and migration ($)', 0), numberField('commercialMonthlyServices', 'Additional services / month ($)', 0))}`)}
      ${disclosure('Application scope', `
        <p class="svc-muted">Select the modules you need. Adjust the one-time cost to include any replacements outside this list.</p>
        ${disclosure('<span id="module-count">Select application modules</span>', `<div class="svc-module-list">${appChoices}</div>`)}
        ${fields(numberField('modulesInitial', 'One-time module costs ($)', 0))}
        ${checkbox('scopeConfirmed', 'Both setups cover the same application needs')}`)}
      ${disclosure('Organization size', `
        <p class="svc-muted">These headcounts suggest seats for new subscriptions. Match each subscription to your bill.</p>
        ${fields(...Object.entries(groups).map(([key, value]) => countField(key, groupLabels[key], value)))}`)}
      ${disclosure('Advanced hosting and costs', `
        <p class="svc-muted">Choose a provider allowance as a starting point. Your edits to its costs stay with the hosting type.</p>
        ${fields('<label>Provider allowance<select name="profile"></select></label>',
          numberField('infrastructureInitial', 'Infrastructure implementation ($)', 4500), numberField('migrationInitial', 'Self-hosted migration ($)', 0), numberField('hardwareInitial', 'Hardware purchase ($)', 0),
          countField('serverCount', 'Servers', 1, 1), countField('vcpu', 'vCPU per server', 4, 1), numberField('ram', 'RAM per server (GiB)', 8, '0.5', 0.5, 100000),
          countField('storageGb', 'Primary storage (GB)', 100), numberField('storageRate', 'Storage / GB / month ($)', 0.07, '0.0001'),
          countField('databaseCount', 'Databases', 1), numberField('databaseMonthly', 'Separate DB service / database / month ($)', 0), numberField('databaseHaMonthly', 'Extra HA / database / month ($)', 0))}
        ${checkbox('databaseHa', 'Budget for database HA separately')}
        ${fields(countField('backupGb', 'Offsite backup storage (GB)', 100), numberField('backupRate', 'Backup / GB / month ($)', 0.02, '0.0001'),
          numberField('controlPlaneMonthly', 'Control plane / month ($)', 0), numberField('networkMonthly', 'Network and load balancing / month ($)', 10),
          numberField('supportMonthly', 'Optional support / month ($)', 0), numberField('administratorAnnual', 'Total administrator labor / year ($)', 2400),
          numberField('selfHostedMonthlyExtras', 'Other monthly costs ($)', 0))}
        <p class="svc-muted">Enter database costs that fall outside the server, storage, and network budget. Include labor for all administrators.</p>
        ${disclosure('Optional setup and replacement costs', `
          ${checkbox('aiSetup', `AI operations assistant (one-time ${range(pricing.ai)})`)}
          ${checkbox('extraTraining', `Additional training (one-time ${range(pricing.training)})`)}
          ${fields(numberField('renewalAmount', 'Replacement or renewal cost ($)', 0), countField('renewalIntervalYears', 'Repeat every N years (0 disables)', 0))}
          <p class="svc-muted">Implementation includes standard handoff and training. The estimate adds renewals on anniversaries within the term.</p>`)}`)}
    </section>
  </form>
  <aside class="svc-result svc-panel" aria-labelledby="result-title">
    <h2 id="result-title" tabindex="-1">Sample scenario</h2>
    <div id="cost-results"></div>
    <p class="svc-muted" id="scope-note"></p>
    <p id="result-status" class="svc-note" role="status"></p>
    <figure class="svc-figure" id="comparison-chart" hidden><div id="cost-chart"></div><figcaption><span class="svc-key"></span> Commercial <span class="svc-key svc-key--self"></span> Self-hosted</figcaption></figure>
    <details class="svc-fold" id="estimate-details"><summary>Configuration and assumptions</summary><pre class="svc-summary-text" id="estimate-summary"></pre></details>
    <div class="svc-cta svc-result-actions">
      <button class="svc-btn" type="button" id="copy-estimate">Copy summary</button>
      <button class="svc-btn" type="button" id="print-estimate">Print / save PDF</button>
      <button class="svc-btn svc-btn--primary" type="button" id="request-estimate">Use in consultation</button>
    </div>
    <p class="svc-muted">Estimates are in US dollars. Actual costs, sizing and feature fit require assessment.</p>
    <p id="estimate-action-status" role="status"></p>
  </aside>
</div>`;

const form = root.querySelector('form');
const subscriptions = root.querySelector('#subscriptions');
const status = root.querySelector('#result-status');
const actionStatus = root.querySelector('#estimate-action-status');
const summaryElement = root.querySelector('#estimate-summary');
const actionButtons = [...root.querySelectorAll('.svc-result-actions button')];
const profileSelect = form.elements.profile;
const tierSelect = form.elements.tier;
const hostingSelect = form.elements.hosting;
const add = root.querySelector('#add-subscription');
const resultTitle = root.querySelector('#result-title');
const previewTitle = root.querySelector('#preview-title');
const previewTotals = root.querySelector('#preview-totals');
const costResults = root.querySelector('#cost-results');
const comparisonChart = root.querySelector('#comparison-chart');
const scopeNote = root.querySelector('#scope-note');
const scopeConfirmed = form.elements.scopeConfirmed;
const hostingEdits = Object.fromEntries(Object.entries(hostingProfiles).map(([type, [profile]]) => [
  type, { profile: '0', values: {}, fields: Object.keys(profile).filter(name => name !== 'name') }
]));
let estimateSummary = '';
let rowId = 0;

const rateFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 4 });
const midpoint = ({ low, high }) => Math.round((low + (high ?? low)) / 2);
const field = name => form.elements.namedItem(name);
const value = name => Number(field(name).value);
const planById = id => comparisons.find(plan => plan.id === id);
const selectedApps = () => [...form.querySelectorAll('[name="applications"]:checked')]
  .map(input => applications.find(app => app.id === input.value));
const isBundled = app => app.id === 'opentofu' || (app.id === 'argocd' && tierSelect.value === 'ha');

function applyProfile() {
  const type = hostingSelect.value;
  const edits = hostingEdits[type];
  edits.profile = profileSelect.value;
  const profile = hostingProfiles[type][Number(edits.profile)];
  for (const name of edits.fields) field(name).value = edits.values[name] ?? profile[name];
}

function setHosting() {
  profileSelect.replaceChildren(...hostingProfiles[hostingSelect.value].map((profile, index) => new Option(profile.name, index)));
  profileSelect.value = hostingEdits[hostingSelect.value].profile;
  applyProfile();
}

function updateModuleCost() {
  const chosen = selectedApps();
  const priced = chosen.filter(app => !isBundled(app));
  const low = priced.reduce((sum, app) => sum + pricing[app.price].low, 0);
  const high = priced.reduce((sum, app) => sum + pricing[app.price].high, 0);
  const formatted = priced.length ? range({ low, high, plus: priced.some(app => pricing[app.price].plus) }) : 'included';
  root.querySelector('#module-count').textContent = chosen.length ? `${chosen.length} selected · ${formatted}` : 'Select application modules';
  field('modulesInitial').value = priced.reduce((sum, app) => sum + midpoint(pricing[app.price]), 0);
}

function syncSubscription(row) {
  const id = row.querySelector('[data-plan]').value;
  const plan = planById(id);
  const rateSelect = row.querySelector('[data-rate]');
  rateSelect.replaceChildren(...(plan?.prices || []).map((rate, index) => new Option(
    `${money(rate.amount)} / ${rate.period} · ${rate.term}`, index
  )), new Option('Custom monthly price', 'month'), new Option('Custom annual price', 'year'));
  const seats = row.querySelector('[data-quantity]');
  const groupCount = plan ? value(plan.seatGroup) : 1;
  seats.value = plan?.unit === 'account' ? 1 : Math.min(plan?.maximum ?? Infinity, Math.max(plan?.minimum ?? 1, groupCount || 1));
  seats.max = String(plan?.maximum ?? 100000);
  row.querySelector('[data-label]').hidden = !!plan;
  applyRate(row);
}

function applyRate(row) {
  const rateSelect = row.querySelector('[data-rate]');
  const plan = planById(row.querySelector('[data-plan]').value);
  const rate = plan?.prices[Number(rateSelect.value)];
  const cost = row.querySelector('[data-cost]');
  cost.value = rate?.amount ?? '';
  row.querySelector('[data-cost-unit]').textContent = `Price per ${plan?.unit === 'account' ? (plan.unitLabel || 'account') : 'unit'} / ${rate?.period || rateSelect.value} ($)`;
  row.querySelector('[data-price-source]').innerHTML = plan ? `<a href="${plan.url}">Vendor source</a> · ${plan.region}, ${plan.currency} · checked ${plan.verified}.${plan.billingNote ? ' ' + escapeHtml(plan.billingNote) : ''}` : 'Enter the billable quantity and price from your invoice. Select annual to enter the actual annual charge.';
}

function createSubscription(id = 'custom', focus = false) {
  const row = document.createElement('fieldset');
  row.className = 'svc-subscription';
  rowId += 1;
  row.innerHTML = `<legend>Subscription ${rowId}</legend>
    <div class="svc-fields">
      <label>Vendor and plan<select data-plan>${comparisons.map(plan => `<option value="${plan.id}">${escapeHtml(plan.vendor + ' ' + plan.plan)}</option>`).join('')}<option value="custom">Custom subscription</option></select></label>
      <label>Billing and price source<select data-rate></select></label>
      <label>Seats or accounts<input data-quantity type="number" min="0" max="100000" step="1" value="1" required></label>
      <label><span data-cost-unit>Price ($)</span><input data-cost type="number" min="0" max="${maxAmount}" step="0.01" value="" required></label>
      <label data-label hidden>Custom name (optional)<input data-custom-name maxlength="80"></label>
    </div>
    <p class="svc-muted" data-price-source></p>
    <p class="svc-muted" data-seat-note></p>
    <button class="svc-btn" type="button" data-remove aria-label="Remove subscription ${rowId}">Remove</button>`;
  subscriptions.append(row);
  row.querySelector('[data-plan]').value = id;
  syncSubscription(row);
  if (focus) row.querySelector('[data-plan]').focus();
}

function readSubscriptions() {
  return [...subscriptions.children].flatMap(row => {
    const plan = planById(row.querySelector('[data-plan]').value);
    const rateChoice = row.querySelector('[data-rate]').value;
    const rate = plan?.prices[Number(rateChoice)];
    const amount = row.querySelector('[data-cost]').valueAsNumber;
    const seats = row.querySelector('[data-quantity]').valueAsNumber;
    const quantity = seats === 0 ? 0 : plan?.unit === 'seat' ? billableSeats(plan, seats) : seats;
    row.querySelector('[data-seat-note]').textContent = !quantity ? 'Zero units. This line is excluded.' : quantity !== seats ? `Vendor billing uses ${quantity} seats for the ${seats} requested.` : '';
    if (!quantity) return [];
    const name = plan ? `${plan.vendor} ${plan.plan}` : row.querySelector('[data-custom-name]').value.trim() || 'Custom subscription';
    return [{ name, amount, quantity, period: rate?.period || rateChoice, source: rate && rate.amount === amount ? `public price checked ${plan.verified}` : 'entered price' }];
  });
}

function chart(result, years) {
  const width = 440;
  const height = 170;
  const left = 12;
  const right = width - 12;
  const top = 9;
  const bottom = 138;
  const max = Math.max(1, result.commercial.total, result.selfHosted.total);
  const x = month => left + (right - left) * month / (years * 12);
  const y = cost => bottom - (bottom - top) * cost / max;
  const line = key => result.points.map(point => `${x(point.month).toFixed(1)},${y(point[key]).toFixed(1)}`).join(' ');
  const ticks = Array.from({ length: years + 1 }, (_, year) => year);
  root.querySelector('#cost-chart').innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Cumulative costs by year. Commercial ends at ${money(result.commercial.total)} and self-hosted ends at ${money(result.selfHosted.total)}.">
    <path d="M${left} ${top}V${bottom}H${right} M${left} 74H${right} M${left} ${top}H${right}" stroke="var(--svc-line)" fill="none"/>
    <polyline points="${line('commercial')}" fill="none" stroke="var(--svc-accent)" stroke-width="3"/>
    <polyline points="${line('selfHosted')}" fill="none" stroke="var(--svc-second)" stroke-width="3" stroke-dasharray="7 4"/>
    ${ticks.map(year => `<text x="${x(year * 12)}" y="159" fill="var(--svc-muted)" text-anchor="middle" font-size="12">${year === 0 ? '0' : year + 'y'}</text>`).join('')}
  </svg>`;
}

function update() {
  add.disabled = subscriptions.children.length >= 25;
  const isValid = form.matches(':valid');
  const comparable = scopeConfirmed.checked;
  const scenario = comparable ? 'Ownership cost estimate' : 'Sample scenario';
  resultTitle.textContent = scenario;
  previewTotals.hidden = !isValid;
  comparisonChart.hidden = !isValid || !comparable;
  scopeNote.hidden = !isValid;
  actionButtons.forEach(button => { button.disabled = !isValid; });
  if (!isValid) {
    previewTitle.textContent = 'Estimate unavailable';
    const invalid = form.querySelector('input:invalid');
    const group = invalid?.closest('details')?.querySelector('summary').textContent;
    status.textContent = group ? `Check the values under ${group} to update the estimate.` : 'Check the values under Estimate inputs to update the estimate.';
    costResults.replaceChildren();
    root.querySelector('#cost-chart').replaceChildren();
    summaryElement.textContent = '';
    estimateSummary = '';
    return;
  }
  const names = ['years', 'commercialInitial', 'commercialMonthlyServices', 'infrastructureInitial', 'modulesInitial', 'migrationInitial', 'hardwareInitial', 'serverCount',
    'serverMonthly', 'storageGb', 'storageRate', 'databaseCount', 'databaseMonthly', 'databaseHaMonthly', 'backupGb', 'backupRate', 'controlPlaneMonthly', 'networkMonthly',
    'supportMonthly', 'administratorAnnual', 'selfHostedMonthlyExtras', 'renewalAmount', 'renewalIntervalYears'];
  const inputs = Object.fromEntries(names.map(name => [name, value(name)]));
  inputs.subscriptions = readSubscriptions();
  inputs.databaseHa = field('databaseHa').checked;
  inputs.addOnsInitial = (field('aiSetup').checked ? midpoint(pricing.ai) : 0) + (field('extraTraining').checked ? midpoint(pricing.training) : 0);
  const { years } = inputs;
  const result = calculateTco(inputs);
  const applicationNote = selectedApps().length ? 'The self-hosted total includes your selected modules. Check features, migration work, and capacity before using the estimate.' : 'The self-hosted total uses your cost inputs, with no application modules selected. Include the costs of any replacements you need.';
  const sizingNote = tierSelect.value === 'ha' && inputs.serverCount < 3 ? 'This estimate includes fewer than three servers. Check the design to validate quorum, failure domains, and failover.' : '';
  scopeNote.textContent = [applicationNote, sizingNote].filter(Boolean).join(' ');
  const { commercial, selfHosted } = result;
  previewTitle.textContent = `${scenario} · ${years}-year totals`;
  root.querySelector('#preview-commercial').textContent = money(commercial.total);
  root.querySelector('#preview-self-hosted').textContent = money(selfHosted.total);
  const difference = result.difference > 0 ? `Self-hosted costs ${money(result.difference)} less` :
    result.difference < 0 ? `Self-hosted costs ${money(-result.difference)} more` : 'Both options have the same estimated cost';
  const comparison = `${difference} over ${years} ${years === 1 ? 'year' : 'years'}.`;
  const resultMessage = comparable ? comparison : 'Confirm in Application scope that both setups cover the same needs to see the cost difference.';
  if (status.textContent !== resultMessage) status.textContent = resultMessage;
  const breakEven = result.breakEvenMonth === null ? 'No sustained break-even within the term.' :
    result.breakEvenMonth === 0 ? 'Self-hosted starts at or below commercial cost and stays there.' :
      `Self-hosted reaches sustained break-even at month ${result.breakEvenMonth}.`;
  costResults.innerHTML = `<table class="svc-table svc-results-table"><caption>${years}-year estimate in US dollars</caption><thead><tr><th scope="col">Cost</th><th scope="col">Commercial</th><th scope="col">Self-hosted</th></tr></thead><tbody>
    ${[['Recurring / mo.', 'monthly'], ['Initial', 'initial'], ['Term total', 'total']].map(([label, key]) => `<tr><th scope="row">${label}</th><td>${money(result.commercial[key])}</td><td>${money(result.selfHosted[key])}</td></tr>`).join('')}
    </tbody></table><p class="svc-muted">Monthly equivalent includes annual subscriptions and administrator labor spread over 12 months. Setup and scheduled replacements are included in the term total, not the monthly figure.</p>${comparable ? `<p class="svc-muted">${breakEven}</p>` : ''}`;
  if (comparable) chart(result, years);
  else root.querySelector('#cost-chart').replaceChildren();
  const appNames = selectedApps().map(app => app.name + (isBundled(app) ? ' (bundled in baseline)' : ''));
  estimateSummary = [
    `${scenario} · ${years}-year totals (USD)`,
    `${tiers[tierSelect.value]} · ${hosting[hostingSelect.value].name} · ${profileSelect.selectedOptions[0].text}`,
    '',
    `Commercial: ${money(commercial.initial)} initial · ${money(commercial.monthly)} monthly · ${money(commercial.total)} total.`,
    `Self-hosted: ${money(selfHosted.initial)} initial · ${money(selfHosted.monthly)} monthly · ${money(selfHosted.total)} total.`,
    ...(comparable ? [comparison, breakEven] : ['Application scope is unconfirmed.']),
    '',
    Object.keys(groups).map(key => `${groupLabels[key]}: ${value(key)}`).join(' · '),
    'Commercial subscriptions:',
    ...inputs.subscriptions.map(item => `• ${item.name}: ${item.quantity} × ${money(item.amount)} / ${item.period} (${item.source})`),
    `Commercial implementation and migration: ${money(inputs.commercialInitial)}. Other commercial services: ${money(inputs.commercialMonthlyServices)}/month.`,
    `Applications: ${appNames.join(', ') || 'None selected'}. One-time modules: ${money(inputs.modulesInitial)}.`,
    `Infrastructure implementation: ${money(inputs.infrastructureInitial)}. Migration: ${money(inputs.migrationInitial)}. Hardware: ${money(inputs.hardwareInitial)}. Optional setup: ${money(inputs.addOnsInitial)}${field('aiSetup').checked ? ' (AI assistant)' : ''}${field('extraTraining').checked ? ' (additional training)' : ''}.`,
    `Compute: ${inputs.serverCount} × ${money(inputs.serverMonthly)}/month; ${value('vcpu')} vCPU and ${value('ram')} GiB RAM per server.`,
    `Storage: ${inputs.storageGb} GB × ${rateFormat.format(inputs.storageRate)}/GB/month. Backups: ${inputs.backupGb} GB × ${rateFormat.format(inputs.backupRate)}/GB/month.`,
    `Databases: ${inputs.databaseCount} × ${money(inputs.databaseMonthly)}/month${inputs.databaseHa ? ` plus ${money(inputs.databaseHaMonthly)} extra per database for HA` : ''}.`,
    `Control plane: ${money(inputs.controlPlaneMonthly)}/month. Network: ${money(inputs.networkMonthly)}/month. Support: ${money(inputs.supportMonthly)}/month. Extras: ${money(inputs.selfHostedMonthlyExtras)}/month. Administration: ${money(inputs.administratorAnnual)}/year.`,
    `Scheduled replacement: ${inputs.renewalIntervalYears && inputs.renewalAmount ? `${money(inputs.renewalAmount)} every ${inputs.renewalIntervalYears} year(s) within the term` : 'none'}.`,
    '',
    scopeNote.textContent,
    'Assumptions: Constant prices and usage. Annual subscriptions and labor are spread over 12 months. Term totals include scheduled replacements inside the horizon. Enter applicable taxes, power, fees, additional services and labor. No inflation, discounting, or timing-of-payment model. Provider allowances and CPU/RAM are preliminary planning inputs. Estimates are not binding quotes or guaranteed savings.'
  ].join('\n');
  summaryElement.textContent = estimateSummary;
}

form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('input', event => {
  const target = event.target;
  if (target.matches('select,[type="checkbox"]')) return;
  const edits = hostingEdits[hostingSelect.value];
  if (edits.fields.includes(target.name)) edits.values[target.name] = target.value;
  if (target.matches('[data-custom-name]')) scopeConfirmed.checked = false;
  update();
});
form.addEventListener('change', event => {
  const target = event.target;
  const row = target.closest('.svc-subscription');
  if (target.matches('[data-plan]')) {
    scopeConfirmed.checked = false;
    syncSubscription(row);
  }
  if (target.matches('[data-rate]')) applyRate(row);
  if (target === tierSelect) {
    field('infrastructureInitial').value = midpoint(pricing[tierSelect.value]);
    field('serverCount').value = tierSelect.value === 'ha' ? 3 : 1;
    field('databaseHa').checked = tierSelect.value === 'ha';
    if (selectedApps().some(app => app.id === 'argocd')) updateModuleCost();
    const managed = hostingSelect.querySelector('[value="managed"]');
    managed.disabled = tierSelect.value !== 'ha';
    if (managed.disabled && hostingSelect.value === 'managed') {
      hostingSelect.value = 'vps';
      setHosting();
    }
  }
  if (target === hostingSelect) setHosting();
  if (target === profileSelect) applyProfile();
  if (target.name === 'applications') {
    scopeConfirmed.checked = false;
    updateModuleCost();
    writeSession('antblu-applications', [...form.querySelectorAll('[name="applications"]:checked')].map(input => input.value));
  }
  update();
});
subscriptions.addEventListener('click', event => {
  if (!event.target.matches('[data-remove]')) return;
  const row = event.target.closest('fieldset');
  const next = row.nextElementSibling || row.previousElementSibling;
  scopeConfirmed.checked = false;
  row.remove();
  (next?.querySelector('[data-plan]') || add).focus();
  update();
});
add.addEventListener('click', () => {
  if (subscriptions.children.length >= 25) return;
  scopeConfirmed.checked = false;
  createSubscription('custom', true);
  update();
});
root.querySelector('#copy-estimate').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(estimateSummary);
    actionStatus.textContent = 'Summary copied.';
  } catch {
    root.querySelector('#estimate-details').open = true;
    const selection = window.getSelection();
    const textRange = document.createRange();
    textRange.selectNodeContents(summaryElement);
    selection.removeAllRanges();
    selection.addRange(textRange);
    actionStatus.textContent = 'Summary selected. Use your device’s copy command.';
  }
});
root.querySelector('#print-estimate').addEventListener('click', () => {
  const details = root.querySelector('#estimate-details');
  const wasOpen = details.open;
  details.open = true;
  window.addEventListener('afterprint', () => { details.open = wasOpen; }, { once: true });
  window.print();
});
root.querySelector('#request-estimate').addEventListener('click', () => {
  if (estimateSummary.length > 6500 || !writeSession('antblu-quote', {
    summary: estimateSummary,
    hosting: hostingSelect.value,
    sample: !scopeConfirmed.checked
  })) {
    root.querySelector('#estimate-details').open = true;
    actionStatus.textContent = 'Automatic transfer is unavailable for this summary. Copy the details and include the relevant lines in your consultation.';
    return;
  }
  location.assign('/contact?service=infrastructure&configuration=calculator#quote');
});
setHosting();
updateModuleCost();
createSubscription('microsoft-365');
createSubscription('salesforce-starter');
update();
