import { syncJogos } from '../src/lib/sync'
import { prisma } from '../src/lib/prisma'

async function main() {
  const result = await syncJogos()
  console.log('Sync result:', JSON.stringify(result, null, 2))

  // round=16 = Oitavas de Final (TheSportsDB usa o nº de participantes como ID de round)
  const jogo = await prisma.jogo.findFirst({
    where: { round: 16 },
    orderBy: { dataJogo: 'asc' },
  })
  console.log('Jogo das oitavas:', JSON.stringify(jogo, null, 2))
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
