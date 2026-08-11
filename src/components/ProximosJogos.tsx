'use client'

import { useEffect, useState } from 'react'
import { Escudo } from './Escudo'
import type { ProximoJogo } from '@/app/api/proximos/route'

const COMP_LABEL: Record<string, string> = {
  'brasileirao': 'Brasileirão Série A',
  'copa-do-brasil': 'Copa do Brasil',
}

function formatDataJogo(iso: string): { data: string; hora: string } {
  const d = new Date(iso)
  const data = d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })
  const hora = d.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { data, hora }
}

function JogoCard({ jogo }: { jogo: ProximoJogo }) {
  const { data, hora } = formatDataJogo(jogo.dataJogo)
  const comp = COMP_LABEL[jogo.competicao] ?? jogo.competicao

  return (
    <div className="flex items-center gap-3 py-3 px-4 border border-gray-800 rounded-lg bg-gray-900/40 min-w-0">
      <div className="flex flex-col items-center shrink-0 w-16 text-center">
        <span className="text-[10px] text-gray-500 uppercase tracking-wide capitalize">
          {data}
        </span>
        <span className="text-xs font-mono text-gray-300">{hora}</span>
      </div>

      <div className="flex flex-1 items-center gap-2 min-w-0 justify-between">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Escudo src={jogo.escudoCasa} alt={jogo.timeCasa} size={20} />
          <span className="text-sm text-gray-200 truncate">{jogo.timeCasa}</span>
        </div>
        <span className="text-xs text-gray-600 shrink-0 px-1">×</span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="text-sm text-gray-200 truncate text-right">{jogo.timeFora}</span>
          <Escudo src={jogo.escudoFora} alt={jogo.timeFora} size={20} />
        </div>
      </div>

      <span className="text-[10px] text-gray-600 shrink-0 hidden sm:block w-28 text-right">
        {comp}
      </span>
    </div>
  )
}

export function ProximosJogos() {
  const [jogos, setJogos] = useState<ProximoJogo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/proximos')
      .then(r => {
        if (!r.ok) throw new Error(`Erro ${r.status}`)
        return r.json() as Promise<ProximoJogo[]>
      })
      .then(data => { setJogos(data); setLoading(false) })
      .catch(e => { setErro(e instanceof Error ? e.message : 'Erro desconhecido'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-600 text-sm" role="status" aria-live="polite">
        Carregando próximos jogos…
      </div>
    )
  }

  if (erro) {
    return (
      <div role="alert" className="text-sm text-red-400 py-4">
        Erro ao carregar: {erro}
      </div>
    )
  }

  if (jogos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-600 text-sm">
        Nenhum jogo próximo encontrado.
      </div>
    )
  }

  // Separar por competição para exibir em grupos
  const grupos = jogos.reduce<Record<string, ProximoJogo[]>>((acc, j) => {
    const key = j.dataJogo.slice(0, 10)
    if (!acc[key]) acc[key] = []
    acc[key].push(j)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-2xl">
      {Object.entries(grupos).map(([dia, lista]) => {
        const { data } = formatDataJogo(lista[0].dataJogo)
        return (
          <section key={dia} aria-label={`Jogos de ${data}`}>
            <h2 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 capitalize">
              {new Date(dia + 'T12:00:00Z').toLocaleDateString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="space-y-2">
              {lista.map(j => <JogoCard key={j.idExterno} jogo={j} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
