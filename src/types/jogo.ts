export type Jogo = {
  id: number
  idExterno: string | null
  timeCasa: string
  timeFora: string
  golsCasa: number
  golsFora: number
  disputado: boolean
  fase: string
  dataJogo: string
  createdAt: string
  idTimeCasa: string | null
  idTimeFora: string | null
  escudoCasa: string | null
  escudoFora: string | null
  round: number | null
  status: string | null
  estadio: string | null
  isSimulado?: boolean
}

export const JOGOS_MOCK: Jogo[] = [
  {
    id: 1,
    idExterno: '2477411',
    timeCasa: 'Internacional',
    timeFora: 'Corinthians',
    golsCasa: 2,
    golsFora: 0,
    disputado: true,
    fase: 'Oitavas de Final',
    dataJogo: '2026-08-06T23:00:00.000Z',
    createdAt: '2026-08-09T00:00:00.000Z',
    idTimeCasa: '134281',
    idTimeFora: '134284',
    escudoCasa: 'https://r2.thesportsdb.com/images/media/team/badge/yprvxx1473538097.png',
    escudoFora: 'https://r2.thesportsdb.com/images/media/team/badge/vvuvps1473538042.png',
    round: 16,
    status: 'FT',
    estadio: null,
  },
  {
    id: 2,
    idExterno: '2477413',
    timeCasa: 'Palmeiras',
    timeFora: 'Fortaleza',
    golsCasa: 3,
    golsFora: 0,
    disputado: true,
    fase: 'Oitavas de Final',
    dataJogo: '2026-08-06T23:00:00.000Z',
    createdAt: '2026-08-09T00:00:00.000Z',
    idTimeCasa: '134465',
    idTimeFora: '136186',
    escudoCasa: 'https://r2.thesportsdb.com/images/media/team/badge/vsqwqp1473538105.png',
    escudoFora: 'https://r2.thesportsdb.com/images/media/team/badge/tosmdr1532853458.png',
    round: 16,
    status: 'FT',
    estadio: null,
  },
  {
    id: 3,
    idExterno: '2477421',
    timeCasa: 'Vitória',
    timeFora: 'Athletico Paranaense',
    golsCasa: 4,
    golsFora: 0,
    disputado: true,
    fase: 'Oitavas de Final',
    dataJogo: '2026-08-06T23:00:00.000Z',
    createdAt: '2026-08-09T00:00:00.000Z',
    idTimeCasa: '134280',
    idTimeFora: '134297',
    escudoCasa: 'https://r2.thesportsdb.com/images/media/team/badge/tysrrx1473538156.png',
    escudoFora: 'https://r2.thesportsdb.com/images/media/team/badge/irzu1u1554237406.png',
    round: 16,
    status: 'FT',
    estadio: null,
  },
  {
    id: 4,
    idExterno: '2477409',
    timeCasa: 'Vasco da Gama',
    timeFora: 'Fluminense',
    golsCasa: 0,
    golsFora: 0,
    disputado: false,
    fase: 'Oitavas de Final',
    dataJogo: '2026-08-13T23:00:00.000Z',
    createdAt: '2026-08-09T00:00:00.000Z',
    idTimeCasa: '134282',
    idTimeFora: '134296',
    escudoCasa: 'https://r2.thesportsdb.com/images/media/team/badge/ynqlxo1630521109.png',
    escudoFora: 'https://r2.thesportsdb.com/images/media/team/badge/stvvwp1473538082.png',
    round: 16,
    status: 'NS',
    estadio: null,
  },
]
