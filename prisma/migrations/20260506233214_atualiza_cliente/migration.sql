/*
  Warnings:

  - You are about to drop the column `empresa` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Cliente` table. All the data in the column will be lost.
  - Added the required column `razaoSocial` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "empresa",
DROP COLUMN "nome",
ADD COLUMN     "aceitaEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "contato" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "razaoSocial" TEXT NOT NULL,
ADD COLUMN     "regiao" TEXT,
ADD COLUMN     "rota" TEXT,
ADD COLUMN     "whatsapp" TEXT;
