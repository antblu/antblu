import { siteConfig } from './site-config.mjs';

const { origin, pathname } = new URL(siteConfig.consultationSchedule);
const namespace = '30min';
const calLink = pathname.slice(1);
const config = { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' };
const inline = document.querySelector('#my-cal-inline-30min');
const popup = document.querySelector('[data-booking-popup]');

// Queue calls until the Cal.diy embed script has loaded.
function cal(...args) {
  const [command, name] = args;
  if (command === 'init') {
    const api = (...instruction) => api.q.push(instruction);
    api.q = [args];
    cal.ns[name] = api;
    cal.q.push(['initNamespace', name]);
  } else {
    cal.q.push(args);
  }
}

cal.ns = {};
cal.q = [];
cal.loaded = true;
window.Cal = cal;
cal('init', namespace, { origin });

const booking = cal.ns[namespace];
if (inline) {
  booking('inline', { elementOrSelector: '#my-cal-inline-30min', calLink, config });
}
booking('ui', { hideEventTypeDetails: false, layout: 'month_view' });

const script = document.createElement('script');
script.src = origin + '/embed/embed.js';
if (popup) {
  script.addEventListener('load', () => {
    // Use a button once the widget is available. Until then, the link opens Services.
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = popup.className;
    trigger.textContent = popup.textContent;
    trigger.dataset.calLink = calLink;
    trigger.dataset.calNamespace = namespace;
    trigger.dataset.calConfig = JSON.stringify(config);
    popup.replaceWith(trigger);
  });
}
document.head.append(script);
