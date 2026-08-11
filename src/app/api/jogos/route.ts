import { NextRequest } from 'next/server'
import { jogoSchema } from '@/lib/schemas'
import { listJogos, createJogo } from '@/lib/jogos'
import { badRequest, unauthorized, serverError } from '@/lib/responses'

export const maxDuration = 10

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const manual = request.headers.get('x-cron-secret')
  if (manual === process.env.CRON_SECRET) return true
  return false
}

export async function GET() {
  try {
    const jogos = await listJogos()
    return Response.json(jogos)
  } catch {
    return serverError('Erro ao buscar jogos')
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized('Não autorizado')
  try {
    const body = await request.json()
    const parsed = jogoSchema.safeParse(body)

    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten())
    }

    const jogo = await createJogo(parsed.data)
    return Response.json(jogo, { status: 201 })
  } catch {
    return serverError('Erro ao criar jogo')
  }
}
