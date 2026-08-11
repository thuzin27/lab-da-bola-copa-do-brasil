import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name) {
  const filePath = path.join(outDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log('Saved: ' + filePath);
  return filePath;
}

async function irParaProximosJogos() {
  await page.locator('[role="tab"]').filter({ hasText: 'Próximos jogos' }).click();
  await page.waitForTimeout(1500);
}

// ── 320px — mobile mínimo ────────────────────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE + '?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Scroll horizontal do body
const scrollWidth320 = await page.evaluate(() => document.body.scrollWidth);
console.log(JSON.stringify({ scrollWidth320, vp: 320, horizOverflow: scrollWidth320 > 320, label: 'overflow body 320px' }));

// Scroll horizontal do tablist
const tablistScrollWidth320 = await page.evaluate(() => {
  const el = document.querySelector('[role="tablist"]');
  return el ? el.scrollWidth : null;
});
const tablistClientWidth320 = await page.evaluate(() => {
  const el = document.querySelector('[role="tablist"]');
  return el ? el.clientWidth : null;
});
console.log(JSON.stringify({ tablistScrollWidth320, tablistClientWidth320, tablistOverflow: tablistScrollWidth320 > tablistClientWidth320, label: 'tablist overflow 320px' }));

// Contagem de abas visíveis
const tabCount = await page.locator('[role="tab"]').count();
console.log(JSON.stringify({ tabCount, label: 'número de abas' }));

// Verificar todas as abas no DOM e suas bounding boxes
const abas = await page.locator('[role="tab"]').all();
for (let i = 0; i < abas.length; i++) {
  const txt = await abas[i].textContent();
  const box = await abas[i].boundingBox();
  console.log(JSON.stringify({ i, txt: txt?.trim(), box, label: 'aba bounding box 320px' }));
}

// Gradient fade indicador de scroll
const gradient = page.locator('.pointer-events-none.absolute.right-0');
const gradientVisible = await gradient.count() > 0 ? await gradient.isVisible() : false;
console.log(JSON.stringify({ gradientVisible, label: 'gradient fade 320px' }));

await shot('arlequina-proximos-320.png');

// Loading state check
const loadingEl = page.locator('[role="status"][aria-live="polite"]');
const loadingCount = await loadingEl.count();
console.log(JSON.stringify({ loadingCount, label: 'loading state aria-live=polite existe' }));

// Verificar se ProximosJogos renderizou (painel deve estar visível)
const painelProximos = page.locator('#panel-proximos-jogos');
const painelHidden = await painelProximos.getAttribute('hidden');
console.log(JSON.stringify({ painelHidden, label: 'painel proximos-jogos hidden attr' }));

// Cards de jogos — overflow horizontal
const cards = await page.locator('#panel-proximos-jogos .rounded-lg').all();
console.log(JSON.stringify({ cardCount: cards.length, label: 'cards no painel' }));

for (let i = 0; i < Math.min(cards.length, 3); i++) {
  const box = await cards[i].boundingBox();
  const scrollW = await cards[i].evaluate(el => el.scrollWidth);
  const clientW = await cards[i].evaluate(el => el.clientWidth);
  console.log(JSON.stringify({ i, box, scrollW, clientW, cardOverflow: scrollW > clientW + 2, label: 'card overflow 320px' }));
}

// Escudo placeholder — verificar se algum img quebrado existe
const imgsBroken = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('#panel-proximos-jogos img'));
  return imgs.map(img => ({
    src: img.src,
    naturalWidth: img.naturalWidth,
    complete: img.complete,
    broken: img.complete && img.naturalWidth === 0,
  }));
});
console.log(JSON.stringify({ imgsBroken, label: 'imagens quebradas 320px' }));

// Estado vazio — tem mensagem?
const vazioEl = await page.locator('text=Nenhum jogo próximo encontrado').count();
console.log(JSON.stringify({ vazioEl, label: 'estado vazio mensagem' }));

// Estado de erro — tem role=alert?
const erroEl = await page.locator('[role="alert"]').count();
console.log(JSON.stringify({ erroEl, label: 'estado erro role=alert existe' }));

// Texto de data/hora — legível?
const horaTexts = await page.locator('#panel-proximos-jogos .font-mono').allTextContents();
console.log(JSON.stringify({ horaTexts, label: 'textos hora 320px' }));

// ── 768px — tablet ───────────────────────────────────────────────────────────
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto(BASE + '?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const scrollWidth768 = await page.evaluate(() => document.body.scrollWidth);
console.log(JSON.stringify({ scrollWidth768, vp: 768, horizOverflow: scrollWidth768 > 768, label: 'overflow body 768px' }));
await shot('arlequina-proximos-768.png');

// Label de competição — hidden sm:block deve aparecer em 768px
const compLabel = await page.locator('#panel-proximos-jogos .hidden.sm\\:block').count();
console.log(JSON.stringify({ compLabel, label: 'label competição visível em 768px (hidden sm:block)' }));

// ── 1440px — desktop ──────────────────────────────────────────────────────────
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + '?aba=proximos-jogos', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const scrollWidth1440 = await page.evaluate(() => document.body.scrollWidth);
console.log(JSON.stringify({ scrollWidth1440, vp: 1440, horizOverflow: scrollWidth1440 > 1440, label: 'overflow body 1440px' }));
await shot('arlequina-proximos-1440.png');

// Label de competição em desktop
const compLabel1440 = await page.locator('#panel-proximos-jogos .hidden.sm\\:block').count();
console.log(JSON.stringify({ compLabel1440, label: 'label competição em 1440px' }));

await browser.close();
console.log('DONE');
