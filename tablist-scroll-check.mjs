import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 320, height: 300 });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Checar overflow style e computed style do tablist
const info = await page.evaluate(() => {
  const tablist = document.querySelector('[role="tablist"]');
  const cs = window.getComputedStyle(tablist);
  return {
    overflowX: cs.overflowX,
    overflowY: cs.overflowY,
    scrollbarWidth: cs.scrollbarWidth,
    // se tem indicação de scroll via gradient ou shadow
    boxShadow: cs.boxShadow,
    mask: cs.mask ?? cs.webkitMask,
  };
});

console.log('Tablist computed styles:', JSON.stringify(info, null, 2));

// Screenshot depois de scroll horizontal para confirmar que "Simulação" chega a ser acessível
await page.evaluate(() => {
  document.querySelector('[role="tablist"]').scrollLeft = 200;
});
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(__dirname, 'arlequina-320-tablist-scrolled.png'), clip: { x: 0, y: 70, width: 320, height: 80 }, fullPage: false });
console.log('Scrolled screenshot saved');

await browser.close();
