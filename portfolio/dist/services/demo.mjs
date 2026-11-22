import { recovery } from './site-content.mjs';
import { escapeHtml as escape } from './common.mjs';

const root = document.querySelector('#service-demo');
root.innerHTML = `<section class="svc-panel consult-exercise" aria-labelledby="exercise-title">
  <h2 id="exercise-title">Recovery exercise</h2>
  <p>${escape(recovery.prompt)}</p>
  <details class="svc-fold">
    <summary>Read the sample AI answer</summary>
    <p>${escape(recovery.answer)}</p>
    <p>Source <a href="#sample-runbook"><code>${escape(recovery.path)}</code></a></p>
  </details>
  <label class="svc-field" for="recovery-point">Recovery point
    <select id="recovery-point">
      <option value="">Choose a snapshot</option>
      ${recovery.snapshots.map(snapshot => `<option value="${escape(snapshot.id)}">${escape(snapshot.label)}</option>`).join('')}
    </select>
  </label>
  <div class="svc-cta">
    <button type="button" class="svc-btn svc-btn--primary" id="restore-file" disabled>Restore to recovery folder</button>
    <button type="button" class="svc-btn" id="reset-restore">Reset exercise</button>
  </div>
  <p id="restore-status" role="status"></p>
  <details class="svc-fold" id="restored-file" hidden>
    <summary>Open restored file</summary>
    <pre>${escape(recovery.contents)}</pre>
    <button type="button" class="svc-btn" id="verify-restore">Verify file contents</button>
  </details>
</section>`;

const select = root.querySelector('#recovery-point');
const restore = root.querySelector('#restore-file');
const file = root.querySelector('#restored-file');
const verify = root.querySelector('#verify-restore');
const status = root.querySelector('#restore-status');

function clearResult() {
  file.open = false;
  file.hidden = true;
  status.textContent = '';
  restore.disabled = !select.value;
}

select.addEventListener('change', clearResult);
restore.addEventListener('click', () => {
  clearResult();
  const snapshot = recovery.snapshots.find(item => item.id === select.value);
  if (!snapshot) return;
  file.hidden = !snapshot.recoverable;
  status.textContent = snapshot.recoverable ? recovery.restored : recovery.afterDeletion;
});
verify.addEventListener('click', () => { status.textContent = recovery.verified; });
root.querySelector('#reset-restore').addEventListener('click', () => {
  select.value = '';
  root.querySelector('details').open = false;
  clearResult();
  select.focus();
});
