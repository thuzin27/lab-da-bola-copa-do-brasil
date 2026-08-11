'use client'

import { BRACKET_H, CONN_W } from '@/lib/bracket'

export function BracketConnectors({ fromSlots }: { fromSlots: number }) {
  const slotH = BRACKET_H / fromSlots
  const pairCount = fromSlots / 2
  const midX = CONN_W / 2

  return (
    <svg aria-hidden="true" width={CONN_W} height={BRACKET_H} style={{ flexShrink: 0 }}>
      {Array.from({ length: pairCount }).map((_, i) => {
        const topY = i * 2 * slotH + slotH / 2
        const botY = (i * 2 + 1) * slotH + slotH / 2
        const midY = (i * 2 + 1) * slotH
        return (
          <g key={i}>
            <polyline
              points={`0,${topY} ${midX},${topY} ${midX},${midY} ${CONN_W},${midY}`}
              fill="none" stroke="#374151" strokeWidth="1" strokeLinejoin="round"
            />
            <polyline
              points={`0,${botY} ${midX},${botY} ${midX},${midY}`}
              fill="none" stroke="#374151" strokeWidth="1" strokeLinejoin="round"
            />
          </g>
        )
      })}
    </svg>
  )
}
