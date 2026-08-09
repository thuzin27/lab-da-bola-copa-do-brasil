import { config } from 'dotenv'
config({ path: '.env.local' })
config({ path: '.env' })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const jogos = [
  {
    timeCasa: 'Flamengo',
    timeFora: 'Vasco',
    golsCasa: 3,
    golsFora: 1,
    fase: 'Oitavas de Final',
    dataJogo: new Date('2025-05-14T21:00:00Z'),
  },
  {
    timeCasa: 'Palmeiras',
    timeFora: 'Santos',
    golsCasa: 2,
    golsFora: 0,
    fase: 'Oitavas de Final',
    dataJogo: new Date('2025-05-15T19:00:00Z'),
  },
  {
    timeCasa: 'Corinthians',
    timeFora: 'São Paulo',
    golsCasa: 1,
    golsFora: 1,
    fase: 'Oitavas de Final',
    dataJogo: new Date('2025-05-16T21:30:00Z'),
  },
  {
    timeCasa: 'Atlético-MG',
    timeFora: 'Cruzeiro',
    golsCasa: 2,
    golsFora: 2,
    fase: 'Quartas de Final',
    dataJogo: new Date('2025-06-04T21:00:00Z'),
  },
  {
    timeCasa: 'Grêmio',
    timeFora: 'Internacional',
    golsCasa: 1,
    golsFora: 0,
    fase: 'Quartas de Final',
    dataJogo: new Date('2025-06-05T21:30:00Z'),
  },
  {
    timeCasa: 'Fluminense',
    timeFora: 'Botafogo',
    golsCasa: 0,
    golsFora: 2,
    fase: 'Semifinal',
    dataJogo: new Date('2025-07-09T21:00:00Z'),
  },
  {
    timeCasa: 'Flamengo',
    timeFora: 'Atlético-MG',
    golsCasa: 1,
    golsFora: 1,
    fase: 'Semifinal',
    dataJogo: new Date('2025-07-16T21:00:00Z'),
  },
  {
    timeCasa: 'Botafogo',
    timeFora: 'Flamengo',
    golsCasa: 0,
    golsFora: 0,
    fase: 'Final',
    dataJogo: new Date('2025-09-13T16:00:00Z'),
  },
]

async function main() {
  console.log('Seeding database...')
  await prisma.jogo.deleteMany()
  await prisma.jogo.createMany({ data: jogos })
  console.log(`Seed completo: ${jogos.length} jogos inseridos.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
