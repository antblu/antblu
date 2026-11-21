import { readFileSync, writeFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function Header({ services = false }) {
  const links = [
    ['Experience', services ? '/#resume' : '#resume'],
    ['Projects', services ? '/#portfolio' : '#portfolio'],
    ['Services', '/services'],
    ['Blog', 'https://blog.antblu.net'],
    ['Contact', '/contact']
  ];
  return h('header', { className: 'svc-header' },
    h('div', { className: 'svc-wrap' },
      h('a', { className: 'svc-brand', href: '/', 'aria-label': 'antblu home' },
        h('picture', null, h('img', { src: '/favicon.svg', alt: '', width: 42, height: 28 })),
        h('span', null, 'antblu')),
      h('button', {
        className: 'svc-btn svc-menu-toggle', type: 'button', hidden: true,
        'aria-expanded': false, 'aria-controls': 'site-nav'
      }, 'Menu'),
      h('nav', { id: 'site-nav', className: 'svc-nav', 'aria-label': 'Main navigation' },
        links.map(([label, href]) => h('a', {
          key: label, href, 'aria-current': services && href === '/services' ? 'page' : undefined
        }, label))),
      h('button', {
        className: 'svc-btn svc-theme', type: 'button', hidden: true, 'data-svc-theme': '',
        'aria-label': 'Dark mode', 'aria-pressed': false
      },
        h('svg', { className: 'theme-icon theme-sun', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true },
          h('circle', { cx: '12', cy: '12', r: '5' }),
          h('path', { d: 'M11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM3.51 4.93l1.42-1.42 2.12 2.13-1.41 1.41zm13.44 13.43 1.41-1.41 2.13 2.12-1.42 1.42zM3.51 19.07l2.13-2.12 1.41 1.41-2.12 2.13zM16.95 5.64l2.12-2.13 1.42 1.42-2.13 2.12z' })),
        h('svg', { className: 'theme-icon theme-moon', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true },
          h('path', { d: 'M20.9 13.4A9 9 0 0 1 10.6 3.1a.8.8 0 0 0-1.1-.9A10.2 10.2 0 1 0 21.8 14.5a.8.8 0 0 0-.9-1.1Z' })))));
}

const sections = [
  ['index.html', 'site-header', h(Header)],
  ['services/index.html', 'site-header', h(Header, { services: true })],
];

for (const [file, name, component] of sections) {
  const path = new URL('../dist/' + file, import.meta.url);
  const html = readFileSync(path, 'utf8');
  const start = `<!-- BEGIN ${name} -->`;
  const end = `<!-- END ${name} -->`;
  const before = html.indexOf(start);
  const after = html.indexOf(end);
  if (before === -1 || after < before) throw new Error(`Missing ${name} markers in ${file}`);
  const markup = renderToStaticMarkup(component);
  writeFileSync(path, html.slice(0, before + start.length) + '\n  ' + markup + '\n  ' + html.slice(after));
}
