import { fetchProximosEventos } from '@/lib/theSportsDb'
import { serverError } from '@/lib/responses'

export const maxDuration = 30
// Cache de 5 minutos — escalação e horários raramente mudam com mais frequência
export const revalidate = 300

export type ProximoJogo = {
  idExterno: string
  timeCasa: string
  timeFora: string
  escudoCasa: string | null
  escudoFora: string | null
  dataJogo: string
  competicao: string
  rodada: number
}

function parseTimestamp(ev: {
  strTimestamp?: string | null
  dateEvent?: string | null
  strTime?: string | null
}): string {
  if (ev.strTimestamp) {
    const ts = /[Z+]/.test(ev.strTimestamp) ? ev.strTimestamp : ev.strTimestamp + 'Z'
    return ts
  }
  const date = ev.dateEvent ?? '2099-01-01'
  const time = ev.strTime ?? '00:00:00'
  return `${date}T${time}Z`
}

export async function GET() {
  try {
    const now = new Date()
    const events = await fetchProximosEventos()

    const proximos: ProximoJogo[] = []

    for (const ev of events) {
      // Pular jogos que já têm placar (disputados)
      if (ev.intHomeScore !== null && ev.intHomeScore !== undefined && ev.intHomeScore !== '') continue

      const dataJogo = parseTimestamp(ev)
      // Filtrar jogos com data no passado — adiados não são "próximos"
      if (new Date(dataJogo) <= now) continue

      proximos.push({
        idExterno: ev.idEvent,
        timeCasa: ev.strHomeTeam,
        timeFora: ev.strAwayTeam,
        escudoCasa: ev.strHomeTeamBadge ?? null,
        escudoFora: ev.strAwayTeamBadge ?? null,
        dataJogo,
        competicao: ev._competicao,
        rodada: parseInt(ev.intRound, 10),
      })
    }

    proximos.sort((a, b) => new Date(a.dataJogo).getTime() - new Date(b.dataJogo).getTime())

    return Response.json(proximos)
  } catch {
    return serverError('Erro ao buscar próximos jogos')
  }
}
