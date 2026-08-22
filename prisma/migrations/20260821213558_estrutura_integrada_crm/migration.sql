-- DropForeignKey
ALTER TABLE "Interacao" DROP CONSTRAINT "Interacao_clienteId_fkey";

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "escritorioId" TEXT,
ADD COLUMN     "originadoPorId" TEXT,
ADD COLUMN     "responsavelPrincipalId" TEXT;

-- AlterTable
ALTER TABLE "Financeiro" ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "contaBancariaId" TEXT,
ADD COLUMN     "empresaEscritorioId" TEXT,
ADD COLUMN     "escritorioId" TEXT,
ADD COLUMN     "nfComissaoId" TEXT,
ADD COLUMN     "obrigacaoId" TEXT,
ADD COLUMN     "representadaId" TEXT,
ADD COLUMN     "vendaId" TEXT;

-- AlterTable
ALTER TABLE "Interacao" ADD COLUMN     "criadoPorId" TEXT,
ADD COLUMN     "escritorioId" TEXT,
ADD COLUMN     "proximoContatoEm" TIMESTAMP(3),
ADD COLUMN     "representadaId" TEXT,
ADD COLUMN     "responsavelId" TEXT,
ADD COLUMN     "statusFollowUp" TEXT NOT NULL DEFAULT 'Aberto',
ADD COLUMN     "vendaId" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Representada" ADD COLUMN     "escritorioId" TEXT,
ADD COLUMN     "exigeNFComissao" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "minimoParcela" DOUBLE PRECISION,
ADD COLUMN     "pedidoMinimo" DOUBLE PRECISION,
ADD COLUMN     "politicaFrete" TEXT,
ADD COLUMN     "prazoAlertaFaturamentoDias" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "prazoEntregaDias" INTEGER,
ADD COLUMN     "prazoFaturamentoDias" INTEGER,
ADD COLUMN     "regiaoAtendimento" TEXT,
ADD COLUMN     "regraReconhecimentoComissao" TEXT;

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "baseCalculoComissao" DOUBLE PRECISION,
ADD COLUMN     "bonificacaoValor" DOUBLE PRECISION,
ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "confirmadoEm" TIMESTAMP(3),
ADD COLUMN     "criadoPorId" TEXT,
ADD COLUMN     "empresaEscritorioId" TEXT,
ADD COLUMN     "escritorioId" TEXT,
ADD COLUMN     "motivoCancelamento" TEXT,
ADD COLUMN     "numeroOCCliente" TEXT,
ADD COLUMN     "numeroPedidoInterno" TEXT,
ADD COLUMN     "numeroPedidoRepresentada" TEXT,
ADD COLUMN     "pedidoEnviadoEm" TIMESTAMP(3),
ADD COLUMN     "percentualComissaoAplicado" DOUBLE PRECISION,
ADD COLUMN     "regraComercialId" TEXT,
ADD COLUMN     "regraReconhecimentoComissao" TEXT,
ADD COLUMN     "responsavelId" TEXT,
ADD COLUMN     "valorComissaoPrevista" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Escritorio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "email" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Escritorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpresaEscritorio" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativa',
    "dataInicio" TIMESTAMP(3),
    "dataEncerramento" TIMESTAMP(3),
    "regimeTributario" TEXT,
    "aliquotaPadraoImposto" DOUBLE PRECISION,
    "endereco" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpresaEscritorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "login" TEXT,
    "senhaHash" TEXT,
    "perfil" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "regiaoAtuacao" TEXT,
    "ultimoAcessoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClienteParticipacao" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "papel" TEXT,
    "inicioEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fimEm" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteParticipacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoRepresentada" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "empresaEscritorioId" TEXT,
    "tipoFormalizacao" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataEncerramento" TIMESTAMP(3),
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "ultimaRevisaoEm" TIMESTAMP(3),
    "proximaRevisaoEm" TIMESTAMP(3),
    "motivoEncerramento" TEXT,
    "arquivoUrl" TEXT,
    "origemDocumento" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoRepresentada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegraComercialRepresentada" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "clienteId" TEXT,
    "contratoId" TEXT,
    "nome" TEXT NOT NULL,
    "tipoEscopo" TEXT NOT NULL DEFAULT 'Padrao',
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaFim" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "pedidoMinimo" DOUBLE PRECISION,
    "minimoParcela" DOUBLE PRECISION,
    "prazoEntregaDias" INTEGER,
    "prazoFaturamentoDias" INTEGER,
    "frete" TEXT,
    "regiao" TEXT,
    "tipoComissao" TEXT,
    "percentualComissao" DOUBLE PRECISION,
    "faixasComissao" TEXT,
    "reconhecimentoComissao" TEXT,
    "fechamentoComissao" TEXT,
    "pagamentoComissao" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegraComercialRepresentada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faturamento" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "numeroNF" TEXT,
    "dataFaturamento" TIMESTAMP(3) NOT NULL,
    "valorFaturado" DOUBLE PRECISION NOT NULL,
    "faturamentoParcial" BOOLEAN NOT NULL DEFAULT false,
    "saldoPedido" DOUBLE PRECISION,
    "percentualCorte" DOUBLE PRECISION,
    "valorCorte" DOUBLE PRECISION,
    "motivoCorte" TEXT,
    "pdfUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Faturado',
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faturamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TituloVenda" (
    "id" TEXT NOT NULL,
    "faturamentoId" TEXT NOT NULL,
    "numeroParcela" INTEGER,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aberto',
    "prorrogadoPara" TIMESTAMP(3),
    "pagoEm" TIMESTAMP(3),
    "atrasoInformadoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TituloVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComissaoMovimento" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT,
    "faturamentoId" TEXT,
    "nfComissaoId" TEXT,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "percentual" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComissaoMovimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NFComissao" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "empresaEscritorioId" TEXT NOT NULL,
    "numero" TEXT,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "periodoInicio" TIMESTAMP(3),
    "periodoFim" TIMESTAMP(3),
    "valorBruto" DOUBLE PRECISION NOT NULL,
    "aliquotaImposto" DOUBLE PRECISION,
    "valorImposto" DOUBLE PRECISION,
    "valorLiquido" DOUBLE PRECISION,
    "vencimento" TIMESTAMP(3),
    "pagoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Emitida',
    "pdfUrl" TEXT,
    "contaBancariaId" TEXT,
    "historica" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NFComissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaBancaria" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "empresaEscritorioId" TEXT,
    "usuarioTitularId" TEXT,
    "nome" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "tipoTitular" TEXT NOT NULL,
    "titular" TEXT,
    "agencia" TEXT,
    "conta" TEXT,
    "pix" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaBancaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepresentadaContaRecebimento" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "contaBancariaId" TEXT NOT NULL,
    "tipoRecebimento" TEXT NOT NULL,
    "percentualDestino" DOUBLE PRECISION,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepresentadaContaRecebimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObrigacaoOperacional" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT,
    "empresaEscritorioId" TEXT,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "periodicidade" TEXT,
    "competencia" TEXT,
    "vencimento" TIMESTAMP(3),
    "valorPrevisto" DOUBLE PRECISION,
    "valorPago" DOUBLE PRECISION,
    "juros" DOUBLE PRECISION,
    "multa" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "pagoEm" TIMESTAMP(3),
    "comprovanteUrl" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObrigacaoOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Escritorio_status_idx" ON "Escritorio"("status");

-- CreateIndex
CREATE INDEX "EmpresaEscritorio_escritorioId_idx" ON "EmpresaEscritorio"("escritorioId");

-- CreateIndex
CREATE INDEX "EmpresaEscritorio_cnpj_idx" ON "EmpresaEscritorio"("cnpj");

-- CreateIndex
CREATE INDEX "EmpresaEscritorio_status_idx" ON "EmpresaEscritorio"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_login_key" ON "Usuario"("login");

-- CreateIndex
CREATE INDEX "Usuario_escritorioId_idx" ON "Usuario"("escritorioId");

-- CreateIndex
CREATE INDEX "Usuario_perfil_idx" ON "Usuario"("perfil");

-- CreateIndex
CREATE INDEX "Usuario_ativo_idx" ON "Usuario"("ativo");

-- CreateIndex
CREATE INDEX "ClienteParticipacao_clienteId_idx" ON "ClienteParticipacao"("clienteId");

-- CreateIndex
CREATE INDEX "ClienteParticipacao_usuarioId_idx" ON "ClienteParticipacao"("usuarioId");

-- CreateIndex
CREATE INDEX "ClienteParticipacao_ativa_idx" ON "ClienteParticipacao"("ativa");

-- CreateIndex
CREATE INDEX "ContratoRepresentada_representadaId_idx" ON "ContratoRepresentada"("representadaId");

-- CreateIndex
CREATE INDEX "ContratoRepresentada_empresaEscritorioId_idx" ON "ContratoRepresentada"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "ContratoRepresentada_vigente_idx" ON "ContratoRepresentada"("vigente");

-- CreateIndex
CREATE INDEX "ContratoRepresentada_proximaRevisaoEm_idx" ON "ContratoRepresentada"("proximaRevisaoEm");

-- CreateIndex
CREATE INDEX "RegraComercialRepresentada_representadaId_idx" ON "RegraComercialRepresentada"("representadaId");

-- CreateIndex
CREATE INDEX "RegraComercialRepresentada_clienteId_idx" ON "RegraComercialRepresentada"("clienteId");

-- CreateIndex
CREATE INDEX "RegraComercialRepresentada_contratoId_idx" ON "RegraComercialRepresentada"("contratoId");

-- CreateIndex
CREATE INDEX "RegraComercialRepresentada_vigenciaInicio_idx" ON "RegraComercialRepresentada"("vigenciaInicio");

-- CreateIndex
CREATE INDEX "RegraComercialRepresentada_ativa_idx" ON "RegraComercialRepresentada"("ativa");

-- CreateIndex
CREATE INDEX "Faturamento_vendaId_idx" ON "Faturamento"("vendaId");

-- CreateIndex
CREATE INDEX "Faturamento_dataFaturamento_idx" ON "Faturamento"("dataFaturamento");

-- CreateIndex
CREATE INDEX "Faturamento_numeroNF_idx" ON "Faturamento"("numeroNF");

-- CreateIndex
CREATE INDEX "TituloVenda_faturamentoId_idx" ON "TituloVenda"("faturamentoId");

-- CreateIndex
CREATE INDEX "TituloVenda_vencimento_idx" ON "TituloVenda"("vencimento");

-- CreateIndex
CREATE INDEX "TituloVenda_status_idx" ON "TituloVenda"("status");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_vendaId_idx" ON "ComissaoMovimento"("vendaId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_faturamentoId_idx" ON "ComissaoMovimento"("faturamentoId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_nfComissaoId_idx" ON "ComissaoMovimento"("nfComissaoId");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_tipo_idx" ON "ComissaoMovimento"("tipo");

-- CreateIndex
CREATE INDEX "ComissaoMovimento_data_idx" ON "ComissaoMovimento"("data");

-- CreateIndex
CREATE INDEX "NFComissao_representadaId_idx" ON "NFComissao"("representadaId");

-- CreateIndex
CREATE INDEX "NFComissao_empresaEscritorioId_idx" ON "NFComissao"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "NFComissao_numero_idx" ON "NFComissao"("numero");

-- CreateIndex
CREATE INDEX "NFComissao_dataEmissao_idx" ON "NFComissao"("dataEmissao");

-- CreateIndex
CREATE INDEX "NFComissao_status_idx" ON "NFComissao"("status");

-- CreateIndex
CREATE INDEX "NFComissao_historica_idx" ON "NFComissao"("historica");

-- CreateIndex
CREATE INDEX "ContaBancaria_escritorioId_idx" ON "ContaBancaria"("escritorioId");

-- CreateIndex
CREATE INDEX "ContaBancaria_empresaEscritorioId_idx" ON "ContaBancaria"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "ContaBancaria_usuarioTitularId_idx" ON "ContaBancaria"("usuarioTitularId");

-- CreateIndex
CREATE INDEX "ContaBancaria_ativa_idx" ON "ContaBancaria"("ativa");

-- CreateIndex
CREATE INDEX "RepresentadaContaRecebimento_representadaId_idx" ON "RepresentadaContaRecebimento"("representadaId");

-- CreateIndex
CREATE INDEX "RepresentadaContaRecebimento_contaBancariaId_idx" ON "RepresentadaContaRecebimento"("contaBancariaId");

-- CreateIndex
CREATE INDEX "RepresentadaContaRecebimento_ativa_idx" ON "RepresentadaContaRecebimento"("ativa");

-- CreateIndex
CREATE INDEX "ObrigacaoOperacional_escritorioId_idx" ON "ObrigacaoOperacional"("escritorioId");

-- CreateIndex
CREATE INDEX "ObrigacaoOperacional_empresaEscritorioId_idx" ON "ObrigacaoOperacional"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "ObrigacaoOperacional_categoria_idx" ON "ObrigacaoOperacional"("categoria");

-- CreateIndex
CREATE INDEX "ObrigacaoOperacional_vencimento_idx" ON "ObrigacaoOperacional"("vencimento");

-- CreateIndex
CREATE INDEX "ObrigacaoOperacional_status_idx" ON "ObrigacaoOperacional"("status");

-- CreateIndex
CREATE INDEX "Auditoria_escritorioId_idx" ON "Auditoria"("escritorioId");

-- CreateIndex
CREATE INDEX "Auditoria_usuarioId_idx" ON "Auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "Auditoria_entidade_idx" ON "Auditoria"("entidade");

-- CreateIndex
CREATE INDEX "Auditoria_entidadeId_idx" ON "Auditoria"("entidadeId");

-- CreateIndex
CREATE INDEX "Auditoria_criadoEm_idx" ON "Auditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "Cliente_escritorioId_idx" ON "Cliente"("escritorioId");

-- CreateIndex
CREATE INDEX "Cliente_originadoPorId_idx" ON "Cliente"("originadoPorId");

-- CreateIndex
CREATE INDEX "Cliente_responsavelPrincipalId_idx" ON "Cliente"("responsavelPrincipalId");

-- CreateIndex
CREATE INDEX "Cliente_status_idx" ON "Cliente"("status");

-- CreateIndex
CREATE INDEX "Financeiro_escritorioId_idx" ON "Financeiro"("escritorioId");

-- CreateIndex
CREATE INDEX "Financeiro_empresaEscritorioId_idx" ON "Financeiro"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "Financeiro_clienteId_idx" ON "Financeiro"("clienteId");

-- CreateIndex
CREATE INDEX "Financeiro_representadaId_idx" ON "Financeiro"("representadaId");

-- CreateIndex
CREATE INDEX "Financeiro_vendaId_idx" ON "Financeiro"("vendaId");

-- CreateIndex
CREATE INDEX "Financeiro_nfComissaoId_idx" ON "Financeiro"("nfComissaoId");

-- CreateIndex
CREATE INDEX "Financeiro_contaBancariaId_idx" ON "Financeiro"("contaBancariaId");

-- CreateIndex
CREATE INDEX "Financeiro_obrigacaoId_idx" ON "Financeiro"("obrigacaoId");

-- CreateIndex
CREATE INDEX "Financeiro_data_idx" ON "Financeiro"("data");

-- CreateIndex
CREATE INDEX "Financeiro_vencimento_idx" ON "Financeiro"("vencimento");

-- CreateIndex
CREATE INDEX "Financeiro_status_idx" ON "Financeiro"("status");

-- CreateIndex
CREATE INDEX "Interacao_escritorioId_idx" ON "Interacao"("escritorioId");

-- CreateIndex
CREATE INDEX "Interacao_clienteId_idx" ON "Interacao"("clienteId");

-- CreateIndex
CREATE INDEX "Interacao_representadaId_idx" ON "Interacao"("representadaId");

-- CreateIndex
CREATE INDEX "Interacao_vendaId_idx" ON "Interacao"("vendaId");

-- CreateIndex
CREATE INDEX "Interacao_criadoPorId_idx" ON "Interacao"("criadoPorId");

-- CreateIndex
CREATE INDEX "Interacao_responsavelId_idx" ON "Interacao"("responsavelId");

-- CreateIndex
CREATE INDEX "Interacao_data_idx" ON "Interacao"("data");

-- CreateIndex
CREATE INDEX "Interacao_proximoContatoEm_idx" ON "Interacao"("proximoContatoEm");

-- CreateIndex
CREATE INDEX "Interacao_statusFollowUp_idx" ON "Interacao"("statusFollowUp");

-- CreateIndex
CREATE INDEX "Representada_escritorioId_idx" ON "Representada"("escritorioId");

-- CreateIndex
CREATE INDEX "Representada_codigo_idx" ON "Representada"("codigo");

-- CreateIndex
CREATE INDEX "Representada_cnpj_idx" ON "Representada"("cnpj");

-- CreateIndex
CREATE INDEX "Representada_status_idx" ON "Representada"("status");

-- CreateIndex
CREATE INDEX "Venda_escritorioId_idx" ON "Venda"("escritorioId");

-- CreateIndex
CREATE INDEX "Venda_empresaEscritorioId_idx" ON "Venda"("empresaEscritorioId");

-- CreateIndex
CREATE INDEX "Venda_clienteId_idx" ON "Venda"("clienteId");

-- CreateIndex
CREATE INDEX "Venda_representadaId_idx" ON "Venda"("representadaId");

-- CreateIndex
CREATE INDEX "Venda_regraComercialId_idx" ON "Venda"("regraComercialId");

-- CreateIndex
CREATE INDEX "Venda_criadoPorId_idx" ON "Venda"("criadoPorId");

-- CreateIndex
CREATE INDEX "Venda_responsavelId_idx" ON "Venda"("responsavelId");

-- CreateIndex
CREATE INDEX "Venda_data_idx" ON "Venda"("data");

-- CreateIndex
CREATE INDEX "Venda_status_idx" ON "Venda"("status");

-- AddForeignKey
ALTER TABLE "EmpresaEscritorio" ADD CONSTRAINT "EmpresaEscritorio_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_originadoPorId_fkey" FOREIGN KEY ("originadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_responsavelPrincipalId_fkey" FOREIGN KEY ("responsavelPrincipalId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteParticipacao" ADD CONSTRAINT "ClienteParticipacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClienteParticipacao" ADD CONSTRAINT "ClienteParticipacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Representada" ADD CONSTRAINT "Representada_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoRepresentada" ADD CONSTRAINT "ContratoRepresentada_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoRepresentada" ADD CONSTRAINT "ContratoRepresentada_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraComercialRepresentada" ADD CONSTRAINT "RegraComercialRepresentada_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraComercialRepresentada" ADD CONSTRAINT "RegraComercialRepresentada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegraComercialRepresentada" ADD CONSTRAINT "RegraComercialRepresentada_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoRepresentada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_regraComercialId_fkey" FOREIGN KEY ("regraComercialId") REFERENCES "RegraComercialRepresentada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TituloVenda" ADD CONSTRAINT "TituloVenda_faturamentoId_fkey" FOREIGN KEY ("faturamentoId") REFERENCES "Faturamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_faturamentoId_fkey" FOREIGN KEY ("faturamentoId") REFERENCES "Faturamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMovimento" ADD CONSTRAINT "ComissaoMovimento_nfComissaoId_fkey" FOREIGN KEY ("nfComissaoId") REFERENCES "NFComissao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFComissao" ADD CONSTRAINT "NFComissao_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFComissao" ADD CONSTRAINT "NFComissao_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFComissao" ADD CONSTRAINT "NFComissao_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaBancaria" ADD CONSTRAINT "ContaBancaria_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaBancaria" ADD CONSTRAINT "ContaBancaria_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaBancaria" ADD CONSTRAINT "ContaBancaria_usuarioTitularId_fkey" FOREIGN KEY ("usuarioTitularId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepresentadaContaRecebimento" ADD CONSTRAINT "RepresentadaContaRecebimento_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepresentadaContaRecebimento" ADD CONSTRAINT "RepresentadaContaRecebimento_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interacao" ADD CONSTRAINT "Interacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_representadaId_fkey" FOREIGN KEY ("representadaId") REFERENCES "Representada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_nfComissaoId_fkey" FOREIGN KEY ("nfComissaoId") REFERENCES "NFComissao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_contaBancariaId_fkey" FOREIGN KEY ("contaBancariaId") REFERENCES "ContaBancaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Financeiro" ADD CONSTRAINT "Financeiro_obrigacaoId_fkey" FOREIGN KEY ("obrigacaoId") REFERENCES "ObrigacaoOperacional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrigacaoOperacional" ADD CONSTRAINT "ObrigacaoOperacional_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObrigacaoOperacional" ADD CONSTRAINT "ObrigacaoOperacional_empresaEscritorioId_fkey" FOREIGN KEY ("empresaEscritorioId") REFERENCES "EmpresaEscritorio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_escritorioId_fkey" FOREIGN KEY ("escritorioId") REFERENCES "Escritorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
