-- AlterTable
ALTER TABLE "ComissaoMovimento" ADD COLUMN     "baseCalculo" DOUBLE PRECISION,
ADD COLUMN     "competencia" TEXT,
ADD COLUMN     "movimentoOrigemId" TEXT,
ADD COLUMN     "numeroSequencial" SERIAL NOT NULL,
ADD COLUMN     "tituloVendaBaixaId" TEXT,
ADD COLUMN     "tituloVendaId" TEXT;

-- AlterTable
ALTER TABLE "Faturamento" ADD COLUMN     "numeroSequencial" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Financeiro" ADD COLUMN     "origem" TEXT,
ADD COLUMN     "origemExterna" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "NFComissao" ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "dataEnvio" TEXT,
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "numeroSequencial" SERIAL NOT NULL,
ADD COLUMN     "referenciaEnvio" TEXT;

-- AlterTable
ALTER TABLE "TituloVenda" ADD COLUMN     "numeroSequencial" SERIAL NOT NULL,
ADD COLUMN     "numeroTituloExterno" TEXT;

-- CreateTable
CREATE TABLE "TituloVendaBaixa" (
    "id" TEXT NOT NULL,
    "tituloVendaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "origemInformacao" TEXT,
    "referencia" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TituloVendaBaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComissaoParcela" (
    "id" TEXT NOT NULL,
    "comissaoMovimentoId" TEXT NOT NULL,
    "numeroParcela" INTEGER NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "recebidoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComissaoParcela_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TituloVendaBaixa_tituloVendaId_idx" ON "TituloVendaBaixa"("tituloVendaId");

-- CreateIndex
CREATE INDEX "TituloVendaBaixa_data_idx" ON "TituloVendaBaixa"("data");

-- CreateIndex
CREATE INDEX "ComissaoParcela_comissaoMovimentoId_idx" ON "ComissaoParcela"("comissaoMovimentoId");

-- CreateIndex
CREATE INDEX "ComissaoParcela_vencimento_idx" ON "ComissaoParcela"("vencimento");

-- CreateIndex
CREATE INDEX "ComissaoParcela_status_idx" ON "ComissaoParcela"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ComissaoParcela_comissaoMovimentoId_numeroParcela_key" ON "ComissaoParcela"("comissaoMovimentoId", "numeroParcela");

-- CreateIndex
CREATE UNIQUE INDEX "ComissaoMovimento_numeroSequencial_key" ON "ComissaoMovimento"("numeroSequencial");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_tituloVendaId_idx" ON "ComissaoMovimento"("tituloVendaId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_tituloVendaBaixaId_idx" ON "ComissaoMovimento"("tituloVendaBaixaId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_movimentoOrigemId_idx" ON "ComissaoMovimento"("movimentoOrigemId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_competencia_idx" ON "ComissaoMovimento"("competencia");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_status_idx" ON "ComissaoMovimento"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Faturamento_numeroSequencial_key" ON "Faturamento"("numeroSequencial");

-- CreateIndex
CREATE INDEX "Financeiro_origem_idx" ON "Financeiro"("origem");

-- CreateIndex
CREATE INDEX "Financeiro_origemExterna_idx" ON "Financeiro"("origemExterna");

-- CreateIndex
CREATE UNIQUE INDEX "NFComissao_numeroSequencial_key" ON "NFComissao"("numeroSequencial");

-- CreateIndex
CREATE UNIQUE INDEX "TituloVenda_numeroSequencial_key" ON "TituloVenda"("numeroSequencial");

-- CreateIndex
CREATE INDEX "TituloVenda_numeroTituloExterno_idx" ON "TituloVenda"("numeroTituloExterno");

-- AddForeignKey
ALTER TABLE "TituloVendaBaixa" ADD CONSTRAINT "TituloVendaBaixa_tituloVendaId_fkey" FOREIGN KEY ("tituloVendaId") REFERENCES "TituloVenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_tituloVendaId_fkey" FOREIGN KEY ("tituloVendaId") REFERENCES "TituloVenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_tituloVendaBaixaId_fkey" FOREIGN KEY ("tituloVendaBaixaId") REFERENCES "TituloVendaBaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_movimentoOrigemId_fkey" FOREIGN KEY ("movimentoOrigemId") REFERENCES "ComissaoMovimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoParcela" ADD CONSTRAINT "ComissaoParcela_comissaoMovimentoId_fkey" FOREIGN KEY ("comissaoMovimentoId") REFERENCES "ComissaoMovimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

