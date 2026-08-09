'use client'

import { useEffect, useState } from 'react'

type Jogo = {
  id: number
  timeCasa: string
  timeFora: string
  golsCasa: number
  golsFora: number
  fase: string
  dataJogo: string
  createdAt: string
}

type FormData = {
  timeCasa: string
  timeFora: string
  golsCasa: string
  golsFora: string
  fase: string
  dataJogo: string
}

const FASES = [
  'Primeira Fase',
  'Segunda Fase',
  'Terceira Fase',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinal',
  'Final',
]

const emptyForm: FormData = {
  timeCasa: '',
  timeFora: '',
  golsCasa: '0',
  golsFora: '0',
  fase: 'Primeira Fase',
  dataJogo: '',
}

export default function Home() {
  const [jogos, setJogos] = useState<Jogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
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
      const data = await res.json()
      setJogos(data)
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

  function formatData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const faseColors: Record<string, string> = {
    'Final': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Semifinal': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Quartas de Final': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Oitavas de Final': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-green-700 dark:bg-green-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lab da Bota</h1>
            <p className="text-green-200 text-sm mt-0.5">Copa do Brasil — Painel de Jogos</p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="p-2 rounded-full bg-green-600 dark:bg-green-800 hover:bg-green-500 dark:hover:bg-green-700 transition-colors"
            aria-label="Alternar tema"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-4">Jogos</h2>

          {loading && (
            <div className="text-center py-12 text-gray-400">
              <div className="inline-block animate-spin text-3xl mb-2">⚽</div>
              <p>Carregando jogos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              Erro ao carregar: {error} —{' '}
              <button onClick={fetchJogos} className="underline font-medium">tentar novamente</button>
            </div>
          )}

          {!loading && !error && jogos.length === 0 && (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p className="text-lg">Nenhum jogo cadastrado ainda.</p>
              <p className="text-sm mt-1">Use o formulário abaixo para adicionar o primeiro.</p>
            </div>
          )}

          {!loading && !error && jogos.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {jogos.map((jogo) => (
                <div
                  key={jogo.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${faseColors[jogo.fase] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {jogo.fase}
                    </span>
                    <span className="text-xs text-gray-400">{formatData(jogo.dataJogo)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-lg text-right flex-1">{jogo.timeCasa}</span>
                    <div className="text-center">
                      <span className="text-2xl font-bold tabular-nums">
                        {jogo.golsCasa} × {jogo.golsFora}
                      </span>
                    </div>
                    <span className="font-semibold text-lg text-left flex-1">{jogo.timeFora}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-5">Cadastrar novo jogo</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Time da Casa</label>
                <input
                  name="timeCasa"
                  value={form.timeCasa}
                  onChange={handleChange}
                  required
                  placeholder="ex: Flamengo"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time Visitante</label>
                <input
                  name="timeFora"
                  value={form.timeFora}
                  onChange={handleChange}
                  required
                  placeholder="ex: Palmeiras"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gols Casa</label>
                <input
                  name="golsCasa"
                  type="number"
                  min="0"
                  value={form.golsCasa}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gols Visitante</label>
                <input
                  name="golsFora"
                  type="number"
                  min="0"
                  value={form.golsFora}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fase</label>
                <select
                  name="fase"
                  value={form.fase}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {FASES.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data e Hora</label>
              <input
                name="dataJogo"
                type="datetime-local"
                value={form.dataJogo}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">Jogo cadastrado com sucesso!</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {submitting ? 'Salvando...' : 'Cadastrar Jogo'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
