-- CreateTable
CREATE TABLE "CartaoCredito" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "emissor" TEXT NOT NULL,
    "titularidade" TEXT NOT NULL,
    "titular" TEXT,
    "finalCartao" TEXT,
    "bandeira" TEXT,
    "contaPagamentoId" TEXT,
    "diaFechamento" INTEGER,
    "diaVencimento" INTEGER,
    "melhorDiaInformado" INTEGER,
    "limiteTotal" DECIMAL(14,2),
    "limiteDisponivelInformado" DECIMAL(14,2),
    "limiteConsultadoEm" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartaoCredito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartaoCompra" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "dataCompra" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "natureza" TEXT NOT NULL,
    "valorTotal" DECIMAL(14,2) NOT NULL,
    "numeroParcelas" INTEGER NOT NULL,
    "estabelecimento" TEXT,
    "referenciaExterna" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativa',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartaoCompra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartaoFatura" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "fechamentoEm" TIMESTAMP(3),
    "vencimentoEm" TIMESTAMP(3) NOT NULL,
    "valorInformado" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'Aberta',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartaoFatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartaoParcela" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "compraId" TEXT NOT NULL,
    "faturaId" TEXT,
    "numero" INTEGER NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "vencimentoPrevisto" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Prevista',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartaoParcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartaoPagamentoFatura" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "financeiroId" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "pagoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartaoPagamentoFatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcordoFinanceiro" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "bemId" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "natureza" TEXT NOT NULL,
    "credor" TEXT,
    "documentoReferencia" TEXT,
    "formalizacao" TEXT,
    "valorOriginal" DECIMAL(14,2),
    "valorNegociado" DECIMAL(14,2),
    "descontoNegociado" DECIMAL(14,2),
    "dataInicio" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcordoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcordoParcela" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "acordoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valorPrevisto" DECIMAL(14,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "financeiroBaixaId" TEXT,
    "valorPago" DECIMAL(14,2),
    "pagoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcordoParcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BemFinanceiro" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titularidade" TEXT NOT NULL,
    "identificacao" TEXT,
    "adquiridoEm" TIMESTAMP(3),
    "valorAquisicao" DECIMAL(14,2),
    "valorEstimado" DECIMAL(14,2),
    "valorEstimadoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BemFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartaoCredito_escritorioId_ativo_idx" ON "CartaoCredito"("escritorioId", "ativo");

-- CreateIndex
CREATE INDEX "CartaoCredito_contaPagamentoId_idx" ON "CartaoCredito"("contaPagamentoId");

-- CreateIndex
CREATE INDEX "CartaoCompra_escritorioId_dataCompra_idx" ON "CartaoCompra"("escritorioId", "dataCompra");

-- CreateIndex
CREATE INDEX "CartaoCompra_cartaoId_status_idx" ON "CartaoCompra"("cartaoId", "status");

-- CreateIndex
CREATE INDEX "CartaoCompra_referenciaExterna_idx" ON "CartaoCompra"("referenciaExterna");

-- CreateIndex
CREATE INDEX "CartaoFatura_escritorioId_vencimentoEm_idx" ON "CartaoFatura"("escritorioId", "vencimentoEm");

-- CreateIndex
CREATE INDEX "CartaoFatura_cartaoId_status_idx" ON "CartaoFatura"("cartaoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CartaoFatura_cartaoId_competencia_key" ON "CartaoFatura"("cartaoId", "competencia");

-- CreateIndex
CREATE INDEX "CartaoParcela_escritorioId_vencimentoPrevisto_idx" ON "CartaoParcela"("escritorioId", "vencimentoPrevisto");

-- CreateIndex
CREATE INDEX "CartaoParcela_faturaId_idx" ON "CartaoParcela"("faturaId");

-- CreateIndex
CREATE INDEX "CartaoParcela_status_idx" ON "CartaoParcela"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CartaoParcela_compraId_numero_key" ON "CartaoParcela"("compraId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "CartaoPagamentoFatura_financeiroId_key" ON "CartaoPagamentoFatura"("financeiroId");

-- CreateIndex
CREATE INDEX "CartaoPagamentoFatura_escritorioId_pagoEm_idx" ON "CartaoPagamentoFatura"("escritorioId", "pagoEm");

-- CreateIndex
CREATE INDEX "CartaoPagamentoFatura_faturaId_idx" ON "CartaoPagamentoFatura"("faturaId");

-- CreateIndex
CREATE INDEX "AcordoFinanceiro_escritorioId_status_idx" ON "AcordoFinanceiro"("escritorioId", "status");

-- CreateIndex
CREATE INDEX "AcordoFinanceiro_bemId_idx" ON "AcordoFinanceiro"("bemId");

-- CreateIndex
CREATE INDEX "AcordoFinanceiro_tipo_idx" ON "AcordoFinanceiro"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "AcordoParcela_financeiroBaixaId_key" ON "AcordoParcela"("financeiroBaixaId");

-- CreateIndex
CREATE INDEX "AcordoParcela_escritorioId_vencimento_idx" ON "AcordoParcela"("escritorioId", "vencimento");

-- CreateIndex
CREATE INDEX "AcordoParcela_status_idx" ON "AcordoParcela"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AcordoParcela_acordoId_numero_key" ON "AcordoParcela"("acordoId", "numero");

-- CreateIndex
CREATE INDEX "BemFinanceiro_escritorioId_status_idx" ON "BemFinanceiro"("escritorioId", "status");

-- CreateIndex
CREATE INDEX "BemFinanceiro_tipo_idx" ON "BemFinanceiro"("tipo");

-- AddForeignKey
ALTER TABLE "CartaoCredito" ADD CONSTRAINT "CartaoCredito_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoCredito" ADD CONSTRAINT "CartaoCredito_contaPagamentoId_fkey" FOREIGN KEY ("contaPagamentoId") REFERENCES "ContaBancaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoCompra" ADD CONSTRAINT "CartaoCompra_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoCompra" ADD CONSTRAINT "CartaoCompra_cartaoId_fkey"FOREIGN KEY ("cartaoId") REFERENCES "CartaoCredito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoFatura" ADD CONSTRAINT "CartaoFatura_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoFatura" ADD CONSTRAINT "CartaoFatura_cartaoId_fkey"FOREIGN KEY ("cartaoId") REFERENCES "CartaoCredito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoParcela" ADD CONSTRAINT "CartaoParcela_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoParcela" ADD CONSTRAINT "CartaoParcela_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "CartaoCompra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoParcela" ADD CONSTRAINT "CartaoParcela_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "CartaoFatura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoPagamentoFatura" ADD CONSTRAINT "CartaoPagamentoFatura_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoPagamentoFatura" ADD CONSTRAINT "CartaoPagamentoFatura_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "CartaoFatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartaoPagamentoFatura" ADD CONSTRAINT "CartaoPagamentoFatura_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoFinanceiro" ADD CONSTRAINT "AcordoFinanceiro_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id")ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoFinanceiro" ADD CONSTRAINT "AcordoFinanceiro_bemId_fkey" FOREIGN KEY ("bemId") REFERENCES "BemFinanceiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoParcela" ADD CONSTRAINT "AcordoParcela_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoParcela" ADD CONSTRAINT "AcordoParcela_acordoId_fkey" FOREIGN KEY ("acordoId") REFERENCES "AcordoFinanceiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcordoParcela" ADD CONSTRAINT "AcordoParcela_financeiroBaixaId_fkey" FOREIGN KEY ("financeiroBaixaId") REFERENCES "Financeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BemFinanceiro" ADD CONSTRAINT "BemFinanceiro_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
