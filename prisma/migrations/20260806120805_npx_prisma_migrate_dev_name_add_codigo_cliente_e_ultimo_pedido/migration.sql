/*
  Warnings:

  - You are about to drop the column `contatoFinanceiro` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `contatoLogistica` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `emailFinanceiro` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `emailLogistica` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `site` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `telefoneFinanceiro` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `telefoneLogistica` on the `Representada` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Representada" DROP COLUMN "contatoFinanceiro",
DROP COLUMN "contatoLogistica",
DROP COLUMN "emailFinanceiro",
DROP COLUMN "emailLogistica",
DROP COLUMN "site",
DROP COLUMN "telefoneFinanceiro",
DROP COLUMN "telefoneLogistica",
ADD COLUMN     "codigo" TEXT,
ADD COLUMN     "faixasComissao" TEXT,
ADD COLUMN     "tipoComissao" TEXT DEFAULT 'fixa';
