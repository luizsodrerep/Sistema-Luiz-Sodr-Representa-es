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

`de78c932810979b9796434d1cc7651b093d8de25`

Mensagem:

`feat: conclui fluxo comercial de orcamentos e vendas`

Push para GitHub concluído com sucesso em 24/08/2026.

Esse checkpoint consolida o fluxo comercial até o recebimento/confirmacao
pela Representada, incluindo:

-   Orçamentos;
-   vínculo Orçamento → Venda;
-   numeração sequencial de Vendas;
-   eventos operacionais da Venda;
-   rastreabilidade Interação → Orçamento → Venda;
-   telas e APIs correspondentes;
-   migrations associadas.

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

Validação do lote do checkpoint `de78c93`:

`npx tsc --noEmit`

Resultado:

-   0 erros TypeScript.

Executado:

`git diff --check`

Resultado:

-   nenhuma inconsistência técnica reportada;
-   houve apenas aviso de normalização LF → CRLF no Windows para arquivos
    Prisma/migrations, sem impacto funcional.

Executado:

`npm run build`

Resultado:

-   build concluído com sucesso;
-   Next.js 15.2.4;
-   `Compiled successfully`;
-   45/45 páginas estáticas geradas;
-   rotas dinâmicas processadas;
-   APIs de Orçamentos e Vendas processadas;
-   rota `/api/vendas/[id]/eventos` processada;
-   Middleware compilado com 38.8 kB.

Observação:

O build informa:

-   `Skipping validation of types`
-   `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint ainda permanece pendente para lote técnico próprio.

Testes funcionais do lote:

-   login e sessão real utilizados;
-   Orçamentos carregados e editados sem erro 500;
-   Vendas carregadas sem erro 500;
-   eventos de Venda registrados com resposta HTTP 201;
-   confirmação de recebimento pela Representada validada na operação;
-   rastreabilidade visual e operacional validada.

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
-   banco PostgreSQL sincronizado;
-   13 migrations reconhecidas pelo Prisma.

Migration estrutural histórica relevante:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

Migrations adicionadas no fechamento de Orçamentos/Vendas:

-   `prisma/migrations/20260824161435_add_orcamentos/migration.sql`
-   `prisma/migrations/20260824180420_link_venda_orcamento/migration.sql`
-   `prisma/migrations/20260824191552_add_venda_sequencial_eventos/migration.sql`

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
-   ComissaoMovimento
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
-   `Venda.orcamentoOrigemId` é único, impedindo que um mesmo orçamento
    gere duas vendas;
-   `VendaEvento` preserva o histórico operacional de envio, recebimento,
    confirmação, pedido registrado e contatos;
-   `Cliente.codigo` continua sendo `String? @unique` e é gerado pela
    aplicação no padrão `CLI-000001`.

------------------------------------------------------------------------

## 14. Arquivo temporário Prisma

Existe localmente:

`prisma/proposed_schema_diff.sql`

Esse arquivo foi usado como artefato de comparação do Prisma.

Ele NÃO foi incluído nos checkpoints Git/GitHub.

Estado local após o checkpoint `de78c93`:

`?? prisma/proposed_schema_diff.sql`

Isso é proposital.

Regras permanentes:

-   não executar;
-   não tratar como migration oficial;
-   não adicionar ao Git;
-   não excluir sem nova análise técnica explícita.

As migrations oficiais são exclusivamente as existentes em
`prisma/migrations/` e já reconhecidas pelo Prisma.

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

Estado funcional consolidado em 24/08/2026:

1.  Autenticação, sessão e controle de acesso — implantados e em uso.
2.  Clientes — liberado para operação real.
3.  Representadas — liberado para operação real no escopo já concluído.
4.  Interações — liberado para operação real.
5.  Orçamentos — liberado para operação real.
6.  Vendas — liberado até envio/recebimento/confirmacao pela Representada.
7.  Próximo módulo: Faturamento.
8.  Depois: Títulos/Vencimentos.
9.  Depois: Comissões.
10. Financeiro.
11. Contabilidade.
12. Agenda real.
13. Relatórios/Dashboard reais.
14. Identidade visual profissional em lote próprio.

Regras comerciais da Representada devem alimentar Orçamentos/Vendas,
sem criar regra única artificial para todas as Representadas.

Faturamento e Comissões não devem ser forçados para dentro do módulo
Vendas. A responsabilidade de Vendas termina quando o pedido está
formalmente registrado e confirmado pela Representada.

------------------------------------------------------------------------

## 26. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referência:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

"Leia o DOCUMENTO_MESTRE_CRM.md e continue exatamente do checkpoint
`de78c93`. Este documento é a fonte oficial de continuidade do projeto.
Não refaça Clientes, Representadas, Interações, Orçamentos ou Vendas.
A próxima frente é Faturamento → Títulos → Comissões, usando a base real
que começará a ser alimentada pela Paula."

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

**ESTÁVEL E LIBERADO PARA INÍCIO DA OPERAÇÃO COMERCIAL REAL NOS MÓDULOS
CONCLUÍDOS**

Último checkpoint funcional:

`de78c932810979b9796434d1cc7651b093d8de25`

Mensagem:

`feat: conclui fluxo comercial de orcamentos e vendas`

Validações do lote:

-   TypeScript: OK — 0 erros;
-   `git diff --check`: OK;
-   Build: OK;
-   45/45 páginas estáticas geradas;
-   Middleware: compilado;
-   Prisma: válido;
-   Prisma Client: gerado;
-   13 migrations aplicadas;
-   banco sincronizado;
-   Git commit: criado;
-   GitHub push: concluído.

Módulos liberados para dados reais:

-   Clientes;
-   Representadas;
-   Interações;
-   Orçamentos;
-   Vendas;
-   registro de envio do pedido à Representada;
-   confirmação de recebimento;
-   registro posterior de número/referência da Representada;
-   histórico de eventos da Venda.

Numeração operacional a partir da base limpa:

-   Cliente: `CLI-000001`;
-   Interação: `INT-000001`;
-   Orçamento: `ORC-000001`;
-   Venda: `VEN-000001`.

Base comercial fictícia:

-   zerada em 24/08/2026;
-   Clientes: 0;
-   Representadas: 0;
-   Interações: 0;
-   Orçamentos: 0;
-   Vendas: 0;
-   Eventos de Venda: 0;
-   Faturamentos: 0;
-   Títulos: 0;
-   Movimentos de comissão: 0;
-   NFs de comissão: 0;
-   Financeiros: 0.

Estrutura preservada:

-   1 Escritório ativo;
-   Luiz Fernando — Diretor ativo;
-   Paula — Administrativo ativo;
-   migrations;
-   schema Prisma;
-   autenticação e autorização.

Procedimento operacional inicial para Paula:

-   cadastrar Clientes e Representadas manualmente;
-   não utilizar importação em lote nesta fase;
-   registrar Interações reais;
-   gerar Orçamentos reais;
-   transformar Orçamento aprovado em Venda;
-   registrar envio e confirmação da Representada;
-   não inventar Interação/Orçamento para vendas históricas que não
    passaram por esses passos no CRM;
-   vendas históricas de junho, julho e agosto podem ser lançadas como
    Venda direta/retroativa quando esse for o fato real.

Importação em lote de Clientes:

-   a rota existe;
-   não integra o procedimento operacional inicial;
-   por decisão operacional, Paula foi orientada a não utilizar;
-   qualquer futura utilização deve ser previamente validada.

Ainda pendente:

-   Faturamento;
-   Títulos/Vencimentos;
-   Comissões;
-   Financeiro;
-   conclusão das contas bancárias/recebimento;
-   formalização das contas 01/02/03;
-   Agenda real;
-   Relatórios/Dashboard reais;
-   lint;
-   auditoria das vulnerabilidades npm;
-   identidade visual futura;
-   Manual Operacional da Paula.

------------------------------------------------------------------------

## 29. Próximo passo exato

NÃO repetir os módulos já fechados:

-   Clientes;
-   Representadas;
-   Interações;
-   Orçamentos;
-   Vendas.

NÃO executar nova migration ou alteração de schema sem necessidade
funcional comprovada e validação prévia.

NÃO executar `npm audit fix` automaticamente.

NÃO adicionar `prisma/proposed_schema_diff.sql` ao Git.

NÃO executar novamente o setup inicial.

Próxima fase técnica:

1.  iniciar o módulo Faturamento a partir das Vendas reais;
2.  permitir uma Venda gerar uma ou várias NFs;
3.  tratar faturamento parcial, saldo e cortes;
4.  derivar Títulos/Vencimentos das condições efetivamente faturadas;
5.  integrar Comissões ao Faturamento e às regras comerciais vigentes;
6.  confrontar o cálculo do sistema com comissões reais já recebidas;
7.  preservar diferenças entre comissão prevista, devida, recebida,
    estornada, recuperada e ajustada;
8.  somente depois avançar para Financeiro.

Dados retroativos:

-   poderão ser inseridos para junho, julho e agosto;
-   devem refletir fatos reais;
-   serão úteis para validar Faturamento e Comissões;
-   não reconstruir eventos inexistentes apenas para completar fluxo.

Manual Operacional:

-   registrar como pendência formal;
-   criar inicialmente uma versão Fase 1 apenas para os módulos já
    liberados à Paula;
-   o manual completo fica para o encerramento dos demais módulos.

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
6.  novos envios continuam permitidos como eventos adicionais;
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

Eventos múltiplos de envio são válidos quando refletem a operação real.
A interface deve deixar claro que, após o primeiro envio, a próxima ação
principal é a confirmação do recebimento.

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

`?? prisma/proposed_schema_diff.sql`

Nenhum outro arquivo temporário deve permanecer.

O arquivo `prisma/proposed_schema_diff.sql` continua protegido pelas
regras do capítulo 14.

------------------------------------------------------------------------
