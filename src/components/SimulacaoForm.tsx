'use client'

import { useState, useMemo } from 'react'
import type { Jogo } from '@/types/jogo'
import { deriveConfrontos, BRACKET_ROUNDS } from '@/lib/bracket'
import { Escudo } from './Escudo'

// ─── Types ───────────────────────────────────────────────────────────────────

type SimTime = { id: string; nome: string; escudo: string | null }

type SimSlot = {
  timeA: SimTime | null
  timeB: SimTime | null
  golsA: string
  golsB: string
  penaltisVencedor: 'A' | 'B' | null
}

type GolSlot = { golsA: string; golsB: string; penaltisVencedor: 'A' | 'B' | null }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptySimSlot(): SimSlot {
  return { timeA: null, timeB: null, golsA: '', golsB: '', penaltisVencedor: null }
}

function emptyGolSlot(): GolSlot {
  return { golsA: '', golsB: '', penaltisVencedor: null }
}

function resolveWinner(slot: SimSlot): SimTime | null {
  if (!slot.timeA || !slot.timeB || slot.golsA === '' || slot.golsB === '') return null
  const a = parseInt(slot.golsA, 10)
  const b = parseInt(slot.golsB, 10)
  if (isNaN(a) || isNaN(b)) return null
  if (a > b) return slot.timeA
  if (b > a) return slot.timeB
  if (slot.penaltisVencedor === 'A') return slot.timeA
  if (slot.penaltisVencedor === 'B') return slot.timeB
  return null
}

function isTied(slot: SimSlot): boolean {
  if (!slot.timeA || !slot.timeB || slot.golsA === '' || slot.golsB === '') return false
  const a = parseInt(slot.golsA, 10)
  const b = parseInt(slot.golsB, 10)
  return !isNaN(a) && !isNaN(b) && a === b
}

const FASE_LABEL: Record<number, string> = Object.fromEntries(
  BRACKET_ROUNDS.map(r => [r.round, r.label])
)

const SIM_DATE_IDA = '2026-08-20T21:00:00.000Z'
const SIM_DATE_VOLTA = '2026-08-27T21:00:00.000Z'

function slotToJogos(slot: SimSlot, round: number, slotIdx: number): Jogo[] {
  if (!slot.timeA || !slot.timeB) return []
  const fase = FASE_LABEL[round] ?? ''
  const golsA = Math.max(0, parseInt(slot.golsA, 10) || 0)
  const golsB = Math.max(0, parseInt(slot.golsB, 10) || 0)
  const base = -(round * 100 + slotIdx * 2)
  const common = {
    idExterno: null, disputado: true, fase,
    createdAt: SIM_DATE_IDA, round, status: 'FT' as const,
    estadio: null, isSimulado: true as const,
  }
  return [
    {
      ...common,
      id: base - 1,
      timeCasa: slot.timeA.nome, timeFora: slot.timeB.nome,
      golsCasa: 0, golsFora: 0, dataJogo: SIM_DATE_IDA,
      idTimeCasa: slot.timeA.id, idTimeFora: slot.timeB.id,
      escudoCasa: slot.timeA.escudo, escudoFora: slot.timeB.escudo,
    },
    {
      ...common,
      id: base - 2,
      timeCasa: slot.timeB.nome, timeFora: slot.timeA.nome,
      golsCasa: golsB, golsFora: golsA, dataJogo: SIM_DATE_VOLTA,
      idTimeCasa: slot.timeB.id, idTimeFora: slot.timeA.id,
      escudoCasa: slot.timeB.escudo, escudoFora: slot.timeA.escudo,
    },
  ]
}

function deriveClassifiers(jogosReais: Jogo[]): SimTime[] {
  const seen = new Set<string>()
  return deriveConfrontos(jogosReais, 16)
    .filter(c => c.vencedorId !== null)
    .map(c => (c.vencedorId === c.timeA.id ? c.timeA : c.timeB))
    .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
}

function computePhases(q: SimSlot[], sg: GolSlot[], fg: GolSlot) {
  const qw = q.map(resolveWinner)
  const ss: SimSlot[] = [
    { timeA: qw[0] ?? null, timeB: qw[1] ?? null, ...sg[0] },
    { timeA: qw[2] ?? null, timeB: qw[3] ?? null, ...sg[1] },
  ]
  const sw = ss.map(resolveWinner)
  return {
    semiSlots: ss,
    finalSlot: { timeA: sw[0] ?? null, timeB: sw[1] ?? null, ...fg } as SimSlot,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SimulacaoForm({
  jogosReais,
  onSimulacaoChange,
}: {
  jogosReais: Jogo[]
  onSimulacaoChange: (jogos: Jogo[]) => void
}) {
  const classifiers = useMemo(() => deriveClassifiers(jogosReais), [jogosReais])

  const [quartas, setQuartas] = useState<SimSlot[]>(() => Array.from({ length: 4 }, emptySimSlot))
  const [semiGols, setSemiGols] = useState<GolSlot[]>(() => Array.from({ length: 2 }, emptyGolSlot))
  const [finalGols, setFinalGols] = useState<GolSlot>(emptyGolSlot)

  const { semiSlots, finalSlot } = computePhases(quartas, semiGols, finalGols)
  const champion = resolveWinner(finalSlot)

  function propagate(q: SimSlot[], sg: GolSlot[], fg: GolSlot) {
    const { semiSlots: ss, finalSlot: fs } = computePhases(q, sg, fg)
    onSimulacaoChange([
      ...q.flatMap((s, i) => slotToJogos(s, 8, i)),
      ...ss.flatMap((s, i) => slotToJogos(s, 4, i)),
      ...slotToJogos(fs, 2, 0),
    ])
  }

  function updateQuarta(idx: number, update: Partial<SimSlot>) {
    const nextQ = quartas.map((s, i) => i === idx ? { ...s, ...update } : s)
    const newSG = Array.from({ length: 2 }, emptyGolSlot)
    const newFG = emptyGolSlot()
    setQuartas(nextQ)
    setSemiGols(newSG)
    setFinalGols(newFG)
    propagate(nextQ, newSG, newFG)
  }

  function updateSemi(idx: number, update: Partial<GolSlot>) {
    const nextSG = semiGols.map((s, i) => i === idx ? { ...s, ...update } : s)
    const newFG = emptyGolSlot()
    setSemiGols(nextSG)
    setFinalGols(newFG)
    propagate(quartas, nextSG, newFG)
  }

  function updateFinal(update: Partial<GolSlot>) {
    const nextFG = { ...finalGols, ...update }
    setFinalGols(nextFG)
    propagate(quartas, semiGols, nextFG)
  }

  function sortear() {
    if (classifiers.length < 8) return
    const shuffled = [...classifiers].sort(() => Math.random() - 0.5)
    const nextQ: SimSlot[] = Array.from({ length: 4 }, (_, i) => ({
      timeA: shuffled[i * 2] ?? null,
      timeB: shuffled[i * 2 + 1] ?? null,
      golsA: '', golsB: '', penaltisVencedor: null,
    }))
    const newSG = Array.from({ length: 2 }, emptyGolSlot)
    const newFG = emptyGolSlot()
    setQuartas(nextQ)
    setSemiGols(newSG)
    setFinalGols(newFG)
    propagate(nextQ, newSG, newFG)
  }

  function resetar() {
    const nextQ = Array.from({ length: 4 }, emptySimSlot)
    const newSG = Array.from({ length: 2 }, emptyGolSlot)
    const newFG = emptyGolSlot()
    setQuartas(nextQ)
    setSemiGols(newSG)
    setFinalGols(newFG)
    propagate(nextQ, newSG, newFG)
  }

  const assignedIds = useMemo(() => {
    const s = new Set<string>()
    quartas.forEach(q => {
      if (q.timeA) s.add(q.timeA.id)
      if (q.timeB) s.add(q.timeB.id)
    })
    return s
  }, [quartas])

  function getAvailable(currentId: string | null): SimTime[] {
    return classifiers.filter(t => !assignedIds.has(t.id) || t.id === currentId)
  }

  const allQuartasDone = quartas.every(s => resolveWinner(s) !== null)
  const allSemiDone = semiSlots.every(s => resolveWinner(s) !== null)

  const inputCls = 'w-14 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-40'
  const selectCls = 'flex-1 min-w-0 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-500'

  if (classifiers.length < 8) {
    return (
      <div className="text-center py-16 text-gray-600 text-sm">
        {classifiers.length === 0
          ? 'Os classificados ainda não foram determinados. Aguarde o fim das oitavas.'
          : `${classifiers.length} de 8 classificados determinados. Aguarde o fim das oitavas.`}
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-400">Simulação local — F5 descarta os resultados.</p>
        <button type="button" onClick={resetar}
          className="text-xs text-red-500 hover:text-red-400 underline focus:outline-none focus:ring-1 focus:ring-red-500 rounded"
        >
          Resetar simulação
        </button>
      </div>

      {/* Quartas */}
      <section aria-labelledby="sim-quartas">
        <div className="flex items-center justify-between mb-3">
          <h2 id="sim-quartas" className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Quartas de Final
          </h2>
          <button type="button" onClick={sortear}
            className="text-xs px-3 py-1 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            Sortear confrontos
          </button>
        </div>
        <div className="space-y-3">
          {quartas.map((slot, idx) => (
            <SlotRowQuartas
              key={idx}
              slot={slot}
              availableA={getAvailable(slot.timeA?.id ?? null)}
              availableB={getAvailable(slot.timeB?.id ?? null)}
              onChangeA={t => updateQuarta(idx, { timeA: t, golsA: '', golsB: '', penaltisVencedor: null })}
              onChangeB={t => updateQuarta(idx, { timeB: t, golsA: '', golsB: '', penaltisVencedor: null })}
              onGolsA={v => updateQuarta(idx, { golsA: v, penaltisVencedor: null })}
              onGolsB={v => updateQuarta(idx, { golsB: v, penaltisVencedor: null })}
              onPenaltis={v => updateQuarta(idx, { penaltisVencedor: v })}
              inputCls={inputCls}
              selectCls={selectCls}
            />
          ))}
        </div>
      </section>

      {/* Semi */}
      {allQuartasDone && (
        <section aria-labelledby="sim-semi">
          <h2 id="sim-semi" className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Semifinal
          </h2>
          <div className="space-y-3">
            {semiSlots.map((slot, idx) => (
              <SlotRowFixed
                key={idx}
                slot={slot}
                onGolsA={v => updateSemi(idx, { golsA: v, penaltisVencedor: null })}
                onGolsB={v => updateSemi(idx, { golsB: v, penaltisVencedor: null })}
                onPenaltis={v => updateSemi(idx, { penaltisVencedor: v })}
                inputCls={inputCls}
              />
            ))}
          </div>
        </section>
      )}

      {/* Final */}
      {allSemiDone && (
        <section aria-labelledby="sim-final">
          <h2 id="sim-final" className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Final
          </h2>
          <SlotRowFixed
            slot={finalSlot}
            onGolsA={v => updateFinal({ golsA: v, penaltisVencedor: null })}
            onGolsB={v => updateFinal({ golsB: v, penaltisVencedor: null })}
            onPenaltis={v => updateFinal({ penaltisVencedor: v })}
            inputCls={inputCls}
          />
          {champion && (
            <div className="mt-6 py-4 text-center border border-amber-700/40 rounded-lg bg-amber-950/20">
              <p className="text-[10px] text-amber-600 uppercase tracking-widest mb-2">Campeão simulado</p>
              <div className="flex items-center justify-center gap-2">
                <Escudo src={champion.escudo} alt={champion.nome} size={32} />
                <span className="text-xl font-bold text-amber-400">{champion.nome}</span>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

// ─── SlotRowQuartas: team selectors + score inputs ────────────────────────────

function SlotRowQuartas({
  slot, availableA, availableB,
  onChangeA, onChangeB, onGolsA, onGolsB, onPenaltis,
  inputCls, selectCls,
}: {
  slot: SimSlot
  availableA: SimTime[]
  availableB: SimTime[]
  onChangeA: (t: SimTime | null) => void
  onChangeB: (t: SimTime | null) => void
  onGolsA: (v: string) => void
  onGolsB: (v: string) => void
  onPenaltis: (v: 'A' | 'B') => void
  inputCls: string
  selectCls: string
}) {
  const winner = resolveWinner(slot)
  const tied = isTied(slot)
  const needsPen = tied && slot.penaltisVencedor === null

  return (
    <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/40 space-y-2">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {slot.timeA
            ? <Escudo src={slot.timeA.escudo} alt={slot.timeA.nome} size={18} />
            : <div className="w-[18px] h-[18px] shrink-0" />}
          <select value={slot.timeA?.id ?? ''} aria-label="Time A"
            onChange={e => onChangeA(availableA.find(t => t.id === e.target.value) ?? null)}
            className={`${selectCls} ${winner?.id === slot.timeA?.id ? 'text-white' : ''}`}
          >
            <option value="">— Time A —</option>
            {availableA.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <input type="number" min="0" max="99" value={slot.golsA}
            onChange={e => onGolsA(e.target.value)}
            disabled={!slot.timeA || !slot.timeB}
            className={inputCls} aria-label={`Gols ${slot.timeA?.nome ?? 'Time A'}`}
          />
          <span className="text-gray-700 text-xs">×</span>
          <input type="number" min="0" max="99" value={slot.golsB}
            onChange={e => onGolsB(e.target.value)}
            disabled={!slot.timeA || !slot.timeB}
            className={inputCls} aria-label={`Gols ${slot.timeB?.nome ?? 'Time B'}`}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <select value={slot.timeB?.id ?? ''} aria-label="Time B"
            onChange={e => onChangeB(availableB.find(t => t.id === e.target.value) ?? null)}
            className={`${selectCls} text-right ${winner?.id === slot.timeB?.id ? 'text-white' : ''}`}
          >
            <option value="">— Time B —</option>
            {availableB.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          {slot.timeB
            ? <Escudo src={slot.timeB.escudo} alt={slot.timeB.nome} size={18} />
            : <div className="w-[18px] h-[18px] shrink-0" />}
        </div>
      </div>

      {needsPen && (
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span>Empate — quem avança nos pênaltis?</span>
          <button type="button" onClick={() => onPenaltis('A')}
            className="px-2 py-0.5 rounded border border-gray-700 hover:border-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
          >{slot.timeA?.nome}</button>
          <button type="button" onClick={() => onPenaltis('B')}
            className="px-2 py-0.5 rounded border border-gray-700 hover:border-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
          >{slot.timeB?.nome}</button>
        </div>
      )}

      {winner && (
        <p className="text-[10px] text-emerald-600 uppercase tracking-widest">
          {winner.nome} avança{tied && slot.penaltisVencedor ? ' (pênaltis)' : ''}
        </p>
      )}
    </div>
  )
}

// ─── SlotRowFixed: teams derived, only scores editable ───────────────────────

function SlotRowFixed({
  slot, onGolsA, onGolsB, onPenaltis, inputCls,
}: {
  slot: SimSlot
  onGolsA: (v: string) => void
  onGolsB: (v: string) => void
  onPenaltis: (v: 'A' | 'B') => void
  inputCls: string
}) {
  const winner = resolveWinner(slot)
  const tied = isTied(slot)
  const needsPen = tied && slot.penaltisVencedor === null
  const wA = winner?.id === slot.timeA?.id
  const wB = winner?.id === slot.timeB?.id

  return (
    <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/40 space-y-2">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${wA ? 'text-white' : 'text-gray-400'}`}>
          <Escudo src={slot.timeA?.escudo ?? null} alt={slot.timeA?.nome ?? ''} size={18} />
          <span className={`text-sm truncate ${wA ? 'font-semibold' : ''}`}>
            {slot.timeA?.nome ?? '—'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <input type="number" min="0" max="99" value={slot.golsA}
            onChange={e => onGolsA(e.target.value)}
            className={inputCls} aria-label={`Gols ${slot.timeA?.nome ?? 'Time A'}`}
          />
          <span className="text-gray-700 text-xs">×</span>
          <input type="number" min="0" max="99" value={slot.golsB}
            onChange={e => onGolsB(e.target.value)}
            className={inputCls} aria-label={`Gols ${slot.timeB?.nome ?? 'Time B'}`}
          />
        </div>

        <div className={`flex items-center gap-1.5 flex-1 min-w-0 justify-end ${wB ? 'text-white' : 'text-gray-400'}`}>
          <span className={`text-sm truncate text-right ${wB ? 'font-semibold' : ''}`}>
            {slot.timeB?.nome ?? '—'}
          </span>
          <Escudo src={slot.timeB?.escudo ?? null} alt={slot.timeB?.nome ?? ''} size={18} />
        </div>
      </div>

      {needsPen && (
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span>Empate — quem avança nos pênaltis?</span>
          <button type="button" onClick={() => onPenaltis('A')}
            className="px-2 py-0.5 rounded border border-gray-700 hover:border-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
          >{slot.timeA?.nome}</button>
          <button type="button" onClick={() => onPenaltis('B')}
            className="px-2 py-0.5 rounded border border-gray-700 hover:border-amber-500 hover:text-amber-400 transition-colors focus:outline-none"
          >{slot.timeB?.nome}</button>
        </div>
      )}

      {winner && (
        <p className="text-[10px] text-emerald-600 uppercase tracking-widest">
          {winner.nome} avança{tied && slot.penaltisVencedor ? ' (pênaltis)' : ''}
        </p>
      )}
    </div>
  )
}
