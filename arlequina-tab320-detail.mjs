import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

// ── 320px — checar tablist detalhes ─────────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Posição de cada aba na viewport (visível ou não)
const abas = await page.locator('[role="tab"]').all();
for (let i = 0; i < abas.length; i++) {
  const txt = await abas[i].textContent();
  const box = await abas[i].boundingBox();
  const inViewport = box ? (box.x >= 0 && box.x < 320) : false;
  const partiallyVisible = box ? (box.x < 320 && box.x + box.width > 0) : false;
  console.log(JSON.stringify({ i, label: txt?.trim(), x: box?.x, width: box?.width, xEnd: box ? box.x + box.width : null, inViewport, partiallyVisible }));
}

// Verificar se "Próximos jogos" é visível sem scroll manual
const proximosJogosTab = page.locator('[role="tab"]').filter({ hasText: 'Próximos jogos' });
const isVisible = await proximosJogosTab.isVisible();
const isInViewport = await proximosJogosTab.isInViewport();
console.log(JSON.stringify({ isVisible, isInViewport, label: 'Próximos jogos visível/in viewport 320px' }));

// Screenshot do tablist em 320px (só o topo)
await page.screenshot({
  path: path.join(__dirname, 'arlequina-tab-320-crop.png'),
  clip: { x: 0, y: 60, width: 320, height: 80 }
});
console.log('Saved crop');

// Verificar scroll do tablist — usuário precisa rolar para ver Próximos jogos?
const tablistEl = page.locator('[role="tablist"]');
const tablistBox = await tablistEl.boundingBox();
const tablistScrollLeft = await tablistEl.evaluate(el => el.scrollLeft);
const tablistScrollWidth = await tablistEl.evaluate(el => el.scrollWidth);
const tablistClientWidth = await tablistEl.evaluate(el => el.clientWidth);
console.log(JSON.stringify({ tablistBox, tablistScrollLeft, tablistScrollWidth, tablistClientWidth, canScroll: tablistScrollWidth > tablistClientWidth, label: 'tablist scroll state' }));

// O gradiente está visível?
const gradient = page.locator('.pointer-events-none.absolute.right-0');
const gradientBox = await gradient.boundingBox();
const gradientVisible = await gradient.isVisible();
console.log(JSON.stringify({ gradientVisible, gradientBox, label: 'gradient fade indicador' }));

// Tentar navegar para Próximos jogos via URL (não via click)
await page.goto(BASE + '?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// A aba "Próximos jogos" fica visível após scroll automático?
const proximosTab2 = page.locator('[role="tab"]').filter({ hasText: 'Próximos jogos' });
const isInViewport2 = await proximosTab2.isInViewport();
const box2 = await proximosTab2.boundingBox();
const tablist2ScrollLeft = await page.locator('[role="tablist"]').evaluate(el => el.scrollLeft);
console.log(JSON.stringify({ isInViewport2, box2, tablist2ScrollLeft, label: 'Próximos jogos inViewport quando é aba ativa' }));

await page.screenshot({
  path: path.join(__dirname, 'arlequina-tab-ativa-320-crop.png'),
  clip: { x: 0, y: 60, width: 320, height: 80 }
});
console.log('Saved crop aba ativa');

await browser.close();
console.log('DONE');
