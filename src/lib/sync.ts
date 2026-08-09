import { prisma } from '@/lib/prisma'
import { fetchAllRounds, type SportsDbEvent } from '@/lib/theSportsDb'
import { mapFase } from '@/lib/mapFase'

function parseScore(raw: string | null | undefined): number {
  if (raw === null || raw === undefined || raw === '') return 0
  const n = parseInt(raw, 10)
  return isNaN(n) ? 0 : n
}

function isDisputado(ev: SportsDbEvent): boolean {
  const s = (ev.strStatus ?? '').toUpperCase()
  return s === 'FT' || s === 'AET' || s === 'PEN'
}

function parseDataJogo(ev: SportsDbEvent): Date {
  if (ev.strTimestamp) {
    // TheSportsDB entrega strings UTC sem sufixo Z — forçar UTC explícito
    const ts = /[Z+]/.test(ev.strTimestamp) ? ev.strTimestamp : ev.strTimestamp + 'Z'
    return new Date(ts)
  }
  const date = ev.dateEvent ?? '2026-01-01'
  const time = ev.strTime ?? '00:00:00'
  // strTime também é UTC — forçar Z para não depender do fuso da máquina
  return new Date(`${date}T${time}Z`)
}

export type SyncResult = {
  criados: number
  atualizados: number
  ignorados: number
  porFase: Record<string, number>
}

export async function syncJogos(): Promise<SyncResult> {
  const events = await fetchAllRounds()

  if (events.length === 0) {
    throw new Error('TheSportsDB retornou zero eventos. Verifique o ID do campeonato e a season.')
  }

  let criados = 0
  let atualizados = 0
  let ignorados = 0
  const porFase: Record<string, number> = {}

  for (const ev of events) {
    const round = parseInt(ev.intRound, 10)
    const fase = mapFase(round)
    const disputado = isDisputado(ev)
    const golsCasa = disputado ? parseScore(ev.intHomeScore) : 0
    const golsFora = disputado ? parseScore(ev.intAwayScore) : 0
    const dataJogo = parseDataJogo(ev)

    const data = {
      timeCasa: ev.strHomeTeam,
      timeFora: ev.strAwayTeam,
      golsCasa,
      golsFora,
      disputado,
      fase,
      dataJogo,
      round,
      status: ev.strStatus ?? null,
      estadio: ev.strVenue ?? null,
      idTimeCasa: ev.idHomeTeam ?? null,
      idTimeFora: ev.idAwayTeam ?? null,
      escudoCasa: ev.strHomeTeamBadge ?? null,
      escudoFora: ev.strAwayTeamBadge ?? null,
    }

    const existing = await prisma.jogo.findUnique({ where: { idExterno: ev.idEvent } })

    if (!existing) {
      await prisma.jogo.create({ data: { ...data, idExterno: ev.idEvent } })
      criados++
    } else {
      await prisma.jogo.update({ where: { idExterno: ev.idEvent }, data })
      atualizados++
    }

    porFase[fase] = (porFase[fase] ?? 0) + 1
  }

  return { criados, atualizados, ignorados, porFase }
}
