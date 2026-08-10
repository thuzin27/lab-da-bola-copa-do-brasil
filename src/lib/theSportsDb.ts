import { z } from 'zod'

const BASE = 'https://www.thesportsdb.com/api/v1/json/123'
const LEAGUE_ID = 4725
const SEASON = '2026'
const ROUNDS = [1256, 128, 64, 32, 16, 8, 4, 2] as const

const EventSchema = z.object({
  idEvent: z.string(),
  strHomeTeam: z.string(),
  strAwayTeam: z.string(),
  idHomeTeam: z.string().nullable().optional(),
  idAwayTeam: z.string().nullable().optional(),
  strHomeTeamBadge: z.string().nullable().optional(),
  strAwayTeamBadge: z.string().nullable().optional(),
  intHomeScore: z.string().nullable().optional(),
  intAwayScore: z.string().nullable().optional(),
  intRound: z.string(),
  strStatus: z.string().nullable().optional(),
  strTimestamp: z.string().nullable().optional(),
  dateEvent: z.string().nullable().optional(),
  strTime: z.string().nullable().optional(),
  strVenue: z.string().nullable().optional(),
})

const ResponseSchema = z.object({
  events: z.array(EventSchema).nullable(),
})

export type SportsDbEvent = z.infer<typeof EventSchema>

async function fetchRound(round: number): Promise<SportsDbEvent[]> {
  const url = `${BASE}/eventsround.php?id=${LEAGUE_ID}&r=${round}&s=${SEASON}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`HTTP ${res.status} para round=${round}`)

      const raw = await res.json()
      const parsed = ResponseSchema.safeParse(raw)

      if (!parsed.success) {
        throw new Error(`Resposta inválida da TheSportsDB (round=${round}): ${parsed.error.message}`)
      }

      return parsed.data.events ?? []
    } catch (err) {
      lastError = err
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt))
    }
  }

  clearTimeout(timeout)
  throw lastError
}

export async function fetchAllRounds(): Promise<SportsDbEvent[]> {
  // Busca todos os rounds em paralelo — reduz latência total de soma(latências) para max(latências)
  const perRound = await Promise.all(ROUNDS.map((round) => fetchRound(round)))
  return perRound.flat()
}
