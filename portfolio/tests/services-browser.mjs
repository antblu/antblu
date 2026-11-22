// Run with Node; uses the optional, already pinned component-development tools.
import assert from 'node:assert/strict';
import { chromium } from '../components/node_modules/playwright/index.mjs';
const base = process.env.ANTBLU_PREVIEW || 'http://localhost:4173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  const apiRequests = [];
  page.on('request', request => {
    if (['fetch', 'xhr'].includes(request.resourceType())) apiRequests.push(request.url());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/services/`);
  const questions = page.locator('.consult-faq summary');
  assert.equal(await questions.count(), 4);
  await questions.nth(1).focus();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('.consult-faq details').nth(1).locator('p').isVisible());
  assert.equal(await page.locator('.consult-faq details[open]').count(), 1);
  await page.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.locator('.consult-photo img').evaluate(img => img.decode());
  await page.screenshot({ path: '/tmp/antblu-services-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'See what you receive' }).first().click();
  assert.equal(await page.locator('.consult-checks dt').count(), 5);
  await page.goto(`${base}/services/handoff/#restore`);
  const snapshot = page.getByLabel('Recovery point');
  await page.getByText('Read the sample AI answer').click();
  assert.match(await page.locator('.consult-exercise details').first().innerText(), /runbooks\/recovery\/files.md/);
  await snapshot.selectOption('1030');
  await page.locator('#restore-file').click();
  assert.match(await page.locator('#restore-status').innerText(), /after the deletion/);
  await snapshot.selectOption('0900');
  await page.locator('#restore-file').click();
  await page.getByText('Open restored file').click();
  assert.match(await page.locator('#restored-file pre').innerText(), /network cable,24/);
  await page.locator('#verify-restore').click();
  assert.match(await page.locator('#restore-status').innerText(), /Restore verified/);
  await page.locator('#reset-restore').click();
  assert.equal(await snapshot.inputValue(), '');
  assert.equal(await page.locator('#restored-file').isVisible(), false);
  // A malformed stored value must not prevent either module from loading.
  await page.evaluate(() => sessionStorage.setItem('antblu-applications', '{"unexpected":true}'));
  await page.goto(`${base}/services/calculator/`);
  await page.locator('#result-status').waitFor();
  assert.equal(await page.getByRole('heading', { level: 2, name: 'Estimate inputs' }).count(), 1);
  const summary = page.locator('#estimate-summary');
  const comparison = /Self-hosted costs|sustained break-even/i;
  assert.equal(await page.locator('#result-title').textContent(), 'Sample scenario');
  assert.match(await page.locator('#cost-results').innerText(), /14,760/);
  assert.match(await page.locator('#cost-results').innerText(), /13,644/);
  assert.match(await page.locator('#scope-note').innerText(), /no application modules selected/);
  assert.doesNotMatch(await page.locator('.svc-result').innerText(), comparison);
  assert.doesNotMatch(await summary.textContent(), comparison);
  await page.locator('#request-estimate').click();
  await page.waitForURL(url => /^\/contact\/?$/.test(url.pathname) && url.hash === '#quote');
  await page.getByText('Configuration · Sample scenario', { exact: true }).waitFor();
  const transferred = await page.locator('#consultation-form [name=configuration]').inputValue();
  assert.match(transferred, /^Sample scenario · 3-year totals/);
  assert.doesNotMatch(transferred, comparison);
  const form = page.locator('#consultation-form');
  const copy = form.getByRole('button', { name: 'Copy brief' });
  await copy.click();
  assert.ok(await form.locator('[name=name]').evaluate(field => field === document.activeElement));
  await form.locator('[name=name]').fill('Sample Client');
  await form.locator('[name=email]').fill('client@example.com');
  await form.locator('[name=message]').fill('We need to replace our shared files service.');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: () => Promise.reject(new Error('Clipboard denied')) }
  }));
  await copy.click();
  const draft = form.locator('#consultation-draft');
  await draft.waitFor();
  assert.match(await draft.inputValue(), /We need to replace.*[\s\S]*Sample scenario · 3-year totals/);
  assert.ok(await draft.evaluate(field => field.selectionEnd === field.value.length));
  await form.getByRole('button', { name: 'Open email draft' }).click();
  assert.match(await form.getByRole('status').innerText(), /Copy the selected brief/);
  await form.locator('[name=configuration]').fill('');
  assert.equal(await draft.isVisible(), false);
  await form.getByRole('button', { name: 'Open email draft' }).click();
  assert.match(await form.getByRole('status').innerText(), /Send the draft/);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: text => { window.copiedBrief = text; return Promise.resolve(); } }
  }));
  await copy.click();
  assert.match(await form.getByRole('status').innerText(), /Brief copied/);
  assert.match(await page.evaluate(() => window.copiedBrief), /Sample Client/);
  await page.goto(`${base}/services/calculator/`);
  await page.getByText('Application scope', { exact: true }).click();
  await page.getByText('Select application modules', { exact: true }).click();
  const module = page.locator('[name=applications][value=nextcloud]');
  await module.check();
  const scope = page.locator('[name=scopeConfirmed]');
  await scope.check();
  assert.match(await page.locator('#result-status').innerText(), /Self-hosted costs.*over 3 years/);
  assert.doesNotMatch(await page.locator('#cost-results').innerText(), /sustained break-even/i);
  const desktopTerm = page.getByRole('slider', { name: 'Term' });
  await desktopTerm.press('End');
  assert.match(await page.locator('#cost-results').innerText(), /sustained break-even at month/i);
  await desktopTerm.press('ArrowLeft');
  assert.match(await summary.textContent(), comparison);
  assert.ok(await page.locator('#comparison-chart').isVisible());
  await module.uncheck();
  assert.equal(await scope.isChecked(), false);
  assert.doesNotMatch(await summary.textContent(), comparison);
  assert.equal(await page.locator('#comparison-chart').isVisible(), false);

  await page.getByText('Advanced hosting and costs', { exact: true }).click();
  const hosting = page.locator('[name=hosting]');
  const provider = page.locator('[name=profile]');
  const serverRate = page.locator('[name=serverMonthly]');
  await serverRate.fill('99');
  await provider.selectOption('1');
  assert.equal(await serverRate.inputValue(), '99');
  assert.equal(await page.locator('[name=networkMonthly]').inputValue(), '12');
  await hosting.selectOption('hardware');
  assert.equal(await serverRate.inputValue(), '25');
  await serverRate.fill('0');
  await hosting.selectOption('vps');
  assert.equal(await provider.inputValue(), '1');
  assert.equal(await serverRate.inputValue(), '99');
  await hosting.selectOption('hardware');
  assert.equal(await serverRate.inputValue(), '0');
  await hosting.selectOption('vps');
  await page.locator('[name=infrastructureInitial]').fill('-1');
  assert.equal(await page.locator('#copy-estimate').isDisabled(), true);
  assert.equal(await page.locator('#cost-results').innerText(), '');
  await page.locator('[name=infrastructureInitial]').fill('4500');
  assert.equal(await page.locator('#copy-estimate').isDisabled(), false);
  await page.locator('[name=tier]').selectOption('ha');
  await page.locator('[name=serverCount]').fill('1');
  assert.match(await page.locator('#scope-note').innerText(), /validate quorum/);
  await hosting.selectOption('managed');
  await serverRate.fill('123');
  await page.locator('[name=tier]').selectOption('standard');
  assert.equal(await hosting.inputValue(), 'vps');
  assert.equal(await serverRate.inputValue(), '99');
  await page.locator('[name=tier]').selectOption('ha');
  await hosting.selectOption('managed');
  assert.equal(await serverRate.inputValue(), '123');
  const mobile = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await mobile.route('https://fonts.googleapis.com/**', route => route.abort());
  await mobile.goto(`${base}/services/calculator/`);
  const preview = mobile.locator('.svc-calc-preview');
  assert.ok(await preview.isVisible());
  const previewBounds = await preview.boundingBox();
  assert.ok(previewBounds.y + previewBounds.height <= 568);
  assert.match(await preview.innerText(), /Sample scenario.*3-year totals/);
  assert.match(await preview.innerText(), /14,760/);
  const termSlider = mobile.getByRole('slider', { name: 'Term' });
  assert.ok(await termSlider.isVisible());
  assert.equal(await mobile.locator('[name=employees]').isVisible(), false);
  assert.equal(await mobile.locator('[name=storageRate]').isVisible(), false);
  await termSlider.press('ArrowLeft');
  assert.equal(await termSlider.getAttribute('aria-valuetext'), '1 year');
  assert.match(await preview.innerText(), /1-year totals/);
  await termSlider.press('End');
  assert.equal(await termSlider.getAttribute('aria-valuetext'), '5 years');
  assert.match(await preview.innerText(), /5-year totals/);
  await mobile.close();
  await page.goto(`${base}/services/applications/`);
  await page.locator('[data-catalog-cards] article').first().waitFor();
  assert.equal(await page.locator('[data-catalog-cards] article').count(), 22);
  assert.equal(await page.locator('[data-catalog-cards]').getByRole('heading', { level: 2 }).count(), 22);
  await page.getByRole('searchbox').fill('nextcloud');
  await page.getByRole('button', { name: 'Details for Nextcloud', exact: true }).click();
  const details = page.getByRole('dialog');
  assert.match(await details.innerText(), /Operator responsibilities/);
  await page.keyboard.press('Escape');
  assert.equal(await details.isVisible(), false);
  await page.getByRole('checkbox', { name: 'Select for quote for Nextcloud', exact: true }).check();
  await page.getByRole('link', { name: 'Request a module quote' }).click();
  assert.match(await page.locator('#consultation-configuration').inputValue(), /Selected application modules:[\s\S]*Nextcloud/);
  await page.goto(`${base}/services/compare/`);
  assert.equal(await page.locator('.consult-ledger dt').count(), 4);
  await page.getByRole('searchbox').fill('no-matching-comparison');
  assert.match(await page.locator('#compare-count').innerText(), /No matching comparisons/);
  assert.deepEqual(apiRequests, []);
  const fallbackFonts = await browser.newPage({ viewport: { width: 768, height: 940 } });
  await fallbackFonts.route('https://fonts.googleapis.com/**', route => route.abort());
  await fallbackFonts.goto(`${base}/services/`);
  assert.ok(await fallbackFonts.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  await noJs.goto(`${base}/services/`);
  assert.ok(await noJs.locator('.consult-faq p').first().isVisible());
  await noJs.locator('.consult-faq summary').nth(1).click();
  assert.ok(await noJs.locator('.consult-faq p').nth(1).isVisible());
  assert.equal(await noJs.locator('.consult-faq p').first().isVisible(), false);
  await noJs.goto(`${base}/services/calculator/`);
  assert.ok(await noJs.getByRole('link', { name: 'review package pricing' }).isVisible());
  const routes = ['/services/', '/services/infrastructure/', '/services/handoff/', '/services/applications/',
    '/services/compare/', '/services/calculator/', '/services/web-development/', '/services/ecommerce/',
    '/contact/', '/privacy/', '/terms/'];
  for (const width of [320, 1440]) {
    for (const theme of ['light', 'dark']) {
      const scan = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
      scan.on('pageerror', error => errors.push(error.message));
      scan.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url());
      });
      await scan.route('**/*', route => {
        if (route.request().url().startsWith(base)) return route.continue();
        return route.abort();
      });
      for (const path of routes) {
        await scan.goto(base + path);
        assert.equal(await scan.locator('html').getAttribute('data-theme'), theme);
        assert.equal(await scan.locator('main h1').count(), 1, path);
        assert.ok(await scan.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width} in ${theme}`);
      }
      if (width === 320 && theme === 'dark') {
        await scan.goto(base + '/services/');
        await scan.locator('.consult-photo img').evaluate(img => img.decode());
        await scan.screenshot({ path: '/tmp/antblu-services-mobile.png', fullPage: true });
        const menu = scan.getByRole('button', { name: 'Menu' });
        await menu.click();
        await scan.keyboard.press('Escape');
        assert.equal(await menu.getAttribute('aria-expanded'), 'false');
        assert.ok(await menu.evaluate(button => button === document.activeElement));
      }
      await scan.close();
    }
  }
  await page.setViewportSize({ width: 1024, height: 850 });
  await page.goto(`${base}/`);
  const role = page.locator('.hero .role');
  await role.locator('.text-flip-word').first().waitFor();
  assert.ok(await role.evaluate(el => el.clientHeight <= Math.ceil(parseFloat(getComputedStyle(el).lineHeight))));
  const experience = await page.getByRole('link', { name: 'View my experience' }).boundingBox();
  assert.ok(experience && experience.y + experience.height <= 850);
  assert.deepEqual(errors, []);
  console.log('Passed consulting route layouts, handoff, restore, draft fallback, FAQ, calculator, and portfolio tablet hero checks.');
} finally {
  await browser.close();
}
