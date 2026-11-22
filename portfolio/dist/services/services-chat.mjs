const form = document.querySelector('#services-chat-form');

if (form) {
  const input = form.elements.namedItem('question');
  const submit = form.querySelector('button[type="submit"]');
  const transcript = document.querySelector('#services-chat-history');
  const status = document.querySelector('#services-chat-status');
  let questions = [];

  function addMessage(speaker, message, sources = []) {
    const entry = document.createElement('li');
    const label = document.createElement('strong');
    const body = document.createElement('p');
    label.textContent = speaker;
    body.textContent = message;
    entry.append(label, body);

    if (sources.length) {
      const links = document.createElement('ul');
      links.className = 'consult-chat-sources';
      links.setAttribute('aria-label', 'Sources');
      for (const source of sources) {
        let url;
        try {
          url = new URL(source);
        } catch {
          continue;
        }
        if (url.protocol !== 'https:' || !['antblu.net', 'docs.antblu.net'].includes(url.host)) continue;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = url.href;
        const page = url.pathname.split('/').filter(Boolean).at(-1) || url.hostname;
        link.textContent = page === 'contact' ? 'Prepare a project brief' : page.replaceAll('-', ' ');
        item.append(link);
        links.append(item);
      }
      if (links.childElementCount) entry.append(links);
    }
    transcript.append(entry);
    transcript.scrollTop = transcript.scrollHeight;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || submit.disabled) return;

    submit.disabled = true;
    input.value = '';
    addMessage('You', question);
    status.textContent = 'Looking up your question…';
    const nextQuestions = [...questions, question].slice(-4);

    try {
      const response = await fetch('/api/services-chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({questions: nextQuestions}),
        signal: AbortSignal.timeout(75000)
      });
      if (!response.ok) {
        if (response.status === 429) {
          status.textContent = 'Chat is busy. Try again shortly.';
          input.value ||= question;
          return;
        }
        throw new Error('Chat unavailable');
      }
      const data = await response.json();
      if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Empty answer');
      questions = nextQuestions;
      addMessage('Services assistant', data.answer, Array.isArray(data.sources) ? data.sources : []);
      status.textContent = '';
    } catch {
      status.textContent = 'Chat is unavailable. You can still send a project brief.';
      input.value ||= question;
    } finally {
      submit.disabled = false;
    }
  });

  form.hidden = false;
}
