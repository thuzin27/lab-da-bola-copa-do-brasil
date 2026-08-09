import { prisma } from '../src/lib/prisma'

async function main() {
  const oitavas = await prisma.jogo.findMany({
    where: { fase: 'Oitavas de Final', disputado: true },
    select: { timeCasa: true, timeFora: true, golsCasa: true, golsFora: true },
    orderBy: { timeCasa: 'asc' },
  })

  console.log(`\nOitavas de Final disputadas (${oitavas.length} jogos):\n`)
  for (const j of oitavas) {
    console.log(`  ${j.timeCasa} ${j.golsCasa} × ${j.golsFora} ${j.timeFora}`)
  }

  const inter = oitavas.find((j) => j.timeCasa.includes('Internacional') || j.timeFora.includes('Internacional'))
  const palm = oitavas.find((j) => j.timeCasa.includes('Palmeiras') || j.timeFora.includes('Palmeiras'))

  console.log('\n--- Validação ---')
  console.log('Internacional 2×0 Corinthians:', inter ? `OK ${inter.timeCasa} ${inter.golsCasa}x${inter.golsFora} ${inter.timeFora}` : 'NAO ENCONTRADO')
  console.log('Palmeiras 3×0 Fortaleza:', palm ? `OK ${palm.timeCasa} ${palm.golsCasa}x${palm.golsFora} ${palm.timeFora}` : 'NAO ENCONTRADO')
}

main().catch((e) => { console.error(e.message); process.exit(1) })
