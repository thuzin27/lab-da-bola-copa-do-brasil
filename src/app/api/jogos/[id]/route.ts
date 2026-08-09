import { NextRequest } from 'next/server'
import { patchSchema } from '@/lib/schemas'
import { updateJogo, deleteJogo, JogoNotFoundError } from '@/lib/jogos'
import { parseId } from '@/lib/utils'
import { badRequest, notFound, serverError } from '@/lib/responses'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
