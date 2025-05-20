/*
  Warnings:

  - You are about to drop the `vendas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "vendas";

-- CreateTable
CREATE TABLE "Vendas" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "representadaId" INTEGER NOT NULL,

    CONSTRAINT "Vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representadas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metaAnual" DECIMAL(12,2) NOT NULL,
    "vendasRealizadas" DECIMAL(12,2) NOT NULL,
    "percentualMeta" DOUBLE PRECISION NOT NULL,
    "comissoesGeradas" DECIMAL(12,2) NOT NULL,
    "percentualComissao" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Representadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetasMensais" (
    "id" TEXT NOT NULL,
    "mes" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "realizado" TEXT,
    "status" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,

    CONSTRAINT "MetasMensais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representada" (
    "id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "segmento" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "gerente" TEXT NOT NULL,
    "gerenteId" TEXT NOT NULL,
    "regiaoAtuacao" TEXT NOT NULL,

    CONSTRAINT "Representada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "percentual" TEXT NOT NULL,
    "pagamento" TEXT NOT NULL,
    "diaPagamento" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "comNF" BOOLEAN NOT NULL,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prazo" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "faturamento" TEXT NOT NULL,
    "entrega" TEXT NOT NULL,

    CONSTRAINT "Prazo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "anual" TEXT NOT NULL,
    "mensal" TEXT NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaMensal" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "mes" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "realizado" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "MetaMensal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compromisso" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "dia" INTEGER NOT NULL,
    "mes" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Compromisso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preco" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL,
    "representadaId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vendas" ADD CONSTRAINT "Vendas_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetasMensais" ADD CONSTRAINT "MetasMensais_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
