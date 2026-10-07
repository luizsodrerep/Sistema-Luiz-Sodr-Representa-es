-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN "termometroRelacionamento" TEXT;

-- CreateTable
CREATE TABLE "AtencaoComercialCliente" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "representadaId" TEXT,
    "criadoPorId" TEXT,
    "resolvidoPorId" TEXT,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativa',
    "resolucao" TEXT,
    "resolvidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AtencaoComercialCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_escritorioId_idx" ON "AtencaoComercialCliente"("escritorioId");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_clienteId_idx" ON "AtencaoComercialCliente"("clienteId");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_representadaId_idx" ON "AtencaoComercialCliente"("representadaId");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_criadoPorId_idx" ON "AtencaoComercialCliente"("criadoPorId");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_resolvidoPorId_idx" ON "AtencaoComercialCliente"("resolvidoPorId");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_tipo_idx" ON "AtencaoComercialCliente"("tipo");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_status_idx" ON "AtencaoComercialCliente"("status");

-- CreateIndex
CREATE INDEX "AtencaoComercialCliente_criadoEm_idx" ON "AtencaoComercialCliente"("criadoEm");

-- AddForeignKey
ALTER TABLE "AtencaoComercialCliente"
ADD CONSTRAINT "AtencaoComercialCliente_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencaoComercialCliente"
ADD CONSTRAINT "AtencaoComercialCliente_clienteId_fkey"
FOREIGN KEY ("clienteId")
REFERENCES "Cliente"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencaoComercialCliente"
ADD CONSTRAINT "AtencaoComercialCliente_representadaId_fkey"
FOREIGN KEY ("representadaId")
REFERENCES "Representada"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencaoComercialCliente"
ADD CONSTRAINT "AtencaoComercialCliente_criadoPorId_fkey"
FOREIGN KEY ("criadoPorId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtencaoComercialCliente"
ADD CONSTRAINT "AtencaoComercialCliente_resolvidoPorId_fkey"
FOREIGN KEY ("resolvidoPorId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;