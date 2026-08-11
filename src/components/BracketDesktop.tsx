'use client'

import type { Jogo } from '@/types/jogo'
import { BRACKET_ROUNDS, BRACKET_H, COL_W, CONN_W, LABEL_H, deriveConfrontos, type Confronto } from '@/lib/bracket'
import { MatchCard } from './MatchCard'
import { EmptySlot } from './EmptySlot'
import { BracketConnectors } from './BracketConnectors'

export function BracketDesktop({ jogos, onCardClick }: { jogos: Jogo[]; onCardClick?: (c: Confronto) => void }) {
  const byRound = Object.fromEntries(
    BRACKET_ROUNDS.map(({ round, slots }) => {
      const derived = deriveConfrontos(jogos, round)
      const padded: (Confronto | null)[] = Array.from(
        { length: slots },
        (_, i) => derived[i] ?? null
      )
      return [round, padded]
    })
  )

  return (
    <div className="flex" role="region" aria-label="Chaveamento da Copa do Brasil 2026">
      {BRACKET_ROUNDS.map(({ round, label, slots }, idx) => {
        const slotH = BRACKET_H / slots
        return (
          <div key={round} className="flex" style={{ flexShrink: 0 }}>
            <div style={{ width: COL_W }}>
              <p
                style={{ height: LABEL_H }}
                className="flex items-center justify-center text-[11px] text-gray-500 uppercase tracking-widest"
              >
                {label}
              </p>
              <div style={{ height: BRACKET_H, position: 'relative' }}>
                {byRound[round].map((c, i) => (
                  <div
                    key={i}
                    style={{ position: 'absolute', top: i * slotH, height: slotH, left: 4, right: 4 }}
                    className="flex items-center"
                  >
                    {c ? <MatchCard confronto={c} onClick={onCardClick ? () => onCardClick(c) : undefined} /> : <EmptySlot />}
                  </div>
                ))}
              </div>
            </div>
            {idx < BRACKET_ROUNDS.length - 1 && (
              <div style={{ width: CONN_W, flexShrink: 0 }}>
                <div style={{ height: LABEL_H }} />
                <BracketConnectors fromSlots={slots} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
