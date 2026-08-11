import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não definida')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Quartas de Final Copa do Brasil 2026
// Sorteio realizado em 11/08/2026 na sede da CBF
// Datas-base: ida 26/08, volta 02/09 (horários a confirmar — usando 21:30 UTC = 18:30 BRT)

const TIMES: Record<string, { id: string; escudo: string }> = {
  'Internacional':    { id: '134281', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/yprvxx1473538097.png' },
  'Grêmio':          { id: '134288', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/uvpwyt1473538089.png' },
  'Cruzeiro':        { id: '134294', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/upsvvu1473538059.png' },
  'Atlético Mineiro':{ id: '134299', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/x5lixs1743742872.png' },
  'Vasco da Gama':   { id: '134282', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/ynqlxo1630521109.png' },
  'Vitória':         { id: '134280', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/tysrrx1473538156.png' },
  'Palmeiras':       { id: '134465', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/vsqwqp1473538105.png' },
  'Santos':          { id: '134286', escudo: 'https://r2.thesportsdb.com/images/media/team/badge/j8xk9g1679447486.png' },
}

const CONFRONTOS = [
  { casa: 'Internacional', fora: 'Grêmio' },
  { casa: 'Cruzeiro',      fora: 'Atlético Mineiro' },
  { casa: 'Vasco da Gama', fora: 'Vitória' },
  { casa: 'Palmeiras',     fora: 'Santos' },
]

// Horários provisórios (21:30 UTC = 18:30 BRT) — atualizar quando CBF confirmar
const IDA_UTC   = 'T21:30:00.000Z'
const VOLTA_UTC = 'T21:30:00.000Z'

async function main() {
  // Garantir que não existam quartas cadastradas (evitar duplicata)
  const existing = await prisma.jogo.findMany({
    where: { round: 8, fase: 'Quartas de Final' },
    select: { id: true, timeCasa: true, timeFora: true },
  })

  if (existing.length > 0) {
    console.log('Já existem jogos de Quartas de Final no banco:')
    existing.forEach(j => console.log(`  id=${j.id} ${j.timeCasa} x ${j.timeFora}`))
    console.log('Abortando para não duplicar. Delete-os manualmente se quiser reinserir.')
    return
  }

  let criados = 0
  for (const { casa, fora } of CONFRONTOS) {
    const timeCasa = TIMES[casa]
    const timeFora = TIMES[fora]

    // Ida — time da casa manda
    await prisma.jogo.create({
      data: {
        idExterno:   null,
        timeCasa:    casa,
        timeFora:    fora,
        golsCasa:    0,
        golsFora:    0,
        disputado:   false,
        fase:        'Quartas de Final',
        round:       8,
        dataJogo:    new Date('2026-08-26' + IDA_UTC),
        status:      'NS',
        estadio:     null,
        idTimeCasa:  timeCasa.id,
        idTimeFora:  timeFora.id,
        escudoCasa:  timeCasa.escudo,
        escudoFora:  timeFora.escudo,
        competicao:  'copa-do-brasil',
      },
    })
    criados++

    // Volta — time visitante manda em casa
    await prisma.jogo.create({
      data: {
        idExterno:   null,
        timeCasa:    fora,
        timeFora:    casa,
        golsCasa:    0,
        golsFora:    0,
        disputado:   false,
        fase:        'Quartas de Final',
        round:       8,
        dataJogo:    new Date('2026-09-02' + VOLTA_UTC),
        status:      'NS',
        estadio:     null,
        idTimeCasa:  timeFora.id,
        idTimeFora:  timeCasa.id,
        escudoCasa:  timeFora.escudo,
        escudoFora:  timeCasa.escudo,
        competicao:  'copa-do-brasil',
      },
    })
    criados++

    console.log(`✓ ${casa} × ${fora} (ida + volta)`)
  }

  console.log(`\n${criados} jogos inseridos.`)

  const total = await prisma.jogo.count()
  console.log(`Total no banco: ${total}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
