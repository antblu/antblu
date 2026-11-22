import {
  Collapsible, MessageScroller, Progress as ProgressPrimitive,
  createElement as h, createRoot, useRef, useState
} from '../assets/vendor/emiliany-vendor.js';

function Progress() {
  return h(ProgressPrimitive.Root, { value: null, 'data-slot': 'progress' },
    h(ProgressPrimitive.Label, { 'data-slot': 'progress-label', className: 'svc-sr-only' }, 'Answer progress'),
    h(ProgressPrimitive.Track, { 'data-slot': 'progress-track' },
      h(ProgressPrimitive.Indicator, { 'data-slot': 'progress-indicator' })));
}

// The shadcn Trace slots use local styles and Base UI's Collapsible.
function TraceLine({ title, status, icon }) {
  return h('span', { 'data-slot': 'trace-line', 'data-status': status },
    h('span', { 'data-slot': 'trace-icon', 'aria-hidden': true },
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: icon }))),
    h('span', { 'data-slot': 'trace-title' }, title));
}

function Trace({ sources, error }) {
  if (error || !sources.length) {
    return h('div', { 'data-slot': 'trace' },
      h(TraceLine, error
        ? { title: 'Request failed', status: 'error', icon: 'M12 8v4m0 4h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z' }
        : { title: 'Answer ready', icon: 'm5 12 4 4L19 6' }));
  }
  return h('div', { 'data-slot': 'trace' },
    h(Collapsible.Root, { 'data-slot': 'trace-collapsible' },
      h(Collapsible.Trigger, { 'data-slot': 'trace-collapsible-trigger' },
        h(TraceLine, {
          title: sources.length === 1 ? '1 source' : `${sources.length} sources`,
          icon: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7m-7 4h7'
        }),
        h('span', { className: 'consult-chat-trace-chevron', 'aria-hidden': true })),
      h(Collapsible.Panel, { 'data-slot': 'trace-collapsible-content' },
        h('ul', { className: 'consult-chat-sources' }, sources.map(({ href, label }) =>
          h('li', { key: href }, h('a', { href }, label)))))));
}

function publicSources(sources) {
  const links = new Map();
  for (const source of Array.isArray(sources) ? sources : []) {
    if (typeof source !== 'string') continue;
    let url;
    try {
      url = new URL(source);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:' || url.username || url.password ||
        !['antblu.net', 'docs.antblu.net'].includes(url.host)) continue;
    const page = url.pathname.split('/').filter(Boolean).at(-1) || url.hostname;
    const label = page === 'contact' ? 'Prepare a project brief' : page.replaceAll('-', ' ');
    links.set(url.href, { href: url.href, label });
  }
  return [...links.values()];
}

function PendingReply() {
  return h('div', { className: 'consult-chat-pending' },
    h('div', { 'data-slot': 'trace' }, h(TraceLine, {
      title: 'Preparing an answer…',
      status: 'running',
      icon: 'M12 6v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'
    })),
    h(Progress));
}

function ServicesChat() {
  const [turns, setTurns] = useState([]);
  const [busy, setBusy] = useState(false);
  const questions = useRef([]);
  const pending = useRef(false);
  const input = useRef(null);
  const submit = useRef(null);

  async function ask(event) {
    event.preventDefault();
    const question = input.current.value.trim();
    if (pending.current) return;
    if (!question) {
      input.current.setCustomValidity('Enter a question.');
      input.current.reportValidity();
      return;
    }

    const id = turns.length;
    const nextQuestions = [...questions.current, question].slice(-4);
    pending.current = true;
    setBusy(true);
    input.current.value = '';
    if (document.activeElement === submit.current) input.current.focus({ preventScroll: true });
    setTurns(current => [...current, { id, question }]);

    let reply;
    try {
      const response = await fetch('/api/services-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: nextQuestions }),
        signal: AbortSignal.timeout(75000)
      });
      if (response.status === 429) {
        reply = { error: 'Chat is busy. Try again shortly.' };
      } else {
        if (!response.ok) throw new Error('Chat unavailable');
        const data = await response.json();
        if (typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('Empty answer');
        reply = { answer: data.answer, sources: publicSources(data.sources) };
        questions.current = nextQuestions;
      }
    } catch {
      reply = { error: 'Chat is unavailable. Try again or send a project brief.' };
    } finally {
      if (reply.error && !input.current.value) input.current.value = question;
      setTurns(current => current.map(turn => turn.id === id ? { ...turn, reply } : turn));
      setBusy(false);
      pending.current = false;
    }
  }

  const messages = turns.flatMap(({ id, question, reply }) => [
    h(MessageScroller.Item, {
      key: `question-${id}`, messageId: `question-${id}`, scrollAnchor: true, className: 'consult-chat-question'
    }, h('strong', null, 'You'), h('p', null, question)),
    reply && h(MessageScroller.Item, {
      key: `reply-${id}`, messageId: `reply-${id}`, className: 'consult-chat-answer'
    },
    h('strong', null, 'Services assistant'),
    h(Trace, { sources: reply.sources || [], error: reply.error }),
    h('p', null, reply.error || reply.answer),
    reply.error && h('a', { href: '/contact#quote' }, 'Prepare a project brief'))
  ]);

  return h('div', { className: 'consult-chat-body' },
    h(MessageScroller.Provider, { autoScroll: true, scrollPreviousItemPeek: 24 },
      h(MessageScroller.Root, { className: 'consult-chat-scroller' },
        h(MessageScroller.Viewport, { className: 'consult-chat-viewport', 'aria-label': 'Conversation' },
          h(MessageScroller.Content, {
            id: 'services-chat-history', className: 'consult-chat-history',
            'aria-label': 'Chat messages', 'aria-busy': busy
          },
          h('p', { className: 'consult-chat-intro' }, 'Ask the AI assistant about packages, costs, or what your team receives at handoff.'),
          messages)),
        h(MessageScroller.Button, { behavior: 'auto', className: 'consult-chat-latest' }, 'Jump to latest'))),
    busy && h(PendingReply),
    h('p', { className: 'svc-sr-only', role: 'status' }, busy ? 'Preparing an answer.' : ''),
    h('form', { id: 'services-chat-form', className: 'consult-chat-form', onSubmit: ask },
      h('label', { htmlFor: 'services-chat-question' }, 'Your question'),
      h('textarea', {
        id: 'services-chat-question', name: 'question', rows: 2, maxLength: 1200, required: true,
        'aria-describedby': 'services-chat-privacy', ref: input, onInput: event => event.currentTarget.setCustomValidity('')
      }),
      h('div', { className: 'consult-chat-actions' },
        h('p', { id: 'services-chat-privacy' }, 'Keep contact details, passwords, and private project information out of chat.'),
        h('button', { className: 'consult-chat-send', type: 'submit', disabled: busy, ref: submit }, 'Send'))));
}

export function mountServicesChat(panel) {
  createRoot(panel).render(h(ServicesChat));
}
