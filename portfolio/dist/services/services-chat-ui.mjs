import {
  Collapsible, MessageScroller, Progress as ProgressPrimitive,
  createElement as h, createRoot, useEffect, useRef, useState
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

const CHAT_URL = '/api/services-chat';

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

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'));
    script.onerror = () => {
      script.remove();
      reject(new Error('Turnstile unavailable'));
    };
    document.head.append(script);
  });
}

function Verification({ siteKey, onToken }) {
  const container = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let turnstile;
    let widget;
    loadTurnstile().then(api => {
      if (!active) return;
      turnstile = api;
      widget = api.render(container.current, {
        sitekey: siteKey,
        action: 'services_chat',
        appearance: 'interaction-only',
        size: 'compact',
        'response-field': false,
        callback: token => {
          setFailed(false);
          onToken(token);
        },
        'expired-callback': () => onToken(''),
        'error-callback': () => {
          onToken('');
          setFailed(true);
        }
      });
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      if (widget !== undefined) turnstile.remove(widget);
    };
  }, [siteKey, onToken, attempt]);

  return h('div', null,
    h('div', { ref: container }),
    failed && h('button', {
      className: 'consult-chat-send', type: 'button', onClick: () => {
        onToken('');
        setFailed(false);
        setAttempt(current => current + 1);
      }
    }, 'Retry verification'));
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
          onAnswer(answer);
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
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [config, setConfig] = useState(null);
  const [configStatus, setConfigStatus] = useState('idle');
  const [token, setToken] = useState('');
  const [challenge, setChallenge] = useState(0);
  const pending = useRef(null);
  const input = useRef(null);
  const submit = useRef(null);
  const needsVerification = config && !config.verified;
  const canSend = config && (!needsVerification || token) && !!draft.trim() && !busy;

  async function loadConfig() {
    setConfigStatus('loading');
    try {
      const response = await chatRequest();
      if (!response.ok) throw await chatError(response);
      const data = await response.json();
      if (typeof data.siteKey !== 'string' || !data.siteKey) throw new Error('Missing site key');
      setConfig(data);
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
    setBusy(true);
    setDraft('');
    if (document.activeElement === submit.current) input.current.focus({ preventScroll: true });
    setTurns(current => [...current, { id, question }]);
    const updateReply = reply => setTurns(current =>
      current.map(turn => turn.id === id ? { ...turn, reply } : turn));

    let partial = '';
    try {
      if (!config.verified) {
        const verification = await chatRequest({ token }, controller.signal);
        if (!verification.ok) throw await chatError(verification);
        setConfig(current => ({ ...current, verified: true }));
        setToken('');
      }

      const response = await chatRequest({ question }, controller.signal);
      if (response.status === 401) {
        setConfig(current => ({ ...current, verified: false }));
      }
      if (!response.ok) throw await chatError(response);
      updateReply(await readAnswer(response, answer => {
        partial = answer;
        setStreaming(true);
        updateReply({ answer, streaming: true });
      }));
      setAnnouncement('Answer ready.');
    } catch (error) {
      setDraft(current => current || question);
      if (controller.signal.aborted) {
        updateReply({ answer: partial, stopped: true });
        setAnnouncement('Answer stopped.');
      } else {
        setToken('');
        setChallenge(current => current + 1);
        const message = error.constructor === Error ? error.message : 'Chat is unavailable. Try again or send a project brief.';
        updateReply({ answer: partial, error: message });
        setAnnouncement('');
      }
    } finally {
      setBusy(false);
      setStreaming(false);
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

  return h('div', { className: 'consult-chat-body' },
    turns.length > 0 && h(MessageScroller.Provider, { autoScroll: true, scrollPreviousItemPeek: 24 },
      h(MessageScroller.Root, { className: 'consult-chat-scroller' },
        h(MessageScroller.Viewport, { className: 'consult-chat-viewport', 'aria-label': 'Conversation' },
          h(MessageScroller.Content, {
            id: 'services-chat-history', className: 'consult-chat-history',
            'aria-label': 'Chat messages', 'aria-busy': busy
          }, messages)),
        h(MessageScroller.Button, { behavior: 'auto', className: 'consult-chat-latest' }, 'Jump to latest'))),
    busy && !streaming && h(PendingReply),
    h('p', { className: 'svc-sr-only', role: 'status' },
      busy ? (streaming ? 'Receiving an answer.' : 'Preparing an answer.') : announcement),
    h('form', { id: 'services-chat-form', className: 'composer-bar', 'data-slot': 'composer-bar', onSubmit: ask },
      h('label', { className: 'svc-sr-only', htmlFor: 'services-chat-question' }, 'Ask AI about my services'),
      h('textarea', {
        id: 'services-chat-question', name: 'question', className: 'composer-input', 'data-slot': 'composer-input',
        placeholder: 'Ask AI about my services…', rows: 1, maxLength: 1200,
        'aria-describedby': 'services-chat-privacy', ref: input, value: draft,
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
        }, h('svg', {
          viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2,
          strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
        }, busy ? h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'currentColor' })
          : h('path', { d: 'M12 19V5m-6 6 6-6 6 6' }))))),
    configStatus === 'loading' && h('p', { className: 'composer-note', role: 'status' }, 'Connecting to chat…'),
    configStatus === 'error' && h('p', { className: 'composer-note', role: 'status' },
      'Chat is unavailable. ', h('a', { href: '/contact#quote' }, 'Prepare a project brief'), ' or ',
      h('button', { className: 'consult-chat-send', type: 'button', onClick: loadConfig }, 'Retry chat')),
    needsVerification && !token && h('p', { className: 'composer-note', role: 'status' }, 'Verify your browser to start chatting.'),
    needsVerification && h(Verification, {
      key: challenge, siteKey: config.siteKey, onToken: setToken
    }),
    h('p', { id: 'services-chat-privacy', className: 'composer-note' },
      'Keep contact details, passwords, and private project information out of chat.'));
}

const composer = document.querySelector('#services-chat');
if (composer) createRoot(composer).render(h(ServicesChat));
