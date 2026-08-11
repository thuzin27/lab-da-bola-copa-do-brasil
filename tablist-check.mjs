import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 320, height: 300 });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Captura só o header + tablist
await page.screenshot({ path: path.join(__dirname, 'arlequina-320-header.png'), clip: { x: 0, y: 0, width: 320, height: 120 }, fullPage: false });

const tablistInfo = await page.evaluate(() => {
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = document.querySelectorAll('[role="tab"]');
  const tl = tablist?.getBoundingClientRect();
  return {
    tablistScrollWidth: tablist?.scrollWidth,
    tablistClientWidth: tablist?.clientWidth,
    tablistOverflow: (tablist?.scrollWidth ?? 0) - (tablist?.clientWidth ?? 0),
    tabs: Array.from(tabs).map(t => ({
      label: t.textContent?.trim(),
      rect: t.getBoundingClientRect(),
      fullyVisible: t.getBoundingClientRect().right <= (tl?.right ?? 320),
    })),
  };
});

console.log(JSON.stringify(tablistInfo, null, 2));
await browser.close();
