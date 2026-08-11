-- Adiciona campo competicao para distinguir Copa do Brasil de outros torneios
-- Registros existentes recebem o default 'copa-do-brasil' automaticamente
ALTER TABLE "Jogo" ADD COLUMN "competicao" TEXT NOT NULL DEFAULT 'copa-do-brasil';
