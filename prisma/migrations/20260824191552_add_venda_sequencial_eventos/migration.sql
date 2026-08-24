/*
  Warnings:

  - A unique constraint covering the columns `[numeroSequencial]` on the table `Venda` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "numeroSequencial" SERIAL NOT NULL;

-- CreateTable
CREATE TABLE "VendaEvento" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "canal" TEXT,
    "referencia" TEXT,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendaEvento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendaEvento_vendaId_idx" ON "VendaEvento"("vendaId");

-- CreateIndex
CREATE INDEX "VendaEvento_usuarioId_idx" ON "VendaEvento"("usuarioId");

-- CreateIndex
CREATE INDEX "VendaEvento_data_idx" ON "VendaEvento"("data");

-- CreateIndex
CREATE INDEX "VendaEvento_tipo_idx" ON "VendaEvento"("tipo");

-- CreateIndex
CREATE INDEX "VendaEvento_canal_idx" ON "VendaEvento"("canal");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_numeroSequencial_key" ON "Venda"("numeroSequencial");

-- AddForeignKey
ALTER TABLE "VendaEvento" ADD CONSTRAINT "VendaEvento_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendaEvento" ADD CONSTRAINT "VendaEvento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
