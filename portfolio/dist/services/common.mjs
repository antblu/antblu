import '../theme.mjs';
import './navigation.mjs';
import { pricing, hosting } from './pricing.mjs';

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

document.querySelectorAll('[data-price]').forEach(node => { node.textContent = range(pricing[node.dataset.price]); });
document.querySelectorAll('[data-hosting-price]').forEach(node => {
  const option = hosting[node.dataset.hostingPrice];
  node.textContent = `${range(option)} / month`;
});
const process = document.querySelector('[data-service-process]');
if (process) {
  process.innerHTML = `<h2>Project steps</h2>
    <ol class="svc-steps">
      <li><a href="/services/applications">Explore the catalog</a></li>
      <li><a href="/demo">Try the demo</a></li>
      <li><a href="/services#booking">Book a consultation</a></li>
      <li>Review an architecture and cost estimate</li>
      <li>Approve the scope and implementation plan</li>
      <li>Deploy and integrate</li>
      <li>Test, migrate, and validate</li>
      <li>Administrator training and runbook handoff</li>
      <li>Run the system in-house or arrange support</li>
    </ol>`;
}
