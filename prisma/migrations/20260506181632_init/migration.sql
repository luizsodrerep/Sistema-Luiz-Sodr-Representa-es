-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "empresa" TEXT,
    "cargo" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "categoria" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Representada" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "produtos" TEXT,
    "comissao" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Ativa',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Representada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "produto" TEXT,
    "quantidade" INTEGER,
    "valorUnitario" DOUBLE PRECISION,
    "valorTotal" DOUBLE PRECISION,
    "comissao" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interacao" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "assunto" TEXT,
    "descricao" TEXT,
    "resultado" TEXT,
    "proximosPasso" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Financeiro" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "vencimento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Financeiro_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
