import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name) {
  const fp = path.join(__dirname, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log('Saved:', fp);
  return fp;
}

// ── 320px ──────────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE + '/?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await shot('t05-320-proximos.png');
const overflow320 = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ overflow320, label: 'overflow 320px' }));

// ── 768px ──────────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto(BASE + '/?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await shot('t05-768-proximos.png');
const overflow768 = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ overflow768, label: 'overflow 768px' }));

// Verificar jogos carregados
const jogoCards = await page.locator('[aria-label*="Jogos de"]').count();
const emptyMsg = await page.locator('text=Nenhum jogo próximo').count();
const errorMsg = await page.locator('[role="alert"]').count();
console.log(JSON.stringify({ jogoCards, emptyMsg, errorMsg, label: 'estado da aba' }));

// ── 1440px ─────────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + '/?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await shot('t05-1440-proximos.png');
const overflow1440 = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ overflow1440, label: 'overflow 1440px' }));

// ── Verificar que fases-anteriores continua com 83 ──────────────────────
await page.goto(BASE + '/?aba=fases-anteriores', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await shot('t05-1440-fases-anteriores.png');

await browser.close();
console.log('DONE');
