import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

async function run(kind, width, height, theme) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: theme === 'dark' ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  await page.addInitScript((t) => {
    try {
      localStorage.removeItem('versemate-onboarding-seen');
      localStorage.setItem('versemate-settings', JSON.stringify({ theme: t }));
    } catch {}
  }, theme);
  await page.goto('http://127.0.0.1:8080/read', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 8000 });
  await page.waitForTimeout(700);
  for (let i = 1; i <= 3; i++) {
    await page.screenshot({ path: `splash-previews/inapp-${kind}-${i}-${theme}.png` });
    if (i < 3) {
      await page.getByRole('button', { name: 'Next' }).click();
      await page.waitForTimeout(450);
    }
  }
  await ctx.close();
}

for (const theme of ['light', 'dark']) {
  await run('desktop', 1280, 860, theme);
  await run('mobile', 390, 844, theme);
}
console.log('done');
await browser.close();
