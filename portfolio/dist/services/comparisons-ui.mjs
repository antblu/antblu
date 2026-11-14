import { comparisons } from './comparisons.mjs';
import { escapeHtml, publicHttps } from './common.mjs';

const mount = document.querySelector('#comparison-results');
const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC'
});

if (mount) {
  mount.innerHTML = `
    <div class="svc-controls">
      <label for="compare-search">Search comparisons
        <input id="compare-search" type="search" placeholder="Find a plan or application" aria-controls="compare-body">
      </label>
      <label for="compare-category">Category
        <select id="compare-category" aria-controls="compare-body"><option value="">All categories</option></select>
      </label>
    </div>
    <p id="compare-count" role="status"></p>
    <div class="svc-table-wrap" role="region" aria-label="Scrollable comparison table" tabindex="0">
      <table class="svc-table svc-comparison-table">
        <caption>U.S. commercial plans and potential self-hosted alternatives</caption>
        <thead><tr>
          <th scope="col">Commercial plan</th>
          <th scope="col">Published pricing</th>
          <th scope="col">Potential alternatives</th>
          <th scope="col">What changes</th>
        </tr></thead>
        <tbody id="compare-body"></tbody>
      </table>
    </div>`;

  const search = mount.querySelector('#compare-search');
  const category = mount.querySelector('#compare-category');
  const count = mount.querySelector('#compare-count');
  const table = mount.querySelector('.svc-table-wrap');
  const body = mount.querySelector('#compare-body');
  const categories = [...new Set(comparisons.map(plan => plan.category))];
  category.append(...categories.map(name => new Option(name, name)));

  function renderComparisons() {
    const query = search.value.trim().toLowerCase();
    const visible = comparisons.filter(plan =>
      (!category.value || plan.category === category.value) &&
      [plan.category, plan.vendor, plan.plan, ...plan.alternatives, plan.details].join(' ').toLowerCase().includes(query)
    );

    count.textContent = visible.length
      ? `${visible.length} ${visible.length === 1 ? 'comparison' : 'comparisons'}`
      : 'No matching comparisons.';
    table.hidden = !visible.length;

    body.innerHTML = visible.map(plan => {
      const unit = plan.unitLabel ?? (plan.unit === 'account' ? 'account' : plan.seatGroup === 'agents' ? 'agent' : 'user');
      const prices = plan.prices.length
        ? plan.prices.map(price =>
          `<li>${currencyFormat.format(price.amount)} per ${unit} per ${price.period}<br><small>${escapeHtml(price.term)}</small></li>`
        ).join('')
        : '<li>Request quote or check vendor pricing</li>';
      const minimum = plan.minimum === null ? 'Minimum depends on scope' : `${plan.minimum} ${unit}${plan.minimum === 1 ? '' : 's'} minimum`;
      const pricingUrl = publicHttps(plan.url);
      const termsUrl = publicHttps(plan.termsUrl);

      return `<tr>
        <th scope="row"><small>${escapeHtml(plan.category)}</small><br>${escapeHtml(plan.vendor)}<br><span>${escapeHtml(plan.plan)}</span></th>
        <td data-label="Published pricing">
          <ul class="svc-comparison-prices">${prices}</ul>
          <small>${escapeHtml(plan.region)} · ${escapeHtml(plan.currency)} · ${minimum}</small>
          ${plan.billingNote ? `<p><small>${escapeHtml(plan.billingNote)}</small></p>` : ''}
          <p><small>Checked <time datetime="${escapeHtml(plan.verified)}">${dateFormat.format(new Date(plan.verified))}</time></small><br>
          ${pricingUrl ? `<a href="${escapeHtml(pricingUrl)}">Vendor pricing</a>` : ''}${termsUrl ? ` · <a href="${escapeHtml(termsUrl)}">Billing details</a>` : ''}</p>
        </td>
        <td data-label="Potential alternatives">${escapeHtml(plan.alternatives.join(', '))}</td>
        <td data-label="What changes">${escapeHtml(plan.details)}</td>
      </tr>`;
    }).join('');
  }

  search.value = new URLSearchParams(location.search).get('q') || '';
  search.addEventListener('input', renderComparisons);
  category.addEventListener('change', renderComparisons);
  renderComparisons();
}
