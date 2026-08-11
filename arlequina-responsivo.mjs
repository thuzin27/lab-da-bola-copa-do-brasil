// Script Arlequina — responsividade 2026-08-11
// Tira screenshots em 320, 640, 768, 1024, 1440px na aba chaveamento
// e verifica scroll horizontal no body

import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const WIDTHS = [320, 640, 768, 1024, 1440]
const BASE_URL = 'http://localhost:3000'
const OUT_DIR = 'D:/datakick/lab-da-bota-copa-do-brasil/screenshots-responsividade'

const browser = await chromium.launch({ headless: true })
const results = []

for (const w of WIDTHS) {
  const page = await browser.newPage()
  await page.setViewportSize({ width: w, height: 900 })
  await page.goto(`${BASE_URL}/?aba=chaveamento`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  const path = `${OUT_DIR}/chav-${w}.png`
  await page.screenshot({ path, fullPage: true })

  // Verifica scroll horizontal no body
  const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
  const viewportWidth = await page.evaluate(() => window.innerWidth)
  const hasHorizontalScroll = bodyScrollWidth > viewportWidth

  // Verifica qual bracket está visível
  const desktopVisible = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="Chaveamento da Copa do Brasil 2026"]')
    if (!el) return null
    const parent = el.closest('.hidden.lg\\:block, .lg\\:hidden')
    if (!parent) {
      // verifica por computed style
      const desktopDiv = document.querySelector('.hidden.lg\\:block')
      const mobileDiv = document.querySelector('.lg\\:hidden')
      if (desktopDiv && mobileDiv) {
        const ds = window.getComputedStyle(desktopDiv).display
        const ms = window.getComputedStyle(mobileDiv).display
        return { desktopDisplay: ds, mobileDisplay: ms }
      }
    }
    return null
  })

  // Alternativa: procura diretamente pelos divs
  const bracketInfo = await page.evaluate(() => {
    const desktopDiv = document.querySelector('.hidden.lg\\:block')
    const mobileDiv = document.querySelector('.lg\\:hidden')
    return {
      desktopDisplay: desktopDiv ? window.getComputedStyle(desktopDiv).display : 'NOT_FOUND',
      mobileDisplay: mobileDiv ? window.getComputedStyle(mobileDiv).display : 'NOT_FOUND',
    }
  })

  // Verifica header: "Lab da Bola" visível?
  const labDaBola = await page.evaluate(() => {
    const span = document.querySelector('span.hidden.sm\\:inline')
    if (!span) return 'NOT_FOUND'
    return window.getComputedStyle(span).display
  })

  // Verifica overflow no documentElement
  const docScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const docClientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const docOverflow = docScrollWidth > docClientWidth

  results.push({
    width: w,
    path,
    bodyScrollWidth,
    viewportWidth,
    hasHorizontalScroll,
    docOverflow,
    docScrollWidth,
    docClientWidth,
    bracketInfo,
    labDaBola,
  })

  await page.close()
}

// Screenshot da aba simulacao em 320px
const simPage = await browser.newPage()
await simPage.setViewportSize({ width: 320, height: 900 })
await simPage.goto(`${BASE_URL}/?aba=simulacao`, { waitUntil: 'networkidle' })
await simPage.waitForTimeout(1500)
const simPath = `${OUT_DIR}/simulacao-320.png`
await simPage.screenshot({ path: simPath, fullPage: false })

// Mede header simulação
const simHeaderInfo = await simPage.evaluate(() => {
  const p = document.querySelector('p.text-xs.text-gray-400')
  const btn = document.querySelector('button.text-xs.text-red-500')
  if (!p || !btn) return { found: false }
  const pRect = p.getBoundingClientRect()
  const bRect = btn.getBoundingClientRect()
  const overlap = !(pRect.right < bRect.left || bRect.right < pRect.left ||
                    pRect.bottom < bRect.top || bRect.bottom < pRect.top)
  const simScrollWidth = document.body.scrollWidth
  const simViewWidth = window.innerWidth
  return {
    found: true,
    pRect: { top: pRect.top, left: pRect.left, right: pRect.right, bottom: pRect.bottom },
    bRect: { top: bRect.top, left: bRect.left, right: bRect.right, bottom: bRect.bottom },
    overlap,
    simScrollWidth,
    simViewWidth,
    hasScroll: simScrollWidth > simViewWidth
  }
})

await simPage.close()

// Screenshot 640px — verifica BracketMobile 2 colunas
const p640 = await browser.newPage()
await p640.setViewportSize({ width: 640, height: 900 })
await p640.goto(`${BASE_URL}/?aba=chaveamento`, { waitUntil: 'networkidle' })
await p640.waitForTimeout(1500)
await p640.screenshot({ path: `${OUT_DIR}/chav-640-full.png`, fullPage: true })

// Verifica grid dos confrontos no mobile (sm:grid-cols-2)
const gridInfo640 = await p640.evaluate(() => {
  // BracketMobile tem grids com classe grid
  const grids = document.querySelectorAll('.grid')
  const info = []
  for (const g of grids) {
    const cols = window.getComputedStyle(g).gridTemplateColumns
    info.push(cols)
  }
  return info
})
await p640.close()

// Screenshot 768px full
const p768 = await browser.newPage()
await p768.setViewportSize({ width: 768, height: 900 })
await p768.goto(`${BASE_URL}/?aba=chaveamento`, { waitUntil: 'networkidle' })
await p768.waitForTimeout(1500)
await p768.screenshot({ path: `${OUT_DIR}/chav-768-full.png`, fullPage: true })

// Verifica bracket desktop vs mobile em 768
const bracket768 = await p768.evaluate(() => {
  const desktopDiv = document.querySelector('.hidden.lg\\:block')
  const mobileDiv = document.querySelector('.lg\\:hidden')
  return {
    desktopDisplay: desktopDiv ? window.getComputedStyle(desktopDiv).display : 'NOT_FOUND',
    mobileDisplay: mobileDiv ? window.getComputedStyle(mobileDiv).display : 'NOT_FOUND',
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }
})

// Verifica grid em 768
const gridInfo768 = await p768.evaluate(() => {
  const grids = document.querySelectorAll('.grid')
  const info = []
  for (const g of grids) {
    const cols = window.getComputedStyle(g).gridTemplateColumns
    info.push(cols)
  }
  return info
})
await p768.close()

// Screenshot 1024px - verifica bracket desktop
const p1024 = await browser.newPage()
await p1024.setViewportSize({ width: 1024, height: 900 })
await p1024.goto(`${BASE_URL}/?aba=chaveamento`, { waitUntil: 'networkidle' })
await p1024.waitForTimeout(1500)
await p1024.screenshot({ path: `${OUT_DIR}/chav-1024-full.png`, fullPage: true })

const bracket1024 = await p1024.evaluate(() => {
  const desktopDiv = document.querySelector('.hidden.lg\\:block')
  const mobileDiv = document.querySelector('.lg\\:hidden')
  const bracketEl = desktopDiv?.querySelector('[role="region"]')
  const bracketRect = bracketEl?.getBoundingClientRect()
  return {
    desktopDisplay: desktopDiv ? window.getComputedStyle(desktopDiv).display : 'NOT_FOUND',
    mobileDisplay: mobileDiv ? window.getComputedStyle(mobileDiv).display : 'NOT_FOUND',
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    bracketWidth: bracketRect?.width ?? null,
    bracketRight: bracketRect?.right ?? null,
  }
})
await p1024.close()

await browser.close()

// Salva resultado como JSON
const report = {
  timestamp: new Date().toISOString(),
  widthResults: results,
  simulacao320: simHeaderInfo,
  bracket768,
  gridInfo640,
  gridInfo768,
  bracket1024,
}

writeFileSync(`${OUT_DIR}/arlequina-report.json`, JSON.stringify(report, null, 2))
console.log('=== RELATÓRIO ARLEQUINA ===')
console.log(JSON.stringify(report, null, 2))
