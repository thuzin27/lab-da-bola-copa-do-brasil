import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const jogoSchema = z.object({
  timeCasa: z.string().min(1),
  timeFora: z.string().min(1),
  golsCasa: z.number().int().min(0).optional().default(0),
  golsFora: z.number().int().min(0).optional().default(0),
  fase: z.string().min(1),
  dataJogo: z.string().datetime(),
})

export async function GET() {
  try {
    const jogos = await prisma.jogo.findMany({
      orderBy: { dataJogo: 'desc' },
    })
    return Response.json(jogos)
  } catch {
    return Response.json({ error: 'Erro ao buscar jogos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = jogoSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const jogo = await prisma.jogo.create({
      data: {
        ...parsed.data,
        dataJogo: new Date(parsed.data.dataJogo),
      },
    })

    return Response.json(jogo, { status: 201 })
  } catch {
    return Response.json({ error: 'Erro ao criar jogo' }, { status: 500 })
  }
}
