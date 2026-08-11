'use client'

import { useState } from 'react'
import type { Jogo } from '@/types/jogo'

const ROUND_MAP: Record<string, number> = {
  'Oitavas de Final': 16,
  'Quartas de Final': 8,
  'Semifinal': 4,
  'Final': 2,
}

const BRACKET_FASES = Object.keys(ROUND_MAP)

type FormData = {
  timeCasa: string
  timeFora: string
  golsCasa: string
  golsFora: string
  fase: string
}

const emptyForm: FormData = {
  timeCasa: '', timeFora: '', golsCasa: '0', golsFora: '0',
  fase: 'Quartas de Final',
}

let nextSimId = -1

export function SimulacaoForm({
  jogosSimulados,
  onSimular,
  onResetar,
}: {
  jogosSimulados: Jogo[]
  onSimular: (jogo: Jogo) => void
  onResetar: () => void
}) {
  const [form, setForm] = useState<FormData>(emptyForm)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = nextSimId--
    const now = new Date().toISOString()
    const jogo: Jogo = {
      id,
      idExterno: null,
      timeCasa: form.timeCasa.trim(),
      timeFora: form.timeFora.trim(),
      golsCasa: parseInt(form.golsCasa, 10),
      golsFora: parseInt(form.golsFora, 10),
      disputado: true,
      fase: form.fase,
      dataJogo: now,
      createdAt: now,
      idTimeCasa: null,
      idTimeFora: null,
      escudoCasa: null,
      escudoFora: null,
      round: ROUND_MAP[form.fase],
      status: 'FT',
      estadio: null,
      isSimulado: true,
    }
    onSimular(jogo)
    setForm(emptyForm)
  }

  const inputCls =
    'w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500'

  return (
    <div className="space-y-6">
      <section aria-labelledby="sim-title" className="border border-gray-800 rounded-lg p-5">
        <h2
          id="sim-title"
          className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4"
        >
          Simular resultado
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3" aria-label="Simular resultado de jogo">
          <div>
            <label htmlFor="fase" className="block text-xs text-gray-500 mb-1">Fase</label>
            <select id="fase" name="fase" value={form.fase} onChange={handleChange} className={inputCls}>
              {BRACKET_FASES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="timeCasa" className="block text-xs text-gray-500 mb-1">Time A</label>
              <input
                id="timeCasa" name="timeCasa" value={form.timeCasa}
                onChange={handleChange} required className={inputCls}
                placeholder="Nome do time"
              />
            </div>
            <div>
              <label htmlFor="timeFora" className="block text-xs text-gray-500 mb-1">Time B</label>
              <input
                id="timeFora" name="timeFora" value={form.timeFora}
                onChange={handleChange} required className={inputCls}
                placeholder="Nome do time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="golsCasa" className="block text-xs text-gray-500 mb-1">Gols A</label>
              <input
                id="golsCasa" name="golsCasa" type="number" min="0"
                value={form.golsCasa} onChange={handleChange} className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="golsFora" className="block text-xs text-gray-500 mb-1">Gols B</label>
              <input
                id="golsFora" name="golsFora" type="number" min="0"
                value={form.golsFora} onChange={handleChange} className={inputCls}
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Simular
          </button>
        </form>
      </section>

      {jogosSimulados.length > 0 && (
        <section
          aria-labelledby="sim-lista"
          className="border border-amber-900/40 rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              id="sim-lista"
              className="text-xs font-semibold text-amber-600 uppercase tracking-widest"
            >
              {jogosSimulados.length} resultado{jogosSimulados.length !== 1 ? 's' : ''} simulado{jogosSimulados.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={onResetar}
              className="text-xs text-red-500 hover:text-red-400 underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
            >
              Resetar simulação
            </button>
          </div>
          <ul className="space-y-1.5">
            {jogosSimulados.map(j => (
              <li key={j.id} className="text-xs flex gap-2 flex-wrap">
                <span className="font-semibold text-amber-600">{j.fase}</span>
                <span className="text-gray-400">
                  {j.timeCasa} {j.golsCasa}×{j.golsFora} {j.timeFora}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-gray-700">
        A simulação é local — recarregar a página descarta os resultados.
      </p>
    </div>
  )
}
