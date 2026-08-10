-- Índice para suportar ORDER BY dataJogo DESC em listJogos()
-- sem full table scan conforme escala do campeonato
CREATE INDEX IF NOT EXISTS "Jogo_dataJogo_idx" ON "Jogo"("dataJogo");
