import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;
const BASE = 'http://localhost:3001';

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name) {
  const filePath = path.join(outDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log('Saved: ' + filePath);
  return filePath;
}

// ── 320px — mobile mínimo ─────────────────────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('arlequina-320-chaveamento.png');

// Métricas 320px
const tablistBox = await page.locator('[role="tablist"]').boundingBox();
const simulacaoBox = await page.locator('[role="tab"]:nth-child(3)').boundingBox();
const gradientEl = page.locator('.pointer-events-none.absolute.right-0');
const gradientCount = await gradientEl.count();
const gradientVisible = gradientCount > 0 ? await gradientEl.isVisible() : false;
const bodyScrollWidth320 = await page.evaluate(() => document.body.scrollWidth);
const vp320 = 320;
const copaBrasilLogo = page.locator('header img[alt="Copa do Brasil 2026"]');
const copaBrasilVisible = await copaBrasilLogo.count() > 0 ? await copaBrasilLogo.isVisible() : false;
const copaBrasilSrc = await copaBrasilLogo.count() > 0 ? await copaBrasilLogo.getAttribute('src') : null;
const labDaBola320 = await page.locator('header').getByText('Lab da Bola').count();
const headerImgs320 = await page.locator('header img').count();
const headerFlex320 = await page.evaluate(() => {
  const h = document.querySelector('header > div');
  if (!h) return null;
  const s = window.getComputedStyle(h);
  return { display: s.display, alignItems: s.alignItems };
});

console.log(JSON.stringify({ tablistBox, simulacaoBox, label: 'aba simulação vs tablist 320px' }));
console.log(JSON.stringify({ gradientCount, gradientVisible, label: 'gradient fade 320px' }));
console.log(JSON.stringify({ bodyScrollWidth320, vp320, hasHorizOverflow: bodyScrollWidth320 > vp320, label: 'overflow 320px' }));
console.log(JSON.stringify({ copaBrasilVisible, copaBrasilSrc, label: 'logo copa 320px' }));
console.log(JSON.stringify({ labDaBola320, headerImgs320, label: 'header 320px counts' }));
console.log(JSON.stringify({ headerFlex320, label: 'alinhamento header 320px' }));

// Clicar aba Simulação e screenshot
await page.locator('[role="tab"]:nth-child(3)').click();
await page.waitForTimeout(800);
await shot('arlequina-320-simulacao.png');
const painelHidden = await page.locator('#panel-simulacao').getAttribute('hidden');
console.log(JSON.stringify({ painelHidden, label: 'painel simulação hidden após click 320px' }));

// ── 768px — tablet ────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('arlequina-768-chaveamento.png');
const body768 = await page.evaluate(() => document.body.scrollWidth);
const gradientAt768 = page.locator('.pointer-events-none.absolute.right-0');
const gradientCount768 = await gradientAt768.count();
const gradientVisible768 = gradientCount768 > 0 ? await gradientAt768.isVisible() : false;
console.log(JSON.stringify({ body768, vp768: 768, hasHorizOverflow: body768 > 768, label: 'overflow 768px' }));
console.log(JSON.stringify({ gradientCount768, gradientVisible768, label: 'gradient 768px (sm:hidden → deve estar oculto)' }));

// ── 1440px — desktop ──────────────────────────────────────────────────────────
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('arlequina-1440-chaveamento.png');
const body1440 = await page.evaluate(() => document.body.scrollWidth);
console.log(JSON.stringify({ body1440, vp1440: 1440, hasHorizOverflow: body1440 > 1440, label: 'overflow 1440px' }));

// Cores das abas inativas
const allTabs = await page.locator('[role="tab"]').all();
for (let i = 0; i < allTabs.length; i++) {
  const tab = allTabs[i];
  const selected = await tab.getAttribute('aria-selected');
  const labelText = await tab.textContent();
  const color = await tab.evaluate(el => window.getComputedStyle(el).color);
  console.log(JSON.stringify({ i, labelText: labelText?.trim(), selected, color, label: 'cor aba' }));
}

// Lab da Bola no header desktop
const labDaBola1440 = await page.locator('header').getByText('Lab da Bola').count();
console.log(JSON.stringify({ labDaBola1440, label: 'Lab da Bola no header 1440px' }));

await browser.close();
console.log('DONE');
