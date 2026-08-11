import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 768, height: 1024 });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Verificar overflow no bracket desktop wrapper
const bracketSection = page.locator('section[aria-label="Chaveamento mata-mata"] > div.hidden');
const bracketScrollWidth = await bracketSection.evaluate(el => el.scrollWidth);
const bracketClientWidth = await bracketSection.evaluate(el => el.clientWidth);
const wrapperOverflow = await bracketSection.evaluate(el => window.getComputedStyle(el).overflowX);
console.log(JSON.stringify({ bracketScrollWidth, bracketClientWidth, wrapperOverflow, hasInternalScroll: bracketScrollWidth > bracketClientWidth, label: 'bracket overflow 768px' }));

// Verificar scroll do body/document
const bodyScroll = await page.evaluate(() => ({
  bodyScrollWidth: document.body.scrollWidth,
  documentScrollWidth: document.documentElement.scrollWidth,
  vp: window.innerWidth,
}));
console.log(JSON.stringify({ bodyScroll, label: 'body scroll 768px' }));

// Screenshot fullPage para ver o bracket inteiro
await page.screenshot({ path: 'D:/datakick/lab-da-bota-copa-do-brasil/arlequina-768-full.png', fullPage: true });
console.log('Saved: arlequina-768-full.png');

await browser.close();
