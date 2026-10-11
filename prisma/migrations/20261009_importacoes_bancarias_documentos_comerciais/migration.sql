-- CreateTable
CREATE TABLE "ImportacaoExtratoBancario" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "contaBancariaId" TEXT NOT NULL,
    "importadoPorId" TEXT,
    "nomeArquivo" TEXT NOT NULL,
    "formatoArquivo" TEXT NOT NULL,
    "hashArquivo" TEXT NOT NULL,
    "caminhoArquivo" TEXT,
    "tamanhoBytes" INTEGER,
    "periodoInicio" TIMESTAMP(3),
    "periodoFim" TIMESTAMP(3),
    "saldoInicialInformado" DECIMAL(14,2),
    "saldoFinalInformado" DECIMAL(14,2),
    "dataSaldoFinal" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Importado',
    "avisos" JSONB,
    "importadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportacaoExtratoBancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoExtratoBancario" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "importacaoId" TEXT NOT NULL,
    "contaBancariaId" TEXT NOT NULL,
    "financeiroId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(14,2) NOT NULL,
    "identificadorBanco" TEXT,
    "referenciaBanco" TEXT,
    "indiceNoArquivo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NaoConciliado',
    "confianca" INTEGER,
    "observacoes" TEXT,
    "conciliadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovimentoExtratoBancario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportacaoDocumentoComercial" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "importadoPorId" TEXT,
    "conferidoPorId" TEXT,
    "representadaId" TEXT,
    "clienteId" TEXT,
    "vendaId" TEXT,
    "tipoDocumento" TEXT NOT NULL DEFAULT 'PedidoOficial',
    "nomeArquivo" TEXT NOT NULL,
    "formatoArquivo" TEXT NOT NULL,
    "hashArquivo" TEXT NOT NULL,
    "caminhoArquivo" TEXT,
    "tamanhoBytes" INTEGER,
    "numeroPedidoExterno" TEXT,
    "referenciaCliente" TEXT,
    "dataPedido" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "condicaoPagamento" TEXT,
    "valorProdutos" DECIMAL(14,2),
    "valorDescontos" DECIMAL(14,2),
    "valorTotalDocumento" DECIMAL(14,2),
    "valorTotalConferido" DECIMAL(14,2),
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "status" TEXT NOT NULL DEFAULT 'PendenteRevisao',
    "dadosExtraidos" JSONB,
    "divergencias" JSONB,
    "observacoes" TEXT,
    "conferidoEm" TIMESTAMP(3),
    "importadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportacaoDocumentoComercial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDocumentoComercial" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "numeroLinha" INTEGER NOT NULL,
    "codigoProduto" TEXT,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT,
    "quantidade" DECIMAL(16,4),
    "precoUnitario" DECIMAL(16,4),
    "valorTotal" DECIMAL(14,2),
    "dataEntrega" TIMESTAMP(3),
    "dadosOriginais" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemDocumentoComercial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportacaoExtratoBancario_escritorioId_importadoEm_idx" ON "ImportacaoExtratoBancario"("escritorioId", "importadoEm");

-- CreateIndex
CREATE INDEX "ImportacaoExtratoBancario_contaBancariaId_periodoInicio_per_idx" ON "ImportacaoExtratoBancario"("contaBancariaId", "periodoInicio", "periodoFim");

-- CreateIndex
CREATE INDEX "ImportacaoExtratoBancario_status_idx" ON "ImportacaoExtratoBancario"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ImportacaoExtratoBancario_contaBancariaId_hashArquivo_key" ON "ImportacaoExtratoBancario"("contaBancariaId", "hashArquivo");

-- CreateIndex
CREATE INDEX "MovimentoExtratoBancario_contaBancariaId_identificadorBanco_idx" ON "MovimentoExtratoBancario"("contaBancariaId", "identificadorBanco");

-- CreateIndex
CREATE INDEX "MovimentoExtratoBancario_contaBancariaId_data_tipo_valor_idx" ON "MovimentoExtratoBancario"("contaBancariaId", "data", "tipo", "valor");

-- CreateIndex
CREATE INDEX "MovimentoExtratoBancario_escritorioId_status_idx" ON "MovimentoExtratoBancario"("escritorioId", "status");

-- CreateIndex
CREATE INDEX "MovimentoExtratoBancario_financeiroId_idx" ON "MovimentoExtratoBancario"("financeiroId");

-- CreateIndex
CREATE UNIQUE INDEX "MovimentoExtratoBancario_importacaoId_indiceNoArquivo_key" ON "MovimentoExtratoBancario"("importacaoId", "indiceNoArquivo");

-- CreateIndex
CREATE INDEX "ImportacaoDocumentoComercial_escritorioId_importadoEm_idx" ON "ImportacaoDocumentoComercial"("escritorioId", "importadoEm");

-- CreateIndex
CREATE INDEX "ImportacaoDocumentoComercial_representadaId_numeroPedidoExt_idx" ON "ImportacaoDocumentoComercial"("representadaId", "numeroPedidoExterno");

-- CreateIndex
CREATE INDEX "ImportacaoDocumentoComercial_clienteId_idx" ON "ImportacaoDocumentoComercial"("clienteId");

-- CreateIndex
CREATE INDEX "ImportacaoDocumentoComercial_vendaId_idx" ON "ImportacaoDocumentoComercial"("vendaId");

-- CreateIndex
CREATE INDEX "ImportacaoDocumentoComercial_status_idx" ON "ImportacaoDocumentoComercial"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ImportacaoDocumentoComercial_escritorioId_hashArquivo_key" ON "ImportacaoDocumentoComercial"("escritorioId", "hashArquivo");

-- CreateIndex
CREATE INDEX "ItemDocumentoComercial_escritorioId_idx" ON "ItemDocumentoComercial"("escritorioId");

-- CreateIndex
CREATE INDEX "ItemDocumentoComercial_documentoId_idx" ON "ItemDocumentoComercial"("documentoId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemDocumentoComercial_documentoId_numeroLinha_key" ON "ItemDocumentoComercial"("documentoId", "numeroLinha");

-- AddForeignKey
ALTER TABLE "ImportacaoExtratoBancario" ADD CONSTRAINT "ImportacaoExtratoBancario_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoExtratoBancario" ADD CONSTRAINT "ImportacaoExtratoBancario_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoExtratoBancario" ADD CONSTRAINT "ImportacaoExtratoBancario_importadoPorId_fkey" FOREIGN KEY ("importadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoExtratoBancario" ADD CONSTRAINT "MovimentoExtratoBancario_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoExtratoBancario" ADD CONSTRAINT "MovimentoExtratoBancario_importacaoId_fkey" FOREIGN KEY ("importacaoId") REFERENCES "ImportacaoExtratoBancario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoExtratoBancario" ADD CONSTRAINT "MovimentoExtratoBancario_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoExtratoBancario" ADD CONSTRAINT "MovimentoExtratoBancario_financeiroId_fkey" FOREIGN KEY ("financeiroId") REFERENCES "Financeiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_importadoPorId_fkey" FOREIGN KEY ("importadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_conferidoPorId_fkey" FOREIGN KEY ("conferidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportacaoDocumentoComercial" ADD CONSTRAINT "ImportacaoDocumentoComercial_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDocumentoComercial" ADD CONSTRAINT "ItemDocumentoComercial_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemDocumentoComercial" ADD CONSTRAINT "ItemDocumentoComercial_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "ImportacaoDocumentoComercial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
