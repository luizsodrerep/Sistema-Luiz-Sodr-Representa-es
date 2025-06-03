/*
  Warnings:

  - You are about to drop the column `responsavel` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to drop the column `comissao` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the column `valorFaturado` on the `Venda` table. All the data in the column will be lost.
  - The `status` column on the `Venda` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('ABERTA', 'CONCLUIDA', 'CANCELADA');

-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_interacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Interacao" DROP CONSTRAINT "Interacao_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Interacao" DROP CONSTRAINT "Interacao_representadaId_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_representadaId_fkey";

-- DropIndex
DROP INDEX "Venda_clienteId_idx";

-- DropIndex
DROP INDEX "Venda_representadaId_idx";

-- AlterTable
ALTER TABLE "FollowUp" DROP COLUMN "responsavel",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Interacao" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "representadaId" DROP NOT NULL,
ALTER COLUMN "data" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "responsavel" DROP NOT NULL,
ALTER COLUMN "descricao" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ABERTA';

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "comissao",
DROP COLUMN "valorFaturado",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "representadaId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusVenda" NOT NULL DEFAULT 'ABERTA';

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_interacaoId_fkey" FOREIGN KEY ("interacaoId") REFERENCES "Interacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
