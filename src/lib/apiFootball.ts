const BASE = 'https://v3.football.api-sports.io'

function getKey(): string | null {
  return process.env.API_FOOTBALL_KEY ?? null
}

async function apiFetch<T>(path: string): Promise<T | null> {
  const key = getKey()
  if (!key) return null
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'x-apisports-key': key },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return (json.response ?? null) as T | null
  } catch {
    return null
  }
}

export type StatItem = {
  type: string
  home: string | number | null
  away: string | number | null
}

export type LineupPlayer = {
  id: number
  name: string
  number: number
  pos: string
  grid: string | null
}

export type TeamLineup = {
  teamId: number
  teamName: string
  formation: string
  coach: string
  startXI: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export type MatchLineup = { casa: TeamLineup; fora: TeamLineup }

// Estatísticas que exibimos na UI — filtramos o resto
const STAT_KEYS = new Set([
  'Ball Possession',
  'Total Shots',
  'Shots on Goal',
  'Corner Kicks',
  'Fouls',
  'Yellow Cards',
  'Red Cards',
  'Offsides',
])

type ApiStatTeam = {
  statistics: { type: string; value: string | number | null }[]
}

export async function fetchStats(fixtureId: string): Promise<StatItem[] | null> {
  const data = await apiFetch<ApiStatTeam[]>(`/fixtures/statistics?fixture=${fixtureId}`)
  if (!data || data.length < 2) return null

  const homeStats = data[0].statistics
  const awayStats = data[1].statistics
  const awayMap = new Map(awayStats.map(s => [s.type, s.value]))

  return homeStats
    .filter(s => STAT_KEYS.has(s.type))
    .map(s => ({
      type: s.type,
      home: s.value,
      away: awayMap.get(s.type) ?? null,
    }))
}

type ApiLineupTeam = {
  team: { id: number; name: string }
  coach: { name: string }
  formation: string
  startXI: { player: { id: number; name: string; number: number; pos: string; grid: string | null } }[]
  substitutes: { player: { id: number; name: string; number: number; pos: string; grid: string | null } }[]
}

function parseTeam(raw: ApiLineupTeam): TeamLineup {
  return {
    teamId: raw.team.id,
    teamName: raw.team.name,
    formation: raw.formation,
    coach: raw.coach.name,
    startXI: raw.startXI.map(p => p.player),
    substitutes: raw.substitutes.map(p => p.player),
  }
}

export async function fetchLineup(fixtureId: string): Promise<MatchLineup | null> {
  const data = await apiFetch<ApiLineupTeam[]>(`/fixtures/lineups?fixture=${fixtureId}`)
  if (!data || data.length < 2) return null
  return { casa: parseTeam(data[0]), fora: parseTeam(data[1]) }
}

export function hasKey(): boolean {
  return !!getKey()
}
