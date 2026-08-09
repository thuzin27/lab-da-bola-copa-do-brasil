export function badRequest(message: string, details?: unknown): Response {
  const body: Record<string, unknown> = { error: message }
  if (details !== undefined) body.details = details
  return Response.json(body, { status: 400 })
}

export function notFound(message: string): Response {
  return Response.json({ error: message }, { status: 404 })
}

export function unauthorized(message: string): Response {
  return Response.json({ error: message }, { status: 401 })
}

export function serverError(message: string): Response {
  return Response.json({ error: message }, { status: 500 })
}
