import type { Jogo } from '@/types/jogo'

export const BRACKET_ROUNDS = [
  { round: 16, label: 'Oitavas de Final', slots: 8 },
  { round: 8,  label: 'Quartas de Final', slots: 4 },
  { round: 4,  label: 'Semifinal',        slots: 2 },
  { round: 2,  label: 'Final',            slots: 1 },
] as const

export const BRACKET_ROUND_VALUES = new Set([16, 8, 4, 2])

export const BRACKET_H  = 640
export const COL_W      = 180
export const CONN_W     = 36
export const LABEL_H    = 28

export type Time = { id: string; nome: string; escudo: string | null }

export type Confronto = {
  id: string
  timeA: Time
  timeB: Time
  golsA: number
  golsB: number
  vencedorId: string | null
  status: 'completo' | 'em_andamento' | 'penaltis'
  jogado: boolean
  isSimulado: boolean
}

export function deriveConfrontos(jogos: Jogo[], round: number): Confronto[] {
  const roundJogos = jogos.filter(j => j.round === round)
  if (!roundJogos.length) return []

  const pairsMap = new Map<string, Jogo[]>()
  for (const jogo of roundJogos) {
    const idA = jogo.idTimeCasa ?? jogo.timeCasa
    const idB = jogo.idTimeFora ?? jogo.timeFora
    const key = [idA, idB].sort().join('|')
    if (!pairsMap.has(key)) pairsMap.set(key, [])
    pairsMap.get(key)!.push(jogo)
  }

  return Array.from(pairsMap.values()).map(legs => {
    const sorted = [...legs].sort(
      (a, b) => new Date(a.dataJogo).getTime() - new Date(b.dataJogo).getTime()
    )
    const ida = sorted[0]
    const teamAId = ida.idTimeCasa ?? ida.timeCasa
    const teamBId = ida.idTimeFora ?? ida.timeFora

    let golsA = 0, golsB = 0
    for (const leg of legs) {
      if (!leg.disputado) continue
      const isACasa = (leg.idTimeCasa ?? leg.timeCasa) === teamAId
      golsA += isACasa ? leg.golsCasa : leg.golsFora
      golsB += isACasa ? leg.golsFora : leg.golsCasa
    }

    const allPlayed = legs.length === 2 && legs.every(l => l.disputado)
    const anyPlayed = legs.some(l => l.disputado)

    let vencedorId: string | null = null
    let status: Confronto['status'] = 'em_andamento'
    if (allPlayed) {
      if (golsA > golsB)      { vencedorId = teamAId; status = 'completo' }
      else if (golsB > golsA) { vencedorId = teamBId; status = 'completo' }
      else                     { status = 'penaltis' }
    }

    const escudoA =
      legs.find(l => (l.idTimeCasa ?? l.timeCasa) === teamAId)?.escudoCasa ??
      legs.find(l => (l.idTimeFora ?? l.timeFora) === teamAId)?.escudoFora ?? null
    const escudoB =
      legs.find(l => (l.idTimeCasa ?? l.timeCasa) === teamBId)?.escudoCasa ??
      legs.find(l => (l.idTimeFora ?? l.timeFora) === teamBId)?.escudoFora ?? null

    return {
      id: [teamAId, teamBId].sort().join('|'),
      timeA: { id: teamAId, nome: ida.timeCasa, escudo: escudoA },
      timeB: { id: teamBId, nome: ida.timeFora, escudo: escudoB },
      golsA, golsB, vencedorId, status,
      jogado: anyPlayed,
      isSimulado: legs.some(l => l.isSimulado === true),
    }
  })
}
