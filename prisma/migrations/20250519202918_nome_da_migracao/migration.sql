/*
  Warnings:

  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Cliente";

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "categoria" VARCHAR(50),
    "telefone" VARCHAR(20),
    "responsavel" TEXT,
    "cidade" VARCHAR(100),
    "estado" CHAR(2),
    "ultimaCompra" DATE,
    "status" VARCHAR(10) DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" VARCHAR(10) NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "representada" VARCHAR(100) NOT NULL,
    "representada_id" VARCHAR(10),
    "data" DATE NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "valor_faturado" DECIMAL(10,2),
    "comissao" DECIMAL(10,2),
    "pagamento" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cnpj_key" ON "clientes"("cnpj");
