import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'splash.html');

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
// Give web fonts a moment to settle.
await page.waitForTimeout(800);

const frames = await page.$$('.frame');
console.log('frames:', frames.length);
for (const el of frames) {
  const name = await el.getAttribute('data-shot');
  const out = path.join(__dirname, `splash-${name}.png`);
  await el.screenshot({ path: out });
  console.log('wrote', out);
}
await browser.close();
