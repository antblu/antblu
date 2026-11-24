import { pricing, hosting } from './dist/services/pricing.mjs';
import { applications } from './dist/services/applications.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { brand, links, landing, dashboards, handoff, infrastructure, recovery, policy, ownershipComparison, implementations } from './dist/services/site-content.mjs';

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
const intro = ({ title, lead }, extra = '', callsToAction = '') => `<section class="consult-hero">
  <div class="svc-wrap${extra ? ' consult-split' : ''}">
    <div><h1>${escape(title)}</h1><p class="consult-lead">${escape(lead)}</p>${callsToAction}</div>
${extra ? `    ${extra}` : ''}
  </div>
</section>`;
const runbook = (onDemo = false) => `<figure class="consult-runbook"${onDemo ? ' id="sample-runbook"' : ''}>
  <figcaption>Sample recovery runbook</figcaption>
  <code>${escape(recovery.path)}</code>
  <h2>${escape(recovery.title)}</h2>
  <dl><div><dt>Operator</dt><dd>${escape(recovery.operator)}</dd></div><div><dt>File</dt><dd><code>${escape(recovery.file)}</code></dd></div></dl>
  <ol>${recovery.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol>
${onDemo ? '' : `  ${anchor(['/services/handoff#restore', 'Try the restore exercise'])}`}
</figure>`;

const serverPhoto = ({ src, alt, caption, width, height }, lazy = false) =>
  `<figure class="consult-photo consult-server-photo">
    <a href="${escape(src)}" aria-label="View full-size photo. ${escape(alt)}"><img src="${escape(src)}" alt="${escape(alt)}" width="${width}" height="${height}" decoding="async"${lazy ? ' loading="lazy"' : ''}></a>
    <figcaption>${escape(caption)}</figcaption>
  </figure>`;

const dashboardCards = dashboards.screenshots.map(({ name, image, width, height, alt, caption }) =>
  `<a class="dashboard-card" href="${escape(image)}" aria-label="View the ${escape(name)} screenshot">
    <span class="dashboard-frame"><img src="${escape(image)}" alt="${escape(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"></span>
    <span class="dashboard-caption"><span><strong>${escape(name)}</strong><span>${escape(caption)}</span></span><span class="dashboard-expand" aria-hidden="true">↗</span></span>
  </a>`).join('\n');

const infrastructureWorkflow = `<section class="infrastructure-workflow" id="infrastructure-workflow" aria-labelledby="infrastructure-workflow-title">
  <div class="infrastructure-workflow-wrap">
    <div class="infrastructure-workflow-intro">
      <h2 id="infrastructure-workflow-title">How I build infrastructure</h2>
      <p>I use my homelab to test how I provision machines, deploy applications, and monitor services.</p>
    </div>
    <fieldset class="infrastructure-workflow-flow">
      <legend class="infrastructure-workflow-visually-hidden">Infrastructure workflow</legend>
      <div class="infrastructure-workflow-switch">
        <label><input type="radio" name="infrastructure-stage" value="provision" aria-describedby="workflow-provision" checked><span>Provision</span></label>
        <label><input type="radio" name="infrastructure-stage" value="deploy" aria-describedby="workflow-deploy"><span>Deploy</span></label>
        <label><input type="radio" name="infrastructure-stage" value="operate" aria-describedby="workflow-operate"><span>Operate</span></label>
      </div>
      <div class="infrastructure-workflow-scene">
        <svg class="infrastructure-workflow-wires" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <path id="workflow-wire-provision" pathLength="100" d="M340 0C340 82 480 43 480 146Q480 180 430 180H140"/>
            <path id="workflow-wire-deploy" pathLength="100" d="M500 0V345"/>
            <path id="workflow-wire-operate" pathLength="100" d="M660 0C660 82 520 43 520 146Q520 180 570 180H860"/>
          </defs>
          <g class="infrastructure-workflow-traces">
            <use href="#workflow-wire-provision"/><use href="#workflow-wire-deploy"/><use href="#workflow-wire-operate"/>
          </g>
          <g class="infrastructure-workflow-signals">
            <use href="#workflow-wire-provision" data-flow="provision"/>
            <use href="#workflow-wire-deploy" data-flow="deploy"/>
            <use href="#workflow-wire-operate" data-flow="operate"/>
          </g>
        </svg>
        <svg class="infrastructure-workflow-wires infrastructure-workflow-wires-mobile" viewBox="0 0 1000 428" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <path id="workflow-mobile-provision" pathLength="100" d="M167 0C167 40 500 6 500 65S245 110 245 171"/>
            <path id="workflow-mobile-deploy" pathLength="100" d="M500 0V333"/>
            <path id="workflow-mobile-operate" pathLength="100" d="M833 0C833 40 500 6 500 65S755 110 755 171"/>
          </defs>
          <g class="infrastructure-workflow-traces">
            <use href="#workflow-mobile-provision"/><use href="#workflow-mobile-deploy"/><use href="#workflow-mobile-operate"/>
          </g>
          <g class="infrastructure-workflow-signals">
            <use href="#workflow-mobile-provision" data-flow="provision"/>
            <use href="#workflow-mobile-deploy" data-flow="deploy"/>
            <use href="#workflow-mobile-operate" data-flow="operate"/>
          </g>
        </svg>
        <div class="infrastructure-workflow-hub" aria-hidden="true">
          <span class="infrastructure-workflow-orbits"></span>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/>
            <path d="M7 6.5h.01M7 17.5h.01M13 6.5h4M13 17.5h4"/>
          </svg>
          <span>Stack</span>
        </div>
        <div class="infrastructure-workflow-tools" data-flow="provision">
          <h3>Build machines</h3>
          <ul>
            <li><img src="/assets/dashboard-icons/opentofu.svg" alt="" width="22" height="22" loading="lazy">OpenTofu</li>
            <li><img src="/assets/dashboard-icons/proxmox.svg" alt="" width="22" height="22" loading="lazy">Proxmox</li>
            <li><img src="/assets/dashboard-icons/ansible.svg" alt="" width="22" height="22" loading="lazy">Ansible</li>
          </ul>
        </div>
        <div class="infrastructure-workflow-tools infrastructure-workflow-tools-wide" data-flow="deploy">
          <h3>Ship applications</h3>
          <ul>
            <li><img src="/assets/dashboard-icons/gitlab.svg" alt="" width="22" height="22" loading="lazy">GitLab</li>
            <li><img src="/assets/dashboard-icons/argo-cd.svg" alt="" width="22" height="22" loading="lazy">Argo CD</li>
            <li><img src="/assets/dashboard-icons/kubernetes.svg" alt="" width="22" height="22" loading="lazy">Kubernetes</li>
          </ul>
        </div>
        <div class="infrastructure-workflow-tools" data-flow="operate">
          <h3>Run and monitor</h3>
          <ul>
            <li><img src="/assets/dashboard-icons/talos.svg" alt="" width="22" height="22" loading="lazy">Talos Linux</li>
            <li><img src="/assets/dashboard-icons/debian.svg" alt="" width="22" height="22" loading="lazy">Debian</li>
            <li><img class="infrastructure-workflow-icon-invert" src="/assets/dashboard-icons/victoriametrics-light.svg" alt="" width="22" height="22" loading="lazy">VictoriaMetrics</li>
          </ul>
        </div>
      </div>
      <div class="infrastructure-workflow-detail">
        <p id="workflow-provision" data-flow="provision">I define Proxmox virtual machines in OpenTofu and configure Debian guests with Ansible.</p>
        <p id="workflow-deploy" data-flow="deploy">I keep application manifests in Git. Argo CD applies them to the Kubernetes cluster.</p>
        <p id="workflow-operate" data-flow="operate">I run Kubernetes on Talos Linux and standalone services on Debian. I use VictoriaMetrics to collect metrics.</p>
      </div>
    </fieldset>
    <div class="infrastructure-workflow-actions">
      <a href="/#homelab">See the homelab</a>
      <button type="button" class="infrastructure-workflow-play" hidden>Pause cycle</button>
    </div>
  </div>
</section>`;

const landingBody = `<section class="consult-hero consult-cover">
  <div class="svc-wrap">
    <div class="consult-cover-copy">
      <h1>${escape(landing.title).replace('open-source', 'open&#8209;source')}</h1><p class="consult-lead">${escape(landing.lead)}</p>
      <div class="svc-cta">${anchor(links.contact, 'svc-btn--primary')}${anchor(['#consult-evidence', 'See the work'], 'consult-secondary')}</div>
      <div id="services-chat" class="services-composer">
        <noscript><p><a href="/contact#quote">Send a project question to Anthony</a></p></noscript>
      </div>
    </div>
    <figure id="app-tour" class="consult-tour">
      <video controls autoplay muted loop playsinline disablepictureinpicture preload="metadata" width="1414" height="920" poster="/assets/tour/application-tour.webp" aria-label="Authentik sign-in and application tour" aria-describedby="tour-caption">
        <source src="/assets/tour/application-tour.mp4" type="video/mp4">
        <track kind="captions" srclang="en" label="Application names" src="/assets/tour/application-tour.vtt">
        <a href="/assets/tour/application-tour.mp4">Watch the application tour</a>
      </video>
      <div class="tour-playback" hidden>
        <button type="button" aria-label="Play tour"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="currentColor"><path class="tour-play-icon" d="M5 3.5v13l11-6.5z"/><g class="tour-pause-icon"><rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/></g></svg></button>
        <input type="range" min="0" value="0" step="0.1" aria-label="Tour position">
      </div>
      <figcaption>
        <span id="tour-caption">Explore the shared workspace, sales and support tools, and the infrastructure that runs them.</span>
        <details class="consult-tour-teaser">
          <summary>Watch the Antalos teaser</summary>
          <video controls playsinline preload="none" width="960" height="540" poster="/assets/tour/antalos-teaser.webp" aria-label="Antalos teaser" aria-describedby="teaser-caption">
            <source src="/assets/tour/antalos-teaser.mp4" type="video/mp4">
            <track kind="captions" srclang="en" label="English" src="/assets/tour/antalos-teaser.vtt">
            <a href="/assets/tour/antalos-teaser.mp4">Open the Antalos teaser</a>
          </video>
          <p id="teaser-caption">See Authentik sign-in, the Nextcloud workspace, and UrBackup status.</p>
        </details>
      </figcaption>
    </figure>
    <a class="consult-scroll" href="#delivery">Scroll <span aria-hidden="true">↓</span></a>
  </div>
</section>
<aside class="consult-proof" id="delivery" aria-label="Project examples">
  <div class="svc-wrap"><strong>Project examples</strong>
    ${[...landing.evidence.links, links.demo, ['#stack', 'Browse the service inventory']].map(link => anchor(link)).join('')}
  </div>
</aside>
<section id="three-doors" class="svc-home" aria-labelledby="three-doors-title">
  <div class="svc-wrap">
    <p>Three doors</p>
    <h2 id="three-doors-title">Which of these is your problem?</h2>
    <p class="svc-lead">Every engagement starts with one of three conditions. Pick the sentence that sounds like your business.</p>
    <div class="svc-grid">
      <article class="svc-card">
        <h3>The system no longer fits.</h3>
        <p>FileMaker, Access, the internal app nobody dares touch. I replace it with software you own, without losing the workflow your staff depend on. Proof: 28,062 invoices migrated with zero operational downtime.</p>
        <strong>Legacy System Replacement</strong>
      </article>
      <article class="svc-card">
        <h3>The cart can't close your sales.</h3>
        <p>Wires, deposits, quotes, staged settlement: transactions hosted carts cannot model. I build commerce platforms that close them. Proof: six-figure monthly Google Shopping revenue on an owned platform.</p>
        <strong>High-Ticket Commerce Platforms</strong>
      </article>
      <article class="svc-card">
        <h3>The work shouldn't still be manual.</h3>
        <p>And you are not giving a chatbot the keys. I build governed AI agents inside your AWS account, with human approval on every consequential action. Proof: three production agents, used daily by a non-technical operator.</p>
        <strong>Production AI Agents</strong>
      </article>
    </div>
  </div>
</section>
${infrastructureWorkflow}
<div class="svc-wrap">
  ${block('From purchase brief to first restore', `<ol class="consult-stages">${landing.steps.map(([title, text, link]) =>
    `<li><h3>${escape(title)}</h3>${paragraph(text)}${anchor(links[link])}</li>`).join('')}</ol>`, 'why')}
  ${block('What you own and control', `<div class="consult-split"><dl class="consult-ledger">${entries(landing.ownership)}</dl>${runbook()}</div>
    <p><a href="/services/handoff#ownership-standard">Client Ownership Standard</a></p>`)}
  <section class="consult-section consult-split" aria-labelledby="consult-evidence">
    <div><h2 id="consult-evidence">${escape(landing.evidence.title)}</h2>${paragraph(landing.evidence.text)}
    <ul>${landing.evidence.links.map(link => `<li>${anchor(link)}</li>`).join('')}</ul></div>
    <figure class="consult-photo"><img src="${escape(landing.evidence.image)}" alt="Rack-mounted lab hardware above an uninterruptible power supply" decoding="async"><figcaption>${escape(landing.evidence.caption)}</figcaption></figure>
  </section>
  ${block(dashboards.title, `${paragraph(dashboards.lead)}
    <div class="dashboard-grid">${dashboardCards}</div>
    <p class="consult-dashboard-link">${anchor(dashboards.homelable)}</p>`, 'dashboard')}
  ${block('Scope and costs', `<p>Start with one server or scope a redundant deployment around your recovery targets. I also build business sites and stores in client-owned accounts.</p>
    <ul class="consult-links">${[[links.infrastructure[0], 'Infrastructure packages'], ['/services/web-development', 'Business websites'], ['/services/ecommerce', 'Online stores'], links.compare].map(link => `<li>${anchor(link)}</li>`).join('')}</ul>
    <div class="consult-cta-row">${actions('calculator', 'contact')}</div>`, 'packages')}
  ${block('Questions before you start', `<div class="consult-faq">${landing.faq.map(([question, answer], index) =>
    `<details name="consult-faq"${index === 0 ? ' open' : ''}><summary>${escape(question)}</summary>${paragraph(answer)}</details>`).join('')}</div>`)}
  ${block('Tell me what you want to build or replace', `<p>Include the tools you use today and who will run the system after handoff.</p>${actions('contact')}`, 'booking')}
</div>`;

const ownershipPdf = '/assets/antblu-client-ownership-standard-v1.0.pdf';

const handoffBody = `${intro(handoff, serverPhoto(handoff.image))}<div class="svc-wrap">
  ${block('Client Ownership Standard', `<div class="svc-cta">
    <a class="svc-btn" href="${ownershipPdf}">Read the PDF</a>
    <a class="svc-btn svc-btn--primary" href="${ownershipPdf}" download>Download the PDF</a>
  </div>`, 'ownership-standard')}
  ${block('Deliverables and acceptance checks', `<dl class="consult-ledger consult-checks">${handoff.checks.map(([title, deliverable, check]) =>
    `<div><dt>${escape(title)}</dt><dd>${paragraph(deliverable)}<p><strong>Acceptance check</strong> ${escape(check)}</p></dd></div>`).join('')}</dl>`)}
  ${block('Practice a file restore', `<div class="consult-split">${runbook(true)}<div id="service-demo"><p>Enable JavaScript to practice the restore.</p></div></div>${actions('contact')}`, 'restore')}
</div>`;

const infrastructureBlock = block(infrastructure.title, `${paragraph(infrastructure.lead)}
  <dl class="consult-ledger">${entries(infrastructure.options)}</dl>
  <div class="consult-split consult-purchase-example">
    <div><h3>${escape(infrastructure.example.title)}</h3>${paragraph(infrastructure.example.detail)}</div>
    ${serverPhoto(infrastructure.example.image, true)}
  </div>
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
  { path: 'privacy', body: intro({ title: 'Privacy notice', lead: 'How I use information from project briefs, Services chat, and site visits.' }) +
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
  if (body) {
    html = region.test(html)
      ? html.replace(region, () => mark(body))
      : html.replace(/(<main id="main" tabindex="-1">)[\s\S]*?(<\/main>)/, (_, start, end) => `${start}\n${mark(body)}\n  ${end}`);
  }
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
