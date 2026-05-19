-- CreateTable
CREATE TABLE "ComissaoFaixa" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "descontoAte" DOUBLE PRECISION NOT NULL,
    "percentualComissao" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComissaoFaixa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComissaoFaixa" ADD CONSTRAINT "ComissaoFaixa_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
