/*
  Warnings:

  - You are about to drop the `ComissaoFaixa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComissaoFaixa" DROP CONSTRAINT "ComissaoFaixa_representadaId_fkey";

-- DropTable
DROP TABLE "ComissaoFaixa";
