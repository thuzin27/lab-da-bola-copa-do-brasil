/**
 * Cleanup das quartas de final inseridas manualmente.
 *
 * Rodar DEPOIS que a TheSportsDB liberar os dados e o sync tiver sido executado.
 * O sync cria novos registros com idExterno real — este script remove os manuais
 * (idExterno null) para os quais já existe um equivalente TheSportsDB no banco.
 *
 * USO:
 *   npx tsx --env-file=.env.local scripts/cleanup-quartas-manuais.ts          # dry-run
 *   npx tsx --env-file=.env.local scripts/cleanup-quartas-manuais.ts --apply  # aplica
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não definida')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DRY_RUN = !process.argv.includes('--apply')

async function main() {
  console.log(DRY_RUN ? '=== DRY-RUN (sem alterações) ===' : '=== MODO APPLY ===')
  console.log()

  // Busca os manuais (idExterno null, round 8)
  const manuais = await prisma.jogo.findMany({
    where: { idExterno: null, round: 8, fase: 'Quartas de Final' },
  })

  if (manuais.length === 0) {
    console.log('Nenhum jogo manual de quartas encontrado. Nada a fazer.')
    return
  }

  console.log(`Jogos manuais encontrados: ${manuais.length}`)
  manuais.forEach(j =>
    console.log(`  id=${j.id}  ${j.timeCasa} x ${j.timeFora}  (${j.dataJogo.toISOString().slice(0, 10)})`)
  )
  console.log()

  // Busca os TheSportsDB (idExterno não-null, round 8)
  const doSync = await prisma.jogo.findMany({
    where: { idExterno: { not: null }, round: 8, fase: 'Quartas de Final' },
  })

  if (doSync.length === 0) {
    console.log('Nenhum jogo com idExterno real encontrado para round 8.')
    console.log('O sync ainda não foi executado ou a TheSportsDB ainda não cadastrou os dados.')
    console.log('Abortando — nada foi deletado.')
    return
  }

  console.log(`Jogos do sync (com idExterno) encontrados: ${doSync.length}`)
  doSync.forEach(j =>
    console.log(`  idExterno=${j.idExterno}  ${j.timeCasa} x ${j.timeFora}  (${j.dataJogo.toISOString().slice(0, 10)})`)
  )
  console.log()

  // Para cada manual, verifica se existe correspondente no sync
  // Correspondência: mesmo par de times (por idTimeCasa/idTimeFora) dentro de ±3 dias
  const parasApagar: typeof manuais = []
  const semCorrespondente: typeof manuais = []

  for (const manual of manuais) {
    const correspondente = doSync.find(s => {
      const mesmoPar =
        (s.idTimeCasa === manual.idTimeCasa && s.idTimeFora === manual.idTimeFora) ||
        (s.idTimeCasa === manual.idTimeFora && s.idTimeFora === manual.idTimeCasa)
      const diffDias = Math.abs(s.dataJogo.getTime() - manual.dataJogo.getTime()) / (1000 * 60 * 60 * 24)
      return mesmoPar && diffDias <= 3
    })

    if (correspondente) {
      parasApagar.push(manual)
      console.log(`MATCH ✓  manual id=${manual.id} (${manual.timeCasa} x ${manual.timeFora})`)
      console.log(`         ← sync   id=${correspondente.id} idExterno=${correspondente.idExterno}`)
    } else {
      semCorrespondente.push(manual)
      console.log(`SEM MATCH ✗  manual id=${manual.id} (${manual.timeCasa} x ${manual.timeFora}) — MANTENDO`)
    }
  }

  console.log()

  if (parasApagar.length === 0) {
    console.log('Nenhum manual tem correspondente confirmado no sync. Abortando sem deletar.')
    return
  }

  if (semCorrespondente.length > 0) {
    console.log(`ATENÇÃO: ${semCorrespondente.length} manual(is) sem correspondente — não serão deletados:`)
    semCorrespondente.forEach(j =>
      console.log(`  id=${j.id}  ${j.timeCasa} x ${j.timeFora}`)
    )
    console.log()
  }

  console.log(`Prontos para deletar: ${parasApagar.length} jogos manuais`)
  parasApagar.forEach(j => console.log(`  id=${j.id}  ${j.timeCasa} x ${j.timeFora}`))

  if (DRY_RUN) {
    console.log()
    console.log('DRY-RUN concluído. Rode com --apply para efetivar.')
    return
  }

  // Deleta apenas os confirmados
  const ids = parasApagar.map(j => j.id)
  const { count } = await prisma.jogo.deleteMany({ where: { id: { in: ids } } })

  console.log()
  console.log(`${count} jogos manuais removidos.`)

  const total = await prisma.jogo.count()
  const round8 = await prisma.jogo.count({ where: { round: 8 } })
  console.log(`Total no banco: ${total}  |  Quartas (round 8): ${round8}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
