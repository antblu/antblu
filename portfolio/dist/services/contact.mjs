const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');
const button = form.querySelector('[type="submit"]');

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled) return;
  for (const name of ['name', 'message']) {
    const field = form.elements.namedItem(name);
    field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
    if (!field.reportValidity()) return;
  }
  const data = new FormData(form);
  const supportUrl = form.dataset.supportUrl;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your message…';
  try {
    const { submitContactTicket, ticketMessages } = await import('./contact-api.mjs');
    const name = data.get('name').trim();
    const email = data.get('email').trim();
    const phone = data.get('phone').trim();
    const result = await submitContactTicket({
      supportUrl, name, email, honeypot: data.get('zammad_form_url'),
      title: `antblu.net inquiry from ${name}`,
      body: `${data.get('message').trim()}\n\nFrom: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\nSource: antblu.net contact form`
    });
    if (result.state === 'sent') {
      status.textContent = `Message sent. Your ticket number is #${result.number}. I’ll reply to your email address.`;
      form.reset();
    } else {
      status.textContent = ticketMessages[result.state];
    }
  } catch {
    status.textContent = 'The contact service is unavailable. Your message is still here. Please try later or email antblu@antblu.net.';
  } finally {
    button.disabled = false;
    form.removeAttribute('aria-busy');
  }
});
form.addEventListener('input', event => event.target.setCustomValidity?.(''));
button.disabled = false;
