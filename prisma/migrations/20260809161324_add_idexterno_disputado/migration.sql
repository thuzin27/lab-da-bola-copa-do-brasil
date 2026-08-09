-- AlterTable
ALTER TABLE "Jogo" ADD COLUMN "idExterno" TEXT,
ADD COLUMN "disputado" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Jogo_idExterno_key" ON "Jogo"("idExterno");
