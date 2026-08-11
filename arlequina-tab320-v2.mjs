import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

// ── 320px com aba ativa em Próximos jogos ────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE + '?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Verificar scroll do tablist — foi feito auto-scroll para a aba ativa?
const tablistScrollLeft = await page.locator('[role="tablist"]').evaluate(el => el.scrollLeft);
const tablistScrollWidth = await page.locator('[role="tablist"]').evaluate(el => el.scrollWidth);
const tablistClientWidth = await page.locator('[role="tablist"]').evaluate(el => el.clientWidth);
console.log(JSON.stringify({ tablistScrollLeft, tablistScrollWidth, tablistClientWidth, label: 'tablist scroll quando aba ativa = proximos' }));

// Posição de cada aba
const abas = await page.locator('[role="tab"]').all();
for (let i = 0; i < abas.length; i++) {
  const txt = await abas[i].textContent();
  const box = await abas[i].boundingBox();
  const selected = await abas[i].getAttribute('aria-selected');
  // bounding box é relativo à viewport
  const inViewport = box ? (box.x >= -1 && box.x + box.width <= 321) : false;
  const partiallyVisible = box ? (box.x < 320 && box.x + box.width > 0) : false;
  console.log(JSON.stringify({ i, label: txt?.trim(), selected, x: box?.x, width: box?.width, inViewport, partiallyVisible }));
}

// Screenshot da área do tablist
await page.screenshot({
  path: path.join(__dirname, 'arlequina-tab-ativa-320.png'),
  clip: { x: 0, y: 60, width: 320, height: 90 }
});
console.log('Saved crop tab ativa');

// Screenshot full page
await page.screenshot({
  path: path.join(__dirname, 'arlequina-proximos-320-full.png'),
  fullPage: false
});
console.log('Saved full viewport');

await browser.close();
console.log('DONE');
