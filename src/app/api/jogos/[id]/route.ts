import { NextRequest } from 'next/server'
import { patchSchema } from '@/lib/schemas'
import { updateJogo, deleteJogo, JogoNotFoundError } from '@/lib/jogos'
import { parseId } from '@/lib/utils'
import { badRequest, unauthorized, notFound, serverError } from '@/lib/responses'

export const maxDuration = 10

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const manual = request.headers.get('x-cron-secret')
  if (manual === process.env.CRON_SECRET) return true
  return false
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) return unauthorized('Não autorizado')
  try {
    const { id } = await params
    const numId = parseId(id)
    if (numId === null) return badRequest('ID inválido')

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten())
    }

    const jogo = await updateJogo(numId, parsed.data)
    return Response.json(jogo)
  } catch (err) {
    if (err instanceof JogoNotFoundError) return notFound('Jogo não encontrado')
    return serverError('Erro ao atualizar jogo')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) return unauthorized('Não autorizado')
  try {
    const { id } = await params
    const numId = parseId(id)
    if (numId === null) return badRequest('ID inválido')

    await deleteJogo(numId)
    return new Response(null, { status: 204 })
  } catch (err) {
    if (err instanceof JogoNotFoundError) return notFound('Jogo não encontrado')
    return serverError('Erro ao deletar jogo')
  }
}
