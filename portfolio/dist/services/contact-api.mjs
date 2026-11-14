// Zammad's public form channel validates email and its fingerprint-bound token,
// and enforces server-side spam controls configured on the support service.
export async function submitContactTicket({ supportUrl = '', name, email, title, body, honeypot = '' }) {
  if (honeypot) return { state: 'rejected' };
  let submitted = false;
  try {
    const fingerprint = crypto.randomUUID();
    const configResponse = await fetch(`${supportUrl}/api/v1/form_config`, {
      method: 'POST', body: new URLSearchParams({ fingerprint }), credentials: 'omit', signal: AbortSignal.timeout(15000)
    });
    if (!configResponse.ok) return { state: 'unavailable' };
    const config = await configResponse.json();
    if (!config.enabled || !config.token || config.spam_protection?.captcha) return { state: 'unavailable' };
    const payload = new FormData();
    Object.entries({ fingerprint, token: config.token, name, email, title, body }).forEach(([key, value]) => payload.set(key, value));
    if (config.spam_protection?.honeypot?.field) payload.set(config.spam_protection.honeypot.field, honeypot);
    submitted = true;
    const response = await fetch(`${supportUrl}/api/v1/form_submit`, {
      method: 'POST', body: payload, credentials: 'omit', signal: AbortSignal.timeout(30000)
    });
    const result = await response.json();
    if (result.errors?.spam) return { state: 'rejected' };
    if (result.errors?.email) return { state: 'invalid-email' };
    if (response.ok && result.ticket?.number) return { state: 'sent', number: result.ticket.number };
    return { state: 'uncertain' };
  } catch {
    return { state: submitted ? 'uncertain' : 'unavailable' };
  }
}

export const ticketMessages = {
  'invalid-email': 'Please enter a valid email address that can receive replies.',
  'rejected': 'The form could not accept this request. You can email antblu@antblu.net.',
  'unavailable': 'The contact service is unavailable. Your message is still here. Please try later or email antblu@antblu.net.',
  'uncertain': 'Delivery could not be confirmed. Please avoid resending immediately. If you need help, email antblu@antblu.net.'
};
