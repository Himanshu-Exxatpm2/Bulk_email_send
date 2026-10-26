import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://localhost:5174';
const out = process.env.OUT ?? '/tmp/shell';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"], input', 'admin@bedlam.org').catch(() => {});
await page.getByRole('button', { name: /continue|sign in|log in/i }).first().click();
await page.waitForTimeout(1200);

// Land on a site dashboard
if (!page.url().includes('/site/')) {
  await page.getByRole('tab', { name: /^sites$/i }).click().catch(async () => {
    await page.getByText(/^Sites$/).first().click().catch(() => {});
  });
  await page.waitForTimeout(600);
  await page.getByText(/bedlam/i).first().click().catch(() => {});
  await page.waitForTimeout(1400);
}

console.log('URL:', page.url());
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}-collapsed.png`, fullPage: true });

// The shell owns scrolling on <main>, so page.screenshot can't grow past the viewport.
await page.evaluate(() => {
  const main = document.querySelector('main');
  if (main) main.scrollTop = main.scrollHeight;
});
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}-bottom.png` });
await page.evaluate(() => {
  const main = document.querySelector('main');
  if (main) main.scrollTop = 0;
});
await page.waitForTimeout(500);

const toggle = page.getByRole('button', { name: /expand sidebar/i });
if (await toggle.count()) {
  await toggle.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}-expanded.png`, fullPage: true });
}

console.log('ERRORS:', errors.slice(0, 10));
await browser.close();
