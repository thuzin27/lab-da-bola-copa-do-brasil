'use client'

import { useEffect, useState } from 'react'

type Jogo = {
  id: number
  idExterno: string | null
  timeCasa: string
  timeFora: string
  golsCasa: number
  golsFora: number
  disputado: boolean
  fase: string
  dataJogo: string
  createdAt: string
}

type JogoFormData = {
  timeCasa: string
  timeFora: string
  golsCasa: string
  golsFora: string
  fase: string
  dataJogo: string
}

const FASES_ORDEM = [
  'Final',
  'Semifinal',
  'Quartas de Final',
  'Oitavas de Final',
  'Terceira Fase',
  'Segunda Fase',
  'Primeira Fase',
  'Preliminar',
]

const FASES_SELECT = [
  'Preliminar',
  'Primeira Fase',
  'Segunda Fase',
  'Terceira Fase',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinal',
  'Final',
]

const emptyForm: JogoFormData = {
  timeCasa: '',
  timeFora: '',
  golsCasa: '0',
  golsFora: '0',
  fase: 'Primeira Fase',
  dataJogo: '',
}

const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
const cardCls = 'bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800'

const FASE_COLORS: Record<string, string> = {
  'Final': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Semifinal': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Quartas de Final': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Oitavas de Final': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Terceira Fase': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Segunda Fase': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Primeira Fase': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'Preliminar': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function groupByFase(jogos: Jogo[]): Record<string, Jogo[]> {
  const map: Record<string, Jogo[]> = {}
  for (const j of jogos) {
    if (!map[j.fase]) map[j.fase] = []
    map[j.fase].push(j)
  }
  return map
}

function detectFaseAtual(jogos: Jogo[]): string | null {
  for (const fase of FASES_ORDEM) {
    const dafase = jogos.filter((j) => j.fase === fase)
    if (dafase.length > 0 && dafase.some((j) => j.disputado)) return fase
  }
  return null
}

export default function Home() {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [form, setForm] = useState<JogoFormData>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  async function fetchJogos() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/jogos')
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setJogos(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJogos() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    setFormSuccess(false)
    try {
      const res = await fetch('/api/jogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeCasa: form.timeCasa,
          timeFora: form.timeFora,
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
      setForm(emptyForm)
      setFormSuccess(true)
      await fetchJogos()
      setTimeout(() => setFormSuccess(false), 3000)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const grouped = groupByFase(jogos)
  const faseAtual = detectFaseAtual(jogos)
  const fasesComJogos = FASES_ORDEM.filter((f) => grouped[f]?.length)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-green-700 dark:bg-green-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lab da Bota</h1>
            <p className="text-green-200 text-sm mt-0.5">Copa do Brasil 2026 — Painel de Jogos</p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-full bg-green-600 dark:bg-green-800 hover:bg-green-500 dark:hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
            aria-label="Alternar tema"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10" lang="pt-BR">
        {loading && (
          <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">
            <div className="inline-block animate-spin text-3xl mb-2">⚽</div>
            <p>Carregando jogos...</p>
          </div>
        )}

        {error && (
          <div role="alert" aria-live="assertive" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300 break-words">
            Erro ao carregar: {error} —{' '}
            <button type="button" onClick={fetchJogos} className="underline font-medium">tentar novamente</button>
          </div>
        )}

        {!loading && !error && jogos.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <p className="text-lg">Nenhum jogo cadastrado ainda.</p>
            <p className="text-sm mt-1">Use o formulário abaixo ou aguarde o sync automático.</p>
          </div>
        )}

        {!loading && !error && fasesComJogos.map((fase) => {
          const jogosNafase = grouped[fase]
          const ehAtual = fase === faseAtual
          const disputados = jogosNafase.filter((j) => j.disputado)
          const futuros = jogosNafase.filter((j) => !j.disputado)

          return (
            <section key={fase} aria-label={fase}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">{fase}</h2>
                {ehAtual && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-600 text-white animate-pulse">
                    Fase atual
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FASE_COLORS[fase] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {jogosNafase.length} jogo{jogosNafase.length !== 1 ? 's' : ''}
                </span>
              </div>

              {disputados.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Disputados</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {disputados.map((jogo) => (
                      <div key={jogo.id} className={`${cardCls} p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{formatData(jogo.dataJogo)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base min-w-0 truncate flex-1 text-right">{jogo.timeCasa}</span>
                          <span className="text-xl font-bold tabular-nums shrink-0 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                            {jogo.golsCasa} × {jogo.golsFora}
                          </span>
                          <span className="font-semibold text-base min-w-0 truncate flex-1 text-left">{jogo.timeFora}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {futuros.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Aguardando</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {futuros.map((jogo) => (
                      <div key={jogo.id} className={`${cardCls} p-4 opacity-70 border-dashed`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{formatData(jogo.dataJogo)}</span>
                          <span className="text-xs text-gray-400 italic">a disputar</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base min-w-0 truncate flex-1 text-right">{jogo.timeCasa}</span>
                          <span className="text-sm font-medium shrink-0 text-gray-400 px-3">vs</span>
                          <span className="font-semibold text-base min-w-0 truncate flex-1 text-left">{jogo.timeFora}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )
        })}

        {/* Formulário */}
        <section aria-labelledby="form-title" className={`${cardCls} p-6`}>
          <h2 id="form-title" className="text-xl font-semibold mb-5">Cadastrar novo jogo</h2>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Cadastrar novo jogo">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeCasa" className="block text-sm font-medium mb-1">Time da Casa</label>
                <input id="timeCasa" name="timeCasa" value={form.timeCasa} onChange={handleChange} required placeholder="ex: Flamengo" className={inputCls} />
              </div>
              <div>
                <label htmlFor="timeFora" className="block text-sm font-medium mb-1">Time Visitante</label>
                <input id="timeFora" name="timeFora" value={form.timeFora} onChange={handleChange} required placeholder="ex: Palmeiras" className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="golsCasa" className="block text-sm font-medium mb-1">Gols Casa</label>
                <input id="golsCasa" name="golsCasa" type="number" min="0" value={form.golsCasa} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label htmlFor="golsFora" className="block text-sm font-medium mb-1">Gols Visitante</label>
                <input id="golsFora" name="golsFora" type="number" min="0" value={form.golsFora} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label htmlFor="fase" className="block text-sm font-medium mb-1">Fase</label>
                <select id="fase" name="fase" value={form.fase} onChange={handleChange} className={inputCls}>
                  {FASES_SELECT.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="dataJogo" className="block text-sm font-medium mb-1">Data e Hora</label>
              <input id="dataJogo" name="dataJogo" type="datetime-local" value={form.dataJogo} onChange={handleChange} required className={inputCls} />
            </div>
            {formError && <p role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
            {formSuccess && <p role="status" aria-live="polite" className="text-sm text-green-600 dark:text-green-400">Jogo cadastrado com sucesso!</p>}
            <button type="submit" disabled={submitting} className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              {submitting ? 'Salvando...' : 'Cadastrar Jogo'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
