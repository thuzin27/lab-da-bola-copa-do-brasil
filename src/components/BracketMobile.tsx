'use client'

import type { Jogo } from '@/types/jogo'
import { BRACKET_ROUNDS, deriveConfrontos } from '@/lib/bracket'
import { MatchCard } from './MatchCard'
import { EmptySlot } from './EmptySlot'

export function BracketMobile({ jogos }: { jogos: Jogo[] }) {
  return (
    <div className="space-y-8" role="region" aria-label="Chaveamento da Copa do Brasil 2026">
      {BRACKET_ROUNDS.map(({ round, label }) => {
        const confrontos = deriveConfrontos(jogos, round)
        return (
          <section key={round}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              {label}
            </h2>
            {confrontos.length === 0 ? (
              <EmptySlot />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {confrontos.map(c => <MatchCard key={c.id} confronto={c} />)}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
