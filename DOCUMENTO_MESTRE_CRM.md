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

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

Esse commit foi enviado com sucesso ao GitHub em 23/08/2026.

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

Validação do lote do checkpoint `a7668fd`:

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

-   build concluído com sucesso;
-   Next.js 15.2.4;
-   `Compiled successfully`;
-   42/42 páginas estáticas geradas;
-   rotas dinâmicas processadas;
-   APIs processadas;
-   Middleware compilado com 38.8 kB.

Observação:

O build informa:

-   `Skipping validation of types`
-   `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint ainda permanece pendente para lote técnico próprio.

Histórico relevante do lote de autenticação:

-   o primeiro build apresentou warnings do `jose` relacionados a
    `CompressionStream` e `DecompressionStream` no Edge Runtime;
-   houve erro de `useSearchParams()` sem `Suspense` em
    `/acesso-negado`;
-   `/acesso-negado` foi corrigida com `Suspense`;
-   no build final daquele lote, o erro desapareceu e os warnings
    anteriores do `jose` não reapareceram.

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

## 13. Prisma --- estrutura integrada

Arquivo:

`prisma/schema.prisma`

Migration oficial criada e aplicada:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

A estrutura integrada contempla:

-   Escritorio
-   EmpresaEscritorio
-   Usuario
-   ClienteParticipacao
-   ContratoRepresentada
-   RegraComercialRepresentada
-   Faturamento
-   TituloVenda
-   ComissaoMovimento
-   NFComissao
-   ContaBancaria
-   RepresentadaContaRecebimento
-   ObrigacaoOperacional
-   Auditoria

Também foram ampliados:

-   Cliente
-   Representada
-   Venda
-   Interacao
-   Financeiro

------------------------------------------------------------------------

## 14. Arquivo temporário Prisma

Existe localmente:

`prisma/proposed_schema_diff.sql`

Esse arquivo foi usado como artefato de comparação do Prisma.

Ele NÃO foi incluído nos checkpoints Git/GitHub.

A migration oficial continua sendo:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

Não tratar `proposed_schema_diff.sql` como migration oficial, não
executá-lo e não adicioná-lo ao Git sem nova validação técnica
explícita.

Estado após o checkpoint `a7668fd`:

`?? prisma/proposed_schema_diff.sql`

Isso é proposital.

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

## 18. Vínculo Representada → Escritório

`ContaBancaria.escritorioId` é obrigatório no Prisma.

`Representada.escritorioId` é opcional no schema atual.

A auditoria pelo Prisma Studio confirmou em 22/08/2026:

-   Representada: 3 registros;
-   ContratoRepresentada: 1;
-   RegraComercialRepresentada: 1;
-   ContaBancaria: 0;
-   RepresentadaContaRecebimento: 0;
-   EmpresaEscritorio: 0;
-   Escritorio: 0;
-   Usuario: 0.

Portanto, naquela auditoria ainda não existia um `Escritorio` real no
banco para ser usado como raiz institucional.

O setup inicial criado no checkpoint `53c41c2` foi projetado para criar
essa raiz.

Não criar conta bancária escolhendo ou presumindo um escritório
arbitrariamente.

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

A API e página de setup inicial estão prontas para criar:

-   primeiro `Escritorio`;
-   primeiro usuário `Diretor`;
-   usuário `Administrativo` opcional;
-   senha armazenada como hash;
-   login automático do Diretor após setup.

Proteção:

O setup somente funciona enquanto:

-   total de `Escritorio` = 0;
-   total de `Usuario` = 0.

Depois disso, retorna conflito e não cria uma segunda raiz
acidentalmente.

IMPORTANTE:

Até o checkpoint `a7668fd`, o setup inicial REAL ainda NÃO foi
executado.

Nenhum usuário real foi criado por esse fluxo até esse checkpoint.

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

## 25. Front-end --- ordem recomendada

Estado da ordem funcional:

1.  Segurança e isolamento de Clientes/Vendas/Interações --- concluído
    estruturalmente no checkpoint `a7668fd`.
2.  Setup inicial e testes reais de autenticação/perfis --- próxima fase
    de segurança a definir e executar com controle.
3.  Concluir Representadas / contas.
4.  Integrar regras comerciais com Vendas.
5.  Integrar comissão/faturamento.
6.  Financeiro.
7.  Contabilidade.
8.  Agenda real.
9.  Relatórios/Dashboard reais.
10. Identidade visual profissional em lote próprio.

Alterações visuais amplas devem ser feitas somente depois da validação
funcional e de segurança correspondente.

------------------------------------------------------------------------

## 26. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referência:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

"Leia o DOCUMENTO_MESTRE_CRM.md no GitHub e continue exatamente do
checkpoint registrado. Este documento é a fonte oficial de continuidade
do projeto."

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

ESTÁVEL PARA CONTINUAR O DESENVOLVIMENTO

Último checkpoint funcional:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

Validações do lote:

-   TypeScript: OK --- 0 erros
-   `git diff --check`: OK
-   Build: OK
-   42/42 páginas estáticas geradas
-   Middleware: compilado
-   Login: infraestrutura criada
-   Logout: infraestrutura criada
-   Sessão: infraestrutura criada
-   Setup inicial: criado, mas ainda não executado
-   Permissões: matriz criada
-   Isolamento de Clientes: implementado
-   Isolamento de Vendas: implementado
-   Isolamento de Interações: implementado
-   Rotas por ID desses três módulos: protegidas
-   Git commit: criado
-   GitHub push: concluído

Ainda pendente:

-   execução segura do setup inicial real;
-   criação real do Diretor;
-   criação do Administrativo, se aplicável;
-   criação futura de Preposto de teste;
-   testes funcionais de login/logout;
-   testes funcionais dos três perfis;
-   validação prática do isolamento entre usuários;
-   integração real da Agenda;
-   integração real dos Relatórios;
-   lint;
-   auditoria das vulnerabilidades npm;
-   fechamento completo das contas bancárias/recebimento;
-   formalização de contas 01/02/03;
-   integração de regras comerciais com Vendas;
-   integração total de comissão;
-   integração total de faturamento;
-   integração total de financeiro;
-   identidade visual futura;
-   substituição controlada de dados fictícios por dados reais somente
    depois dos testes correspondentes.

------------------------------------------------------------------------

## 29. Próximo passo exato

O lote de isolamento estrutural de Clientes, Vendas e Interações foi
concluído e versionado.

NÃO repetir esse lote.

NÃO executar migration ou alteração de schema automaticamente.

NÃO executar `npm audit fix` automaticamente.

NÃO adicionar `prisma/proposed_schema_diff.sql` ao Git.

NÃO criar contas bancárias presumindo um `Escritorio`.

Antes de integrações funcionais maiores, a próxima fase deve partir do
estado real do banco e da segurança.

Sequência segura recomendada:

1.  Confirmar o estado real de `Escritorio` e `Usuario` antes de
    qualquer setup.
2.  Se o banco continuar sem raiz institucional, planejar e executar o
    setup inicial real de forma controlada.
3.  Criar o primeiro Diretor somente pelo fluxo validado de setup.
4.  Criar Administrativo somente se aplicável e com dados explicitamente
    fornecidos.
5.  Criar Preposto de teste apenas quando houver condições para validar
    isolamento.
6.  Testar login/logout e permissões de Diretor, Administrativo e
    Preposto.
7.  Testar na prática o isolamento de Clientes, Vendas e Interações
    entre usuários.
8.  Somente depois dos testes de segurança, avançar para integrações
    funcionais maiores.
9.  Criar checkpoint Git/GitHub ao final de cada lote validado.

A execução do setup real não deve ser iniciada sem antes confirmar o
estado do banco.

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

## 32. Checkpoint de isolamento de dados --- 23/08/2026

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
