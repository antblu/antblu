import { bindEmailBrief } from './email-brief.mjs';

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const fields = ['name', 'message'].map(name => form.elements.namedItem(name));
for (const field of fields) field.addEventListener('input', () => field.setCustomValidity(''));

bindEmailBrief({
  form,
  status,
  validate() {
    for (const field of fields) field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
    return form.reportValidity();
  },
  compose() {
    const data = new FormData(form);
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const phone = data.get('phone').trim();
    return {
      title: `antblu.net inquiry from ${name}`,
      body: `${data.get('message').trim()}\n\nFrom: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}`
    };
  }
});
