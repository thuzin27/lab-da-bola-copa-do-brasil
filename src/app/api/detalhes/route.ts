import { fetchStats, fetchLineup, hasKey, type StatItem, type MatchLineup } from '@/lib/apiFootball'
import { serverError } from '@/lib/responses'

export const dynamic = 'force-dynamic'

export type DetalhesResponse = {
  semChave: boolean
  stats: StatItem[] | null
  lineup: MatchLineup | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fixtureId = searchParams.get('id')

  if (!fixtureId) return serverError('Parâmetro id obrigatório')

  if (!hasKey()) {
    return Response.json({ semChave: true, stats: null, lineup: null } satisfies DetalhesResponse)
  }

  const [stats, lineup] = await Promise.all([
    fetchStats(fixtureId),
    fetchLineup(fixtureId),
  ])

  return Response.json({ semChave: false, stats, lineup } satisfies DetalhesResponse)
}
