import { NextRequest } from 'next/server'
import { syncJogos } from '@/lib/sync'

function isAuthorized(request: NextRequest): boolean {
  // Vercel cron: envia Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  // Trigger manual: header x-cron-secret
  const manual = request.headers.get('x-cron-secret')
  if (manual === process.env.CRON_SECRET) return true
  return false
}

async function runSync() {
  const result = await syncJogos()
  return Response.json({ ok: true, ...result })
}

// Vercel cron jobs disparam GET
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    return await runSync()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return Response.json({ error: msg }, { status: 500 })
  }
}

// Trigger manual via POST
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    return await runSync()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return Response.json({ error: msg }, { status: 500 })
  }
}
