import { fetchBracketLive } from '@/lib/theSportsDb'

export const dynamic = 'force-dynamic'

export type LiveScore = {
  idExterno: string
  golsCasa: number | null
  golsFora: number | null
  status: string | null
}

function parseScore(s: string | null | undefined): number | null {
  if (s === null || s === undefined || s === '') return null
  const n = parseInt(s, 10)
  return isNaN(n) ? null : n
}

export async function GET() {
  try {
    const events = await fetchBracketLive()
    const scores: LiveScore[] = events.map(e => ({
      idExterno: e.idEvent,
      golsCasa: parseScore(e.intHomeScore),
      golsFora: parseScore(e.intAwayScore),
      status: e.strStatus ?? null,
    }))
    return Response.json(scores)
  } catch {
    return Response.json([])
  }
}
