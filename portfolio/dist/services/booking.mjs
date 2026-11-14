import { siteConfig } from './site-config.mjs';

const { origin, pathname } = new URL(siteConfig.consultationSchedule);
const namespace = '30min';

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
booking('inline', {
  elementOrSelector: '[data-booking-calendar]',
  calLink: pathname.slice(1),
  config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }
});
booking('ui', { hideEventTypeDetails: false, layout: 'month_view' });

const script = document.createElement('script');
script.src = origin + '/embed/embed.js';
document.head.append(script);
