/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "ultimoPedidoEm" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_codigo_key" ON "Cliente"("codigo");
