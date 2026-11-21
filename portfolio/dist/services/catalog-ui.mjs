import { applications } from './applications.mjs';
import { pricing } from './pricing.mjs';
import { siteConfig } from './site-config.mjs';
import { escapeHtml, publicHttps, range, readSession, writeSession } from './common.mjs';

const catalog = document.querySelector('#application-catalog');
const savedApplications = readSession('antblu-applications');
const selected = new Set((Array.isArray(savedApplications) ? savedApplications : []).filter(id => applications.some(app => app.id === id)));
const categories = new Set(applications.map(app => app.category));
catalog.innerHTML = `
  <div class="svc-controls">
    <label>Search applications<input type="search" placeholder="Name, capability, or integration"></label>
    <label>Category<select><option value="">All categories</option>${[...categories].map(category => `<option>${escapeHtml(category)}</option>`).join('')}</select></label>
  </div>
  <div class="svc-catalog-toolbar">
    <p role="status" data-catalog-status></p>
    <div class="svc-cta"><a class="svc-btn svc-btn--primary" data-estimate href="/services/calculator">Estimate selected apps</a><a class="svc-btn" data-request href="/contact?service=infrastructure#quote">Request a module quote</a></div>
  </div>
  <div class="svc-grid svc-grid--auto" data-catalog-cards></div>
  <dialog aria-labelledby="application-title"><button class="svc-btn" type="button">Close details</button><div data-app-detail></div></dialog>`;

const cards = catalog.querySelector('[data-catalog-cards]');
const search = catalog.querySelector('[type="search"]');
const category = catalog.querySelector('select');
const dialog = catalog.querySelector('dialog');
const quoteLink = catalog.querySelector('[data-request]');
const estimateLink = catalog.querySelector('[data-estimate]');

function updateSelection(count) {
  catalog.querySelector('[data-catalog-status]').textContent = `${count} ${count === 1 ? 'application' : 'applications'} shown · ${selected.size} selected`;
  const selection = new URLSearchParams({ apps: [...selected].join(',') });
  quoteLink.href = '/contact?service=infrastructure' + (selected.size ? `&${selection}` : '') + '#quote';
  estimateLink.href = '/services/calculator' + (selected.size ? `?${selection}` : '');
}

let count = applications.length;
function render() {
  const terms = search.value.toLowerCase().trim().split(/\s+/);
  const matches = applications.filter(app => {
    const index = [app.name, app.category, app.description, app.capabilities, app.database, app.integrations].join(' ').toLowerCase();
    return (!category.value || app.category === category.value) && terms.every(term => index.includes(term));
  });
  count = matches.length;
  cards.innerHTML = matches.map(app => `<article class="svc-card">
    <span class="svc-kicker">${escapeHtml(app.category)}</span><h2 class="svc-card-title">${app.name}</h2><p>${app.description}</p>
    <p class="svc-module-price"><strong>${range(pricing[app.price])}</strong> implementation</p>
    <div class="svc-cta"><button class="svc-btn" type="button" data-app="${app.id}" aria-label="Details for ${app.name}">Details</button></div>
    <label class="svc-choice"><input type="checkbox" value="${app.id}" ${selected.has(app.id) ? 'checked' : ''}> Select for quote<span class="svc-sr-only"> for ${app.name}</span></label>
  </article>`).join('') || '<p>No matches. Try a different term or category.</p>';
  updateSelection(count);
}
search.addEventListener('input', render);
category.addEventListener('change', render);
cards.addEventListener('change', event => {
  const input = event.target;
  if (!input.matches('[type="checkbox"]')) return;
  if (input.checked) selected.add(input.value);
  else selected.delete(input.value);
  writeSession('antblu-applications', [...selected]);
  updateSelection(count);
});
cards.addEventListener('click', event => {
  const button = event.target.closest('[data-app]');
  if (!button) return;
  const app = applications.find(item => item.id === button.dataset.app);
  const sandbox = publicHttps(siteConfig.sandboxUrls[app.id]);
  dialog.querySelector('[data-app-detail]').innerHTML = `
    <h2 id="application-title">${app.name}</h2><p>${app.description}</p>
    <dl>${[
      ['Capabilities', app.capabilities], ['Database', app.database], ['Typical hosting', app.hosting],
      ['Integration candidates', app.integrations], ['Edition and license', app.edition], ['One-time implementation', range(pricing[app.price])]
    ].map(([title, value]) => `<dt>${title}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl>
    <p>${app.qualification}</p><div class="svc-cta">
      <a href="${app.url}">Official website</a><a href="${app.licenseUrl}">Upstream license</a>
      ${app.qualificationUrl ? `<a href="${app.qualificationUrl}">Edition details</a>` : ''}
      ${sandbox ? `<a href="${escapeHtml(sandbox)}">Open sandbox</a>` : ''}
    </div>`;
  dialog.showModal();
});
dialog.querySelector('button').addEventListener('click', () => dialog.close());
render();
