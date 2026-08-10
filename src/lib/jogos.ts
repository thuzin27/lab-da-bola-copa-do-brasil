import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import type { JogoCreateInput, JogoPatchInput } from '@/lib/schemas'

/** Retorna todos os jogos ordenados por data decrescente. */
export async function listJogos() {
  return prisma.jogo.findMany({ orderBy: { dataJogo: 'desc' } })
}

/** Cria um jogo a partir dos dados validados pelo jogoSchema. */
export async function createJogo(data: JogoCreateInput) {
  return prisma.jogo.create({
    data: {
      ...data,
      dataJogo: new Date(data.dataJogo),
    },
  })
}

/**
 * Busca um jogo pelo id numérico.
 * Lança um erro tipado se não encontrar, para o handler retornar 404.
 */
export class JogoNotFoundError extends Error {
  constructor(id: number) {
    super(`Jogo ${id} não encontrado`)
    this.name = 'JogoNotFoundError'
  }
}

export async function getJogoOrThrow(id: number) {
  const jogo = await prisma.jogo.findUnique({ where: { id } })
  if (!jogo) throw new JogoNotFoundError(id)
  return jogo
}

/** Atualiza campos parciais de um jogo. Lança JogoNotFoundError se não existir. */
export async function updateJogo(id: number, data: JogoPatchInput) {
  const updateData: Parameters<typeof prisma.jogo.update>[0]['data'] = { ...data }
  if (data.dataJogo) {
    updateData.dataJogo = new Date(data.dataJogo)
  }
  try {
    return await prisma.jogo.update({ where: { id }, data: updateData })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new JogoNotFoundError(id)
    }
    throw err
  }
}

/** Remove um jogo. Lança JogoNotFoundError se não existir. */
export async function deleteJogo(id: number) {
  try {
    await prisma.jogo.delete({ where: { id } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new JogoNotFoundError(id)
    }
    throw err
  }
}
