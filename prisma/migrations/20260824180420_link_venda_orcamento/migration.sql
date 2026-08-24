/*
  Warnings:

  - A unique constraint covering the columns `[orcamentoOrigemId]` on the table `Venda` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "orcamentoOrigemId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Venda_orcamentoOrigemId_key" ON "Venda"("orcamentoOrigemId");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_orcamentoOrigemId_fkey" FOREIGN KEY ("orcamentoOrigemId") REFERENCES "Orcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
