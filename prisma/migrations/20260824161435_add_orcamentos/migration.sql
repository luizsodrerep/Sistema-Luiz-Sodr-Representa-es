-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "numeroSequencial" SERIAL NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "interacaoOrigemId" TEXT,
    "clienteId" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "responsavelId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "validadeEm" TIMESTAMP(3) NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "condicaoPagamento" TEXT,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "enviadoEm" TIMESTAMP(3),
    "finalizadoEm" TIMESTAMP(3),
    "motivoFinalizacao" TEXT,
    "arquivoUrl" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Orcamento_numeroSequencial_key" ON "Orcamento"("numeroSequencial");

-- CreateIndex
CREATE INDEX "Orcamento_escritorioId_idx" ON "Orcamento"("escritorioId");

-- CreateIndex
CREATE INDEX "Orcamento_interacaoOrigemId_idx" ON "Orcamento"("interacaoOrigemId");

-- CreateIndex
CREATE INDEX "Orcamento_clienteId_idx" ON "Orcamento"("clienteId");

-- CreateIndex
CREATE INDEX "Orcamento_representadaId_idx" ON "Orcamento"("representadaId");

-- CreateIndex
CREATE INDEX "Orcamento_criadoPorId_idx" ON "Orcamento"("criadoPorId");

-- CreateIndex
CREATE INDEX "Orcamento_responsavelId_idx" ON "Orcamento"("responsavelId");

-- CreateIndex
CREATE INDEX "Orcamento_data_idx" ON "Orcamento"("data");

-- CreateIndex
CREATE INDEX "Orcamento_validadeEm_idx" ON "Orcamento"("validadeEm");

-- CreateIndex
CREATE INDEX "Orcamento_status_idx" ON "Orcamento"("status");

-- CreateIndex
CREATE INDEX "Orcamento_enviadoEm_idx" ON "Orcamento"("enviadoEm");

-- CreateIndex
CREATE INDEX "Orcamento_finalizadoEm_idx" ON "Orcamento"("finalizadoEm");

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_interacaoOrigemId_fkey" FOREIGN KEY ("interacaoOrigemId") REFERENCES "Interacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
