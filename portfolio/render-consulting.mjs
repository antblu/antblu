import { pricing, hosting } from './dist/services/pricing.mjs';
import { applications } from './dist/services/applications.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { brand, links, landing, handoff, infrastructure, recovery, policy, ownershipComparison, implementations } from './dist/services/site-content.mjs';

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const anchor = ([href, label], type = '') => `<a${type ? ` class="svc-btn ${type}"` : ''} href="${escape(href)}">${escape(label)}</a>`;
const actions = (...keys) => `<div class="svc-cta">${keys.map((key, index) =>
  anchor(links[key], index ? 'consult-secondary' : 'svc-btn--primary')).join('')}</div>`;
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 0 });
const range = ({ low, high, plus }) => high
  ? `${money.format(low)}–${money.format(high)}${plus ? '+' : ''}`
  : `From ${money.format(low)}`;
const paragraph = text => `<p>${escape(text)}</p>`;
const entries = items => items.map(([heading, text]) =>
  `<div><dt>${escape(heading)}</dt><dd>${escape(text)}</dd></div>`).join('\n');
const block = (heading, body, id = '') => `<section class="consult-section"${id ? ` id="${id}"` : ''}>
  <h2>${escape(heading)}</h2>
  ${body}
</section>`;
const intro = ({ title, lead }, extra = '') => `<section class="consult-hero">
  <div class="svc-wrap${extra ? ' consult-split' : ''}">
    <div><h1>${escape(title)}</h1><p class="consult-lead">${escape(lead)}</p>${extra ? actions('handoff', 'calculator') : ''}</div>
${extra ? `    ${extra}` : ''}
  </div>
</section>`;
const runbook = (onDemo = false) => `<figure class="consult-runbook"${onDemo ? ' id="sample-runbook"' : ''}>
  <figcaption>Sample recovery runbook</figcaption>
  <code>${escape(recovery.path)}</code>
  <h2>${escape(recovery.title)}</h2>
  <dl><div><dt>Operator</dt><dd>${escape(recovery.operator)}</dd></div><div><dt>File</dt><dd><code>${escape(recovery.file)}</code></dd></div></dl>
  <ol>${recovery.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
${onDemo ? '' : `  ${anchor(links.demo)}`}
</figure>`;

const landingBody = `${intro(landing, runbook())}
<div class="svc-wrap">
  ${block('From purchase brief to first restore', `<ol class="consult-stages">${landing.steps.map(([title, text, link]) =>
    `<li><h3>${escape(title)}</h3>${paragraph(text)}${anchor(links[link])}</li>`).join('')}</ol>`, 'why')}
  ${block('What stays in your hands', `<dl class="consult-ledger">${entries(landing.ownership)}</dl>`)}
  <section class="consult-section consult-split" aria-labelledby="consult-evidence">
    <div><h2 id="consult-evidence">${escape(landing.evidence.title)}</h2>${paragraph(landing.evidence.text)}
    <ul>${landing.evidence.links.map(link => `<li>${anchor(link)}</li>`).join('')}</ul></div>
    <figure class="consult-photo"><img src="${escape(landing.evidence.image)}" alt="Rack-mounted lab hardware above an uninterruptible power supply" decoding="async"><figcaption>${escape(landing.evidence.caption)}</figcaption></figure>
  </section>
  ${block('Scope and costs', `<p>Start with one server or scope a redundant deployment around your recovery targets. I also build business sites and stores in client-owned accounts.</p>
    <ul class="consult-links">${[[links.infrastructure[0], 'Infrastructure packages'], ['/services/web-development', 'Business websites'], ['/services/ecommerce', 'Online stores'], links.compare].map(link => `<li>${anchor(link)}</li>`).join('')}</ul>
    <div class="consult-cta-row">${actions('calculator', 'contact')}</div>`, 'packages')}
  ${block('Questions before you start', `<div class="consult-faq">${landing.faq.map(([question, answer], index) =>
    `<details name="consult-faq"${index === 0 ? ' open' : ''}><summary>${escape(question)}</summary>${paragraph(answer)}</details>`).join('')}</div>`)}
  ${block('Tell me what you want to build or replace', `<p>Include the tools you use today and who will run the system after handoff.</p>${actions('contact')}`, 'booking')}
</div>`;

const handoffBody = `${intro(handoff)}<div class="svc-wrap">
  ${block('Deliverables and acceptance checks', `<dl class="consult-ledger consult-checks">${handoff.checks.map(([title, deliverable, check]) =>
    `<div><dt>${escape(title)}</dt><dd>${paragraph(deliverable)}<p><strong>Acceptance check</strong> ${escape(check)}</p></dd></div>`).join('')}</dl>`)}
  ${block('Practice a file restore', `${runbook()}${actions('contact')}`)}
</div>`;

const demoBody = `${intro(recovery)}<div class="svc-wrap">
  <section class="consult-section consult-split" aria-label="Recovery exercise">
    ${runbook(true)}
    <div id="service-demo"><p>Enable JavaScript to work through the simulation.</p></div>
  </section>
  ${block('Plan your own handoff', actions('handoff', 'contact'))}
</div>`;

const infrastructureBlock = block(infrastructure.title, `${paragraph(infrastructure.lead)}
  <dl class="consult-ledger">${entries(infrastructure.options)}</dl>
  <h3>${escape(infrastructure.example.title)}</h3>${paragraph(infrastructure.example.detail)}
  ${paragraph(infrastructure.stack)}
  <ul class="consult-links">${infrastructure.sources.map(link => `<li>${anchor(link)}</li>`).join('')}</ul>
  ${actions('handoff')}`, 'purchase-brief');

const open = '<!-- Begin generated consulting content -->';
const close = '<!-- End generated consulting content -->';
const region = new RegExp(`${open}[\\s\\S]*?${close}`);
const mark = body => `${open}\n${body}\n${close}`;
const comparisonBlock = block('Access, export, maintenance, and recovery',
  `<dl class="consult-ledger">${entries(ownershipComparison)}</dl>${actions('calculator')}`);
const catalogFallback = `<noscript><p>Browse the editions below. Enable JavaScript to filter and select modules.</p>
  <dl class="consult-ledger">${entries(applications.map(app => [app.name, app.edition + ' · ' + app.description]))}</dl></noscript>`;
const pages = [
  { path: 'services', body: landingBody, meta: landing },
  { path: 'services/handoff', body: handoffBody, meta: handoff },
  { path: 'demo', body: demoBody, meta: recovery },
  { path: 'privacy', body: intro({ title: 'Privacy notice', lead: 'How I use information from project briefs and site visits.' }) +
    `<div class="svc-wrap">${policy.privacy.map(([title, copy]) => block(title, paragraph(copy))).join('')}
    <p>For questions about your inquiry, email ${anchor([`mailto:${brand.email}`, brand.email])}.</p></div>` },
  { path: 'terms', body: intro({ title: 'Consulting estimates and site terms', lead: 'What a project estimate covers and what you buy directly.' }) +
    `<div class="svc-wrap">${policy.terms.map(([title, copy]) => block(title, paragraph(copy))).join('')}</div>` },
  { path: 'services/infrastructure', fragment: infrastructureBlock },
  { path: 'services/compare', fragment: comparisonBlock, before: '<section class="svc-section" aria-label="Software comparisons">' },
  { path: 'services/applications', fragment: catalogFallback, before: '<section class="svc-section" aria-label="Application catalog">' },
  ...Object.entries(implementations).map(([slug, [title, copy]]) => ({
    path: `services/${slug}`,
    fragment: block(title, paragraph(copy) + actions('handoff')),
    before: '<section class="svc-section">'
  })),
  { path: 'services/calculator' },
  { path: 'contact' }
];

for (const { path, body, meta, fragment, before = '<section class="svc-section"><h2>Two infrastructure tiers' } of pages) {
  const url = new URL(`./dist/${path}/index.html`, import.meta.url);
  const original = await readFile(url, 'utf8');
  let html = original;
  if (body) html = html.replace(/(<main id="main" tabindex="-1">)[\s\S]*?(<\/main>)/, (_, start, end) => `${start}\n${mark(body)}\n  ${end}`);
  if (fragment) {
    html = region.test(html)
      ? html.replace(region, () => mark(fragment))
      : html.replace(before, () => `${mark(fragment)}\n${before}`);
  }
  if (meta) {
    const title = `${meta.title} | ${brand.name}`;
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
      .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*/g, `$1${escape(meta.lead)}`)
      .replace(/https:\/\/antblu\.net\/(?:services(?:\/handoff)?|demo)(?=")/g, `https://antblu.net/${path}`);
  }
  if (!html.includes('/services/consulting.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/services/consulting.css">\n</head>');
  }
  html = html.replace(/(<a href="\/services\/infrastructure">Infrastructure<\/a>)(?!\s*<a href="\/services\/handoff")/,
    '$1\n        <a href="/services/handoff">Ownership and Handoff</a>');
  html = html.replace(/src="(?:\.\.\/)+assets\//g, 'src="/assets/')
    .replace(/ *<a href="(?:\/services)?#booking">Book a Consultation<\/a>\n/g, '')
    .replace(/<a href="\/contact#quote">(?:Request a Quote|Prepare a Project Brief)<\/a>/g, anchor(links.contact))
    .replace('Independent infrastructure engineering, web development, and e-commerce.', escape(brand.description));
  html = html.replace(/(data-price="([^"]+)">)[^<]*/g, (_, tag, key) => tag + range(pricing[key]))
    .replace(/(data-hosting-price="([^"]+)">)[^<]*/g, (_, tag, key) => tag + range(hosting[key]) + ' / month');
  if (process.argv.includes('--check')) {
    if (html !== original) {
      console.error(`Generated markup is out of date for /${path}`);
      process.exitCode = 1;
    }
  } else if (html !== original) await writeFile(url, html);
}
