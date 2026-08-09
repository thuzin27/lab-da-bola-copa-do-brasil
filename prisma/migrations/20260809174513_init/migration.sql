-- CreateTable
CREATE TABLE "Jogo" (
    "id" SERIAL NOT NULL,
    "timeCasa" TEXT NOT NULL,
    "timeFora" TEXT NOT NULL,
    "golsCasa" INTEGER NOT NULL DEFAULT 0,
    "golsFora" INTEGER NOT NULL DEFAULT 0,
    "fase" TEXT NOT NULL,
    "dataJogo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);
