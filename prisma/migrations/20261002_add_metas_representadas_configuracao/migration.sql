-- AlterTable
ALTER TABLE "Representada"
ALTER COLUMN "status" SET DEFAULT U&'Em configura\00E7\00E3o';

-- CreateTable
CREATE TABLE "MetaRepresentada" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Vendas',
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "valorMeta" DOUBLE PRECISION NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "fonte" TEXT,
    "referencia" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaRepresentada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaRepresentada_escritorioId_idx"
ON "MetaRepresentada"("escritorioId");

-- CreateIndex
CREATE INDEX "MetaRepresentada_representadaId_idx"
ON "MetaRepresentada"("representadaId");

-- CreateIndex
CREATE INDEX "MetaRepresentada_criadoPorId_idx"
ON "MetaRepresentada"("criadoPorId");

-- CreateIndex
CREATE INDEX "MetaRepresentada_tipo_idx"
ON "MetaRepresentada"("tipo");

-- CreateIndex
CREATE INDEX "MetaRepresentada_ano_mes_idx"
ON "MetaRepresentada"("ano", "mes");

-- CreateIndex
CREATE INDEX "MetaRepresentada_ativa_idx"
ON "MetaRepresentada"("ativa");

-- CreateIndex
CREATE UNIQUE INDEX "MetaRepresentada_representadaId_tipo_ano_mes_key"
ON "MetaRepresentada"("representadaId", "tipo", "ano", "mes");

-- AddForeignKey
ALTER TABLE "MetaRepresentada"
ADD CONSTRAINT "MetaRepresentada_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaRepresentada"
ADD CONSTRAINT "MetaRepresentada_representadaId_fkey"
FOREIGN KEY ("representadaId")
REFERENCES "Representada"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaRepresentada"
ADD CONSTRAINT "MetaRepresentada_criadoPorId_fkey"
FOREIGN KEY ("criadoPorId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;