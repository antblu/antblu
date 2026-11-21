import { applications } from './applications.mjs';
import { range, readSession } from './common.mjs';
import { pricing, tiers } from './pricing.mjs';
import { submitContactTicket, ticketMessages } from './contact-api.mjs';

const form = document.querySelector('#consultation-form');
const status = document.querySelector('#consultation-status');
const send = form.querySelector('[type="submit"]');
const draft = form.querySelector('[data-email-draft]');
const details = form.querySelector('[data-quote-details]');
const detailsTitle = details.querySelector('summary');
const defaultDetailsTitle = detailsTitle.textContent;
const query = new URLSearchParams(location.search);
const get = name => form.elements.namedItem(name);
const quote = query.get('configuration') === 'calculator' ? readSession('antblu-quote') : null;
const service = query.get('service');
const tier = query.get('tier');
const selectedApps = (query.get('apps') || '').split(',');
const moduleLines = applications.filter(app => selectedApps.includes(app.id)).map(app => `${app.name}: ${range(pricing[app.price])} one-time`);
if ([...get('service').options].some(option => option.value === service)) get('service').value = service;
if (quote && [...get('hosting').options].some(option => option.value === quote.hosting)) get('hosting').value = quote.hosting;

const prepared = [
  Object.hasOwn(tiers, tier) ? `Preferred tier: ${tiers[tier]}.` : '',
  moduleLines.length ? `Selected application modules:\n${moduleLines.join('\n')}` : '',
  typeof quote?.summary === 'string' ? quote.summary : ''
].filter(Boolean).join('\n\n');
if (prepared) {
  get('configuration').value = prepared.slice(0, 6500);
  if (quote?.sample === true) detailsTitle.textContent = 'Configuration · Sample scenario';
  details.open = true;
}

function valid() {
  for (const field of [get('name'), get('message')]) field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
  return form.reportValidity();
}
function inquiry() {
  const selectLabel = name => get(name).selectedOptions[0].text;
  const name = get('name').value.trim();
  const email = get('email').value.trim();
  const title = `Consultation request · ${selectLabel('service')}`;
  const body = [
    get('message').value.trim(),
    `Name: ${name}\nEmail: ${email}`,
    get('business').value.trim() ? `Business: ${get('business').value.trim()}` : '',
    `Requested service: ${selectLabel('service')}`,
    get('hosting').value ? `Preferred hosting: ${selectLabel('hosting')}` : '',
    get('configuration').value.trim() ? `Configuration:\n${get('configuration').value.trim()}` : '',
    'Source: antblu.net consultation form'
  ].filter(Boolean).join('\n\n');
  return { name, email, title, body, honeypot: get('zammad_form_url').value };
}

send.disabled = false;
draft.hidden = false;
form.addEventListener('input', event => event.target.setCustomValidity?.(''));
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (send.disabled || !valid()) return;
  send.disabled = true;
  draft.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your consultation request…';
  const result = await submitContactTicket({ ...inquiry(), supportUrl: form.dataset.supportUrl });
  if (result.state === 'sent') {
    form.reset();
    detailsTitle.textContent = defaultDetailsTitle;
    try { if (quote) sessionStorage.removeItem('antblu-quote'); } catch {}
    status.textContent = `Consultation request received. Your ticket number is #${result.number}.`;
  } else {
    status.textContent = ticketMessages[result.state];
  }
  form.removeAttribute('aria-busy');
  send.disabled = false;
  draft.disabled = false;
  status.focus();
});

draft.addEventListener('click', () => {
  if (!valid()) return;
  const { title, body } = inquiry();
  const email = `mailto:antblu@antblu.net?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body.replaceAll('\n', '\r\n'))}`;
  if (email.length > 1900) {
    const summary = get('configuration');
    const text = summary.value ? summary : get('message');
    if (summary.value) details.open = true;
    text.focus();
    text.select();
    status.textContent = 'This request is too long for a portable email link. Copy the selected text and email it with your inquiry to antblu@antblu.net, or send it through the form.';
    return;
  }
  location.href = email;
  status.textContent = 'Send the draft from your email app to submit your request.';
});
