-- CreateTable
CREATE TABLE "Catalogo" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "nomeArquivoOriginal" TEXT NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "extensao" TEXT,
    "tamanhoBytes" INTEGER NOT NULL,
    "hashSha256" TEXT,
    "versao" TEXT,
    "dataReferencia" TIMESTAMP(3),
    "origem" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "arquivadoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Catalogo_caminhoArquivo_key" ON "Catalogo"("caminhoArquivo");

-- CreateIndex
CREATE INDEX "Catalogo_escritorioId_idx" ON "Catalogo"("escritorioId");

-- CreateIndex
CREATE INDEX "Catalogo_representadaId_idx" ON "Catalogo"("representadaId");

-- CreateIndex
CREATE INDEX "Catalogo_criadoPorId_idx" ON "Catalogo"("criadoPorId");

-- CreateIndex
CREATE INDEX "Catalogo_nome_idx" ON "Catalogo"("nome");

-- CreateIndex
CREATE INDEX "Catalogo_status_idx" ON "Catalogo"("status");

-- CreateIndex
CREATE INDEX "Catalogo_dataReferencia_idx" ON "Catalogo"("dataReferencia");

-- CreateIndex
CREATE INDEX "Catalogo_criadoEm_idx" ON "Catalogo"("criadoEm");

-- CreateIndex
CREATE INDEX "Catalogo_hashSha256_idx" ON "Catalogo"("hashSha256");

-- AddForeignKey
ALTER TABLE "Catalogo" ADD CONSTRAINT "Catalogo_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catalogo" ADD CONSTRAINT "Catalogo_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catalogo" ADD CONSTRAINT "Catalogo_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
