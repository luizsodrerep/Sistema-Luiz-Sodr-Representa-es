/*
  Warnings:

  - A unique constraint covering the columns `[numeroSequencial]` on the table `Interacao` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Interacao" ADD COLUMN     "numeroSequencial" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Interacao_numeroSequencial_key" ON "Interacao"("numeroSequencial");
