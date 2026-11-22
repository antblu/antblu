const chat = document.querySelector('#services-chat');

if (chat) {
  const panel = chat.querySelector('#services-chat-panel');
  const status = chat.querySelector('#services-chat-loading');
  let mounting = false;
  let mounted = false;

  async function openChat() {
    if (!chat.open) return;
    if (chat.getBoundingClientRect().top > window.innerHeight * .25) {
      chat.scrollIntoView({ block: 'start' });
    }
    if (mounting || mounted) return;
    mounting = true;
    status.textContent = 'Opening chat…';
    status.hidden = false;

    try {
      const { mountServicesChat } = await import('./services-chat-ui.mjs');
      mountServicesChat(panel);
      mounted = true;
    } catch {
      status.textContent = 'Chat couldn’t open.';
    } finally {
      mounting = false;
    }
  }

  chat.addEventListener('toggle', openChat);
  if (location.hash === '#services-chat') chat.open = true;
  if (chat.open) void openChat();
}
