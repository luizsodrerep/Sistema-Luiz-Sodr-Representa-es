BEGIN;

-- =====================================================
-- 1. RECONCILIACAO HISTORICA DA PROSPECCAO
--
-- Estas colunas ja existem no banco atual e no schema.prisma,
-- mas nao estavam representadas no historico de migrations.
-- IF NOT EXISTS torna esta etapa segura no banco atual e
-- reproduzivel em uma instalacao nova criada somente pelas migrations.
-- =====================================================

ALTER TABLE "Interacao"
ADD COLUMN IF NOT EXISTS "nomeProspect" TEXT;

ALTER TABLE "Interacao"
ADD COLUMN IF NOT EXISTS "empresaProspect" TEXT;

ALTER TABLE "Interacao"
ADD COLUMN IF NOT EXISTS "origemProspeccao" TEXT;

-- =====================================================
-- 2. REMOCAO TEMPORARIA DAS FKs DE ESCRITORIO
-- Necessaria para trocar SET NULL por RESTRICT e
-- tornar escritorioId obrigatorio.
-- =====================================================

ALTER TABLE "Cliente"
DROP CONSTRAINT "Cliente_escritorioId_fkey";

ALTER TABLE "Financeiro"
DROP CONSTRAINT "Financeiro_escritorioId_fkey";

ALTER TABLE "Interacao"
DROP CONSTRAINT "Interacao_escritorioId_fkey";

ALTER TABLE "ObrigacaoOperacional"
DROP CONSTRAINT "ObrigacaoOperacional_escritorioId_fkey";

ALTER TABLE "Representada"
DROP CONSTRAINT "Representada_escritorioId_fkey";

ALTER TABLE "Venda"
DROP CONSTRAINT "Venda_escritorioId_fkey";

-- =====================================================
-- 3. ESCRITORIO OBRIGATORIO
-- O banco real foi previamente auditado e possui zero
-- registros com escritorioId nulo nestas tabelas.
-- =====================================================

ALTER TABLE "Cliente"
ALTER COLUMN "escritorioId" SET NOT NULL;

ALTER TABLE "Financeiro"
ALTER COLUMN "escritorioId" SET NOT NULL;

ALTER TABLE "Interacao"
ALTER COLUMN "escritorioId" SET NOT NULL;

ALTER TABLE "ObrigacaoOperacional"
ALTER COLUMN "escritorioId" SET NOT NULL;

ALTER TABLE "Representada"
ALTER COLUMN "escritorioId" SET NOT NULL;

ALTER TABLE "Venda"
ALTER COLUMN "escritorioId" SET NOT NULL;

-- =====================================================
-- 4. CAMPOS PROFISSIONAIS BASICOS DO USUARIO
-- Todos opcionais para preservar os dois usuarios atuais.
-- =====================================================

ALTER TABLE "Usuario"
ADD COLUMN "cargo" TEXT,
ADD COLUMN "departamento" TEXT,
ADD COLUMN "telefone" TEXT,
ADD COLUMN "tipoVinculo" TEXT;

-- =====================================================
-- 5. VINCULO ESTRUTURAL DAS TRANSFERENCIAS
-- =====================================================

ALTER TABLE "Financeiro"
ADD COLUMN "transferenciaGrupoId" TEXT;

-- Copia para a nova coluna apenas o UUID tecnico que ja
-- esta armazenado na origem das transferencias existentes.
-- Nao altera valor, conta, status, data, descricao ou origem.
UPDATE "Financeiro"
SET "transferenciaGrupoId" =
  SUBSTRING(
    "origem"
    FROM LENGTH('TRANSFERENCIA_INTERNA:') + 1
  )
WHERE
  "origem" LIKE 'TRANSFERENCIA_INTERNA:%'
  AND "transferenciaGrupoId" IS NULL;

CREATE INDEX "Financeiro_transferenciaGrupoId_idx"
ON "Financeiro"("transferenciaGrupoId");

-- =====================================================
-- 6. TAREFAS / COMPROMISSOS DA AGENDA
-- =====================================================

CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "escritorioId" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "responsavelId" TEXT,
    "clienteId" TEXT,
    "representadaId" TEXT,
    "interacaoId" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'Tarefa',
    "prioridade" TEXT NOT NULL DEFAULT 'Normal',
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "vencimentoEm" TIMESTAMP(3),
    "concluidoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Tarefa_escritorioId_idx"
ON "Tarefa"("escritorioId");

CREATE INDEX "Tarefa_criadoPorId_idx"
ON "Tarefa"("criadoPorId");

CREATE INDEX "Tarefa_responsavelId_idx"
ON "Tarefa"("responsavelId");

CREATE INDEX "Tarefa_clienteId_idx"
ON "Tarefa"("clienteId");

CREATE INDEX "Tarefa_representadaId_idx"
ON "Tarefa"("representadaId");

CREATE INDEX "Tarefa_interacaoId_idx"
ON "Tarefa"("interacaoId");

CREATE INDEX "Tarefa_status_idx"
ON "Tarefa"("status");

CREATE INDEX "Tarefa_inicioEm_idx"
ON "Tarefa"("inicioEm");

CREATE INDEX "Tarefa_vencimentoEm_idx"
ON "Tarefa"("vencimentoEm");

-- =====================================================
-- 7. PERMISSOES INDIVIDUAIS
-- NULL = herda a regra do perfil base.
-- =====================================================

CREATE TABLE "UsuarioPermissao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "ver" BOOLEAN,
    "criar" BOOLEAN,
    "editar" BOOLEAN,
    "excluir" BOOLEAN,
    "administrar" BOOLEAN,
    "escopo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioPermissao_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UsuarioPermissao_usuarioId_idx"
ON "UsuarioPermissao"("usuarioId");

CREATE INDEX "UsuarioPermissao_recurso_idx"
ON "UsuarioPermissao"("recurso");

CREATE UNIQUE INDEX "UsuarioPermissao_usuarioId_recurso_key"
ON "UsuarioPermissao"("usuarioId", "recurso");

-- =====================================================
-- 8. CONTATOS MULTIPLOS DAS REPRESENTADAS
-- Os campos principais antigos permanecem preservados.
-- =====================================================

CREATE TABLE "RepresentadaContato" (
    "id" TEXT NOT NULL,
    "representadaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "area" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepresentadaContato_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RepresentadaContato_representadaId_idx"
ON "RepresentadaContato"("representadaId");

CREATE INDEX "RepresentadaContato_area_idx"
ON "RepresentadaContato"("area");

CREATE INDEX "RepresentadaContato_ativo_idx"
ON "RepresentadaContato"("ativo");

-- =====================================================
-- 9. RECRIACAO DAS FKs DE ESCRITORIO COMO RESTRICT
-- =====================================================

ALTER TABLE "Cliente"
ADD CONSTRAINT "Cliente_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Representada"
ADD CONSTRAINT "Representada_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Venda"
ADD CONSTRAINT "Venda_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Interacao"
ADD CONSTRAINT "Interacao_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Financeiro"
ADD CONSTRAINT "Financeiro_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "ObrigacaoOperacional"
ADD CONSTRAINT "ObrigacaoOperacional_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- =====================================================
-- 10. FKs DOS NOVOS MODELOS
-- =====================================================

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_escritorioId_fkey"
FOREIGN KEY ("escritorioId")
REFERENCES "Escritorio"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_criadoPorId_fkey"
FOREIGN KEY ("criadoPorId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_responsavelId_fkey"
FOREIGN KEY ("responsavelId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_clienteId_fkey"
FOREIGN KEY ("clienteId")
REFERENCES "Cliente"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_representadaId_fkey"
FOREIGN KEY ("representadaId")
REFERENCES "Representada"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Tarefa"
ADD CONSTRAINT "Tarefa_interacaoId_fkey"
FOREIGN KEY ("interacaoId")
REFERENCES "Interacao"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "UsuarioPermissao"
ADD CONSTRAINT "UsuarioPermissao_usuarioId_fkey"
FOREIGN KEY ("usuarioId")
REFERENCES "Usuario"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "RepresentadaContato"
ADD CONSTRAINT "RepresentadaContato_representadaId_fkey"
FOREIGN KEY ("representadaId")
REFERENCES "Representada"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

COMMIT;
