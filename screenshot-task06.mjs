import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3000';

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(name) {
  const filePath = path.join(__dirname, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log('Saved: ' + filePath);
  return filePath;
}

// ── 320px mobile ─────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 320, height: 568 });
await page.goto(BASE + '/?aba=simulacao', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await shot('t06-320-simulacao.png');

const overflow320 = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ overflow320, label: 'scroll horizontal 320px' }));

// Contar campos de texto livre (não deve ter nenhum)
const inputTextCount = await page.locator('#panel-simulacao input[type="text"]').count();
console.log(JSON.stringify({ inputTextCount, label: 'campos texto livre (deve ser 0)' }));

// Verificar selects de time (deve ter 8 — 4 quartas × 2)
const selectCount = await page.locator('#panel-simulacao select').count();
console.log(JSON.stringify({ selectCount, label: 'selects de time (deve ser 8)' }));

// Botão sortear presente
const sortearBtn = await page.locator('button:has-text("Sortear")').count();
console.log(JSON.stringify({ sortearBtn, label: 'botão sortear' }));

// Botão resetar presente
const resetarBtn = await page.locator('button:has-text("Resetar")').count();
console.log(JSON.stringify({ resetarBtn, label: 'botão resetar' }));

// ── Simular fluxo básico ──────────────────────────────────────────────────────
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto(BASE + '/?aba=simulacao', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await shot('t06-768-simulacao-inicial.png');

// Clicar Sortear e fazer screenshot
await page.locator('button:has-text("Sortear")').click();
await page.waitForTimeout(800);
await shot('t06-768-apos-sortear.png');

// Preencher placar do 1o confronto
const inputs = page.locator('#panel-simulacao input[type="number"]');
const inputCount = await inputs.count();
console.log(JSON.stringify({ inputCount, label: 'inputs de gols após sortear' }));

if (inputCount >= 2) {
  await inputs.nth(0).fill('2');
  await inputs.nth(1).fill('1');
  await page.waitForTimeout(400);
  await shot('t06-768-quarta1-preenchida.png');

  // Preencher restantes
  if (inputCount >= 8) {
    await inputs.nth(2).fill('1');
    await inputs.nth(3).fill('0');
    await inputs.nth(4).fill('3');
    await inputs.nth(5).fill('1');
    await inputs.nth(6).fill('0');
    await inputs.nth(7).fill('2');
    await page.waitForTimeout(600);
    await shot('t06-768-quartas-completas.png');

    // Semi deve aparecer
    const semiSection = await page.locator('#sim-semi').isVisible();
    console.log(JSON.stringify({ semiSection, label: 'semifinal apareceu (deve ser true)' }));

    if (semiSection) {
      const semiInputs = page.locator('#panel-simulacao input[type="number"]');
      const allInputs = await semiInputs.count();
      // Semi tem 4 inputs novos (2 confrontos)
      if (allInputs >= 12) {
        await semiInputs.nth(8).fill('2');
        await semiInputs.nth(9).fill('0');
        await semiInputs.nth(10).fill('1');
        await semiInputs.nth(11).fill('3');
        await page.waitForTimeout(600);
        await shot('t06-768-semi-preenchida.png');

        const finalSection = await page.locator('#sim-final').isVisible();
        console.log(JSON.stringify({ finalSection, label: 'final apareceu (deve ser true)' }));

        if (finalSection) {
          const finalInputs = await page.locator('#panel-simulacao input[type="number"]').count();
          if (finalInputs >= 14) {
            const fi = page.locator('#panel-simulacao input[type="number"]');
            await fi.nth(12).fill('1');
            await fi.nth(13).fill('0');
            await page.waitForTimeout(600);
            await shot('t06-768-campeao.png');

            const campeaoText = await page.locator('text=Campeão simulado').isVisible();
            console.log(JSON.stringify({ campeaoText, label: 'campeão simulado apareceu' }));
          }
        }
      }
    }
  }
}

// Verificar resetar
await page.locator('button:has-text("Resetar")').click();
await page.waitForTimeout(400);
const afterReset = await page.locator('#panel-simulacao select').count();
console.log(JSON.stringify({ afterReset, selectCount, label: 'selects após reset (deve ser igual a selects)' }));
await shot('t06-768-apos-reset.png');

// ── 1440px desktop ────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(BASE + '/?aba=simulacao', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('t06-1440-simulacao.png');

const overflow1440 = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
console.log(JSON.stringify({ overflow1440, label: 'scroll horizontal 1440px' }));

await browser.close();
console.log('DONE');
