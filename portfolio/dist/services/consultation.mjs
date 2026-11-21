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

const requiredFields = [...form.querySelectorAll('[data-slot="field"] [required]')];
const fieldDescriptions = new Map(requiredFields.map(field => [field, field.getAttribute('aria-describedby')]));

function showFieldError(field, message) {
  const group = field.closest('[data-slot="field"]');
  const error = group.querySelector('[data-slot="field-error"]');
  const description = fieldDescriptions.get(field);
  const describedBy = [description, message && error.id].filter(Boolean).join(' ');
  if (describedBy) field.setAttribute('aria-describedby', describedBy);
  else field.removeAttribute('aria-describedby');

  if (message) {
    group.dataset.invalid = 'true';
    field.setAttribute('aria-invalid', 'true');
  } else {
    delete group.dataset.invalid;
    field.removeAttribute('aria-invalid');
  }
  error.hidden = !message;
  if (error.textContent !== message) error.textContent = message;
}

function validateField(field) {
  if (field.name === 'name' || field.name === 'message') {
    field.setCustomValidity(field.value && !field.value.trim() ? 'Please fill out this field.' : '');
  }
  showFieldError(field, field.validationMessage);
  return field.validity.valid;
}

function valid() {
  const invalidFields = requiredFields.filter(field => !validateField(field));
  invalidFields[0]?.focus();
  return invalidFields.length === 0;
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
form.noValidate = true;
for (const field of requiredFields) {
  field.addEventListener('blur', () => {
    if (field.value || field.hasAttribute('aria-invalid')) validateField(field);
  });
  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validateField(field);
  });
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (send.disabled || !valid()) return;
  send.disabled = true;
  draft.disabled = true;
  status.classList.remove('motion-success');
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your consultation request…';
  const result = await submitContactTicket({ ...inquiry(), supportUrl: form.dataset.supportUrl });
  if (result.state === 'sent') {
    status.classList.add('motion-success');
    form.reset();
    for (const field of requiredFields) showFieldError(field, '');
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
