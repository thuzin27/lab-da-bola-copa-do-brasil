const FASE_MAP: Record<number, string> = {
  1256: 'Preliminar',
  128: 'Primeira Fase',
  64: 'Segunda Fase',
  32: 'Terceira Fase',
  16: 'Oitavas de Final',
  8: 'Quartas de Final',
  4: 'Semifinal',
  2: 'Final',
}

export function mapFase(round: number): string {
  return FASE_MAP[round] ?? `Fase ${round}`
}

export const FASE_ORDER = [2, 4, 8, 16, 32, 64, 128, 1256]
