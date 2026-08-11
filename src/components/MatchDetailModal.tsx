'use client'

import { useEffect, useState } from 'react'
import { Escudo } from './Escudo'
import type { DetalhesResponse, } from '@/app/api/detalhes/route'
import type { StatItem, LineupPlayer } from '@/lib/apiFootball'

type PartidaInfo = {
  timeCasa: string
  timeFora: string
  escudoCasa: string | null
  escudoFora: string | null
  golsCasa?: number
  golsFora?: number
  disputado: boolean
  dataJogo: string
  estadio: string | null
  idApiFootball: string | null
}

const STAT_LABEL: Record<string, string> = {
  'Ball Possession': 'Posse de bola',
  'Total Shots': 'Finalizações',
  'Shots on Goal': 'No alvo',
  'Corner Kicks': 'Escanteios',
  'Fouls': 'Faltas',
  'Yellow Cards': 'Amarelos',
  'Red Cards': 'Vermelhos',
  'Offsides': 'Impedimentos',
}

function sortByGrid(players: LineupPlayer[]): LineupPlayer[] {
  return [...players].sort((a, b) => {
    const [rowA, colA] = (a.grid ?? '9:9').split(':').map(Number)
    const [rowB, colB] = (b.grid ?? '9:9').split(':').map(Number)
    return rowA !== rowB ? rowA - rowB : colA - colB
  })
}

function StatBar({ stat }: { stat: StatItem }) {
  const label = STAT_LABEL[stat.type] ?? stat.type
  const hRaw = String(stat.home ?? '0').replace('%', '')
  const aRaw = String(stat.away ?? '0').replace('%', '')
  const isPct = String(stat.home ?? '').includes('%')
  const h = parseFloat(hRaw) || 0
  const a = parseFloat(aRaw) || 0
  const total = h + a || 1
  const hPct = Math.round((h / total) * 100)
  const aPct = 100 - hPct

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px] text-gray-400">
        <span className="font-mono tabular-nums">{isPct ? `${h}%` : h}</span>
        <span className="text-gray-600 text-[10px] uppercase tracking-widest">{label}</span>
        <span className="font-mono tabular-nums">{isPct ? `${a}%` : a}</span>
      </div>
      <div className="flex h-1.5 rounded overflow-hidden gap-px">
        <div className="bg-blue-500 rounded-l" style={{ width: `${hPct}%` }} />
        <div className="bg-orange-500 rounded-r" style={{ width: `${aPct}%` }} />
      </div>
    </div>
  )
}

function PlayerList({ players, title }: { players: LineupPlayer[]; title: string }) {
  const sorted = sortByGrid(players)
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">{title}</p>
      <div className="space-y-0.5">
        {sorted.map(p => (
          <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="w-4 text-right text-gray-600 tabular-nums shrink-0">{p.number}</span>
            <span className="text-gray-500 text-[10px] uppercase w-4 shrink-0">{p.pos}</span>
            <span className="truncate">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MatchDetailModal({ partida, onClose }: { partida: PartidaInfo; onClose: () => void }) {
  const [data, setData] = useState<DetalhesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [aba, setAba] = useState<'stats' | 'lineup'>('stats')

  useEffect(() => {
    if (!partida.idApiFootball) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`/api/detalhes?id=${partida.idApiFootball}`)
      .then(r => r.ok ? r.json() as Promise<DetalhesResponse> : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [partida.idApiFootball])

  // Fechar com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const dataFormatada = new Date(partida.dataJogo).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const hora = new Date(partida.dataJogo).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
  })

  const hasStats = data?.stats && data.stats.length > 0
  const hasLineup = data?.lineup

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-0 sm:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes: ${partida.timeCasa} × ${partida.timeFora}`}
    >
      <div
        className="w-full sm:max-w-lg bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl max-h-[90dvh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-gray-600 hover:text-gray-300 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>

          <div className="flex items-center justify-between gap-2">
            {/* Casa */}
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <Escudo src={partida.escudoCasa} alt={partida.timeCasa} size={36} />
              <span className="text-xs text-gray-300 text-center truncate w-full">{partida.timeCasa}</span>
            </div>

            {/* Placar ou data */}
            <div className="flex flex-col items-center shrink-0">
              {partida.disputado ? (
                <span className="text-2xl font-bold tabular-nums text-white">
                  {partida.golsCasa} × {partida.golsFora}
                </span>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-gray-400">{dataFormatada}</p>
                  <p className="text-sm font-bold text-gray-200">{hora}</p>
                </div>
              )}
            </div>

            {/* Fora */}
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <Escudo src={partida.escudoFora} alt={partida.timeFora} size={36} />
              <span className="text-xs text-gray-300 text-center truncate w-full">{partida.timeFora}</span>
            </div>
          </div>

          {partida.estadio && (
            <p className="text-center text-[10px] text-gray-600 mt-2">{partida.estadio}</p>
          )}
        </div>

        {/* Abas internas */}
        {(hasStats || hasLineup) && (
          <div className="flex border-b border-gray-800 shrink-0">
            {hasStats && (
              <button
                onClick={() => setAba('stats')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${aba === 'stats' ? 'text-gray-100 border-b-2 border-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Estatísticas
              </button>
            )}
            {hasLineup && (
              <button
                onClick={() => setAba('lineup')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${aba === 'lineup' ? 'text-gray-100 border-b-2 border-gray-100' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Escalação
              </button>
            )}
          </div>
        )}

        {/* Conteúdo */}
        <div className="overflow-y-auto flex-1 px-4 py-4">
          {loading && (
            <p className="text-center text-gray-600 text-sm py-8">Carregando…</p>
          )}

          {!loading && data?.semChave && (
            <p className="text-center text-gray-600 text-xs py-8">
              Configure <code className="text-gray-500">API_FOOTBALL_KEY</code> para ver estatísticas e escalação.
            </p>
          )}

          {!loading && !data?.semChave && !hasStats && !hasLineup && partida.idApiFootball && (
            <p className="text-center text-gray-600 text-xs py-8">
              Estatísticas e escalação ainda não disponíveis para esta partida.
            </p>
          )}

          {!loading && !partida.idApiFootball && (
            <p className="text-center text-gray-600 text-xs py-8">
              Sem dados adicionais para esta partida.
            </p>
          )}

          {/* Stats */}
          {!loading && hasStats && aba === 'stats' && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span className="truncate max-w-[40%]">{partida.timeCasa}</span>
                <span className="truncate max-w-[40%] text-right">{partida.timeFora}</span>
              </div>
              {data!.stats!.map(s => <StatBar key={s.type} stat={s} />)}
              <p className="text-[9px] text-gray-700 text-center pt-2">Dados: API-Football</p>
            </div>
          )}

          {/* Lineup */}
          {!loading && hasLineup && aba === 'lineup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest truncate">
                  {data!.lineup!.casa.teamName}
                  <span className="ml-1 text-gray-600 font-normal">{data!.lineup!.casa.formation}</span>
                </p>
                <p className="text-[10px] text-gray-600">Técnico: {data!.lineup!.casa.coach}</p>
                <PlayerList players={data!.lineup!.casa.startXI} title="Titular" />
                {data!.lineup!.casa.substitutes.length > 0 && (
                  <PlayerList players={data!.lineup!.casa.substitutes} title="Banco" />
                )}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-widest truncate">
                  {data!.lineup!.fora.teamName}
                  <span className="ml-1 text-gray-600 font-normal">{data!.lineup!.fora.formation}</span>
                </p>
                <p className="text-[10px] text-gray-600">Técnico: {data!.lineup!.fora.coach}</p>
                <PlayerList players={data!.lineup!.fora.startXI} title="Titular" />
                {data!.lineup!.fora.substitutes.length > 0 && (
                  <PlayerList players={data!.lineup!.fora.substitutes} title="Banco" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
