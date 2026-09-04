# DOCUMENTO MESTRE --- CRM LUIZ SODRÉ REPRESENTAÇÕES

## 1. Finalidade deste documento

Este arquivo é a memória técnica persistente do projeto CRM Luiz Sodré
Representações.

Ele deve ser tratado como fonte oficial de continuidade entre conversas,
etapas de desenvolvimento e checkpoints técnicos.

Sempre que houver:

-   conclusão de módulo;
-   alteração estrutural relevante;
-   nova migration;
-   mudança importante de regra de negócio;
-   correção ampla;
-   novo checkpoint Git/GitHub;
-   decisão arquitetural importante;

este documento deve ser atualizado antes de iniciar uma nova grande
etapa.

------------------------------------------------------------------------

## 2. Regra principal de continuidade

O CRM deve seguir a cadeia:

DADOS → INDICADORES → ANÁLISE → DECISÃO → AÇÃO

O sistema não deve ser tratado apenas como cadastro.

A arquitetura deve preservar:

-   rastreabilidade;
-   histórico;
-   regras comerciais;
-   responsabilidades;
-   participação de usuários;
-   vendas;
-   faturamentos;
-   comissões;
-   financeiro;
-   obrigações;
-   interações;
-   auditoria;
-   autenticação;
-   autorização;
-   isolamento de dados por usuário.

------------------------------------------------------------------------

## 3. Escopo deste projeto

Este projeto trata exclusivamente do CRM e gestão comercial.

Assuntos paralelos devem ser tratados em conversa/projeto separado.

------------------------------------------------------------------------

## 4. Perfil operacional do sistema

A entidade central é o escritório.

Clientes pertencem ao escritório.

Usuários do escritório podem possuir:

-   responsabilidade por clientes;
-   participação em clientes;
-   responsabilidade por vendas;
-   responsabilidade por interações;
-   atuação por região;
-   histórico próprio.

O sistema deve suportar Diretor, Administrativo e futuros Prepostos sem
depender de estruturas fixas.

------------------------------------------------------------------------

## 5. Stack atual

-   Next.js: 15.2.4
-   TypeScript
-   Prisma: 5.22.0
-   PostgreSQL
-   Tailwind CSS
-   Windows
-   bcryptjs
-   jose
-   Projeto local prioritário antes de qualquer expansão para nuvem

Não atualizar Next.js, Prisma ou outras dependências estruturais sem
necessidade técnica comprovada.

------------------------------------------------------------------------

## 6. Regra obrigatória de trabalho com arquivos

O usuário não possui experiência com programação. O procedimento deve
priorizar redução de risco manual.

Procedimento padrão obrigatório:

1.  Para qualquer alteração manual, o assistente informa primeiro o
    comando para abrir o arquivo no Bloco de Notas.
2.  Quando o assistente já possuir uma versão atual e confiável do
    arquivo, não deve solicitar novamente seu conteúdo.
3.  Quando houver alteração, o assistente deve fornecer o conteúdo
    COMPLETO, FINAL, REVISADO E PRONTO PARA SUBSTITUIÇÃO do arquivo.
4.  O usuário deve substituir integralmente o conteúdo do arquivo:
    `Ctrl+A` → apagar → colar o conteúdo completo fornecido → `Ctrl+S`.
5.  Não orientar inserção manual de blocos parciais, linhas isoladas ou
    trechos no meio de arquivos, salvo impossibilidade técnica
    específica e explicitamente justificada.
6.  O mesmo procedimento vale para código, Markdown, configuração e
    outros arquivos editados manualmente.
7.  Solicitar novamente o conteúdo do arquivo somente quando:
    -   ele tiver sido alterado depois da última versão conhecida;
    -   houver dúvida técnica real sobre seu estado;
    -   o conteúdo atual não estiver disponível ou não for confiável.
8.  Após cada alteração de código, usar como validação rápida:
    `npx tsc --noEmit`
9.  Não executar build completo, diff detalhado ou verificações extensas
    depois de cada pequena alteração.
10. Ao final de um lote lógico, executar validação ampliada conforme
    aplicável:
    -   `npx tsc --noEmit`
    -   `git diff --check`
    -   `npm run build`
    -   `git status --short`
11. Criar checkpoint Git/GitHub somente depois da validação do lote.
12. Evitar `git add .` quando existir qualquer arquivo local que deva
    permanecer fora do Git.
13. Adicionar explicitamente somente os arquivos aprovados para o
    checkpoint.
14. Quando uma saída do Git abrir no paginador mostrando `:` ou `(END)`,
    sair normalmente com a tecla `q`.

Objetivo: reduzir risco de edição incorreta, confusão, retrabalho e
inclusão acidental de arquivos.

------------------------------------------------------------------------

## 7. Política de segurança do código

Não executar ou orientar automaticamente:

-   git commit;
-   git push;
-   criação de branch;
-   merge;
-   alteração de schema;
-   migration;
-   upgrade de dependências;
-   npm audit fix;
-   npm audit fix --force;

sem validar o estado técnico antes.

Antes de checkpoint relevante, verificar conforme aplicável:

-   `npx tsc --noEmit`
-   `git diff --check`
-   `npm run build`
-   estado do Git

------------------------------------------------------------------------

## 8. Política de Git/GitHub

Sempre que um módulo, lote relevante ou alteração estrutural importante
estiver validado, deve ser criado um checkpoint Git/GitHub antes de
avançar.

Não criar commit para cada pequena alteração isolada.

Critério ideal para checkpoint:

-   alteração relevante concluída;
-   TypeScript validado;
-   build validado;
-   arquivos revisados;
-   estado do Git conferido.

GitHub é a fonte oficial do código versionado.

------------------------------------------------------------------------

## 9. Checkpoint Git atual

Repositório:

`https://github.com/luizsodrerep/Sistema-Luiz-Sodr-Representa-es.git`

Branch:

`main`

Commit funcional validado mais recente:

`3d1e999`

Mensagem:

`feat: consolida regras comerciais faturamento e fluxo de vendas`

Push para GitHub concluído com sucesso em 27/08/2026.

Esse checkpoint consolida:

-   ajustes de regras comerciais de Representadas;
-   condições de pagamento;
-   fluxo operacional da Venda;
-   envio oficial único à Representada;
-   confirmação da Representada;
-   registro de número oficial do pedido;
-   alteração/divergência pós-envio como evento rastreável;
-   início do módulo Faturamento;
-   API de Faturamentos;
-   tela de Faturamentos;
-   sincronização estrutural entre banco PostgreSQL e `schema.prisma`;
-   migration `20260827_sincroniza_faturamento_titulos_comissoes`.

Checkpoint funcional anterior:

`de78c932810979b9796434d1cc7651b093d8de25`

Mensagem:

`feat: conclui fluxo comercial de orcamentos e vendas`

Checkpoint funcional anterior:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

Checkpoint funcional anterior:

`53c41c23ab310b8f10fd0e4aec85205c0ca8ff32`

Mensagem:

`feat: adiciona autenticacao e controle de acesso`

Checkpoint funcional anterior:

`6dcd74a25dfc8523c2e25ddcafb524c5bd3a1631`

Mensagem:

`feat: conclui estrutura funcional de representadas`

Checkpoint documental anterior:

`5ee92f0`

Mensagem:

`docs: atualiza checkpoint e estado de representadas`

Checkpoint técnico anterior relevante:

`33b1d21d712e7daf4dc8f2cfeb863300032d12f9`

Mensagem:

`checkpoint: estrutura integrada CRM e correcoes TypeScript`

------------------------------------------------------------------------

## 10. Estado de validação técnica atual

Validação do lote do checkpoint `3d1e999`:

`npx tsc --noEmit`

Resultado:

-   0 erros TypeScript.

Executado:

`git diff --check`

Resultado:

-   nenhuma inconsistência de whitespace;
-   apenas avisos LF → CRLF no Windows em `.gitignore` e `prisma/schema.prisma`, sem impacto funcional.

Prisma:

-   versão preservada em `5.22.0`;
-   `npx prisma generate` executado com sucesso;
-   Prisma Client gerado com sucesso.

Banco:

-   PostgreSQL 16.13;
-   14 migrations reconhecidas;
-   migration `20260827_sincroniza_faturamento_titulos_comissoes` aplicada com sucesso;
-   `npx prisma migrate status` retornou `Database schema is up to date!`;
-   `npx prisma migrate diff --from-schema-datasource prisma\schema.prisma --to-schema-datamodel prisma\schema.prisma --exit-code` retornou `No difference detected.`

Git:

-   commit `3d1e999` criado;
-   push para `origin/main` concluído;
-   `git status --short` vazio após o push.

Validação funcional real:

-   `VEN-000001` aberta sem erro P2022 após sincronização do banco;
-   envio oficial único registrado;
-   status alterado para `Aguardando confirmação`;
-   confirmação da Representada registrada;
-   status alterado para `Confirmado`;
-   número oficial do pedido Massari/Mercos registrado;
-   histórico preservou autoria da criação e das ações posteriores.

Build completo de produção:

-   último build completo validado permanece o do checkpoint anterior;
-   novo build completo não foi repetido neste lote;
-   deve ser executado em lote técnico futuro antes de marco de produção.

Lint:

-   permanece pendente.

------------------------------------------------------------------------

## 11. Evolução dos erros TypeScript

Estado inicial registrado:

28 erros em 17 arquivos.

Depois das correções sucessivas:

27 → 24 → 23 → 15 → 9 → 6 → 0 erros.

Estado atual:

0 erros TypeScript, reconfirmados no lote do checkpoint `a7668fd`.

------------------------------------------------------------------------

## 12. Correções técnicas históricas consolidadas

### 12.1 Next.js 15 --- params assíncronos

Corrigidos, entre outros:

-   `app/api/representadas/[id]/comissao/route.ts`
-   `app/api/representadas/[id]/route.ts`
-   `app/api/vendas/[id]/route.ts`
-   `app/api/interacoes/[id]/route.ts`
-   `app/interacoes/[id]/page.tsx`
-   `app/interacoes/[id]/editar/page.tsx`

Rotas de API passaram a usar `params: Promise<{ id: string }>` e
`const { id } = await params`.

### 12.2 Representadas --- correção inicial de tipagem

Corrigido `app/representadas/nova/page.tsx` para aceitar
`HTMLSelectElement` no `handleChange`.

### 12.3 Calendários

Corrigidos:

-   `app/agenda/page.tsx`
-   `app/contabilidade/calendario/page.tsx`
-   `app/financeiro/calendario/page.tsx`

Uso incompatível de `day` e `displayValue` foi substituído por
`modifiers` e `modifiersClassNames`.

### 12.4 Excel / Buffer

Corrigidos:

-   `app/api/clientes/exportar/route.ts`
-   `app/api/clientes/importar/route.ts`
-   `app/api/templates/route.ts`

Compatibilidade entre Buffer, Uint8Array, ArrayBuffer, BodyInit e
ExcelJS foi ajustada sem upgrade de dependências.

### 12.5 Layout / AlertReminder

`date` foi convertido para `time` e `type` removido no uso de
`AlertReminder`.

### 12.6 Contact Buttons

`md` passou a ser convertido internamente para `default`, preservando a
API pública.

### 12.7 Sales Comparison

Criado tipo `SalesPeriod` e conversão controlada no `onValueChange`.

### 12.8 Tailwind

`height: 0` foi corrigido para `height: "0"` nos keyframes de accordion.

------------------------------------------------------------------------

## 13. Prisma --- estrutura integrada e migrations atuais

Arquivo:

`prisma/schema.prisma`

Estado atual:

-   schema válido;
-   Prisma Client 5.22.0 gerado;
-   PostgreSQL sincronizado;
-   14 migrations reconhecidas e aplicadas.

Migration estrutural histórica relevante:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

Migrations adicionadas no fechamento de Orçamentos/Vendas:

-   `prisma/migrations/20260824161435_add_orcamentos/migration.sql`
-   `prisma/migrations/20260824180420_link_venda_orcamento/migration.sql`
-   `prisma/migrations/20260824191552_add_venda_sequencial_eventos/migration.sql`

Migration de consolidação de 27/08/2026:

`prisma/migrations/20260827_sincroniza_faturamento_titulos_comissoes/migration.sql`

Essa migration consolidou no banco estruturas já previstas no schema, incluindo:

-   `TituloVendaBaixa`;
-   `ComissaoParcela`;
-   `numeroSequencial` em Faturamento, TituloVenda, ComissaoMovimento e NFComissao;
-   `numeroTituloExterno` em TituloVenda;
-   novos vínculos e campos em ComissaoMovimento;
-   campos adicionais em NFComissao;
-   `origem` e `origemExterna` em Financeiro;
-   índices e foreign keys correspondentes.

Ocorrência técnica da migration:

-   a primeira tentativa encontrou BOM UTF-8 no arquivo SQL;
-   o BOM foi removido;
-   a migration foi marcada como rolled back;
-   `npx prisma migrate deploy` reaplicou a migration com sucesso;
-   `npx prisma migrate status` confirmou banco atualizado;
-   `migrate diff` confirmou ausência de diferença entre banco e schema.

Estrutura integrada contempla, entre outras entidades:

-   Escritorio
-   EmpresaEscritorio
-   Usuario
-   Cliente
-   ClienteParticipacao
-   Representada
-   ContratoRepresentada
-   RegraComercialRepresentada
-   Interacao
-   Orcamento
-   Venda
-   VendaEvento
-   Faturamento
-   TituloVenda
-   TituloVendaBaixa
-   ComissaoMovimento
-   ComissaoParcela
-   NFComissao
-   ContaBancaria
-   RepresentadaContaRecebimento
-   Financeiro
-   ObrigacaoOperacional
-   Auditoria

Regras estruturais consolidadas:

-   `Interacao.numeroSequencial` usa `autoincrement()`;
-   `Orcamento.numeroSequencial` usa `autoincrement()`;
-   `Venda.numeroSequencial` usa `autoincrement()`;
-   `Venda.orcamentoOrigemId` é único;
-   `VendaEvento` preserva histórico operacional;
-   `Cliente.codigo` continua sendo `String? @unique` e é gerado pela aplicação no padrão `CLI-000001`;
-   Títulos possuem identificação interna própria e número externo opcional;
-   baixas de títulos são separadas do título principal;
-   parcelas de comissão possuem estrutura própria.

Regra permanente:

-   não atualizar a versão do Prisma durante a fase atual sem necessidade técnica comprovada;
-   não executar `db push` para substituir migration oficial;
-   migrations SQL devem permanecer em UTF-8 sem BOM.

------------------------------------------------------------------------

## 14. Arquivos temporários Prisma e diagnósticos

Estado atualizado em 27/08/2026:

Os arquivos temporários usados durante diagnóstico estrutural foram removidos após cumprirem sua função:

-   `banco_atual_diagnostico.prisma`
-   `diagnostico_banco_para_schema.sql`
-   `prisma/proposed_schema_diff.sql`

Portanto, referências históricas anteriores dizendo que
`prisma/proposed_schema_diff.sql` deveria permanecer local estão
SUPERADAS pelo checkpoint `3d1e999`.

Regra atual:

-   não recriar diagnósticos sem necessidade;
-   não versionar arquivos temporários;
-   não tratar diagnóstico como migration;
-   migrations oficiais permanecem exclusivamente em `prisma/migrations/`.

Backup PostgreSQL é tratado separadamente no capítulo 34.

------------------------------------------------------------------------

## 15. Regras de negócio de comissão

Comissão não deve ser tratada apenas como valor da venda × percentual.

O sistema precisa suportar:

-   comissão por faturamento;
-   comissão por liquidez;
-   estornos;
-   recuperações;
-   parcelas;
-   cortes;
-   diferentes datas de pagamento;
-   conta PF;
-   conta PJ;
-   exigência de NF;
-   não exigência de NF;
-   histórico da regra comercial;
-   vigência de regra;
-   regra por representada;
-   regra específica por cliente;
-   base de cálculo;
-   percentual aplicado;
-   comissão prevista;
-   movimentos de comissão;
-   NF de comissão.

Contrato e emissão de NF são dimensões diferentes.

Ausência de NF não deve significar automaticamente ausência de contrato.

------------------------------------------------------------------------

## 16. Representadas --- estado funcional no checkpoint 6dcd74a

O módulo Representadas foi ampliado e auditado em lote relevante.

Fluxos básicos validados funcionalmente com dados fictícios:

-   cadastro de representada;
-   comissão fixa;
-   comissão variada;
-   faixas adicionais de comissão;
-   visualização;
-   edição;
-   conversão fixa → variada;
-   conversão variada → fixa;
-   exclusão de representada sem vínculos.

A API de exclusão foi protegida para impedir remoção de representadas
com histórico/vínculos em:

-   contratos;
-   regras comerciais;
-   vendas;
-   interações;
-   notas de comissão;
-   contas de recebimento;
-   financeiro.

Quando houver vínculos, a regra correta é inativar ou suspender em vez
de apagar o histórico.

### 16.1 APIs criadas

-   `app/api/representadas/[id]/contratos/route.ts`
-   `app/api/representadas/[id]/contratos/[contratoId]/route.ts`
-   `app/api/representadas/[id]/regras-comerciais/route.ts`
-   `app/api/representadas/[id]/regras-comerciais/[regraId]/route.ts`
-   `app/api/representadas/[id]/contas-recebimento/route.ts`
-   `app/api/representadas/[id]/contas-recebimento/[vinculoId]/route.ts`
-   `app/api/contas-bancarias/route.ts`
-   `app/api/empresas-escritorio/route.ts`

Também foram reforçadas:

-   `app/api/representadas/route.ts`
-   `app/api/representadas/[id]/route.ts`

As APIs passaram a usar whitelist explícita de campos em vez de repassar
`...body` diretamente ao Prisma.

### 16.2 Telas criadas

-   `app/representadas/[id]/contratos/page.tsx`
-   `app/representadas/[id]/regras-comerciais/page.tsx`
-   `app/representadas/[id]/contas-recebimento/page.tsx`

A página principal da representada recebeu acessos diretos para:

-   Contratos
-   Regras Comerciais
-   Contas de Recebimento
-   Editar
-   Excluir

### 16.3 Contratos

Estrutura funcional criada para:

-   formalização física, digital, e-mail, verbal ou outra;
-   início e encerramento;
-   vigência;
-   revisões;
-   empresa do escritório;
-   origem/documento;
-   observações;
-   proteção contra exclusão quando existir regra comercial vinculada.

### 16.4 Regras comerciais

Estrutura funcional criada para:

-   regra padrão por representada;
-   regra específica por cliente;
-   vínculo opcional a contrato;
-   vigência;
-   pedido mínimo;
-   mínimo de parcela;
-   prazo de entrega;
-   prazo de faturamento;
-   frete;
-   região;
-   comissão fixa;
-   comissão variada por faixas;
-   reconhecimento de comissão;
-   fechamento e pagamento;
-   bloqueio de exclusão quando a regra já tiver sido usada em vendas.

### 16.5 Contas de recebimento

Estrutura inicial criada para vincular contas bancárias existentes à
representada.

A auditoria funcional detectou uma lacuna:

A tela consegue selecionar/vincular contas já existentes, mas ainda não
possui fluxo completo para cadastrar uma nova `ContaBancaria`.

Essa lacuna deve ser resolvida antes de considerar o submódulo de contas
encerrado.

------------------------------------------------------------------------

## 17. Regra de negócio das contas 01 / 02 / 03

Decisão funcional registrada em 22/08/2026:

-   cada representada poderá possuir até 3 opções de conta de
    recebimento cadastradas;
-   Conta 01 será a principal/prioritária;
-   Conta 01 será normalmente destinada a recebimentos de comissão com
    NF;
-   Conta 02 será alternativa normalmente destinada a recebimentos sem
    NF;
-   Conta 03 será uma opção adicional disponível ao Diretor do
    escritório;
-   as três contas podem permanecer cadastradas mesmo quando apenas uma
    estiver recebendo naquele momento;
-   a arquitetura deve permitir no futuro dividir o recebimento de uma
    comissão entre duas ou três contas;
-   a ordem 01/02/03 deve ser estável e não depender apenas da ordem
    visual da consulta;
-   percentual de destino deve permitir futuro rateio controlado;
-   contrato e NF não devem ser amarrados de forma automática entre si.

Estado do schema atual:

`RepresentadaContaRecebimento` ainda não possui campos formais
específicos para ordem/prioridade/finalidade 01/02/03.

Antes de alterar Prisma, migrations ou banco, deve existir validação
explícita e checkpoint próprio.

------------------------------------------------------------------------

## 18. Vínculo Representada → Escritório e estado institucional real

`ContaBancaria.escritorioId` é obrigatório no Prisma.

`Representada.escritorioId` continua opcional no schema atual.

A auditoria histórica de 22/08/2026 registrava banco ainda sem raiz
institucional. Esse estado foi superado.

Estado real confirmado em 24/08/2026:

-   1 `Escritorio` ativo: Luiz Sodré Representações;
-   2 usuários ativos:
    -   Luiz Fernando — perfil Diretor;
    -   Paula — perfil Administrativo.

Portanto:

-   o setup institucional real já foi executado;
-   não repetir setup inicial;
-   não criar nova raiz institucional;
-   novas entidades comerciais devem permanecer vinculadas ao
    `escritorioId` da sessão;
-   contas bancárias futuras não devem presumir ou criar outro
    escritório.

------------------------------------------------------------------------

## 19. Autenticação e autorização --- checkpoint 53c41c2

Foi criado um lote estrutural de autenticação e controle de acesso.

Dependências adicionadas:

-   `bcryptjs`
-   `jose`

`AUTH_SECRET` foi configurado localmente no `.env.local`.

O valor do `AUTH_SECRET` nunca deve ser enviado para conversas, GitHub
ou documentação pública.

### 19.1 Infraestrutura criada

Arquivos:

-   `lib/auth/session.ts`
-   `lib/auth/server.ts`
-   `lib/auth/permissions.ts`
-   `middleware.ts`

### 19.2 APIs de autenticação

Criadas:

-   `app/api/auth/login/route.ts`
-   `app/api/auth/logout/route.ts`
-   `app/api/auth/me/route.ts`
-   `app/api/auth/setup-inicial/route.ts`

### 19.3 Telas

Criadas:

-   `app/login/page.tsx`
-   `app/setup-inicial/page.tsx`
-   `app/acesso-negado/page.tsx`

Criado também:

-   `components/auth/user-session-menu.tsx`

O componente foi integrado em:

-   `app/layout.tsx`

### 19.4 Login

A API de login suporta:

-   login por e-mail;
-   login por identificador/login;
-   senha com bcrypt;
-   bloqueio de usuário inativo;
-   bloqueio de usuário sem senha configurada;
-   validação de perfil;
-   cookie HttpOnly;
-   SameSite Lax;
-   cookie Secure em produção;
-   atualização de `ultimoAcessoEm`.

### 19.5 Setup inicial

A API e página de setup inicial foram usadas para estabelecer a raiz
institucional real.

Estado confirmado em 24/08/2026:

-   `Escritorio`: Luiz Sodré Representações — ativo;
-   usuário Diretor: Luiz Fernando — ativo;
-   usuário Administrativo: Paula — ativo.

A proteção do setup permanece válida:

O setup somente funciona enquanto:

-   total de `Escritorio` = 0;
-   total de `Usuario` = 0.

Como a raiz institucional já existe, o setup inicial NÃO deve ser
executado novamente.

------------------------------------------------------------------------

## 20. Perfis e política de segurança

Perfis definidos:

-   Diretor
-   Administrativo
-   Preposto

A segurança deve trabalhar com duas camadas:

1.  RBAC --- permissão por perfil/recurso/ação;
2.  escopo de dados --- permissão sobre registros específicos.

Esconder botões não é considerado segurança suficiente.

Toda API sensível deve validar:

-   sessão;
-   perfil;
-   ação;
-   escritório;
-   escopo do registro.

### 20.1 Diretor

Diretor possui acesso integral ao sistema.

Inclui:

-   dados comerciais;
-   financeiro;
-   contabilidade;
-   usuários;
-   configurações;
-   auditoria;
-   contas bancárias;
-   gestão estrutural.

### 20.2 Administrativo

Administrativo possui acesso operacional ampliado.

Inclui:

-   clientes;
-   representadas;
-   contratos;
-   regras comerciais;
-   contas de recebimento;
-   vendas;
-   interações;
-   agenda;
-   relatórios;
-   financeiro;
-   contabilidade.

Não deve administrar:

-   usuários;
-   configurações estruturais;
-   auditoria administrativa;
-   permissões superiores.

### 20.3 Preposto

Preposto deve operar com princípio de mínimo privilégio.

Não pode acessar níveis superiores de Diretoria ou Administração.

Não deve acessar:

-   contas bancárias;
-   contas de recebimento;
-   financeiro;
-   contabilidade;
-   usuários;
-   configurações;
-   auditoria;
-   dados globais do escritório.

Pode acessar somente o necessário para sua atividade:

-   seu dashboard;
-   sua carteira;
-   representadas necessárias à sua função;
-   regras comerciais necessárias à venda;
-   suas vendas;
-   suas interações;
-   sua agenda;
-   seus relatórios;
-   consultas relacionadas à própria função.

------------------------------------------------------------------------

## 21. Escopo de dados do Preposto

O middleware bloqueia áreas e ações, mas NÃO substitui o filtro de
registros nas APIs.

### 21.1 Vendas --- isolamento implementado no checkpoint a7668fd

Preposto visualiza registros quando:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A API também filtra pelo `escritorioId` da sessão.

GET, POST, GET por ID, PUT e DELETE receberam proteção de escopo.

Preposto não pode criar venda em nome de outro usuário.

### 21.2 Clientes --- isolamento implementado no checkpoint a7668fd

Preposto visualiza clientes quando:

-   `responsavelPrincipalId = usuario logado`;
-   OU existir `ClienteParticipacao` ativa para o usuário.

A API também filtra pelo `escritorioId` da sessão.

GET, POST, GET por ID, PUT e DELETE receberam proteção de escopo.

### 21.3 Interações --- isolamento implementado no checkpoint a7668fd

Preposto visualiza registros quando:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A API também filtra pelo `escritorioId` da sessão.

GET, POST, GET por ID, PUT e DELETE receberam proteção de escopo.

Criação e edição validam o cliente informado contra o escritório e a
carteira permitida.

### 21.4 Agenda --- ainda não integrada ao banco

A revisão realizada em 23/08/2026 constatou que a Agenda ainda utiliza
dados fictícios/estáticos.

Quando for integrada aos dados reais, a Agenda de Preposto deverá ser
derivada somente dos registros relacionados ao próprio usuário e ao
escritório da sessão.

### 21.5 Relatórios --- ainda não integrados ao banco

A revisão realizada em 23/08/2026 constatou que Relatórios ainda utiliza
métricas fictícias/estáticas.

Quando for integrado aos dados reais, todo relatório de Preposto deverá
ser calculado somente sobre seu universo autorizado.

Nunca usar dados globais do escritório em relatório de usuário simples.

------------------------------------------------------------------------

## 22. Middleware

O middleware atual valida:

-   presença de sessão;
-   validade criptográfica do token;
-   páginas públicas;
-   APIs públicas de autenticação;
-   recurso solicitado;
-   perfil;
-   método HTTP convertido em ação.

Mapeamento:

-   GET → ver
-   HEAD → ver
-   OPTIONS → ver
-   POST → criar
-   PUT → editar
-   PATCH → editar
-   DELETE → excluir

Resultados:

-   sem autenticação em API → 401;
-   sessão inválida → 401;
-   operação sem permissão → 403;
-   página sem permissão → `/acesso-negado`.

O middleware não deve ser tratado como único controle de segurança de
dados.

------------------------------------------------------------------------

## 23. Vulnerabilidades npm

Após instalar `bcryptjs` e `jose`, o npm informou:

-   8 vulnerabilidades;
-   2 moderate;
-   5 high;
-   1 critical.

Não foi executado:

-   `npm audit fix`
-   `npm audit fix --force`

Essas vulnerabilidades precisam ser auditadas em lote técnico próprio.

Não aplicar correção automática sem analisar dependências afetadas e
risco de breaking changes.

------------------------------------------------------------------------

## 24. Identidade visual futura

Foi registrada uma etapa futura exclusiva para identidade visual
profissional.

Essa etapa deve ocorrer depois de autenticação/segurança estarem
estabilizadas e versionadas.

Quando chegar o momento, solicitar o logotipo atual e demais materiais
necessários.

Escopo previsto:

-   logotipo;
-   marca do CRM;
-   página de login;
-   sidebar/cabeçalho;
-   dashboard;
-   favicon;
-   cores institucionais;
-   tipografia;
-   cards;
-   espaçamentos;
-   loading;
-   erros;
-   aplicação consistente da identidade em Clientes, Representadas e
    demais módulos.

Não misturar redesign visual com lote de segurança ou migration
estrutural.

------------------------------------------------------------------------

## 25. Front-end --- ordem funcional atualizada

Estado funcional consolidado em 27/08/2026:

1.  Autenticação, sessão e controle de acesso — implantados e em uso.
2.  Clientes — liberado para operação real.
3.  Representadas — liberado para operação real no escopo concluído, com pendências específicas registradas.
4.  Interações — liberado para operação real.
5.  Orçamentos — liberado para operação real.
6.  Vendas — fluxo comercial real validado até envio oficial, confirmação e número oficial da Representada.
7.  Faturamento — estrutura iniciada; API e tela criadas; ainda não encerrado.
8.  Próximo foco: concluir Faturamento real.
9.  Depois: Títulos/Vencimentos.
10. Depois: Comissões.
11. Financeiro.
12. Contabilidade.
13. Agenda real.
14. Relatórios/Dashboard reais.
15. Identidade visual profissional em lote próprio.

Regras comerciais da Representada devem alimentar Orçamentos/Vendas sem
criar regra artificial única para todas as Representadas.

A responsabilidade principal do módulo Vendas termina quando o pedido
está comercialmente registrado e confirmado pela Representada.

Encadeamento oficial:

`INT → ORC → VEN → FATURAMENTO → TÍTULOS → COMISSÕES → FINANCEIRO`

------------------------------------------------------------------------

## 26. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referência:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

"Leia o DOCUMENTO_MESTRE_CRM.md atualizado até o checkpoint `3d1e999`.
Este documento é a fonte oficial de continuidade do projeto. Não refaça
Clientes, Representadas, Interações, Orçamentos ou o fluxo comercial já
validado da VEN-000001. Continue exatamente de Faturamento →
Títulos/Vencimentos → Comissões. Preserve todas as pendências registradas
nos capítulos 34 e 35. Não altere Prisma/schema sem necessidade funcional
comprovada e validação prévia."

Não depender exclusivamente da memória automática.

------------------------------------------------------------------------

## 27. Memória e fontes oficiais

A continuidade oficial deve depender de:

1.  GitHub
2.  `DOCUMENTO_MESTRE_CRM.md`
3.  histórico das conversas
4.  arquivos do repositório

O documento mestre deve ser atualizado em checkpoints relevantes.

GitHub e este documento são os dois principais pontos de recuperação do
projeto.

------------------------------------------------------------------------

## 28. Estado atual do projeto

Estado técnico:

**ESTÁVEL NOS MÓDULOS COMERCIAIS JÁ VALIDADOS E EM EVOLUÇÃO PARA
FATURAMENTO / TÍTULOS / COMISSÕES**

Último checkpoint funcional:

`3d1e999`

Mensagem:

`feat: consolida regras comerciais faturamento e fluxo de vendas`

Validações do lote:

-   TypeScript: OK — 0 erros;
-   `git diff --check`: OK;
-   Prisma: 5.22.0 preservado;
-   Prisma Client: gerado;
-   14 migrations aplicadas;
-   banco sincronizado;
-   `migrate diff`: nenhuma diferença;
-   Git commit: criado;
-   GitHub push: concluído;
-   working tree: limpo após push.

Módulos liberados para dados reais:

-   Clientes;
-   Representadas;
-   Interações;
-   Orçamentos;
-   Vendas;
-   envio oficial único do pedido;
-   confirmação da Representada;
-   número oficial do pedido da Representada;
-   histórico operacional e auditoria de autoria.

Primeira Venda real validada:

`VEN-000001`

Fluxo real validado:

`INT-000001 → ORC-000001 → VEN-000001`

Venda criada por:

-   Paula — Administrativo.

Envio e ações posteriores executadas por:

-   Luiz Fernando — Diretor.

Pedido oficial da Massari/Mercos:

`Pedido #14330 de 25.08.26`

Referência:

`14330`

Canal:

`Portal`

Regra de autoria:

-   quem cria a Venda permanece registrado;
-   quem executa cada evento posterior também permanece registrado;
-   usuário autorizado pode dar continuidade ao processo criado por outro usuário.

Ainda pendente:

-   conclusão do Faturamento;
-   Títulos/Vencimentos;
-   Comissões;
-   Financeiro;
-   conclusão das contas bancárias/recebimento;
-   formalização das contas 01/02/03;
-   exceções comerciais temporárias por cliente;
-   divergência pós-envio em cenário real;
-   segurança da tela de login;
-   segregação de obrigações por usuário/perfil;
-   Agenda real;
-   Relatórios/Dashboard reais;
-   lint;
-   auditoria das vulnerabilidades npm;
-   identidade visual;
-   Manual Operacional.

------------------------------------------------------------------------

## 29. Próximo passo exato

NÃO repetir os módulos já validados:

-   Clientes;
-   Representadas;
-   Interações;
-   Orçamentos;
-   fluxo comercial já validado de Vendas.

NÃO atualizar Prisma.

NÃO executar nova migration ou alteração de schema sem necessidade
funcional comprovada e validação prévia.

NÃO executar `npm audit fix` automaticamente.

NÃO executar novamente o setup inicial.

NÃO adicionar backups ao Git.

Próxima fase técnica:

1.  revisar o estado atual de `app/faturamentos/page.tsx`;
2.  revisar `app/api/faturamentos/route.ts`;
3.  utilizar Vendas reais confirmadas como base;
4.  registrar primeiro Faturamento real somente após validação da lógica;
5.  suportar uma ou várias NFs por Venda;
6.  tratar faturamento parcial, saldo, corte e motivo do corte;
7.  derivar Títulos/Vencimentos da NF e condição de pagamento;
8.  separar previsão de vencimento, prorrogação e fato real;
9.  suportar baixas totais e parciais;
10. controlar atraso/inadimplência de forma informativa;
11. integrar Comissões ao evento correto de reconhecimento;
12. confrontar cálculo do sistema com comissões reais já recebidas;
13. somente depois avançar para Financeiro.

Dados retroativos:

-   podem ser usados;
-   devem refletir fatos reais;
-   não inventar Interações/Orçamentos inexistentes;
-   preservar datas reais.

Manual Operacional:

-   permanece pendência formal;
-   não deve interromper a evolução dos módulos;
-   material de tela real deve ser preservado para futura elaboração.

------------------------------------------------------------------------

## 30. Regra de decisão técnica

Não alterar código apenas para silenciar erro.

Sempre identificar:

Problema → Causa raiz → Risco → Correção → Impacto

Evitar:

-   gambiarras;
-   casts excessivos;
-   duplicação de regra;
-   quebra de API existente;
-   alteração estrutural sem necessidade;
-   mudança de banco sem validação;
-   reescrita desnecessária;
-   criação de campos sem regra de negócio definida;
-   autorização somente visual;
-   APIs retornando dados globais para usuário de escopo restrito.

------------------------------------------------------------------------

## 31. Regra final

O sistema deve evoluir preservando:

-   segurança;
-   histórico;
-   previsibilidade;
-   rastreabilidade;
-   estabilidade;
-   isolamento de dados;
-   princípio de mínimo privilégio;
-   baixo risco de regressão;
-   clareza para manutenção futura.

A substituição integral de arquivos editados manualmente é a regra
operacional padrão para reduzir erros.

------------------------------------------------------------------------

## 32. Checkpoint histórico de isolamento de dados --- 23/08/2026

Este capítulo é histórico e foi superado operacionalmente pelo checkpoint `de78c93` de 24/08/2026. Deve ser preservado para rastreabilidade.

Checkpoint Git/GitHub:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

Branch:

`main`

Push para GitHub concluído com sucesso.

### 32.1 Escopo concluído

Foi concluído o primeiro lote de isolamento de dados por sessão,
escritório e usuário nas APIs de:

-   Clientes;
-   Vendas;
-   Interações.

Foram alterados e versionados exatamente 6 arquivos:

-   `app/api/clientes/route.ts`
-   `app/api/clientes/[id]/route.ts`
-   `app/api/vendas/route.ts`
-   `app/api/vendas/[id]/route.ts`
-   `app/api/interacoes/route.ts`
-   `app/api/interacoes/[id]/route.ts`

### 32.2 Clientes

A listagem passou a exigir sessão e filtrar por `escritorioId`.

Para Preposto, o acesso é limitado aos clientes em que:

-   `responsavelPrincipalId = usuario logado`;
-   OU exista `ClienteParticipacao` ativa para o usuário.

A criação registra:

-   `escritorioId` da sessão;
-   `originadoPorId`;
-   `responsavelPrincipalId`.

Preposto não pode utilizar a API para atribuir o cliente criado a outro
usuário.

GET, PUT e DELETE por ID também passaram a validar o escopo antes de
acessar ou modificar o registro.

### 32.3 Vendas

A listagem passou a exigir sessão e filtrar por `escritorioId`.

Para Preposto, o acesso é limitado às vendas em que:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A criação registra:

-   `escritorioId` da sessão;
-   `criadoPorId`;
-   `responsavelId`.

Preposto não pode criar venda em nome de outro usuário.

GET, PUT e DELETE por ID passaram a validar o escopo da venda antes da
operação.

Alteração de cliente durante edição também passou a validar o cliente
contra o escritório e o escopo permitido.

### 32.4 Interações

A listagem passou a exigir sessão e filtrar por `escritorioId`.

Para Preposto, o acesso é limitado às interações em que:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A criação registra:

-   `escritorioId` da sessão;
-   `criadoPorId`;
-   `responsavelId`.

Antes da criação, o cliente informado é validado contra:

-   `escritorioId`;
-   carteira permitida ao Preposto.

GET, PUT e DELETE por ID também passaram a validar o escopo antes da
operação.

Na edição, o cliente informado é novamente validado para impedir
associação da interação a cliente fora do escopo autorizado.

### 32.5 Agenda e Relatórios

Agenda e Relatórios foram revisados neste lote.

Estado encontrado:

-   Agenda ainda utiliza dados fictícios/estáticos;
-   Relatórios ainda utiliza métricas fictícias/estáticas;
-   essas páginas ainda não consultam os dados reais do banco.

Por esse motivo, não foram alteradas neste lote.

Quando forem integradas ao banco, deverão obrigatoriamente respeitar:

-   `escritorioId`;
-   perfil;
-   `usuarioId`;
-   escopo de carteira;
-   princípio de mínimo privilégio.

### 32.6 Validações do lote

Executado:

`npx tsc --noEmit`

Resultado:

-   0 erros TypeScript.

Executado:

`git diff --check`

Resultado:

-   nenhuma inconsistência reportada.

Executado:

`npm run build`

Resultado:

-   `Compiled successfully`;
-   42/42 páginas estáticas geradas;
-   Middleware compilado;
-   APIs processadas;
-   build de produção concluído com sucesso.

Observação:

O build continua informando:

-   `Skipping validation of types`
-   `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint permanece pendente para lote técnico próprio.

### 32.7 Estado do arquivo temporário Prisma

O arquivo:

`prisma/proposed_schema_diff.sql`

continua local, não rastreado pelo Git e não foi incluído no checkpoint.

Estado esperado:

`?? prisma/proposed_schema_diff.sql`

Esse arquivo continua protegido pelas regras anteriores:

-   não executar;
-   não tratar como migration oficial;
-   não adicionar ao Git;
-   não excluir sem nova análise técnica.

### 32.8 Regra operacional consolidada de edição de arquivos

A partir deste checkpoint, para reduzir risco de erro manual:

1.  Toda alteração manual deve começar com o comando para abrir o
    arquivo no Bloco de Notas.
2.  Quando o conteúdo atual já for conhecido e confiável, não solicitar
    novamente o arquivo.
3.  Toda alteração deve ser entregue como conteúdo integral, final e
    revisado do arquivo.
4.  O usuário deve substituir o arquivo inteiro, e não inserir
    manualmente trechos.
5.  Alteração parcial só será usada quando a substituição integral for
    tecnicamente inviável e isso for explicitamente explicado.
6.  Após alteração de código, validação rápida padrão:
    `npx tsc --noEmit`.
7.  Validações amplas ficam para o fechamento do lote.
8.  Checkpoint Git/GitHub somente após validação.
9.  Não usar `git add .` quando houver arquivo local protegido.
10. Adicionar explicitamente somente os arquivos aprovados.

### 32.9 Estado atual após o checkpoint a7668fd

Concluído:

-   infraestrutura de autenticação;
-   middleware;
-   matriz inicial de permissões;
-   isolamento de Clientes;
-   isolamento de Vendas;
-   isolamento de Interações;
-   proteção das rotas por ID desses três módulos;
-   validação TypeScript;
-   validação de diff;
-   build de produção;
-   checkpoint Git/GitHub.

Ainda pendente:

-   execução segura do setup inicial real;
-   criação real do Diretor;
-   criação do Administrativo, se aplicável;
-   criação futura de Preposto de teste;
-   testes funcionais dos três perfis;
-   validação prática do isolamento entre usuários;
-   integração real da Agenda;
-   integração real dos Relatórios;
-   lint;
-   auditoria das vulnerabilidades npm;
-   conclusão das contas bancárias/recebimento;
-   formalização das contas 01/02/03;
-   integração de regras comerciais com Vendas;
-   integração completa de comissão;
-   integração completa de faturamento;
-   integração completa de financeiro;
-   identidade visual em lote próprio.

### 32.10 Próxima etapa

O isolamento estrutural das APIs de Clientes, Vendas e Interações foi
concluído.

A próxima fase deve começar pela confirmação do estado real do banco
antes do setup inicial.

Não executar migration ou alteração de schema automaticamente.

Não executar `npm audit fix` automaticamente.

Não adicionar `prisma/proposed_schema_diff.sql` ao Git.

Preservar o checkpoint:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

GitHub e este documento são os dois principais pontos de recuperação do
projeto.

## 33. Checkpoint comercial e liberação operacional --- 24/08/2026

Checkpoint Git/GitHub:

`de78c932810979b9796434d1cc7651b093d8de25`

Mensagem:

`feat: conclui fluxo comercial de orcamentos e vendas`

Branch:

`main`

Push confirmado no GitHub.

### 33.1 Módulos concluídos nesta fase

-   Clientes;
-   Representadas;
-   Interações;
-   Orçamentos;
-   Vendas;
-   envio do pedido à Representada;
-   confirmação do recebimento;
-   histórico operacional da Venda.

### 33.2 Orçamentos

Regras consolidadas:

-   orçamento nasce de necessidade comercial;
-   pode ou não nascer de uma Interação;
-   orçamento existente NÃO gera Venda automaticamente;
-   primeiro deve ser enviado ao cliente;
-   somente após aprovação/aceite do cliente nasce a Venda;
-   cada Orçamento pode gerar no máximo uma Venda;
-   aprovação e criação da Venda ocorrem de forma transacional;
-   falha na criação da Venda não deve deixar o Orçamento aprovado
    isoladamente;
-   orçamento não gera Financeiro ou Comissão automaticamente;
-   validade padrão é calculada pela aplicação;
-   condição de pagamento deve refletir a política comercial aplicável
    da Representada quando cadastrada.

### 33.3 Vendas

Numeração permanente:

`VEN-000001`, `VEN-000002`, ...

Origem rastreável:

-   `INT → ORC → VEN`;
-   `ORC → VEN`;
-   Venda direta/retroativa.

Status operacional de referência:

-   Aguardando envio;
-   Aguardando confirmação;
-   Confirmado;
-   Faturado;
-   Cancelado.

Fluxo consolidado:

1.  cliente aprova Orçamento;
2.  Venda é criada com status `Aguardando envio`;
3.  primeiro envio à Representada é registrado;
4.  status passa para `Aguardando confirmação`;
5.  ação principal passa a ser confirmar recebimento;
6.  REGRA HISTÓRICA SUPERADA EM 27/08/2026: novos envios eram permitidos como eventos adicionais; a regra atual permite apenas um envio oficial inicial;
7.  confirmação pode usar E-mail, WhatsApp, Ligação, Portal, Presencial
    ou Outro;
8.  referência/número/protocolo é opcional conforme o processo real da
    Representada, mas a confirmação deve possuir evidência operacional;
9.  número oficial de pedido da Representada pode ser registrado depois;
10. histórico anterior nunca deve ser sobrescrito.

A diversidade de Representadas deve ser preservada. Não criar regra
única impondo número de pedido ou canal obrigatório para todas.

### 33.4 VendaEvento

`VendaEvento` registra de forma genérica:

-   Venda criada;
-   Pedido enviado;
-   Recebimento confirmado;
-   Pedido registrado;
-   Contato com Representada;
-   outros eventos futuros compatíveis.

Campos principais:

-   data;
-   tipo;
-   canal;
-   referência;
-   descrição;
-   usuário responsável.

REGRA HISTÓRICA SUPERADA EM 27/08/2026:

Eventos múltiplos de envio deixaram de ser tratados como novos envios
normais. A regra atual preserva um único envio oficial inicial. Fatos
posteriores devem ser classificados como confirmação, número oficial,
contato ou alteração/divergência pós-envio.

### 33.5 Limite de responsabilidade do módulo Vendas

O módulo Vendas termina quando o pedido está comercialmente registrado e
confirmado pela Representada.

Não concentrar no módulo Vendas responsabilidades próprias de:

-   Faturamento;
-   Títulos;
-   Comissões;
-   Financeiro.

O encadeamento oficial passa a ser:

`INT → ORC → VEN → FATURAMENTO → TÍTULOS → COMISSÕES → FINANCEIRO`

### 33.6 Base de teste zerada

Antes da entrada de dados reais foi executada limpeza controlada da massa
comercial fictícia.

Após a limpeza, inventário confirmado:

-   Clientes: 0;
-   Participações de clientes: 0;
-   Representadas: 0;
-   Contratos de representadas: 0;
-   Regras comerciais: 0;
-   Contas de recebimento: 0;
-   Interações: 0;
-   Orçamentos: 0;
-   Vendas: 0;
-   Eventos de Venda: 0;
-   Faturamentos: 0;
-   Títulos de Venda: 0;
-   Movimentos de comissão: 0;
-   Notas de comissão: 0;
-   Financeiros: 0.

Preservados:

-   Escritório Luiz Sodré Representações;
-   Luiz Fernando — Diretor;
-   Paula — Administrativo;
-   autenticação;
-   schema;
-   migrations;
-   código versionado.

### 33.7 Sequenciais reiniciados antes da operação real

Foram reiniciadas as sequences PostgreSQL de:

-   Interação;
-   Orçamento;
-   Venda.

Primeiros registros reais esperados:

-   `INT-000001`;
-   `ORC-000001`;
-   `VEN-000001`.

Cliente não usa sequence PostgreSQL para `codigo`.

A regra atual da aplicação foi preservada:

-   primeiro cliente real: `CLI-000001`;
-   próximos: `CLI-000002`, `CLI-000003`, ...

NÃO alterar para `S001` sem decisão nova explícita.

### 33.8 Operação real pela Paula

Paula pode iniciar alimentação real dos módulos concluídos.

Procedimento inicial:

-   cadastrar Clientes manualmente;
-   cadastrar Representadas manualmente;
-   registrar Interações reais;
-   criar Orçamentos reais;
-   registrar aprovações;
-   acompanhar Vendas até confirmação da Representada.

Importação em lote:

-   existe tecnicamente;
-   não faz parte do procedimento inicial;
-   Paula foi orientada a não utilizar;
-   não criar tarefa adicional apenas para bloquear essa função neste
    momento, salvo nova decisão.

### 33.9 Dados retroativos

É permitido inserir Vendas retroativas de junho, julho e agosto.

Regra:

-   registrar o que efetivamente aconteceu;
-   não inventar Interações ou Orçamentos inexistentes;
-   quando não existir histórico de Interação/Orçamento, usar Venda
    direta/retroativa;
-   preservar datas reais.

Esses dados serão usados para validar os próximos módulos com situações
reais.

### 33.10 Próxima fase: Faturamento e Comissões

Objetivo da próxima conversa:

-   implementar Faturamento sobre Vendas confirmadas;
-   suportar múltiplas NFs por Venda;
-   suportar faturamento parcial;
-   calcular saldo;
-   registrar cortes e motivos;
-   criar/usar Títulos de Venda;
-   conectar Comissão ao evento correto de reconhecimento;
-   confrontar o sistema com comissões reais já recebidas.

As comissões reais já recebidas poderão ser usadas como massa de
validação. Isso é desejável porque permite comparar cálculo esperado
versus fato financeiro real.

### 33.11 Manual Operacional

Pendência formal criada:

**Manual Operacional do CRM — Paula**

Estratégia:

-   não produzir manual completo enquanto poucos módulos estiverem
    concluídos;
-   quando conveniente, criar versão Fase 1 apenas de:
    -   Clientes;
    -   Representadas;
    -   Interações;
    -   Orçamentos;
    -   Vendas;
-   atualizar posteriormente com Faturamento, Comissões e demais
    módulos;
-   manual definitivo somente após estabilização geral do CRM.

### 33.12 Estado local após limpeza e checkpoint

`git status --short` esperado:

Estado histórico superado pelo checkpoint `3d1e999`.

Os arquivos temporários de diagnóstico foram removidos em 27/08/2026.
O estado atual está documentado no capítulo 14.

------------------------------------------------------------------------

## 34. Consolidação de 27/08/2026 --- banco, faturamento e fluxo real de Venda

### 34.1 Backup local do PostgreSQL

Antes da consolidação estrutural foi criado e validado backup local:

`backups/crm_luiz_sodre_antes_consolidacao_2026-08-27.backup`

Validação:

-   arquivo existente;
-   tamanho confirmado;
-   `pg_restore -l` conseguiu listar o conteúdo;
-   backup criado com PostgreSQL 16.13.

Regra:

-   `/backups/` está no `.gitignore`;
-   backup NÃO deve ser versionado;
-   não utilizar cópias paralelas do projeto como linha oficial de desenvolvimento;
-   GitHub continua sendo a fonte oficial do código.

### 34.2 Regra de envio oficial da Venda

Cada Venda possui UM único envio oficial inicial à Representada.

Fluxo atual:

1.  Venda nasce em `Aguardando envio`;
2.  envio oficial é registrado uma única vez;
3.  status passa para `Aguardando confirmação`;
4.  não existe segundo “envio normal”;
5.  backend também bloqueia duplicidade;
6.  fatos posteriores devem ser classificados corretamente.

### 34.3 Confirmação da Representada

A confirmação:

-   só pode existir após envio oficial;
-   deve possuir referência ou descrição real;
-   deve ser única;
-   muda a Venda para `Confirmado`;
-   não deve criar artificialmente data de envio inexistente.

### 34.4 Número oficial do pedido

O número oficial da Representada:

-   deve ser registrado como dado estruturado;
-   não deve ser sobrescrito silenciosamente;
-   eventual correção deve virar alteração/divergência;
-   deve preservar exatamente o identificador real da Representada.

### 34.5 Alteração / divergência pós-envio

Após o envio oficial:

-   mudança relevante não cria novo envio normal;
-   não cria nova Venda automaticamente;
-   não apaga o histórico original;
-   deve ser registrada como `Alteração pós-envio`;
-   descrição é obrigatória;
-   referência é opcional quando existir;
-   cada ocorrência deve permanecer no histórico.

Pendência:

-   testar cenário real após confirmação;
-   definir efeito de eventual reenvio corretivo;
-   definir impacto em Faturamento, Títulos e Comissões.

### 34.6 Condições de pagamento

Formato operacional:

-   21
-   21-28
-   21-28-35
-   21-28-35-42
-   etc.

Condição `0`:

-   somente negociação à vista.

Regra:

-   condições padrão devem preferencialmente ficar na Representada;
-   condição especial pode ser registrada na negociação específica;
-   futura interface deve restringir entrada a números e formatar separação automaticamente.

### 34.7 Títulos e vencimentos

Controle de Títulos é interno ao escritório.

Nem todas as Representadas fornecem número externo.

Portanto:

-   CRM pode usar `TIT-xxxxxx`;
-   número externo é opcional;
-   NF de venda é referência operacional principal.

O sistema deve distinguir:

-   vencimento previsto;
-   vencimento prorrogado;
-   pagamento real;
-   atraso;
-   inadimplência;
-   baixa total;
-   baixa parcial.

Previsão nunca deve ser tratada como fato definitivo.

### 34.8 Regra específica por cliente

Situação operacional identificada:

-   cliente pode ser especial hoje e deixar de ser;
-   outro cliente pode passar a ser especial futuramente.

Regra conceitual:

-   não inflar Representada com dezenas de regras temporárias;
-   regra padrão pertence à Representada;
-   exceção de cliente precisa ter tratamento próprio;
-   histórico e vigência precisam ser preservados.

Pendência arquitetural:

-   definir modelagem de exceções por cliente;
-   impacto em Orçamento, Venda, Faturamento e Comissão;
-   não alterar Prisma antes de análise própria.

### 34.9 Segurança da tela de login

Pendência crítica:

Foi observado lembrete/obrigação operacional aparecendo antes da autenticação.

Regra final:

-   nenhuma informação interna deve aparecer antes do login;
-   após login, obrigações devem respeitar escritório, usuário, perfil e escopo;
-   Preposto não deve ver pendências privadas de Diretoria ou Administrativo.

Essa correção deve ter lote próprio de segurança.

### 34.10 Interface e ergonomia

A tela de Venda foi reorganizada para uma caixa clara de ação comercial.

Pendência visual:

-   diferenciar por cor:
    -   confirmação;
    -   divergência;
    -   registro documental;
-   manter semântica consistente no CRM;
-   usar telas reais como material para futuro Manual Operacional.

Mercos/Massari pode ser usado apenas como referência de ergonomia, não como sistema a ser copiado.

------------------------------------------------------------------------

## 35. Pendências oficiais para próximas conversas

### 35.1 Prioridade imediata

1.  concluir Faturamento;
2.  validar lançamento real de NF;
3.  faturamento parcial;
4.  saldo;
5.  cortes;
6.  condição de pagamento;
7.  gerar/controlar Títulos;
8.  previsão x vencimento real;
9.  prorrogação;
10. baixa parcial/total;
11. inadimplência informativa;
12. integrar reconhecimento de Comissão.

### 35.2 Comissões

Desenvolver/validar:

-   prevista;
-   devida;
-   recebida;
-   estornada;
-   recuperada;
-   ajuste;
-   faturamento x liquidez;
-   competência;
-   parcelas;
-   NF de comissão;
-   exigência ou não de NF;
-   contas de recebimento;
-   confronto com relatórios reais das Representadas.

### 35.3 Vendas

Pendências:

-   testar divergência pós-envio em caso real;
-   testar consequência após pedido confirmado;
-   definir reenvio corretivo;
-   manter envio oficial único;
-   refinar cores e semântica dos botões.

### 35.4 Segurança

Pendências críticas:

-   remover informação interna da tela pré-login;
-   filtrar alertas pós-login por usuário/perfil/escritório;
-   validar Preposto real;
-   testar isolamento prático entre usuários;
-   revisar futuras APIs para RBAC + escopo.

### 35.5 Clientes e regras especiais

Pendência:

-   modelar exceções comerciais temporárias por cliente;
-   histórico;
-   vigência;
-   integração com Orçamento, Venda, Faturamento e Comissão.

### 35.6 Representadas

Pendências:

-   concluir `ContaBancaria`;
-   formalizar Contas 01/02/03;
-   prioridade;
-   finalidade;
-   possível rateio futuro;
-   testes adicionais com dados reais.

### 35.7 Infraestrutura e qualidade

Pendências:

-   lint;
-   auditoria das vulnerabilidades npm;
-   não executar `npm audit fix` automaticamente;
-   novo build completo em lote técnico;
-   identidade visual profissional;
-   favicon/logotipo;
-   Manual Operacional;
-   Agenda real;
-   Relatórios reais;
-   Dashboard real.

------------------------------------------------------------------------

## 36. Próximo ponto oficial de continuidade

Checkpoint oficial:

`3d1e999`

Próxima frente:

`FATURAMENTO → TÍTULOS/VENCIMENTOS → COMISSÕES`

Ao iniciar nova conversa:

1.  ler este Documento Mestre;
2.  não refazer módulos já validados;
3.  revisar `app/faturamentos/page.tsx`;
4.  revisar `app/api/faturamentos/route.ts`;
5.  usar Vendas reais confirmadas como base;
6.  não alterar Prisma/schema sem necessidade funcional comprovada;
7.  preservar todas as pendências do capítulo 35.

Mensagem de abertura recomendada:

"Leia o DOCUMENTO_MESTRE_CRM.md atualizado até o checkpoint `3d1e999`.
Esse é o estado oficial do CRM Luiz Sodré Representações. Não refaça
Clientes, Representadas, Interações, Orçamentos ou o fluxo comercial já
validado da VEN-000001. Continue exatamente de Faturamento →
Títulos/Vencimentos → Comissões. Preserve as pendências registradas nos
capítulos 34 e 35 e não altere Prisma/schema sem necessidade funcional
comprovada."

------------------------------------------------------------------------
## 37. CONSOLIDAÇÃO OFICIAL DE 28/08/2026 — NOVO PONTO DE CONTINUIDADE

Este capítulo atualiza e SUPERA, quando houver conflito, o estado operacional
descrito nos capítulos anteriores.

Os capítulos anteriores devem permanecer preservados como histórico técnico
e funcional do projeto.

### 37.1 Checkpoint protegido atual

O último checkpoint funcional protegido no Git/GitHub é:

`0bc1a38`

Mensagem:

`feat: adiciona controle operacional de comissoes`

Branch:

`main`

Push para GitHub concluído.

Após o push, `git status --short` permaneceu vazio.

Checkpoints relevantes posteriores ao antigo `3d1e999`:

- `2b8caaf` — autenticação e identidade visual;
- `1f3d8e0` — controle operacional de Faturamentos;
- `b507933` — Títulos e Vencimentos;
- `d51d901` — baixa e prorrogação de Títulos;
- `0bc1a38` — controle operacional de Comissões.

Portanto, referências anteriores que indicam `3d1e999` como checkpoint
funcional atual estão SUPERADAS por este capítulo.

------------------------------------------------------------------------

## 38. Estado funcional atual dos módulos financeiros comerciais

### 38.1 Faturamento

O módulo de Faturamento possui controle operacional de pendências.

Situações operacionais implementadas:

- Sem previsão;
- Aguardando faturamento;
- Previsto para hoje;
- Previsão vencida;
- Parcialmente faturado.

O saldo pendente considera:

`valor da Venda - faturamentos - cortes`

A condição de pagamento foi corrigida para aceitar a convenção operacional
real do escritório.

Exemplos válidos:

- `30/45/60`;
- `30-45-60`;
- demais prazos crescentes equivalentes;
- `0` para pagamento à vista.

A Venda real `VEN-000001` possui condição:

`30/45/60`

A simulação foi validada com geração correta de três vencimentos e divisão
exata do valor.

Nenhuma NF fictícia foi registrada durante essa validação.

### 38.2 Títulos e Vencimentos

Foi criado módulo próprio:

`/titulos`

O módulo distingue:

- A vencer;
- Vence hoje;
- Vencido;
- Prorrogado;
- Pago.

Foram implementadas operações de:

- prorrogação de vencimento;
- baixa parcial;
- baixa total.

A prorrogação preserva o vencimento original.

A baixa preserva histórico através de `TituloVendaBaixa`.

Nenhum título ou baixa fictícia foi criado para validar a interface.

Títulos e Vencimentos permanecem tecnicamente em rota própria, mas
conceitualmente fazem parte do Financeiro comercial.

### 38.3 Comissões

Foi criada a primeira versão operacional:

`/comissoes`

A versão atual é deliberadamente de leitura.

Ela diferencia:

- comissão prevista;
- comissão devida;
- comissão recebida;
- estornada;
- recuperada;
- ajuste;
- movimentos;
- parcelas pendentes.

Não existe geração automática de `ComissaoMovimento` neste momento.

Essa decisão é intencional para impedir reconhecimento financeiro incorreto
antes da validação completa das políticas reais de comissão de cada
Representada.

A Venda real `VEN-000001` apresentou corretamente:

- Representada: MASSARI;
- comissão prevista: R$ 134,46;
- percentual preservado na Venda: 7%;
- movimentos de comissão: 0.

A ausência de movimento é correta enquanto não ocorrer o fato financeiro
definido pela política da Representada.

------------------------------------------------------------------------

## 39. Regras reais de reconhecimento de comissão

### 39.1 Conceitos separados

O CRM deve tratar separadamente:

1. previsão de comissão;
2. gatilho de reconhecimento;
3. competência/fechamento;
4. pagamento da comissão;
5. NF de comissão, quando exigida;
6. recebimento efetivo;
7. tributação da NF de serviços.

Venda existente gera inicialmente comissão PREVISTA.

Ela não deve se tornar automaticamente DEVIDA apenas porque a Venda existe.

### 39.2 Reconhecimento por Faturamento

Quando a Representada trabalha por Faturamento:

- a emissão real da NF de venda é o gatilho;
- a comissão passa a ser DEVIDA sobre a base efetivamente faturada;
- os eventos pertencem ao período de fechamento aplicável;
- o pagamento segue a política da respectiva Representada.

Faturamento parcial deve futuramente respeitar a base efetivamente faturada
e impedir duplicidade de reconhecimento.

### 39.3 Reconhecimento por Liquidez

Quando a Representada trabalha por Liquidez:

- a baixa/pagamento efetivo do título é o gatilho;
- a comissão passa a ser DEVIDA sobre o valor efetivamente liquidado;
- os eventos pertencem ao período de fechamento aplicável;
- o pagamento segue a política da respectiva Representada.

Baixas parciais deverão ser tratadas de maneira proporcional quando essa
regra for implementada, sempre evitando reconhecimento duplicado.

### 39.4 Política real da MASSARI

Política informada e validada operacionalmente:

Regra de reconhecimento:

`Liquidez`

Fechamento:

`01 a 30`

Pagamento da comissão:

`dia 10 do mês subsequente`

Exige NF de comissão:

`Sim`

### 39.5 Exceção real da MASSARI — dia 31

Foi identificada uma regra operacional importante:

pagamentos/baixas ocorridos especificamente no dia 31 não entram no
fechamento normal de 01 a 30.

Esses valores ficam para o ciclo seguinte ao próximo.

Exemplo:

- baixa em 30/08/2026 → pagamento previsto da comissão em 10/09/2026;
- baixa em 31/08/2026 → pagamento previsto da comissão em 10/10/2026.

Essa regra NÃO deve ser codificada globalmente para todas as Representadas.

Ela deve ser configurável por Representada, porque outras empresas podem
possuir políticas diferentes.

### 39.6 NF de comissão e tributação — MASSARI

Informações reais para futura validação da área de Contabilidade:

- MASSARI exige NF de comissão;
- imposto informado sobre a NF de serviços: 6%;
- pagamento do imposto: dia 20;
- referência do pagamento do imposto: mês anterior.

Essas informações pertencem conceitualmente ao fluxo:

`COMISSÃO → NF DE COMISSÃO → CONTABILIDADE`

O imposto não deve modificar o valor comercial bruto da comissão.

O sistema deve conseguir distinguir futuramente:

- comissão bruta;
- imposto;
- valor líquido;
- competência;
- NF emitida;
- vencimento/pagamento da obrigação tributária.

------------------------------------------------------------------------

## 40. Decisão de pausa da automação de Comissões

A automação financeira de Comissões fica temporariamente PAUSADA.

Motivo:

o uso prático com dados reais está revelando regras e necessidades que não
devem ser presumidas antes de uma alteração estrutural.

Antes de criar movimentos automáticos de comissão, será realizada uma
varredura prática dos cadastros e módulos.

O objetivo é evitar diversas migrations pequenas e sucessivas.

Se alterações de schema forem realmente necessárias, as necessidades
compatíveis deverão ser agrupadas em um único lote planejado.

Não alterar Prisma apenas porque uma necessidade isolada foi identificada.

------------------------------------------------------------------------

## 41. Varredura prática obrigatória antes da próxima alteração do Prisma

### 41.1 Cadastro automático por CNPJ

Avaliar e desenvolver preenchimento cadastral por CNPJ para:

- Clientes;
- Representadas.

Objetivo:

ao informar um CNPJ válido, consultar uma fonte adequada e preencher
automaticamente os dados cadastrais disponíveis.

O usuário deve visualizar, conferir e poder corrigir os dados antes da
gravação definitiva.

A implementação deve considerar falha ou indisponibilidade da consulta
externa sem impedir cadastro manual.

### 41.2 Endereço estruturado

Revisar Clientes e Representadas para verificar exatamente quais campos já
existem antes de alterar o schema.

Estrutura desejada:

- logradouro;
- número;
- complemento;
- bairro;
- cidade;
- estado;
- CEP.

Necessidade já identificada:

Representadas precisam apresentar formalmente o bairro.

Também deve ser avaliado campo próprio para número do endereço, evitando
depender de o usuário lembrar de colocar o número dentro do campo de rua.

Não criar campos duplicados sem antes conferir o modelo atual.

### 41.3 Regra para novas necessidades descobertas

Durante a alimentação real, revisar progressivamente:

- Clientes;
- Representadas;
- Interações;
- Orçamentos;
- Vendas;
- Faturamentos;
- Títulos;
- Comissões;
- Financeiro;
- Contabilidade.

Novas necessidades identificadas durante o uso devem ser registradas.

Não alterar Prisma a cada descoberta isolada.

Primeiro consolidar o conjunto de necessidades.

Depois avaliar quais realmente exigem banco de dados e quais podem ser
resolvidas através de dados e relacionamentos já existentes.

------------------------------------------------------------------------

## 42. Remoção de dados fictícios do frontend

Antes da utilização operacional intensiva do CRM com dados reais, deve ser
feita uma varredura completa das telas que ainda apresentam informações
fictícias ou estáticas como se fossem dados reais.

Áreas já identificadas historicamente incluem:

- Dashboard;
- Agenda;
- Relatórios;
- Financeiro antigo;
- eventuais cards, gráficos ou indicadores ainda não ligados ao banco.

Regra definitiva:

dados fictícios não podem ser apresentados como situação real do escritório.

Quando uma tela ainda não possuir fonte de dados real, utilizar
preferencialmente:

- zero;
- estado vazio;
- `Sem dados`;
- informação clara de módulo ainda não integrado;

em vez de valores inventados.

Dados institucionais, textos explicativos ou exemplos claramente
identificados como exemplos não são considerados dados operacionais
fictícios.

A remoção deve ser feita cuidadosamente para não eliminar dados reais já
cadastrados no PostgreSQL.

------------------------------------------------------------------------

## 43. Entrada e validação com dados reais

O CRM passará por validação contínua durante toda a sua construção.

A operação real não é apenas uso do sistema: também é mecanismo de
validação funcional.

Serão progressivamente cadastradas:

- vendas reais da semana;
- vendas retroativas reais;
- dados reais dos meses anteriores escolhidos;
- faturamentos reais;
- títulos reais;
- demais fatos comerciais efetivamente ocorridos.

Regra:

não inventar fatos retroativos para completar fluxo.

Quando não houve Interação ou Orçamento histórico, não criar registros
fictícios apenas para preencher etapas.

Preservar datas e fatos reais.

Problemas encontrados durante o uso devem ser analisados e corrigidos até a
construção final do CRM.

------------------------------------------------------------------------

## 44. Clientes — análise ABC e concentração do faturamento

Foi identificada necessidade gerencial de medir concentração comercial da
carteira de Clientes.

O objetivo é responder perguntas como:

- quantos Clientes representam a maior parte do faturamento;
- quanto os Clientes A representam;
- quanto os Clientes B representam;
- quanto os Clientes C representam;
- qual o grau de concentração da carteira.

Referência conceitual:

`Análise ABC / Princípio de Pareto`

Exemplo gerencial:

uma parcela menor da carteira pode representar aproximadamente 80% do
faturamento, enquanto uma parcela maior representa aproximadamente os 20%
restantes.

Esse exemplo NÃO deve ser transformado automaticamente em regra rígida
20/80.

A distribuição real deve ser analisada primeiro.

### 44.1 Local recomendado

A informação deverá aparecer em dois níveis.

No módulo Clientes:

- classificação A/B/C;
- faturamento do Cliente;
- participação percentual;
- posição/ranking;
- período considerado.

Em Gestão Comercial/Dashboard:

- quantidade de Clientes A/B/C;
- percentual da carteira em cada classe;
- percentual do faturamento;
- curva de Pareto;
- concentração comercial;
- evolução por período.

### 44.2 Classificação dinâmica

A classificação A/B/C não deve ser simplesmente cadastrada manualmente como
característica permanente do Cliente.

Ela deve ser calculada a partir de dados comerciais reais e de um período
definido.

Um Cliente pode mudar de classe ao longo do tempo.

A fórmula e os limites definitivos de A/B/C serão validados após existir
volume suficiente de dados reais no CRM.

------------------------------------------------------------------------

## 45. Clientes — quantidade e relacionamento com Representadas

Foi identificada uma necessidade comercial importante durante revisão das
telas.

Um mesmo Cliente pode comprar produtos de várias Representadas.

Existem Clientes reais que compram de três, quatro ou mais Representadas.

O CRM deve permitir identificar essa amplitude de relacionamento de forma
rápida e visual.

### 45.1 Indicador na tela do Cliente

Ao abrir um Cliente, apresentar de forma discreta um indicador semelhante a:

`Representadas relacionadas: 4`

ou equivalente visual compatível com o padrão definitivo da interface.

O objetivo é permitir que o usuário compreenda a amplitude comercial do
Cliente imediatamente, sem poluir a tela.

### 45.2 Detalhamento das Representadas

Além da quantidade, deve ser possível visualizar quais Representadas estão
relacionadas ao Cliente.

A visualização deve distinguir, quando aplicável:

- relacionamento atual/ativo;
- relacionamento histórico;
- Representada atualmente inativa.

Uma Representada não deve desaparecer do histórico comercial do Cliente
apenas porque foi posteriormente inativada.

### 45.3 A contagem não deve ser um número manual

Não criar simplesmente um campo como:

`quantidadeRepresentadas = 4`

para ser preenchido manualmente.

A quantidade deve ser derivada dos relacionamentos e fatos comerciais reais
existentes no CRM, evitando divergência entre a contagem e o histórico.

Antes de decidir se é necessário novo relacionamento no Prisma, revisar o
que já pode ser obtido através de:

- Vendas;
- Orçamentos;
- Interações;
- regras comerciais;
- demais vínculos já existentes.

### 45.4 Critério exato de relacionamento

Ainda deve ser validado com dados reais o critério definitivo para afirmar
que um Cliente "compra de uma Representada".

Possíveis dimensões que deverão ser analisadas:

- existência de Venda;
- histórico de compra;
- relacionamento comercial sem Venda recente;
- Representada ativa ou inativa;
- período da última compra.

Não criar uma definição artificial antes da validação prática.

### 45.5 Uso gerencial futuro

Essa informação poderá alimentar futuramente:

- oportunidades de cross-selling;
- Clientes atendidos por apenas uma Representada;
- Clientes multirrepresentadas;
- Representadas ainda não trabalhadas em determinado Cliente;
- cobertura comercial da carteira;
- análise de concentração;
- análise ABC;
- oportunidades de expansão por Cliente.

A informação deverá ser apresentada de forma simples no cadastro individual
e de forma analítica em Gestão Comercial/Dashboard.

------------------------------------------------------------------------

## 46. Estratégia para próxima sessão de desenvolvimento

A próxima sessão NÃO deve começar pela automação de Comissões.

A sequência oficial passa a ser:

1. continuar utilizando o CRM com dados reais;
2. executar cadastros reais e observar dificuldades práticas;
3. revisar Clientes e Representadas;
4. avaliar preenchimento automático por CNPJ;
5. revisar endereço, bairro e número;
6. mapear necessidades adicionais de cadastro;
7. localizar dados fictícios ainda existentes no frontend;
8. remover ou substituir esses dados por estados reais/vazios;
9. revisar a relação Cliente × Representadas;
10. preparar futura análise ABC/Pareto;
11. consolidar todas as necessidades que possam exigir alteração estrutural;
12. somente então decidir sobre alteração única e planejada do Prisma;
13. continuar entrada de Vendas/Faturamentos/Títulos reais;
14. retornar posteriormente à automação de Comissões;
15. depois avançar para Financeiro e Contabilidade.

A regra central desta fase é:

`VALIDAR NA PRÁTICA → IDENTIFICAR → CONSOLIDAR → ALTERAR UMA VEZ → VALIDAR NOVAMENTE`

------------------------------------------------------------------------

## 47. Regra de continuidade e proteção do projeto

O desenvolvimento continuará sendo validado durante toda a construção do
sistema.

Não considerar uma tela definitivamente encerrada apenas porque compilou ou
funcionou uma vez.

O uso real pode revelar:

- campos faltantes;
- regras comerciais específicas;
- problemas de ergonomia;
- dados desnecessários;
- relacionamentos não previstos;
- inconsistências de cálculo;
- oportunidades gerenciais.

Essas descobertas devem ser incorporadas de maneira controlada.

Não usar dados fictícios para esconder ausência de integração.

Não alterar regras financeiras com base em suposição.

Não alterar Prisma sem necessidade funcional comprovada.

Quando houver necessidade de alteração estrutural, preferir lote único,
planejado e validado.

Preservar sempre:

- histórico;
- rastreabilidade;
- segurança;
- dados reais;
- checkpoints Git/GitHub;
- regras específicas por Representada;
- possibilidade de evolução futura.

------------------------------------------------------------------------

## 48. Próximo ponto oficial de continuidade

Checkpoint funcional protegido:

`0bc1a38`

Estado:

Faturamento, Títulos/Vencimentos e primeira visão operacional de Comissões
já desenvolvidos.

Comissões:

automação temporariamente pausada até validação com maior quantidade de
dados reais e consolidação das políticas das Representadas.

Próxima frente:

`VARREDURA PRÁTICA → CADASTROS → CNPJ/ENDEREÇO → DADOS FICTÍCIOS → CLIENTE × REPRESENTADAS → NECESSIDADES DE PRISMA`

Somente depois:

`COMISSÕES → FINANCEIRO → CONTABILIDADE`

Mensagem recomendada para abrir a próxima conversa:

"Leia integralmente o DOCUMENTO_MESTRE_CRM.md, especialmente os capítulos
37 a 48.

O checkpoint funcional protegido é `0bc1a38`.

Não refaça Faturamento, Títulos/Vencimentos ou a primeira versão de
Comissões.

A automação de Comissões está temporariamente pausada.

Continue pela varredura prática do CRM com dados reais.

As prioridades são revisar Clientes e Representadas, preenchimento por CNPJ,
endereço estruturado com bairro e número, localizar e eliminar dados
operacionais fictícios do frontend, avaliar Cliente × Representadas e
preparar futura análise ABC/Pareto.

Não altere Prisma a cada descoberta.

Primeiro consolide todas as necessidades estruturais e, somente se houver
necessidade funcional comprovada, planeje uma alteração única.

Preserve integralmente as regras de comissão já validadas, especialmente a
política da MASSARI e a exceção do dia 31."

------------------------------------------------------------------------

------------------------------------------------------------------------

## 49. CONSOLIDAÇÃO OFICIAL DE 04/09/2026 — NOVO CHECKPOINT FUNCIONAL

Este capítulo atualiza e SUPERA, quando houver conflito, o estado operacional
descrito nos capítulos anteriores.

Os capítulos anteriores devem permanecer preservados como histórico técnico
e funcional do projeto.

### 49.1 Checkpoint funcional protegido atual

Commit funcional protegido mais recente:

`150836c`

Mensagem:

`feat: consolida assistente financeiro prospeccao alertas e dashboard`

Branch:

`main`

Push para GitHub concluído com sucesso em 04/09/2026.

O checkpoint consolidou 21 arquivos alterados/adicionados e protegeu no
GitHub, entre outros:

- Financeiro operacional;
- Meu Assistente Pessoal;
- API central do Assistente;
- alerta crítico global;
- prospecção sem Cliente cadastrado;
- ajustes em Interações;
- ajustes em Orçamentos;
- ajustes em Clientes;
- ajustes em Representadas;
- Dashboard higienizado;
- permissões do Financeiro;
- imagens utilizadas pelo Assistente.

Validações executadas antes do checkpoint:

- `npx tsc --noEmit` — 0 erros;
- `npx prisma validate` — schema válido;
- `git diff --check` — sem erro de whitespace;
- aviso LF → CRLF em `prisma/schema.prisma`, sem impacto funcional;
- push para `origin/main` concluído.

Arquivo local não versionado e preservado:

`public/foto sistema minha area paula.jpeg`

Esse arquivo não estava em uso confirmado no código. Por segurança, não foi
apagado e também não foi incluído no checkpoint.

------------------------------------------------------------------------

## 50. Financeiro — estado operacional em 04/09/2026

Foi criada API própria:

`app/api/financeiro/route.ts`

Foi consolidada a tela:

`app/financeiro/page.tsx`

O Financeiro utiliza a estrutura Prisma existente.

Tipos operacionais:

- `Entrada`;
- `Saida`;
- `SaldoInicial`.

Status:

- `Pendente`;
- `Realizado`;
- `Cancelado`.

Regras atuais:

- Saldo Inicial é registrado como fato realizado;
- Saldo Inicial pode ser positivo ou negativo;
- Entrada e Saída usam valor positivo;
- o sinal econômico é determinado pelo tipo;
- Cancelado não participa dos cálculos;
- pendências afetam projeção;
- realizados afetam saldo realizado;
- Saída pendente vencida entra no cálculo de valor vencido;
- parcelamentos podem ser criados em lançamentos separados;
- a divisão de parcelas é feita em centavos e eventual diferença de
  arredondamento fica na última parcela;
- Diretor possui exclusão definitiva;
- Administrativo possui operação sem exclusão;
- Preposto não possui acesso ao Financeiro.

Resumo calculado pela API:

- saldo realizado;
- entradas realizadas;
- saídas realizadas;
- entradas pendentes;
- saídas pendentes;
- saldo projetado;
- quantidade vencida;
- valor vencido.

Regra permanente:

`FATO EXTERNO MANUAL → FINANCEIRO`

`FATO GERADO POR MÓDULO → INTEGRAÇÃO FUTURA, SEM DUPLICAÇÃO MANUAL`

O Financeiro não deve duplicar fatos que futuramente sejam originados
automaticamente por Faturamentos, Títulos ou Comissões.

------------------------------------------------------------------------

## 51. Interações — continuidade operacional

Foi consolidado o conceito de continuidade de Interações.

Regra de negócio:

- uma Interação representa um assunto/processo;
- o assunto pode durar vários dias;
- não se deve editar o passado para registrar nova evolução;
- novas informações devem ser registradas como acompanhamento;
- o histórico anterior deve permanecer preservado;
- a Interação pode receber vários acompanhamentos;
- somente quando o assunto estiver resolvido deve ser finalizada.

A tela possui:

- `Registrar acompanhamento`;
- `Registrar e finalizar`.

A finalização exige nova informação/resultado e confirmação do usuário.

O Assistente não duplica essa lógica.

Regra:

`ASSISTENTE LEMBRA → INTERAÇÃO ORIGINAL RESOLVE → ASSISTENTE DEIXA DE EXIBIR`

Observação arquitetural:

A continuidade operacional atualmente aproveita a estrutura existente e deve
permanecer sob observação técnica. Qualquer futura alteração estrutural para
entidade dedicada de acompanhamento exigirá preservação integral do histórico,
análise de impacto e aprovação explícita antes de migration.

------------------------------------------------------------------------

## 52. Prospecção sem Cliente cadastrado

Foi identificada necessidade operacional real de registrar prospecções antes
de existir Cliente formal no CRM.

Foram adicionados ao modelo `Interacao`:

- `nomeProspect`;
- `empresaProspect`;
- `origemProspeccao`.

Uso:

- permitir registrar contato inicial;
- preservar origem;
- não obrigar cadastro prematuro de Cliente;
- permitir posterior evolução para Cliente real.

A alteração estrutural foi aplicada com cautela.

O banco recebeu as três colunas correspondentes.

Depois foi confirmado:

`npx prisma migrate diff --from-schema-datasource "prisma\schema.prisma" --to-schema-datamodel "prisma\schema.prisma" --script`

Resultado final:

`-- This is an empty migration.`

Isso confirmou alinhamento entre banco e `schema.prisma`.

Prisma Client foi regenerado com sucesso após encerramento dos processos que
estavam bloqueando o arquivo do engine.

Regra futura:

não criar categoria genérica `Outros` de forma prematura para origem de
prospecção.

Primeiro observar os dados reais.

------------------------------------------------------------------------

## 53. Meu Assistente Pessoal — estado atual

Foi criado:

`app/meu-assistente-pessoal/page.tsx`

Foi criada API central:

`app/api/meu-assistente-pessoal/route.ts`

Objetivo:

ser o interligador operacional dos principais módulos do CRM, mostrando ao
usuário o que exige atenção sem duplicar as regras de negócio de cada módulo.

Princípio:

`ASSISTENTE IDENTIFICA → PRIORIZA → ENCAMINHA → MÓDULO ORIGINAL EXECUTA`

O Assistente não deve virar um segundo sistema dentro do CRM.

### 53.1 Escopo por usuário

Diretor:

- visão consolidada do escritório.

Administrativo / Preposto:

- visão das próprias responsabilidades conforme regras atuais.

### 53.2 Módulos integrados

Atualmente integrados:

- Interações;
- Prospecções;
- Orçamentos;
- Vendas;
- Títulos/Vencimentos.

Integrações preparadas ou relacionadas, mas ainda não plenamente ativadas no
Assistente:

- Faturamentos;
- Comissões;
- Redes Sociais.

### 53.3 Interações

Entram enquanto:

`statusFollowUp != "Finalizado"`

Quando finalizadas, deixam de aparecer.

### 53.4 Orçamentos

Entram quando status:

- `Pendente`;
- `Vencido`.

Não entram quando encerrados comercialmente, como:

- `Aprovado`;
- `Recusado`;
- `Cancelado`.

Orçamento vencido pode gerar alerta crítico.

### 53.5 Vendas

Fluxo validado:

`Aguardando envio`
→ Pedido enviado
→ `Aguardando confirmação`
→ Recebimento confirmado
→ `Confirmado`

O Assistente acompanha:

- Venda aguardando envio;
- Venda aguardando confirmação da Representada;
- previsão de faturamento;
- previsão de faturamento vencida.

A etapa `Aguardando confirmação` foi adicionada ao Assistente em 04/09/2026
para impedir que um pedido enviado desapareça do radar antes da confirmação
da Representada.

### 53.6 Títulos

O Assistente considera:

- vencimento original;
- vencimento prorrogado;
- pagamento;
- status de quitação.

Título pago/liquidado deixa de aparecer.

Título vencido e não quitado pode gerar alerta crítico.

------------------------------------------------------------------------

## 54. Alerta crítico global

Foi criado:

`components/alerta-critico-global.tsx`

Imagem usada:

`public/assistente-alerta-paula.jpeg`

O componente foi integrado globalmente ao CRM através de:

`components/auth/user-session-menu.tsx`

Comportamento:

- aparece somente quando a API do Assistente retorna alerta crítico;
- não aparece para pendência normal;
- leva diretamente ao registro original;
- pode ser silenciado temporariamente;
- atualiza durante a navegação/uso;
- não apaga nem resolve a pendência.

Regras críticas iniciais:

- Orçamento vencido;
- Venda aguardando envio;
- previsão de faturamento vencida;
- Título vencido.

Venda aguardando confirmação da Representada é importante, mas não é alerta
global crítico enquanto não houver prazo objetivo máximo definido.

Validação real em 04/09/2026:

a API retornou pendências operacionais, porém:

`alertasCriticos: 0`

Portanto, a personagem corretamente não apareceu.

Não criar pendência fictícia apenas para testar o alerta.

------------------------------------------------------------------------

## 55. Dashboard — preservação funcional e remoção de dados fictícios

O Dashboard antigo continha valores e nomes comerciais fictícios da fase
inicial de frontend.

Foram identificados, entre outros:

- vendas fictícias;
- metas fictícias;
- ticket médio fictício;
- total de pedidos fictício;
- diferenças de faturamento fictícias;
- representadas fictícias;
- histórico mensal fictício;
- percentuais fictícios;
- comissões fictícias.

Decisão definitiva:

O frontend antigo deve ser tratado como ESPECIFICAÇÃO FUNCIONAL do CRM.

Portanto:

- não apagar funcionalidades apenas porque ainda não estão ligadas ao banco;
- preservar filtros;
- preservar botões;
- preservar abas;
- preservar gráficos;
- preservar relatórios;
- preservar indicadores;
- preservar análises planejadas;
- retirar somente os dados demonstrativos.

O Dashboard foi higienizado preservando a estrutura funcional.

Onde não existe fonte real consolidada, o sistema utiliza estados neutros,
como:

- `R$ 0,00`;
- `0`;
- `0,0%`;
- `Sem dados`;
- mensagens claras de ausência de dado real.

Regra importante:

`ZERO FICTÍCIO NÃO DEVE SER CONFUNDIDO COM RESULTADO MEDIDO`

Quando possível, interfaces futuras devem distinguir explicitamente ausência
de integração de resultado real igual a zero.

------------------------------------------------------------------------

## 56. Regra permanente sobre funcionalidades antigas do frontend

Toda função criada na fase inicial do frontend deve ser presumida como
necessidade funcional do negócio até prova em contrário.

Ao encontrar tela antiga com dados fictícios:

1. identificar qual necessidade ela representa;
2. preservar a função;
3. remover somente os dados demonstrativos;
4. conectar posteriormente aos módulos reais;
5. não eliminar recursos por conveniência técnica;
6. somente remover função com decisão explícita do usuário.

Essa regra vale para:

- Dashboard;
- Contabilidade;
- Agenda;
- Relatórios;
- Redes Sociais;
- Interações AI;
- comparativos;
- planilhas;
- demais telas antigas.

------------------------------------------------------------------------

## 57. Varredura de dados fictícios — estado em 04/09/2026

Foi executada busca geral em:

- `app`;
- `components`;
- `lib`.

Foram identificadas ocorrências que exigem classificação cuidadosa.

Não remover automaticamente ocorrências de palavras como:

- exemplo;
- mock;
- fake;
- demo.

Algumas são legítimas:

- comentários técnicos;
- placeholders;
- exemplos de condição de pagamento;
- componentes internos;
- mensagens explicativas.

Áreas com dados operacionais fictícios confirmados ou suspeitos:

- Contabilidade;
- Interações AI;
- Sales Comparison;
- Spreadsheet Handler;
- Agenda;
- Redes Sociais;
- Relatórios;
- eventuais APIs/templates de planilha.

Arquivo que precisa ser investigado antes de alterar:

`app/api/clientes/exportar/route.ts`

O registro `Exemplo Ltda` pode fazer parte de modelo/template de importação e
não deve ser removido sem compreender o fluxo.

------------------------------------------------------------------------

## 58. Contabilidade — primeira pendência da próxima conversa

A Contabilidade NÃO foi alterada nesta conversa.

Foi apenas revisada.

A tela atual contém várias funções planejadas que devem ser preservadas:

- resumo contábil;
- notas fiscais;
- impostos;
- filtros;
- calendário fiscal;
- importação/exportação;
- nova Nota Fiscal;
- novo imposto;
- baixa/pagamento;
- relatórios;
- gráficos;
- impressão;
- relatório para contador;
- análise tributária.

Também contém dados demonstrativos antigos, incluindo:

- clientes fictícios;
- NFs fictícias;
- impostos fictícios;
- datas de 2023;
- calendário fiscal fictício;
- lembretes fiscais fictícios;
- relatórios recentes fictícios;
- percentuais tributários simplificados;
- cálculo genérico de 6%.

Regra para próxima conversa:

NÃO apagar essas funções.

Primeiro revisar o arquivo completo.

Depois remover/substituir apenas os dados fictícios.

Não inventar regras tributárias reais.

A regra de 6% somente poderá ser usada onde houver regra real confirmada e
contexto correto.

Contabilidade é o primeiro ponto operacional recomendado para a próxima
conversa.

------------------------------------------------------------------------

## 59. Nova diretriz gerencial — valor econômico de Clientes e Representadas

Foi identificada em 04/09/2026 uma necessidade gerencial adicional à análise
ABC/Pareto já registrada.

Problema:

um pedido grande isolado pode dar falsa impressão de alta rentabilidade.

Exemplo conceitual:

- pedido de R$ 10.000;
- comissão de 10%;
- reposição apenas a cada 3 ou 4 meses.

Esse relacionamento não deve ser avaliado somente pelo valor unitário do
pedido.

A análise futura deve considerar, no mínimo:

- faturamento anualizado;
- frequência de recompra;
- comissão efetivamente gerada;
- recorrência;
- tempo/esforço comercial consumido;
- custo operacional de atendimento;
- potencial futuro;
- concentração;
- estabilidade do relacionamento.

A mesma lógica vale para Representadas.

Uma Representada com percentual alto de comissão não é automaticamente a
mais valiosa.

Deverão ser avaliados:

- comissão anual gerada;
- quantidade de Clientes ativos;
- frequência de recompra;
- ticket;
- prazo de faturamento;
- conversão comercial;
- esforço necessário;
- estabilidade;
- potencial.

### 59.1 Classificação A/B/C/D/E/F

Foi discutida a possibilidade de ampliar a classificação para:

- A;
- B;
- C;
- D;
- E;
- F.

A fórmula definitiva NÃO foi aprovada.

Não criar campo estrutural nem automação antes da validação com dados reais.

Também deve ser separado:

`CLASSIFICAÇÃO ATUAL`

de:

`POTENCIAL FUTURO`

Exemplo:

um Cliente com resultado atual baixo, mas potencial alto, não deve ser
tratado da mesma maneira que um Cliente com resultado baixo e potencial
baixo.

Objetivo final:

priorizar energia comercial nas relações que geram maior retorno econômico e
estratégico.

------------------------------------------------------------------------

## 60. Manual Operacional Completo

A necessidade de Manual Operacional foi reforçada.

O sistema está ficando fortemente interligado entre módulos e depende de
rotina correta de uso.

O Manual deverá documentar, progressivamente:

- login;
- perfis;
- Clientes;
- Representadas;
- Interações;
- acompanhamentos;
- Prospecções;
- Orçamentos;
- Vendas;
- Faturamentos;
- Títulos;
- Comissões;
- Financeiro;
- Assistente Pessoal;
- Alertas;
- Contabilidade;
- Agenda;
- Relatórios;
- Dashboard;
- demais módulos.

O Manual não deve ser produzido às pressas antes da estabilização.

Capturas de telas reais e fluxos validados devem ser preservados para futura
elaboração.

------------------------------------------------------------------------

## 61. Prisma — regra reforçada de segurança estrutural

A segurança estrutural foi reforçada.

Regra permanente:

NENHUMA alteração em:

- `schema.prisma`;
- migrations;
- tabelas;
- relações;
- dependências estruturais;
- arquitetura persistente;

deve ser executada sem:

1. necessidade funcional comprovada;
2. consulta ao Documento Mestre;
3. diagnóstico do estado atual;
4. explicação de risco e impacto;
5. aprovação explícita do usuário.

GitHub é a principal proteção versionada do código.

Não executar reset de banco.

Não executar `prisma migrate dev` cegamente quando houver risco de conflito
com migrations já aplicadas.

Se Prisma solicitar reset do schema ou perda de dados:

`RESPONDER NÃO / CANCELAR`

Prisma permanece na versão:

`5.22.0`

Não atualizar para Prisma 8 ou outra versão estrutural sem planejamento
próprio.

------------------------------------------------------------------------

## 62. Estado técnico final da sessão de 04/09/2026

Validações concluídas:

`npx tsc --noEmit`

Resultado:

- 0 erros TypeScript.

`npx prisma validate`

Resultado:

- schema válido.

`git diff --check`

Resultado:

- sem inconsistência de whitespace;
- apenas aviso LF → CRLF no Windows em `prisma/schema.prisma`.

Checkpoint funcional:

`150836c`

Mensagem:

`feat: consolida assistente financeiro prospeccao alertas e dashboard`

Push:

- concluído em `origin/main`.

Arquivo local não versionado:

`public/foto sistema minha area paula.jpeg`

Esse arquivo deve permanecer preservado até decisão futura.

Build completo:

- não foi repetido neste fechamento;
- permanece pendente para lote técnico futuro.

Lint:

- permanece pendente.

------------------------------------------------------------------------

## 63. Próximo ponto oficial de continuidade

Checkpoint funcional protegido:

`150836c`

Primeira frente recomendada:

`CONTABILIDADE — REMOVER DADOS FICTÍCIOS SEM APAGAR FUNCIONALIDADES`

Depois:

1. continuar varredura de dados fictícios;
2. revisar Interações AI;
3. revisar Sales Comparison;
4. revisar Spreadsheet Handler;
5. revisar Agenda;
6. revisar Redes Sociais;
7. revisar Relatórios;
8. investigar `app/api/clientes/exportar/route.ts`;
9. preservar funções antigas do frontend;
10. substituir gradualmente simulação por dados reais;
11. continuar uso real com Paula;
12. registrar dificuldades operacionais;
13. evoluir análise econômica de Clientes e Representadas;
14. definir futuramente classificação A–F;
15. retomar Comissões quando houver base real suficiente;
16. consolidar Contabilidade real;
17. preparar Manual Operacional.

Não refazer módulos já validados.

Não pedir novamente dezenas de arquivos já revisados.

Somente solicitar arquivo quando o estado local atual for realmente
necessário.

Mensagem recomendada para nova conversa:

"Leia integralmente o DOCUMENTO_MESTRE_CRM.md, principalmente os capítulos
49 a 63.

O checkpoint funcional protegido atual é `150836c`.

Não refaça os módulos e fluxos já validados.

A primeira pendência é Contabilidade.

A Contabilidade ainda contém dados demonstrativos antigos, mas suas funções
devem ser preservadas integralmente.

A regra permanente é: o frontend antigo representa necessidades reais do
negócio. Remova somente dados fictícios; não apague funcionalidades sem
decisão explícita.

Depois continue a varredura controlada em Interações AI, Sales Comparison,
Spreadsheet Handler, Agenda, Redes Sociais e Relatórios.

O Meu Assistente Pessoal está implementado e integrado a
Interações/Prospecções, Orçamentos, Vendas e Títulos.

O Diretor possui visão consolidada do escritório.

Existe alerta crítico global com personagem do Assistente.

Vendas em `Aguardando confirmação` agora permanecem no radar do Assistente.

O Financeiro operacional foi consolidado.

A prospecção pode ser registrada antes de existir Cliente.

Não altere Prisma, migration ou banco sem necessidade funcional comprovada,
consulta ao Documento Mestre e aprovação explícita.

Preserve o arquivo local não versionado
`public/foto sistema minha area paula.jpeg`.

Há uma nova diretriz futura para classificação econômica A–F de Clientes e
Representadas considerando recorrência, faturamento anualizado, comissão,
esforço e potencial. A fórmula ainda não está aprovada.

O Manual Operacional Completo permanece pendência formal."

------------------------------------------------------------------------
