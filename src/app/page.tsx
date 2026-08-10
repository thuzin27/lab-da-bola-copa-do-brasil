'use client'

import { useEffect, useState } from 'react'
import { Jogo, JOGOS_MOCK } from '@/types/jogo'

// ─── Types ────────────────────────────────────────────────────────────────────

type Time = { id: string; nome: string; escudo: string | null }

type Confronto = {
  id: string
  timeA: Time
  timeB: Time
  golsA: number
  golsB: number
  vencedorId: string | null
  status: 'completo' | 'em_andamento' | 'penaltis'
  jogado: boolean
}

type JogoFormData = {
  timeCasa: string; timeFora: string
  golsCasa: string; golsFora: string
  fase: string; dataJogo: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRACKET_ROUNDS = [
  { round: 16, label: 'Oitavas de Final', slots: 8 },
  { round: 8,  label: 'Quartas de Final', slots: 4 },
  { round: 4,  label: 'Semifinal',        slots: 2 },
  { round: 2,  label: 'Final',            slots: 1 },
] as const

const BRACKET_ROUND_VALUES = new Set([16, 8, 4, 2])

const FASES_SELECT = [
  'Preliminar', 'Primeira Fase', 'Segunda Fase', 'Terceira Fase',
  'Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final',
]

const BRACKET_H  = 640
const COL_W      = 180
const CONN_W     = 36
const LABEL_H    = 28

const emptyForm: JogoFormData = {
  timeCasa: '', timeFora: '', golsCasa: '0', golsFora: '0',
  fase: 'Primeira Fase', dataJogo: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

function deriveConfrontos(jogos: Jogo[], round: number): Confronto[] {
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
      golsA, golsB, vencedorId, status, jogado: anyPlayed,
    }
  })
}

// ─── Bracket UI ───────────────────────────────────────────────────────────────

function Escudo({ src, alt, size = 20 }: { src: string | null; alt: string; size?: number }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-700 shrink-0"
      />
    )
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

function MatchCard({ confronto }: { confronto: Confronto }) {
  const { timeA, timeB, golsA, golsB, vencedorId, status, jogado } = confronto
  const wA = vencedorId === timeA.id
  const wB = vencedorId === timeB.id

  return (
    <article className="w-full border border-gray-700 rounded bg-gray-900 px-2 py-1.5 text-xs">
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

function EmptySlot() {
  return (
    <div className="w-full border border-dashed border-gray-800 rounded px-2 py-3 text-center" aria-label="A definir">
      <span className="text-[11px] text-gray-700">A definir</span>
    </div>
  )
}

function BracketConnectors({ fromSlots }: { fromSlots: number }) {
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

function BracketDesktop({ jogos }: { jogos: Jogo[] }) {
  const byRound = Object.fromEntries(
    BRACKET_ROUNDS.map(({ round, slots }) => {
      const derived = deriveConfrontos(jogos, round)
      const padded: (Confronto | null)[] = Array.from({ length: slots }, (_, i) => derived[i] ?? null)
      return [round, padded]
    })
  )

  return (
    <div className="flex" role="region" aria-label="Chaveamento da Copa do Brasil 2026">
      {BRACKET_ROUNDS.map(({ round, label, slots }, idx) => {
        const slotH = BRACKET_H / slots
        return (
          <div key={round} className="flex" style={{ flexShrink: 0 }}>
            {/* Column */}
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
                    {c ? <MatchCard confronto={c} /> : <EmptySlot />}
                  </div>
                ))}
              </div>
            </div>
            {/* Connector to next column */}
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

function BracketMobile({ jogos }: { jogos: Jogo[] }) {
  return (
    <div className="space-y-8" role="region" aria-label="Chaveamento da Copa do Brasil 2026">
      {BRACKET_ROUNDS.map(({ round, label }) => {
        const confrontos = deriveConfrontos(jogos, round)
        return (
          <section key={round}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{label}</h2>
            {confrontos.length === 0 ? (
              <EmptySlot />
            ) : (
              <div className="space-y-2">
                {confrontos.map(c => <MatchCard key={c.id} confronto={c} />)}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// ─── Fases anteriores ────────────────────────────────────────────────────────

function FasesAnteriores({ jogos }: { jogos: Jogo[] }) {
  const anteriores = jogos.filter(j => !BRACKET_ROUND_VALUES.has(j.round ?? -1))
  if (!anteriores.length) return null

  return (
    <details className="border border-gray-800 rounded-lg">
      <summary className="cursor-pointer px-4 py-3 text-sm text-gray-400 select-none list-none flex items-center gap-2">
        <span className="text-gray-600">▶</span>
        Fases anteriores ({anteriores.length} jogo{anteriores.length !== 1 ? 's' : ''})
      </summary>
      <ul className="px-4 pb-4 pt-2 space-y-1.5 max-h-72 overflow-y-auto" aria-label="Lista de jogos das fases anteriores">
        {anteriores.map(j => (
          <li key={j.id} className="text-xs text-gray-500 flex gap-3 flex-wrap">
            <span className="shrink-0 text-gray-600 tabular-nums">{formatData(j.dataJogo)}</span>
            <span>
              {j.timeCasa}
              {j.disputado ? ` ${j.golsCasa}×${j.golsFora} ` : ' × '}
              {j.timeFora}
            </span>
            <span className="text-gray-700">· {j.fase}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}

// ─── Admin form ───────────────────────────────────────────────────────────────

function AdminForm({ onJogoAdded }: { onJogoAdded: () => void }) {
  const [form, setForm] = useState<JogoFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError(null); setSuccess(false)
    try {
      const res = await fetch('/api/jogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeCasa: form.timeCasa, timeFora: form.timeFora,
          golsCasa: parseInt(form.golsCasa, 10),
          golsFora: parseInt(form.golsFora, 10),
          fase: form.fase,
          dataJogo: new Date(form.dataJogo).toISOString(),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `Erro ${res.status}`)
      }
      setForm(emptyForm); setSuccess(true)
      onJogoAdded()
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const inputCls = 'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500'

  return (
    <section aria-labelledby="admin-title" className="border border-gray-800 rounded-lg p-5">
      <h2 id="admin-title" className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Cadastrar jogo
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3" aria-label="Cadastrar novo jogo">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="timeCasa" className="block text-xs text-gray-500 mb-1">Time da Casa</label>
            <input id="timeCasa" name="timeCasa" value={form.timeCasa} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label htmlFor="timeFora" className="block text-xs text-gray-500 mb-1">Time Visitante</label>
            <input id="timeFora" name="timeFora" value={form.timeFora} onChange={handleChange} required className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="golsCasa" className="block text-xs text-gray-500 mb-1">Gols Casa</label>
            <input id="golsCasa" name="golsCasa" type="number" min="0" value={form.golsCasa} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label htmlFor="golsFora" className="block text-xs text-gray-500 mb-1">Gols Fora</label>
            <input id="golsFora" name="golsFora" type="number" min="0" value={form.golsFora} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label htmlFor="fase" className="block text-xs text-gray-500 mb-1">Fase</label>
            <select id="fase" name="fase" value={form.fase} onChange={handleChange} className={inputCls}>
              {FASES_SELECT.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="dataJogo" className="block text-xs text-gray-500 mb-1">Data e Hora</label>
          <input id="dataJogo" name="dataJogo" type="datetime-local" value={form.dataJogo} onChange={handleChange} required className={inputCls} />
        </div>
        {error   && <p role="alert"  aria-live="assertive" className="text-xs text-red-400">{error}</p>}
        {success && <p role="status" aria-live="polite"    className="text-xs text-green-400">Jogo cadastrado!</p>}
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {submitting ? 'Salvando…' : 'Cadastrar'}
        </button>
      </form>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  async function fetchJogos() {
    try {
      setLoading(true); setFetchError(null)
      const res = await fetch('/api/jogos')
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setJogos(await res.json())
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJogos() }, [])

  const hasBracketData = jogos.some(j => j.round === 16)
  const bracketJogos = hasBracketData ? jogos : JOGOS_MOCK

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lab-da-bola.svg" alt="Lab da Bola" className="h-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://r2.thesportsdb.com/images/media/league/logo/opmpxf1700175452.png"
            alt="Copa do Brasil"
            className="h-10 object-contain"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10" lang="pt-BR">
        {loading && (
          <div className="text-center py-16 text-gray-600" role="status" aria-live="polite">
            Carregando jogos…
          </div>
        )}

        {fetchError && !loading && (
          <div role="alert" className="text-sm text-red-400 py-4">
            Erro ao carregar: {fetchError}.{' '}
            <button onClick={fetchJogos} className="underline">Tentar novamente</button>
          </div>
        )}

        {/* Chaveamento */}
        {!loading && (
          <section aria-label="Chaveamento mata-mata">
            {/* Desktop: 4 colunas */}
            <div className="hidden md:block overflow-x-auto">
              <BracketDesktop jogos={bracketJogos} />
            </div>
            {/* Mobile: fases empilhadas */}
            <div className="md:hidden">
              <BracketMobile jogos={bracketJogos} />
            </div>
          </section>
        )}

        {/* Fases anteriores */}
        {!loading && <FasesAnteriores jogos={jogos} />}

        {/* Admin */}
        <AdminForm onJogoAdded={fetchJogos} />
      </main>
    </div>
  )
}
