import { pricing, hosting } from './pricing.mjs';
import { siteConfig } from './site-config.mjs';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0 });
export const money = value => currency.format(value);
export function range({ low, high, plus }) {
  return high ? `${money(low)}–${money(high)}${plus ? '+' : ''}` : `From ${money(low)}`;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

export function publicHttps(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

export function readSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
}

export function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

const theme = document.querySelector('[data-svc-theme]');
if (theme) {
  const system = matchMedia('(prefers-color-scheme: dark)');
  let choice;
  try { choice = localStorage.getItem('antblu-theme'); } catch {}
  function apply() {
    const dark = choice === 'dark' || (choice !== 'light' && system.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#070d16' : '#eef5fc';
  }
  theme.addEventListener('click', () => {
    choice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('antblu-theme', choice); } catch {}
    apply();
  });
  system.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key !== 'antblu-theme' && event.key !== null) return;
    choice = event.newValue;
    apply();
  });
  apply();
}

document.querySelectorAll('[data-price]').forEach(node => { node.textContent = range(pricing[node.dataset.price]); });
document.querySelectorAll('[data-hosting-price]').forEach(node => {
  const option = hosting[node.dataset.hostingPrice];
  node.textContent = `${range(option)} / month`;
});
const process = document.querySelector('[data-service-process]');
if (process) {
  process.innerHTML = `<h2>From evaluation to handoff</h2>
    <ol class="svc-steps">
      <li><a href="/services/applications">Explore the catalog</a></li>
      <li><a href="/demo">Try the demo</a></li>
      <li><a href="/contact">Request a consultation</a></li>
      <li>Review an architecture and cost estimate</li>
      <li>Approve scope and implementation</li>
      <li>Deploy and integrate</li>
      <li>Test, migrate, and validate</li>
      <li>Train administrators and hand off the runbooks</li>
      <li>Operate independently or arrange optional support</li>
    </ol>`;
}

const serviceMenu = document.querySelector('.svc-nav details');
if (serviceMenu) {
  const summary = serviceMenu.querySelector('summary');
  serviceMenu.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !serviceMenu.open) return;
    serviceMenu.open = false;
    summary.focus();
  });
  document.addEventListener('click', event => {
    if (!serviceMenu.contains(event.target)) serviceMenu.open = false;
  });
}

const schedule = publicHttps(siteConfig.consultationSchedule);
if (schedule) {
  document.querySelectorAll('[data-schedule]').forEach(link => {
    link.href = schedule;
    link.hidden = false;
  });
}
