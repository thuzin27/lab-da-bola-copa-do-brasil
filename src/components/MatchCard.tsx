'use client'

import type { Confronto } from '@/lib/bracket'
import { Escudo } from './Escudo'

export function MatchCard({ confronto, onClick }: { confronto: Confronto; onClick?: () => void }) {
  const { timeA, timeB, golsA, golsB, vencedorId, status, jogado, isSimulado } = confronto
  const wA = vencedorId === timeA.id
  const wB = vencedorId === timeB.id

  return (
    <article
      onClick={onClick}
      className={`w-full border rounded px-2 py-1.5 text-xs ${onClick ? 'cursor-pointer hover:border-gray-500 transition-colors' : ''} ${
        isSimulado
          ? 'border-amber-700/60 bg-amber-950/30'
          : 'border-gray-700 bg-gray-900'
      }`}
    >
      {isSimulado && (
        <p className="text-[9px] text-amber-500/80 uppercase tracking-widest mb-1 text-center font-medium">
          simulado
        </p>
      )}
      <div className={`flex items-center gap-1.5 mb-1 ${wA ? 'text-white' : 'text-gray-400'}`}>
        <Escudo src={timeA.escudo} alt={timeA.nome} size={18} />
        <span className={`flex-1 truncate ${wA ? 'font-semibold' : ''}`}>{timeA.nome}</span>
        {jogado && <span className="tabular-nums font-bold ml-1 shrink-0">{golsA}</span>}
      </div>
      <div className={`flex items-center gap-1.5 ${wB ? 'text-white' : 'text-gray-400'}`}>
        <Escudo src={timeB.escudo} alt={timeB.nome} size={18} />
        <span className={`flex-1 truncate ${wB ? 'font-semibold' : ''}`}>{timeB.nome}</span>
        {jogado && <span className="tabular-nums font-bold ml-1 shrink-0">{golsB}</span>}
      </div>
      {status === 'penaltis' && (
        <p className="mt-1 text-[10px] text-gray-600 text-center leading-tight">
          pênaltis — vencedor não disponível
        </p>
      )}
      {status === 'em_andamento' && jogado && (
        <p className="mt-1 text-[10px] text-gray-600 text-center">volta pendente</p>
      )}
    </article>
  )
}
