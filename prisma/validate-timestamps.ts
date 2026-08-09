import { prisma } from '../src/lib/prisma'

const BRT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

async function main() {
  const jogos = await prisma.jogo.findMany({
    where: {
      OR: [
        { timeCasa: { contains: 'Vitória' }, timeFora: { contains: 'Athletico' } },
        { timeCasa: { contains: 'Corinthians' }, timeFora: { contains: 'Internacional' } },
      ],
    },
    select: { timeCasa: true, timeFora: true, golsCasa: true, golsFora: true, dataJogo: true, disputado: true },
    orderBy: { dataJogo: 'asc' },
  })

  console.log('\n--- Validação de timestamps ---\n')
  for (const j of jogos) {
    const display = BRT.format(j.dataJogo)
    const ok = display.includes('06/08/2026') && display.includes('20:00')
    console.log(`${ok ? '✅' : '❌'} ${j.timeCasa} ${j.golsCasa}x${j.golsFora} ${j.timeFora}`)
    console.log(`   Esperado: 06/08/2026, 20:00 | Exibido (BRT): ${display}\n`)
  }
}

main().catch((e) => { console.error(e.message); process.exit(1) })
