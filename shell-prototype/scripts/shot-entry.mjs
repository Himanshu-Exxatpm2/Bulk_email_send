import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://localhost:5174';
const out = process.env.OUT ?? '/tmp/entry';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

async function login() {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /continue|sign in|log in/i }).first().click();
  await page.waitForTimeout(1000);
}

// 1) Choose products
await login();
console.log('after login:', page.url());
await page.screenshot({ path: `${out}-choose.png` });

// 2) As School -> schools launch
await page.getByRole('button', { name: /As School/i }).click().catch(() => {});
await page.waitForTimeout(1000);
console.log('school path:', page.url());
await page.screenshot({ path: `${out}-schools-launch.png` });

// 3) Open a school dashboard
await page.getByText(/Abilene Christine University - DPT/i).first().click().catch(() => {});
await page.waitForTimeout(2500);
console.log('school dash:', page.url());
await page.screenshot({ path: `${out}-school-dash.png`, fullPage: true });

// 4) Back to choose -> As Site -> sites launch
await login();
await page.getByRole('button', { name: /As Site/i }).click().catch(() => {});
await page.waitForTimeout(1000);
console.log('site path:', page.url());
await page.screenshot({ path: `${out}-sites-launch.png` });

// 5) Open a site dashboard (regression check for the shared session changes)
await page.getByText(/Bedlam-Hospital/i).first().click().catch(() => {});
await page.waitForTimeout(2000);
console.log('site dash:', page.url());
await page.screenshot({ path: `${out}-site-dash.png` });

console.log('ERRORS:', errors.slice(0, 12));
await browser.close();
