import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });
await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
await page.waitForSelector('section[aria-label="Chaveamento mata-mata"]', { timeout: 8000 });
await page.screenshot({ path: '/tmp/bracket-desktop.png', fullPage: false });

const aDefinir = await page.locator('[aria-label="A definir"]').count();
const matchCards = await page.locator('article').count();
const labels = await page.locator('p.uppercase').allTextContents();
const hasSvgConnectors = await page.locator('svg[aria-hidden="true"]').count();
const headerLogos = await page.locator('header img').count();
const hasForm = await page.locator('form[aria-label="Cadastrar novo jogo"]').count();

// Mobile check
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: '/tmp/bracket-mobile.png', fullPage: false });
const mobileVisible = await page.locator('.md\\:hidden').isVisible();

console.log(JSON.stringify({
  aDefinir, matchCards, labels, hasSvgConnectors, headerLogos, hasForm, mobileVisible
}));
await browser.close();
