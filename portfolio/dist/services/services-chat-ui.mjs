import {
  Collapsible, MessageScroller, Progress as ProgressPrimitive, ThinkingOrb,
  createElement as h, createRoot, useEffect, useRef, useState
} from '../assets/vendor/emiliany-vendor.js';

function Progress() {
  return h(ProgressPrimitive.Root, { value: null, 'data-slot': 'progress' },
    h(ProgressPrimitive.Label, { 'data-slot': 'progress-label', className: 'svc-sr-only' }, 'Answer progress'),
    h(ProgressPrimitive.Track, { 'data-slot': 'progress-track' },
      h(ProgressPrimitive.Indicator, { 'data-slot': 'progress-indicator' })));
}

// The shadcn Trace slots use local styles and Base UI's Collapsible.
function TraceLine({ title, status, icon, showOrb }) {
  return h('span', { 'data-slot': 'trace-line', 'data-status': status },
    h('span', { 'data-slot': 'trace-icon', 'aria-hidden': true },
      showOrb ? h(ThinkingOrb, { state: 'working', size: 20, theme: 'dark' })
        : h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' },
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

function PendingReply({ streaming }) {
  const [showOrb, setShowOrb] = useState(false);
  useEffect(() => {
    if (streaming) return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference) and (forced-colors: none)');
    let timer;
    function schedule() {
      clearTimeout(timer);
      setShowOrb(false);
      if (motion.matches) timer = setTimeout(() => setShowOrb(true), 2000);
    }
    schedule();
    motion.addEventListener('change', schedule);
    return () => {
      clearTimeout(timer);
      motion.removeEventListener('change', schedule);
    };
  }, [streaming]);
  return h('div', { className: 'consult-chat-pending' },
    h('div', { 'data-slot': 'trace' }, h(TraceLine, {
      title: streaming ? 'Receiving an answer…' : 'Preparing an answer…',
      status: 'running',
      showOrb: !streaming && showOrb,
      icon: 'M12 6v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z'
    })),
    h(Progress));
}

const CHAT_URL = '/api/services-chat';

function controlIcon(name) {
  return h('img', {
    className: 'consult-chat-control-icon', src: new URL(`../assets/chat-icons/${name}.svg`, import.meta.url).href,
    width: 20, height: 20, alt: ''
  });
}

async function chatRequest(body, signal) {
  const timeout = AbortSignal.timeout(body?.question ? 95000 : 15000);
  const options = { signal: signal ? AbortSignal.any([signal, timeout]) : timeout };
  if (body) {
    options.method = 'POST';
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(body);
  }
  return fetch(CHAT_URL, options);
}

async function chatError(response) {
  const data = await response.json();
  return new Error(data.error);
}

async function readAnswer(response, onAnswer) {
  if (!response.headers.get('Content-Type')?.startsWith('text/event-stream') || !response.body) {
    throw new Error('Chat is unavailable. Try again or send a project brief.');
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let answer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const [event, data] = frame.split('\n');
        const payload = JSON.parse(data.slice('data: '.length));
        if (event === 'event: delta') {
          answer += payload.text;
          if (answer.trim()) onAnswer(answer);
        } else if (event === 'event: done' && answer.trim()) {
          return { answer: answer.trim(), sources: publicSources(payload.sources) };
        } else if (event === 'event: error') {
          throw new Error(payload.message);
        }
      }
    }
    throw new Error('The reply was interrupted. Try again or send a project brief.');
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Standalone composer layout adapted from https://www.assistant-ui.com/elements/composer.
function ServicesChat() {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState('');
  // Each request waits, may stream, then completes, stops, or fails.
  const [requestPhase, setRequestPhase] = useState('idle');
  const [configStatus, setConfigStatus] = useState('idle');
  const [expanded, setExpanded] = useState(false);
  const chat = useRef(null);
  const resizeButton = useRef(null);
  const pending = useRef(null);
  const input = useRef(null);
  const submit = useRef(null);
  const streaming = requestPhase === 'streaming';
  const busy = requestPhase === 'waiting' || streaming;
  const canSend = configStatus === 'ready' && !!draft.trim() && !busy;

  function resizeChat() {
    const dialog = chat.current;
    const container = dialog.parentElement;
    container.style.minHeight = expanded ? '' : dialog.offsetHeight + 'px';
    // Switch dialog modes in place so the transcript and composer stay mounted.
    dialog.close();
    if (expanded) dialog.show();
    else dialog.showModal();
    setExpanded(!expanded);
    resizeButton.current.focus({ preventScroll: true });
  }

  async function loadConfig() {
    setConfigStatus('loading');
    try {
      const response = await chatRequest();
      if (!response.ok || (await response.json()).status !== 'ok') {
        throw new Error('Chat is unavailable');
      }
      setConfigStatus('ready');
    } catch {
      setConfigStatus('error');
    }
  }

  async function ask(event) {
    event.preventDefault();
    if (pending.current || !canSend) return;

    const question = draft.trim();
    const id = turns.length;
    const controller = new AbortController();
    pending.current = controller;
    setRequestPhase('waiting');
    setDraft('');
    if (document.activeElement === submit.current) input.current.focus({ preventScroll: true });
    setTurns(current => [...current, { id, question }]);
    const updateReply = reply => setTurns(current =>
      current.map(turn => turn.id === id ? { ...turn, reply } : turn));

    let partial = '';
    try {
      const response = await chatRequest({ question }, controller.signal);
      if (!response.ok) throw await chatError(response);
      const reply = await readAnswer(response, answer => {
        controller.signal.throwIfAborted();
        partial = answer;
        setRequestPhase('streaming');
        updateReply({ answer, streaming: true });
      });
      controller.signal.throwIfAborted();
      updateReply(reply);
      setRequestPhase('complete');
    } catch (error) {
      setDraft(current => current || question);
      if (controller.signal.aborted) {
        updateReply({ answer: partial, stopped: true });
        setRequestPhase('stopped');
      } else {
        const message = error.constructor === Error ? error.message : 'Chat is unavailable. Try again or send a project brief.';
        updateReply({ answer: partial, error: message });
        setRequestPhase('failed');
      }
    } finally {
      pending.current = null;
    }
  }

  const messages = turns.flatMap(({ id, question, reply }) => [
    h(MessageScroller.Item, {
      key: 'question-' + id, messageId: 'question-' + id, scrollAnchor: true, className: 'consult-chat-question'
    }, h('strong', null, 'You'), h('p', null, question)),
    reply && h(MessageScroller.Item, {
      key: 'reply-' + id, messageId: 'reply-' + id, className: 'consult-chat-answer'
    },
    h('strong', null, 'Services assistant'),
    reply.stopped
      ? h('p', null, 'Answer stopped.')
      : !reply.streaming && h(Trace, { sources: reply.sources || [], error: reply.error }),
    reply.answer && h('p', null, reply.answer),
    reply.error && h('p', { role: 'status' }, reply.error),
    reply.error && h('a', { href: '/contact#quote' }, 'Prepare a project brief'))
  ]);
  const announcement = {
    waiting: 'Preparing an answer.',
    streaming: 'Receiving an answer.',
    complete: 'Answer ready.',
    stopped: 'Answer stopped.'
  }[requestPhase];

  return h('dialog', {
    className: 'consult-chat-body', open: true, ref: chat, 'aria-label': 'Services assistant',
    onCancel: event => {
      event.preventDefault();
      resizeChat();
    }
  },
    turns.length > 0 && h('div', { className: 'consult-chat-header' },
      expanded && h('strong', null, 'Services assistant'),
      h('button', {
        className: 'svc-btn consult-chat-resize', type: 'button', ref: resizeButton, onClick: resizeChat,
        'aria-label': 'Expand chat', 'aria-pressed': expanded,
        title: expanded ? 'Collapse chat' : 'Expand chat'
      }, controlIcon(expanded ? 'minimize' : 'maximize'))),
    turns.length > 0 && h(MessageScroller.Provider, { autoScroll: true, scrollPreviousItemPeek: 24 },
      h(MessageScroller.Root, { className: 'consult-chat-scroller' },
        h(MessageScroller.Viewport, { className: 'consult-chat-viewport', 'aria-label': 'Conversation' },
          h(MessageScroller.Content, {
            id: 'services-chat-history', className: 'consult-chat-history',
            'aria-label': 'Chat messages', 'aria-busy': busy
          }, messages)),
        h(MessageScroller.Button, { behavior: 'auto', className: 'consult-chat-latest' }, 'Jump to latest'))),
    busy && h(PendingReply, { streaming }),
    h('p', { className: 'svc-sr-only', role: 'status' }, announcement),
    h('form', { id: 'services-chat-form', className: 'composer-bar', 'data-slot': 'composer-bar', onSubmit: ask },
      h('label', { className: 'svc-sr-only', htmlFor: 'services-chat-question' }, 'Ask AI about my services'),
      h('textarea', {
        id: 'services-chat-question', name: 'question', className: 'composer-input', 'data-slot': 'composer-input',
        placeholder: 'Ask AI about my services…', rows: 1, maxLength: 1200,
        ref: input, value: draft,
        onFocus: () => {
          if (configStatus === 'idle') void loadConfig();
        },
        onChange: event => setDraft(event.currentTarget.value),
        onKeyDown: event => {
          if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing || event.keyCode === 229 || !canSend) return;
          event.preventDefault();
          event.currentTarget.form.requestSubmit();
        }
      }),
      h('div', { className: 'composer-toolbar', 'data-slot': 'composer-toolbar' },
        h('button', {
          className: 'composer-send', 'data-slot': 'composer-send', type: busy ? 'button' : 'submit',
          'aria-label': busy ? 'Stop generating' : 'Send message', disabled: !busy && !canSend, ref: submit,
          onClick: busy ? event => {
            event.preventDefault();
            pending.current?.abort();
            input.current.focus({ preventScroll: true });
          } : undefined
        }, controlIcon(busy ? 'stop' : 'send')))),
    configStatus === 'loading' && h('p', { className: 'svc-sr-only', role: 'status' }, 'Connecting to chat…'),
    configStatus === 'error' && h('p', { className: 'composer-note', role: 'status' },
      'Chat is unavailable. ', h('a', { href: '/contact#quote' }, 'Prepare a project brief'), ' or ',
      h('button', { className: 'consult-chat-send', type: 'button', onClick: loadConfig }, 'Retry chat')));
}

const composer = document.querySelector('#services-chat');
if (composer) createRoot(composer).render(h(ServicesChat));
