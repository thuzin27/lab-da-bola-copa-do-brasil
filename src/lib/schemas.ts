import { z } from 'zod'

/** Schema para criação de jogo (POST /api/jogos) */
export const jogoSchema = z.object({
  timeCasa: z.string().min(1),
  timeFora: z.string().min(1),
  golsCasa: z.number().int().min(0).optional().default(0),
  golsFora: z.number().int().min(0).optional().default(0),
  fase: z.string().min(1),
  dataJogo: z.string().datetime(),
})

/** Schema para atualização parcial de jogo (PATCH /api/jogos/[id]) */
export const patchSchema = z.object({
  golsCasa: z.number().int().min(0).optional(),
  golsFora: z.number().int().min(0).optional(),
  fase: z.string().min(1).optional(),
  dataJogo: z.string().datetime().optional(),
})

export type JogoCreateInput = z.infer<typeof jogoSchema>
export type JogoPatchInput = z.infer<typeof patchSchema>
