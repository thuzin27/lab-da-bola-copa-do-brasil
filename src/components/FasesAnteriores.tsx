'use client'

import type { Jogo } from '@/types/jogo'
import { BRACKET_ROUND_VALUES } from '@/lib/bracket'
import { mapFase } from '@/lib/mapFase'
import { Escudo } from './Escudo'

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function JogoCard({ jogo }: { jogo: Jogo }) {
  return (
    <article className="border border-gray-800 rounded bg-gray-900 px-3 py-2 text-xs">
      <div className="flex items-center gap-2 mb-1.5">
        <Escudo src={jogo.escudoCasa} alt={jogo.timeCasa} size={16} />
        <span className="flex-1 truncate text-gray-300">{jogo.timeCasa}</span>
        {jogo.disputado && (
          <span className="tabular-nums font-bold text-white shrink-0">{jogo.golsCasa}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Escudo src={jogo.escudoFora} alt={jogo.timeFora} size={16} />
        <span className="flex-1 truncate text-gray-300">{jogo.timeFora}</span>
        {jogo.disputado && (
          <span className="tabular-nums font-bold text-white shrink-0">{jogo.golsFora}</span>
        )}
      </div>
      <p className="mt-1.5 text-[10px] text-gray-700">
        {formatData(jogo.dataJogo)}
      </p>
    </article>
  )
}

// Ordem: fase mais recente primeiro (Terceira → Segunda → Primeira → Preliminar)
const FASE_ANTERIORES_ORDER = [32, 64, 128, 1256]

export function FasesAnteriores({ jogos }: { jogos: Jogo[] }) {
  const anteriores = jogos.filter(j => !BRACKET_ROUND_VALUES.has(j.round ?? -1))

  const byRound = new Map<number, Jogo[]>()
  for (const jogo of anteriores) {
    const r = jogo.round ?? 0
    if (!byRound.has(r)) byRound.set(r, [])
    byRound.get(r)!.push(jogo)
  }

  const rounds = [
    ...FASE_ANTERIORES_ORDER.filter(r => byRound.has(r)),
    ...[...byRound.keys()].filter(r => !FASE_ANTERIORES_ORDER.includes(r)).sort(),
  ]

  if (!anteriores.length) {
    return (
      <p className="text-sm text-gray-600 py-8 text-center">
        Nenhum jogo de fase anterior encontrado.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-gray-600">
        {anteriores.length} jogo{anteriores.length !== 1 ? 's' : ''} em{' '}
        {rounds.length} fase{rounds.length !== 1 ? 's' : ''}
      </p>
      {rounds.map(round => (
        <section key={round} aria-labelledby={`fase-label-${round}`}>
          <h2
            id={`fase-label-${round}`}
            className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3"
          >
            {mapFase(round)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {byRound.get(round)!.map(j => (
              <JogoCard key={j.id} jogo={j} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
