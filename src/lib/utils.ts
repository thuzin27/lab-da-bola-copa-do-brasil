/**
 * Converte uma string de rota dinâmica para número inteiro.
 * Retorna null se a string não representar um inteiro válido.
 */
export function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}
