import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  golsCasa: z.number().int().min(0).optional(),
  golsFora: z.number().int().min(0).optional(),
  fase: z.string().min(1).optional(),
  dataJogo: z.string().datetime().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
      return Response.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.jogo.findUnique({ where: { id: numId } })
    if (!existing) {
      return Response.json({ error: 'Jogo não encontrado' }, { status: 404 })
    }

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.dataJogo) {
      data.dataJogo = new Date(parsed.data.dataJogo)
    }

    const jogo = await prisma.jogo.update({
      where: { id: numId },
      data,
    })

    return Response.json(jogo)
  } catch {
    return Response.json({ error: 'Erro ao atualizar jogo' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numId = parseInt(id, 10)

    if (isNaN(numId)) {
      return Response.json({ error: 'ID inválido' }, { status: 400 })
    }

    const existing = await prisma.jogo.findUnique({ where: { id: numId } })
    if (!existing) {
      return Response.json({ error: 'Jogo não encontrado' }, { status: 404 })
    }

    await prisma.jogo.delete({ where: { id: numId } })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Erro ao deletar jogo' }, { status: 500 })
  }
}
