import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

const sizes = [320, 768, 1440];

for (const width of sizes) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const result = await page.evaluate(() => {
    const bodyScrollWidth = document.body.scrollWidth;
    const bodyClientWidth = document.body.clientWidth;
    const docScrollWidth = document.documentElement.scrollWidth;
    const docClientWidth = document.documentElement.clientWidth;
    const hasHorizontalScroll = docScrollWidth > docClientWidth;
    return {
      bodyScrollWidth,
      bodyClientWidth,
      docScrollWidth,
      docClientWidth,
      hasHorizontalScroll,
      overflow: docScrollWidth - docClientWidth,
    };
  });

  console.log(`${width}px: overflow=${result.overflow}px hasScroll=${result.hasHorizontalScroll} (docScroll=${result.docScrollWidth} docClient=${result.docClientWidth})`);
}

await browser.close();
