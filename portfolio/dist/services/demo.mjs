import { applications } from './applications.mjs';
import { siteConfig } from './site-config.mjs';
import { escapeHtml, publicHttps } from './common.mjs';

const root = document.querySelector('#service-demo');
const appIds = ['nextcloud', 'keycloak', 'zammad', 'grafana', 'argocd', 'forgejo'];
const apps = appIds.map(id => applications.find(app => app.id === id));
const names = ['Files workspace', 'Unified sign-in', 'Helpdesk queue', 'Metrics dashboard', 'GitOps deployments', 'Source repository'];
const flow = [
  { title: 'Normal operations', message: 'All example services are available. Start the scenario to watch an alert move through the operations workflow.' },
  { title: 'Alert received', message: 'The files workspace returned errors on 12% of sampled requests. The API p95 rose to 2.1 seconds shortly after a release.' },
  { title: 'Recommendation ready', message: 'Example AI recommendation: Worker memory limits were lowered in the latest deployment. Event history shows repeated out-of-memory restarts. Review the change, compare it with the last stable revision, and restore the previously tested resource setting with a rollback plan.' },
  { title: 'Administrator approved the proposed change', message: 'The admin reviewed the evidence, authorized the resource change and recorded their approval on the change request. The deployment service can now apply the approved revision.' },
  { title: 'Approved Git revision synced', message: 'The simulated GitOps controller reconciled the manifest. The deployment passes readiness checks. Watch request latency and restart counts before closing the incident.' },
  { title: 'Recovery verified', message: 'Request latency returned to its baseline and restart counts held steady through the observation window. The administrator added the evidence and change revision to the incident record.' }
];
const nextActions = ['Simulate an alert', 'Review AI recommendation', 'Approve as administrator', 'Sync approved revision', 'Verify recovery'];
let stage = 0;

root.innerHTML = `<div class="svc-grid svc-grid--two">
  <section class="svc-panel"><h2>Example workspace</h2><p class="svc-muted">Choose an application to see how it fits the environment.</p>
    <label class="svc-field">Application<select id="demo-application">${apps.map((app, index) => `<option value="${app.id}">${names[index]} · ${app.name}</option>`).join('')}</select></label>
    <div class="svc-demo-app" id="demo-app-preview" aria-live="polite"></div>
  </section>
  <section class="svc-panel"><h2>Infrastructure dashboard</h2>
    <dl class="svc-demo-metrics">
      <div><dt>Files workspace</dt><dd id="demo-files"></dd></div>
      <div><dt>p95 latency</dt><dd id="demo-latency"></dd></div>
      <div><dt>Identity service</dt><dd>Available · 3 replicas</dd></div>
      <div><dt>GitOps revision</dt><dd id="demo-revision"></dd></div>
    </dl>
  </section>
</div>
<section class="svc-panel svc-incident">
  <h2>Service incident</h2>
  <ol class="svc-steps" id="demo-incident-steps"></ol>
  <div class="svc-note" role="status"><strong id="demo-incident-heading"></strong><p id="demo-incident-message"></p></div>
  <div class="svc-cta"><button class="svc-btn svc-btn--primary" type="button" id="demo-next"></button><button class="svc-btn" type="button" id="demo-reset">Reset scenario</button></div>
</section>`;

const appSelector = root.querySelector('#demo-application');
const next = root.querySelector('#demo-next');
const reset = root.querySelector('#demo-reset');

function showApplication() {
  const app = apps.find(item => item.id === appSelector.value);
  const sandbox = publicHttps(siteConfig.sandboxUrls[app.id]);
  root.querySelector('#demo-app-preview').innerHTML = `<h3>${app.name}</h3><p>${app.description}</p>
    <p><strong>Typical integrations</strong> · ${escapeHtml(app.integrations)}</p>
    ${sandbox ? `<a class="svc-btn" href="${escapeHtml(sandbox)}">Open public sandbox</a>` : ''}`;
}

function showStage() {
  const affected = stage > 0 && stage < 4;
  root.querySelector('#demo-files').textContent = affected ? 'Degraded · 1/3 ready' : 'Available · 3/3 ready';
  root.querySelector('#demo-files').classList.toggle('svc-demo-warn', affected);
  root.querySelector('#demo-latency').textContent = affected ? '2.1 seconds' : '190 milliseconds';
  root.querySelector('#demo-revision').textContent = stage >= 4 ? 'f3d2b10 · synced' : 'ac41eb2 · synced';
  root.querySelector('#demo-incident-heading').textContent = flow[stage].title;
  root.querySelector('#demo-incident-message').textContent = flow[stage].message;
  root.querySelector('#demo-incident-steps').innerHTML = flow.map(({ title }, index) =>
    `<li${index === stage ? ' aria-current="step"' : ''}>${title}</li>`).join('');
  next.disabled = stage === flow.length - 1;
  next.textContent = nextActions[stage] || 'Scenario complete';
}
appSelector.addEventListener('change', showApplication);
next.addEventListener('click', () => {
  stage += 1;
  showStage();
  if (next.disabled) reset.focus();
});
reset.addEventListener('click', () => {
  stage = 0;
  showStage();
  next.focus();
});
showApplication();
showStage();
