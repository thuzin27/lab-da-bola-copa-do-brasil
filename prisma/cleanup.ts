import { prisma } from '../src/lib/prisma'

async function main() {
  const antes = await prisma.jogo.count()
  console.log(`Total antes da limpeza: ${antes} jogos`)

  const porFaseAntes = await prisma.jogo.groupBy({
    by: ['fase'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })
  console.log('\nPor fase (antes):')
  for (const f of porFaseAntes) {
    console.log(`  ${f.fase}: ${f._count.id}`)
  }

  const resultado = await prisma.jogo.deleteMany({
    where: {
      idExterno: null,
      dataJogo: { lt: new Date('2026-01-01') },
    },
  })

  console.log(`\nRemovidos: ${resultado.count} jogos fantasmas (idExterno IS NULL AND dataJogo < 2026-01-01)`)

  const depois = await prisma.jogo.count()
  console.log(`\nTotal depois da limpeza: ${depois} jogos`)

  const porFaseDepois = await prisma.jogo.groupBy({
    by: ['fase'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })
  console.log('\nPor fase (depois):')
  for (const f of porFaseDepois) {
    console.log(`  ${f.fase}: ${f._count.id}`)
  }
}

main().catch((e) => { console.error(e.message); process.exit(1) })
