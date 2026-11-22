import { brand } from './site-content.mjs';

export function bindEmailBrief({ form, status, validate, compose }) {
  const open = form.querySelector('[type="submit"]');
  const copy = form.querySelector('[data-copy-brief]');
  const fallback = form.querySelector('.consult-draft');
  const fallbackLabel = form.querySelector('[data-draft-label]');
  open.disabled = false;
  copy.hidden = false;

  function selectBrief(body, message) {
    fallback.value = body;
    fallback.hidden = false;
    fallbackLabel.hidden = false;
    fallback.focus();
    fallback.select();
    status.textContent = message;
  }

  form.addEventListener('input', event => {
    if (event.target === fallback) return;
    fallback.value = '';
    fallback.hidden = true;
    fallbackLabel.hidden = true;
    status.textContent = '';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate()) return;
    const { title, body } = compose();
    const href = `mailto:${brand.email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(body.replaceAll('\n', '\r\n'))}`;
    if (href.length > 1900) {
      selectBrief(body, `Copy the selected brief into an email to ${brand.email}.`);
      return;
    }
    location.href = href;
    status.textContent = 'Send the draft from your email app.';
  });

  copy.addEventListener('click', async () => {
    if (!validate()) return;
    const { body } = compose();
    try {
      await navigator.clipboard.writeText(body);
      status.textContent = 'Brief copied.';
    } catch {
      selectBrief(body, 'Copy the selected brief with your browser or keyboard.');
    }
  });
}
