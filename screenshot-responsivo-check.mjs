import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'screenshots-responsividade');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const BASE = 'http://localhost:3000';
const VIEWPORTS = [
  { width: 320, height: 568, label: '320px' },
  { width: 768, height: 1024, label: '768px' },
  { width: 1440, height: 900, label: '1440px' },
];
const ABAS = [
  { tab: 1, name: 'chaveamento', label: 'Chaveamento' },
  { tab: 2, name: 'fases-anteriores', label: 'Fases anteriores' },
  { tab: 3, name: 'simulacao', label: 'Simulação' },
];

const browser = await chromium.launch();
const page = await browser.newPage();

console.log('Capturando screenshots em 3 larguras x 3 abas...\n');

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  console.log(`\n📱 ${vp.label} (${vp.width}×${vp.height})`);
  
  for (const aba of ABAS) {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    
    if (aba.tab > 1) {
      await page.locator(`[role="tab"]:nth-child(${aba.tab})`).click();
      await page.waitForTimeout(600);
    }
    
    const filename = `${vp.label}-${aba.name}.png`;
    const filePath = path.join(outDir, filename);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`  ✓ ${aba.label}`);
  }
}

await browser.close();
console.log(`\n✅ Screenshots salvos em: ${outDir}`);
