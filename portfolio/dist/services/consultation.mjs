import { applications } from './applications.mjs';
import { range, readSession } from './common.mjs';
import { pricing, tiers } from './pricing.mjs';
import { bindEmailBrief } from './email-brief.mjs';

const form = document.querySelector('#consultation-form');
const status = document.querySelector('#consultation-status');
const details = form.querySelector('[data-quote-details]');
const detailsTitle = details.querySelector('summary');
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
  return { title, body };
}

form.noValidate = true;
for (const field of requiredFields) {
  field.addEventListener('blur', () => {
    if (field.value || field.hasAttribute('aria-invalid')) validateField(field);
  });
  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validateField(field);
  });
}
bindEmailBrief({ form, status, validate: valid, compose: inquiry });
