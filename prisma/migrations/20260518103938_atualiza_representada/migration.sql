/*
  Warnings:

  - You are about to drop the column `contato` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `produtos` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `Representada` table. All the data in the column will be lost.
  - You are about to drop the column `valorUnitario` on the `Venda` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Representada" DROP COLUMN "contato",
DROP COLUMN "email",
DROP COLUMN "produtos",
DROP COLUMN "telefone",
ADD COLUMN     "bancoComissao" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "contatoFinanceiro" TEXT,
ADD COLUMN     "contatoLogistica" TEXT,
ADD COLUMN     "contatoPrincipal" TEXT,
ADD COLUMN     "contratoAssinado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailFinanceiro" TEXT,
ADD COLUMN     "emailLogistica" TEXT,
ADD COLUMN     "emailPrincipal" TEXT,
ADD COLUMN     "emiteNF" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fechamentoComissao" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "pagamentoComissao" TEXT,
ADD COLUMN     "site" TEXT,
ADD COLUMN     "telefoneFinanceiro" TEXT,
ADD COLUMN     "telefoneLogistica" TEXT,
ADD COLUMN     "telefonePrincipal" TEXT,
ADD COLUMN     "whatsappPrincipal" TEXT;

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "valorUnitario",
ADD COLUMN     "arquivoUrl" TEXT,
ADD COLUMN     "condicaoPagamento" TEXT,
ADD COLUMN     "desconto" DOUBLE PRECISION,
ADD COLUMN     "numeroPedido" TEXT,
ADD COLUMN     "previsaoFaturamento" TIMESTAMP(3);
