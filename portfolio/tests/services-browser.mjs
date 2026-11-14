// Run with Node; uses the optional, already pinned component-development tools.
import assert from 'node:assert/strict';
import { chromium } from '../components/node_modules/playwright/index.mjs';
const base = process.env.ANTBLU_PREVIEW || 'http://localhost:4173';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/services/`);
  const triggers = page.locator('.svc-faq-trigger');
  await triggers.first().waitFor();
  assert.equal(await triggers.count(), 4);
  await triggers.first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await triggers.first().getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Tab');
  await page.waitForFunction(() => document.querySelectorAll('.svc-faq-trigger')[1] === document.activeElement);
  await page.keyboard.press('Enter');
  assert.equal(await triggers.nth(1).getAttribute('aria-expanded'), 'true');
  assert.equal(await triggers.first().getAttribute('aria-expanded'), 'true');
  await page.screenshot({ path: '/tmp/services-faq-desktop.png', fullPage: true });
  // A malformed stored value must not prevent either module from loading.
  await page.evaluate(() => sessionStorage.setItem('antblu-applications', '{"unexpected":true}'));
  await page.goto(`${base}/services/calculator/`);
  await page.locator('#result-status').waitFor();
  assert.match(await page.locator('#cost-results').innerText(), /14,760/);
  assert.match(await page.locator('#cost-results').innerText(), /13,644/);
  assert.match(await page.locator('#scope-note').innerText(), /no application modules selected/);
  await page.locator('[name=infrastructureInitial]').fill('-1');
  assert.equal(await page.locator('#copy-estimate').isDisabled(), true);
  assert.equal(await page.locator('#cost-results').innerText(), '');
  await page.locator('[name=infrastructureInitial]').fill('4500');
  assert.equal(await page.locator('#copy-estimate').isDisabled(), false);
  await page.locator('[name=tier]').selectOption('ha');
  await page.locator('[name=serverCount]').fill('1');
  assert.match(await page.locator('#scope-note').innerText(), /validate quorum/);
  await page.goto(`${base}/services/applications/`);
  await page.locator('[data-catalog-cards] article').first().waitFor();
  assert.equal(await page.locator('[data-catalog-cards] article').count(), 22);
  const fallbackFonts = await browser.newPage({ viewport: { width: 768, height: 940 } });
  await fallbackFonts.route('https://fonts.googleapis.com/**', route => route.abort());
  await fallbackFonts.goto(`${base}/services/`);
  assert.ok(await fallbackFonts.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  await noJs.goto(`${base}/services/`);
  await noJs.locator('[data-react-faq] summary').first().click();
  assert.ok(await noJs.locator('[data-react-faq] p').first().isVisible());
  await noJs.goto(`${base}/services/calculator/`);
  assert.ok(await noJs.getByRole('link', { name: 'review package pricing' }).isVisible());
  const blocked = await browser.newPage();
  await blocked.route('**/assets/vendor/emiliany-vendor.js', route => route.abort());
  await blocked.goto(`${base}/services/`);
  assert.ok(await blocked.locator('[data-react-faq]').isVisible());
  assert.deepEqual(errors, []);
  console.log('Passed React keyboard interaction, native fallbacks, saved-state recovery, calculator totals and invalid inputs.');
} finally {
  await browser.close();
}
