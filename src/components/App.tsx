'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Jogo } from '@/types/jogo'
import { JOGOS_MOCK } from '@/types/jogo'
import { COPA_DO_BRASIL } from '@/lib/competicao'
import { BRACKET_ROUND_VALUES } from '@/lib/bracket'
import { BracketDesktop } from './BracketDesktop'
import { BracketMobile } from './BracketMobile'
import { FasesAnteriores } from './FasesAnteriores'
import { SimulacaoForm } from './SimulacaoForm'
import { ProximosJogos } from './ProximosJogos'

// ─── Abas ────────────────────────────────────────────────────────────────────

const ABAS = [
  { id: 'chaveamento',       label: 'Chaveamento' },
  { id: 'fases-anteriores',  label: 'Fases anteriores' },
  { id: 'simulacao',         label: 'Simulação' },
  { id: 'proximos-jogos',    label: 'Próximos jogos' },
] as const

type AbaId = typeof ABAS[number]['id']

function isAbaId(s: string | null): s is AbaId {
  return ABAS.some(a => a.id === s)
}

// ─── Logo da Copa (task 01) ───────────────────────────────────────────────────
// Tenta /public/copa-do-brasil.svg primeiro; cai na URL do TheSportsDB se falhar.
// Nunca colapsa o header mesmo que ambos falhem (graceful degradation via onError).

function CopaDoBrasilLogo() {
  const [src, setSrc] = useState('/copa-do-brasil.svg')
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Copa do Brasil 2026"
      height={40}
      style={{ height: 40, width: 'auto', maxWidth: 160, objectFit: 'contain', minWidth: 24 }}
      onError={() => {
        if (src !== COPA_DO_BRASIL.logo) setSrc(COPA_DO_BRASIL.logo)
        else setHidden(true)
      }}
    />
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function App() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawAba = searchParams.get('aba')
  const abaAtiva: AbaId = isAbaId(rawAba) ? rawAba : 'chaveamento'

  const [jogosReais, setJogosReais] = useState<Jogo[]>([])
  const [jogosSimulados, setJogosSimulados] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [liveScores, setLiveScores] = useState<Record<string, { golsCasa: number | null; golsFora: number | null }>>({})


  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Todos os setState chamados só após o primeiro await — evita set-state-in-effect
  const fetchJogos = useCallback(async () => {
    try {
      const res = await fetch('/api/jogos')
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setJogosReais(await res.json())
      setFetchError(null)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchJogos() }, [fetchJogos])

  useEffect(() => {
    const idx = ABAS.findIndex(a => a.id === abaAtiva)
    tabRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [abaAtiva])

  useEffect(() => {
    if (abaAtiva !== 'chaveamento') return
    const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'PEN'])
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function fetchLive(): Promise<boolean> {
      try {
        const res = await fetch('/api/livescore')
        if (!res.ok) return false
        const data: { idExterno: string; golsCasa: number | null; golsFora: number | null; status: string | null }[] = await res.json()
        setLiveScores(Object.fromEntries(data.map(s => [s.idExterno, { golsCasa: s.golsCasa, golsFora: s.golsFora }])))
        return data.some(s => LIVE_STATUSES.has(s.status ?? ''))
      } catch {
        return false
      }
    }

    void (async () => {
      const hasLive = await fetchLive()
      if (!hasLive) return
      intervalId = setInterval(async () => {
        const stillLive = await fetchLive()
        if (!stillLive && intervalId !== null) {
          clearInterval(intervalId)
          intervalId = null
        }
      }, 60_000)
    })()

    return () => { if (intervalId !== null) clearInterval(intervalId) }
  }, [abaAtiva])

  function reload() {
    setLoading(true)
    setFetchError(null)
    void fetchJogos()
  }

  function setAba(id: AbaId) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('aba', id)
    router.push(`?${params.toString()}`)
  }

  function handleTabKeyDown(e: React.KeyboardEvent, idx: number) {
    let next = idx
    if (e.key === 'ArrowRight')     next = (idx + 1) % ABAS.length
    else if (e.key === 'ArrowLeft') next = (idx - 1 + ABAS.length) % ABAS.length
    else if (e.key === 'Home')      next = 0
    else if (e.key === 'End')       next = ABAS.length - 1
    else return
    e.preventDefault()
    setAba(ABAS[next].id)
    tabRefs.current[next]?.focus()
  }

  const hasBracketData = jogosReais.some(j => BRACKET_ROUND_VALUES.has(j.round ?? -1))
  const jogosParaBracket: Jogo[] = [
    ...(hasBracketData ? jogosReais : JOGOS_MOCK),
    ...jogosSimulados,
  ].map(j => {
    const live = j.idExterno ? liveScores[j.idExterno] : undefined
    if (!live || live.golsCasa === null || live.golsFora === null) return j
    return { ...j, golsCasa: live.golsCasa, golsFora: live.golsFora }
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── Header (task 01) ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/lab-da-bola.svg"
              alt=""
              aria-hidden="true"
              className="h-8"
            />
            <span className="text-lg font-semibold text-gray-100">Lab da Bola</span>
          </div>
          <CopaDoBrasilLogo />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6" lang="pt-BR">

        {/* ── Tablist (task 02) ──────────────────────────────────────────── */}
        {/* Wrapper relativo para o gradient indicador de scroll em mobile */}
        <div className="relative mb-8">
        <div
          role="tablist"
          aria-label="Navegação das seções"
          className="flex border-b border-gray-800 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ABAS.map((aba, idx) => (
            <button
              key={aba.id}
              ref={el => { tabRefs.current[idx] = el }}
              role="tab"
              id={`tab-${aba.id}`}
              aria-selected={abaAtiva === aba.id}
              aria-controls={`panel-${aba.id}`}
              tabIndex={abaAtiva === aba.id ? 0 : -1}
              onClick={() => setAba(aba.id)}
              onKeyDown={e => handleTabKeyDown(e, idx)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
                focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
                abaAtiva === aba.id
                  ? 'border-gray-100 text-gray-100'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
        {/* Gradient fade direito — indica abas fora da área visível em mobile */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-px w-8 bg-gradient-to-l from-gray-950 to-transparent sm:hidden" />
        </div>

        {/* ── Estados de carregamento ────────────────────────────────────── */}
        {loading && (
          <div className="text-center py-16 text-gray-600" role="status" aria-live="polite">
            Carregando jogos…
          </div>
        )}

        {fetchError && !loading && (
          <div role="alert" className="text-sm text-red-400 py-4">
            Erro ao carregar: {fetchError}.{' '}
            <button onClick={reload} className="underline">
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Painel: Chaveamento ──────────────────────────────────── */}
            <div
              role="tabpanel"
              id="panel-chaveamento"
              aria-labelledby="tab-chaveamento"
              hidden={abaAtiva !== 'chaveamento'}
            >
              <section aria-label="Chaveamento mata-mata">
                <div className="hidden md:block overflow-x-auto">
                  <BracketDesktop jogos={jogosParaBracket} />
                </div>
                <div className="md:hidden">
                  <BracketMobile jogos={jogosParaBracket} />
                </div>
              </section>
            </div>

            {/* ── Painel: Fases anteriores (task 03) ──────────────────── */}
            <div
              role="tabpanel"
              id="panel-fases-anteriores"
              aria-labelledby="tab-fases-anteriores"
              hidden={abaAtiva !== 'fases-anteriores'}
            >
              <FasesAnteriores jogos={jogosReais} />
            </div>

            {/* ── Painel: Simulação (task 06) ──────────────────────────── */}
            <div
              role="tabpanel"
              id="panel-simulacao"
              aria-labelledby="tab-simulacao"
              hidden={abaAtiva !== 'simulacao'}
            >
              <SimulacaoForm
                jogosReais={jogosReais}
                onSimulacaoChange={setJogosSimulados}
              />
            </div>

            {/* ── Painel: Próximos jogos (task 05) ─────────────────────── */}
            <div
              role="tabpanel"
              id="panel-proximos-jogos"
              aria-labelledby="tab-proximos-jogos"
              hidden={abaAtiva !== 'proximos-jogos'}
            >
              {abaAtiva === 'proximos-jogos' && <ProximosJogos />}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
