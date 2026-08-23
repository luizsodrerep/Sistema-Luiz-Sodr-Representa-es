# DOCUMENTO MESTRE --- CRM LUIZ SODRÃ‰ REPRESENTAÃ‡Ã•ES

## 1. Finalidade deste documento

Este arquivo Ã© a memÃ³ria tÃ©cnica persistente do projeto CRM Luiz SodrÃ©
RepresentaÃ§Ãµes.

Ele deve ser tratado como fonte oficial de continuidade entre conversas,
etapas de desenvolvimento e checkpoints tÃ©cnicos.

Sempre que houver:

-   conclusÃ£o de mÃ³dulo;
-   alteraÃ§Ã£o estrutural relevante;
-   nova migration;
-   mudanÃ§a importante de regra de negÃ³cio;
-   correÃ§Ã£o ampla;
-   novo checkpoint Git/GitHub;
-   decisÃ£o arquitetural importante;

este documento deve ser atualizado antes de iniciar uma nova grande
etapa.

------------------------------------------------------------------------

## 2. Regra principal de continuidade

O CRM deve seguir a cadeia:

DADOS â†’ INDICADORES â†’ ANÃLISE â†’ DECISÃƒO â†’ AÃ‡ÃƒO

O sistema nÃ£o deve ser tratado apenas como cadastro.

A arquitetura deve preservar:

-   rastreabilidade;
-   histÃ³rico;
-   regras comerciais;
-   responsabilidades;
-   participaÃ§Ã£o de usuÃ¡rios;
-   vendas;
-   faturamentos;
-   comissÃµes;
-   financeiro;
-   obrigaÃ§Ãµes;
-   interaÃ§Ãµes;
-   auditoria;
-   autenticaÃ§Ã£o;
-   autorizaÃ§Ã£o;
-   isolamento de dados por usuÃ¡rio.

------------------------------------------------------------------------

## 3. Escopo deste projeto

Este projeto trata exclusivamente do CRM e gestÃ£o comercial.

Assuntos paralelos devem ser tratados em conversa/projeto separado.

------------------------------------------------------------------------

## 4. Perfil operacional do sistema

A entidade central Ã© o escritÃ³rio.

Clientes pertencem ao escritÃ³rio.

UsuÃ¡rios do escritÃ³rio podem possuir:

-   responsabilidade por clientes;
-   participaÃ§Ã£o em clientes;
-   responsabilidade por vendas;
-   responsabilidade por interaÃ§Ãµes;
-   atuaÃ§Ã£o por regiÃ£o;
-   histÃ³rico prÃ³prio.

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
-   Projeto local prioritÃ¡rio antes de qualquer expansÃ£o para nuvem

NÃ£o atualizar Next.js, Prisma ou outras dependÃªncias estruturais sem
necessidade tÃ©cnica comprovada.

------------------------------------------------------------------------

## 6. Regra obrigatÃ³ria de trabalho com arquivos

O usuÃ¡rio nÃ£o possui experiÃªncia com programaÃ§Ã£o. O procedimento deve
priorizar reduÃ§Ã£o de risco manual.

Procedimento padrÃ£o obrigatÃ³rio:

1.  Para qualquer alteraÃ§Ã£o manual, o assistente informa primeiro o
    comando para abrir o arquivo no Bloco de Notas.
2.  Quando o assistente jÃ¡ possuir uma versÃ£o atual e confiÃ¡vel do
    arquivo, nÃ£o deve solicitar novamente seu conteÃºdo.
3.  Quando houver alteraÃ§Ã£o, o assistente deve fornecer o conteÃºdo
    COMPLETO, FINAL, REVISADO E PRONTO PARA SUBSTITUIÃ‡ÃƒO do arquivo.
4.  O usuÃ¡rio deve substituir integralmente o conteÃºdo do arquivo:
    `Ctrl+A` â†’ apagar â†’ colar o conteÃºdo completo fornecido â†’ `Ctrl+S`.
5.  NÃ£o orientar inserÃ§Ã£o manual de blocos parciais, linhas isoladas ou
    trechos no meio de arquivos, salvo impossibilidade tÃ©cnica
    especÃ­fica e explicitamente justificada.
6.  O mesmo procedimento vale para cÃ³digo, Markdown, configuraÃ§Ã£o e
    outros arquivos editados manualmente.
7.  Solicitar novamente o conteÃºdo do arquivo somente quando:
    -   ele tiver sido alterado depois da Ãºltima versÃ£o conhecida;
    -   houver dÃºvida tÃ©cnica real sobre seu estado;
    -   o conteÃºdo atual nÃ£o estiver disponÃ­vel ou nÃ£o for confiÃ¡vel.
8.  ApÃ³s cada alteraÃ§Ã£o de cÃ³digo, usar como validaÃ§Ã£o rÃ¡pida:
    `npx tsc --noEmit`
9.  NÃ£o executar build completo, diff detalhado ou verificaÃ§Ãµes extensas
    depois de cada pequena alteraÃ§Ã£o.
10. Ao final de um lote lÃ³gico, executar validaÃ§Ã£o ampliada conforme
    aplicÃ¡vel:
    -   `npx tsc --noEmit`
    -   `git diff --check`
    -   `npm run build`
    -   `git status --short`
11. Criar checkpoint Git/GitHub somente depois da validaÃ§Ã£o do lote.
12. Evitar `git add .` quando existir qualquer arquivo local que deva
    permanecer fora do Git.
13. Adicionar explicitamente somente os arquivos aprovados para o
    checkpoint.
14. Quando uma saÃ­da do Git abrir no paginador mostrando `:` ou `(END)`,
    sair normalmente com a tecla `q`.

Objetivo: reduzir risco de ediÃ§Ã£o incorreta, confusÃ£o, retrabalho e
inclusÃ£o acidental de arquivos.

------------------------------------------------------------------------

## 7. PolÃ­tica de seguranÃ§a do cÃ³digo

NÃ£o executar ou orientar automaticamente:

-   git commit;
-   git push;
-   criaÃ§Ã£o de branch;
-   merge;
-   alteraÃ§Ã£o de schema;
-   migration;
-   upgrade de dependÃªncias;
-   npm audit fix;
-   npm audit fix --force;

sem validar o estado tÃ©cnico antes.

Antes de checkpoint relevante, verificar conforme aplicÃ¡vel:

-   `npx tsc --noEmit`
-   `git diff --check`
-   `npm run build`
-   estado do Git

------------------------------------------------------------------------

## 8. PolÃ­tica de Git/GitHub

Sempre que um mÃ³dulo, lote relevante ou alteraÃ§Ã£o estrutural importante
estiver validado, deve ser criado um checkpoint Git/GitHub antes de
avanÃ§ar.

NÃ£o criar commit para cada pequena alteraÃ§Ã£o isolada.

CritÃ©rio ideal para checkpoint:

-   alteraÃ§Ã£o relevante concluÃ­da;
-   TypeScript validado;
-   build validado;
-   arquivos revisados;
-   estado do Git conferido.

GitHub Ã© a fonte oficial do cÃ³digo versionado.

------------------------------------------------------------------------

## 9. Checkpoint Git atual

RepositÃ³rio:

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

Checkpoint tÃ©cnico anterior relevante:

`33b1d21d712e7daf4dc8f2cfeb863300032d12f9`

Mensagem:

`checkpoint: estrutura integrada CRM e correcoes TypeScript`

------------------------------------------------------------------------

## 10. Estado de validaÃ§Ã£o tÃ©cnica atual

ValidaÃ§Ã£o do lote do checkpoint `a7668fd`:

`npx tsc --noEmit`

Resultado:

-   0 erros TypeScript.

Executado:

`git diff --check`

Resultado:

-   nenhuma inconsistÃªncia reportada.

Executado:

`npm run build`

Resultado:

-   build concluÃ­do com sucesso;
-   Next.js 15.2.4;
-   `Compiled successfully`;
-   42/42 pÃ¡ginas estÃ¡ticas geradas;
-   rotas dinÃ¢micas processadas;
-   APIs processadas;
-   Middleware compilado com 38.8 kB.

ObservaÃ§Ã£o:

O build informa:

-   `Skipping validation of types`
-   `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint ainda permanece pendente para lote tÃ©cnico prÃ³prio.

HistÃ³rico relevante do lote de autenticaÃ§Ã£o:

-   o primeiro build apresentou warnings do `jose` relacionados a
    `CompressionStream` e `DecompressionStream` no Edge Runtime;
-   houve erro de `useSearchParams()` sem `Suspense` em
    `/acesso-negado`;
-   `/acesso-negado` foi corrigida com `Suspense`;
-   no build final daquele lote, o erro desapareceu e os warnings
    anteriores do `jose` nÃ£o reapareceram.

------------------------------------------------------------------------

## 11. EvoluÃ§Ã£o dos erros TypeScript

Estado inicial registrado:

28 erros em 17 arquivos.

Depois das correÃ§Ãµes sucessivas:

27 â†’ 24 â†’ 23 â†’ 15 â†’ 9 â†’ 6 â†’ 0 erros.

Estado atual:

0 erros TypeScript, reconfirmados no lote do checkpoint `a7668fd`.

------------------------------------------------------------------------

## 12. CorreÃ§Ãµes tÃ©cnicas histÃ³ricas consolidadas

### 12.1 Next.js 15 --- params assÃ­ncronos

Corrigidos, entre outros:

-   `app/api/representadas/[id]/comissao/route.ts`
-   `app/api/representadas/[id]/route.ts`
-   `app/api/vendas/[id]/route.ts`
-   `app/api/interacoes/[id]/route.ts`
-   `app/interacoes/[id]/page.tsx`
-   `app/interacoes/[id]/editar/page.tsx`

Rotas de API passaram a usar `params: Promise<{ id: string }>` e
`const { id } = await params`.

### 12.2 Representadas --- correÃ§Ã£o inicial de tipagem

Corrigido `app/representadas/nova/page.tsx` para aceitar
`HTMLSelectElement` no `handleChange`.

### 12.3 CalendÃ¡rios

Corrigidos:

-   `app/agenda/page.tsx`
-   `app/contabilidade/calendario/page.tsx`
-   `app/financeiro/calendario/page.tsx`

Uso incompatÃ­vel de `day` e `displayValue` foi substituÃ­do por
`modifiers` e `modifiersClassNames`.

### 12.4 Excel / Buffer

Corrigidos:

-   `app/api/clientes/exportar/route.ts`
-   `app/api/clientes/importar/route.ts`
-   `app/api/templates/route.ts`

Compatibilidade entre Buffer, Uint8Array, ArrayBuffer, BodyInit e
ExcelJS foi ajustada sem upgrade de dependÃªncias.

### 12.5 Layout / AlertReminder

`date` foi convertido para `time` e `type` removido no uso de
`AlertReminder`.

### 12.6 Contact Buttons

`md` passou a ser convertido internamente para `default`, preservando a
API pÃºblica.

### 12.7 Sales Comparison

Criado tipo `SalesPeriod` e conversÃ£o controlada no `onValueChange`.

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

TambÃ©m foram ampliados:

-   Cliente
-   Representada
-   Venda
-   Interacao
-   Financeiro

------------------------------------------------------------------------

## 14. Arquivo temporÃ¡rio Prisma

Existe localmente:

`prisma/proposed_schema_diff.sql`

Esse arquivo foi usado como artefato de comparaÃ§Ã£o do Prisma.

Ele NÃƒO foi incluÃ­do nos checkpoints Git/GitHub.

A migration oficial continua sendo:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

NÃ£o tratar `proposed_schema_diff.sql` como migration oficial, nÃ£o
executÃ¡-lo e nÃ£o adicionÃ¡-lo ao Git sem nova validaÃ§Ã£o tÃ©cnica
explÃ­cita.

Estado apÃ³s o checkpoint `a7668fd`:

`?? prisma/proposed_schema_diff.sql`

Isso Ã© proposital.

------------------------------------------------------------------------

## 15. Regras de negÃ³cio de comissÃ£o

ComissÃ£o nÃ£o deve ser tratada apenas como valor da venda Ã— percentual.

O sistema precisa suportar:

-   comissÃ£o por faturamento;
-   comissÃ£o por liquidez;
-   estornos;
-   recuperaÃ§Ãµes;
-   parcelas;
-   cortes;
-   diferentes datas de pagamento;
-   conta PF;
-   conta PJ;
-   exigÃªncia de NF;
-   nÃ£o exigÃªncia de NF;
-   histÃ³rico da regra comercial;
-   vigÃªncia de regra;
-   regra por representada;
-   regra especÃ­fica por cliente;
-   base de cÃ¡lculo;
-   percentual aplicado;
-   comissÃ£o prevista;
-   movimentos de comissÃ£o;
-   NF de comissÃ£o.

Contrato e emissÃ£o de NF sÃ£o dimensÃµes diferentes.

AusÃªncia de NF nÃ£o deve significar automaticamente ausÃªncia de contrato.

------------------------------------------------------------------------

## 16. Representadas --- estado funcional no checkpoint 6dcd74a

O mÃ³dulo Representadas foi ampliado e auditado em lote relevante.

Fluxos bÃ¡sicos validados funcionalmente com dados fictÃ­cios:

-   cadastro de representada;
-   comissÃ£o fixa;
-   comissÃ£o variada;
-   faixas adicionais de comissÃ£o;
-   visualizaÃ§Ã£o;
-   ediÃ§Ã£o;
-   conversÃ£o fixa â†’ variada;
-   conversÃ£o variada â†’ fixa;
-   exclusÃ£o de representada sem vÃ­nculos.

A API de exclusÃ£o foi protegida para impedir remoÃ§Ã£o de representadas
com histÃ³rico/vÃ­nculos em:

-   contratos;
-   regras comerciais;
-   vendas;
-   interaÃ§Ãµes;
-   notas de comissÃ£o;
-   contas de recebimento;
-   financeiro.

Quando houver vÃ­nculos, a regra correta Ã© inativar ou suspender em vez
de apagar o histÃ³rico.

### 16.1 APIs criadas

-   `app/api/representadas/[id]/contratos/route.ts`
-   `app/api/representadas/[id]/contratos/[contratoId]/route.ts`
-   `app/api/representadas/[id]/regras-comerciais/route.ts`
-   `app/api/representadas/[id]/regras-comerciais/[regraId]/route.ts`
-   `app/api/representadas/[id]/contas-recebimento/route.ts`
-   `app/api/representadas/[id]/contas-recebimento/[vinculoId]/route.ts`
-   `app/api/contas-bancarias/route.ts`
-   `app/api/empresas-escritorio/route.ts`

TambÃ©m foram reforÃ§adas:

-   `app/api/representadas/route.ts`
-   `app/api/representadas/[id]/route.ts`

As APIs passaram a usar whitelist explÃ­cita de campos em vez de repassar
`...body` diretamente ao Prisma.

### 16.2 Telas criadas

-   `app/representadas/[id]/contratos/page.tsx`
-   `app/representadas/[id]/regras-comerciais/page.tsx`
-   `app/representadas/[id]/contas-recebimento/page.tsx`

A pÃ¡gina principal da representada recebeu acessos diretos para:

-   Contratos
-   Regras Comerciais
-   Contas de Recebimento
-   Editar
-   Excluir

### 16.3 Contratos

Estrutura funcional criada para:

-   formalizaÃ§Ã£o fÃ­sica, digital, e-mail, verbal ou outra;
-   inÃ­cio e encerramento;
-   vigÃªncia;
-   revisÃµes;
-   empresa do escritÃ³rio;
-   origem/documento;
-   observaÃ§Ãµes;
-   proteÃ§Ã£o contra exclusÃ£o quando existir regra comercial vinculada.

### 16.4 Regras comerciais

Estrutura funcional criada para:

-   regra padrÃ£o por representada;
-   regra especÃ­fica por cliente;
-   vÃ­nculo opcional a contrato;
-   vigÃªncia;
-   pedido mÃ­nimo;
-   mÃ­nimo de parcela;
-   prazo de entrega;
-   prazo de faturamento;
-   frete;
-   regiÃ£o;
-   comissÃ£o fixa;
-   comissÃ£o variada por faixas;
-   reconhecimento de comissÃ£o;
-   fechamento e pagamento;
-   bloqueio de exclusÃ£o quando a regra jÃ¡ tiver sido usada em vendas.

### 16.5 Contas de recebimento

Estrutura inicial criada para vincular contas bancÃ¡rias existentes Ã 
representada.

A auditoria funcional detectou uma lacuna:

A tela consegue selecionar/vincular contas jÃ¡ existentes, mas ainda nÃ£o
possui fluxo completo para cadastrar uma nova `ContaBancaria`.

Essa lacuna deve ser resolvida antes de considerar o submÃ³dulo de contas
encerrado.

------------------------------------------------------------------------

## 17. Regra de negÃ³cio das contas 01 / 02 / 03

DecisÃ£o funcional registrada em 22/08/2026:

-   cada representada poderÃ¡ possuir atÃ© 3 opÃ§Ãµes de conta de
    recebimento cadastradas;
-   Conta 01 serÃ¡ a principal/prioritÃ¡ria;
-   Conta 01 serÃ¡ normalmente destinada a recebimentos de comissÃ£o com
    NF;
-   Conta 02 serÃ¡ alternativa normalmente destinada a recebimentos sem
    NF;
-   Conta 03 serÃ¡ uma opÃ§Ã£o adicional disponÃ­vel ao Diretor do
    escritÃ³rio;
-   as trÃªs contas podem permanecer cadastradas mesmo quando apenas uma
    estiver recebendo naquele momento;
-   a arquitetura deve permitir no futuro dividir o recebimento de uma
    comissÃ£o entre duas ou trÃªs contas;
-   a ordem 01/02/03 deve ser estÃ¡vel e nÃ£o depender apenas da ordem
    visual da consulta;
-   percentual de destino deve permitir futuro rateio controlado;
-   contrato e NF nÃ£o devem ser amarrados de forma automÃ¡tica entre si.

Estado do schema atual:

`RepresentadaContaRecebimento` ainda nÃ£o possui campos formais
especÃ­ficos para ordem/prioridade/finalidade 01/02/03.

Antes de alterar Prisma, migrations ou banco, deve existir validaÃ§Ã£o
explÃ­cita e checkpoint prÃ³prio.

------------------------------------------------------------------------

## 18. VÃ­nculo Representada â†’ EscritÃ³rio

`ContaBancaria.escritorioId` Ã© obrigatÃ³rio no Prisma.

`Representada.escritorioId` Ã© opcional no schema atual.

A auditoria pelo Prisma Studio confirmou em 22/08/2026:

-   Representada: 3 registros;
-   ContratoRepresentada: 1;
-   RegraComercialRepresentada: 1;
-   ContaBancaria: 0;
-   RepresentadaContaRecebimento: 0;
-   EmpresaEscritorio: 0;
-   Escritorio: 0;
-   Usuario: 0.

Portanto, naquela auditoria ainda nÃ£o existia um `Escritorio` real no
banco para ser usado como raiz institucional.

O setup inicial criado no checkpoint `53c41c2` foi projetado para criar
essa raiz.

NÃ£o criar conta bancÃ¡ria escolhendo ou presumindo um escritÃ³rio
arbitrariamente.

------------------------------------------------------------------------

## 19. AutenticaÃ§Ã£o e autorizaÃ§Ã£o --- checkpoint 53c41c2

Foi criado um lote estrutural de autenticaÃ§Ã£o e controle de acesso.

DependÃªncias adicionadas:

-   `bcryptjs`
-   `jose`

`AUTH_SECRET` foi configurado localmente no `.env.local`.

O valor do `AUTH_SECRET` nunca deve ser enviado para conversas, GitHub
ou documentaÃ§Ã£o pÃºblica.

### 19.1 Infraestrutura criada

Arquivos:

-   `lib/auth/session.ts`
-   `lib/auth/server.ts`
-   `lib/auth/permissions.ts`
-   `middleware.ts`

### 19.2 APIs de autenticaÃ§Ã£o

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

Criado tambÃ©m:

-   `components/auth/user-session-menu.tsx`

O componente foi integrado em:

-   `app/layout.tsx`

### 19.4 Login

A API de login suporta:

-   login por e-mail;
-   login por identificador/login;
-   senha com bcrypt;
-   bloqueio de usuÃ¡rio inativo;
-   bloqueio de usuÃ¡rio sem senha configurada;
-   validaÃ§Ã£o de perfil;
-   cookie HttpOnly;
-   SameSite Lax;
-   cookie Secure em produÃ§Ã£o;
-   atualizaÃ§Ã£o de `ultimoAcessoEm`.

### 19.5 Setup inicial

A API e pÃ¡gina de setup inicial estÃ£o prontas para criar:

-   primeiro `Escritorio`;
-   primeiro usuÃ¡rio `Diretor`;
-   usuÃ¡rio `Administrativo` opcional;
-   senha armazenada como hash;
-   login automÃ¡tico do Diretor apÃ³s setup.

ProteÃ§Ã£o:

O setup somente funciona enquanto:

-   total de `Escritorio` = 0;
-   total de `Usuario` = 0.

Depois disso, retorna conflito e nÃ£o cria uma segunda raiz
acidentalmente.

IMPORTANTE:

AtÃ© o checkpoint `a7668fd`, o setup inicial REAL ainda NÃƒO foi
executado.

Nenhum usuÃ¡rio real foi criado por esse fluxo atÃ© esse checkpoint.

------------------------------------------------------------------------

## 20. Perfis e polÃ­tica de seguranÃ§a

Perfis definidos:

-   Diretor
-   Administrativo
-   Preposto

A seguranÃ§a deve trabalhar com duas camadas:

1.  RBAC --- permissÃ£o por perfil/recurso/aÃ§Ã£o;
2.  escopo de dados --- permissÃ£o sobre registros especÃ­ficos.

Esconder botÃµes nÃ£o Ã© considerado seguranÃ§a suficiente.

Toda API sensÃ­vel deve validar:

-   sessÃ£o;
-   perfil;
-   aÃ§Ã£o;
-   escritÃ³rio;
-   escopo do registro.

### 20.1 Diretor

Diretor possui acesso integral ao sistema.

Inclui:

-   dados comerciais;
-   financeiro;
-   contabilidade;
-   usuÃ¡rios;
-   configuraÃ§Ãµes;
-   auditoria;
-   contas bancÃ¡rias;
-   gestÃ£o estrutural.

### 20.2 Administrativo

Administrativo possui acesso operacional ampliado.

Inclui:

-   clientes;
-   representadas;
-   contratos;
-   regras comerciais;
-   contas de recebimento;
-   vendas;
-   interaÃ§Ãµes;
-   agenda;
-   relatÃ³rios;
-   financeiro;
-   contabilidade.

NÃ£o deve administrar:

-   usuÃ¡rios;
-   configuraÃ§Ãµes estruturais;
-   auditoria administrativa;
-   permissÃµes superiores.

### 20.3 Preposto

Preposto deve operar com princÃ­pio de mÃ­nimo privilÃ©gio.

NÃ£o pode acessar nÃ­veis superiores de Diretoria ou AdministraÃ§Ã£o.

NÃ£o deve acessar:

-   contas bancÃ¡rias;
-   contas de recebimento;
-   financeiro;
-   contabilidade;
-   usuÃ¡rios;
-   configuraÃ§Ãµes;
-   auditoria;
-   dados globais do escritÃ³rio.

Pode acessar somente o necessÃ¡rio para sua atividade:

-   seu dashboard;
-   sua carteira;
-   representadas necessÃ¡rias Ã  sua funÃ§Ã£o;
-   regras comerciais necessÃ¡rias Ã  venda;
-   suas vendas;
-   suas interaÃ§Ãµes;
-   sua agenda;
-   seus relatÃ³rios;
-   consultas relacionadas Ã  prÃ³pria funÃ§Ã£o.

------------------------------------------------------------------------

## 21. Escopo de dados do Preposto

O middleware bloqueia Ã¡reas e aÃ§Ãµes, mas NÃƒO substitui o filtro de
registros nas APIs.

### 21.1 Vendas --- isolamento implementado no checkpoint a7668fd

Preposto visualiza registros quando:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A API tambÃ©m filtra pelo `escritorioId` da sessÃ£o.

GET, POST, GET por ID, PUT e DELETE receberam proteÃ§Ã£o de escopo.

Preposto nÃ£o pode criar venda em nome de outro usuÃ¡rio.

### 21.2 Clientes --- isolamento implementado no checkpoint a7668fd

Preposto visualiza clientes quando:

-   `responsavelPrincipalId = usuario logado`;
-   OU existir `ClienteParticipacao` ativa para o usuÃ¡rio.

A API tambÃ©m filtra pelo `escritorioId` da sessÃ£o.

GET, POST, GET por ID, PUT e DELETE receberam proteÃ§Ã£o de escopo.

### 21.3 InteraÃ§Ãµes --- isolamento implementado no checkpoint a7668fd

Preposto visualiza registros quando:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A API tambÃ©m filtra pelo `escritorioId` da sessÃ£o.

GET, POST, GET por ID, PUT e DELETE receberam proteÃ§Ã£o de escopo.

CriaÃ§Ã£o e ediÃ§Ã£o validam o cliente informado contra o escritÃ³rio e a
carteira permitida.

### 21.4 Agenda --- ainda nÃ£o integrada ao banco

A revisÃ£o realizada em 23/08/2026 constatou que a Agenda ainda utiliza
dados fictÃ­cios/estÃ¡ticos.

Quando for integrada aos dados reais, a Agenda de Preposto deverÃ¡ ser
derivada somente dos registros relacionados ao prÃ³prio usuÃ¡rio e ao
escritÃ³rio da sessÃ£o.

### 21.5 RelatÃ³rios --- ainda nÃ£o integrados ao banco

A revisÃ£o realizada em 23/08/2026 constatou que RelatÃ³rios ainda utiliza
mÃ©tricas fictÃ­cias/estÃ¡ticas.

Quando for integrado aos dados reais, todo relatÃ³rio de Preposto deverÃ¡
ser calculado somente sobre seu universo autorizado.

Nunca usar dados globais do escritÃ³rio em relatÃ³rio de usuÃ¡rio simples.

------------------------------------------------------------------------

## 22. Middleware

O middleware atual valida:

-   presenÃ§a de sessÃ£o;
-   validade criptogrÃ¡fica do token;
-   pÃ¡ginas pÃºblicas;
-   APIs pÃºblicas de autenticaÃ§Ã£o;
-   recurso solicitado;
-   perfil;
-   mÃ©todo HTTP convertido em aÃ§Ã£o.

Mapeamento:

-   GET â†’ ver
-   HEAD â†’ ver
-   OPTIONS â†’ ver
-   POST â†’ criar
-   PUT â†’ editar
-   PATCH â†’ editar
-   DELETE â†’ excluir

Resultados:

-   sem autenticaÃ§Ã£o em API â†’ 401;
-   sessÃ£o invÃ¡lida â†’ 401;
-   operaÃ§Ã£o sem permissÃ£o â†’ 403;
-   pÃ¡gina sem permissÃ£o â†’ `/acesso-negado`.

O middleware nÃ£o deve ser tratado como Ãºnico controle de seguranÃ§a de
dados.

------------------------------------------------------------------------

## 23. Vulnerabilidades npm

ApÃ³s instalar `bcryptjs` e `jose`, o npm informou:

-   8 vulnerabilidades;
-   2 moderate;
-   5 high;
-   1 critical.

NÃ£o foi executado:

-   `npm audit fix`
-   `npm audit fix --force`

Essas vulnerabilidades precisam ser auditadas em lote tÃ©cnico prÃ³prio.

NÃ£o aplicar correÃ§Ã£o automÃ¡tica sem analisar dependÃªncias afetadas e
risco de breaking changes.

------------------------------------------------------------------------

## 24. Identidade visual futura

Foi registrada uma etapa futura exclusiva para identidade visual
profissional.

Essa etapa deve ocorrer depois de autenticaÃ§Ã£o/seguranÃ§a estarem
estabilizadas e versionadas.

Quando chegar o momento, solicitar o logotipo atual e demais materiais
necessÃ¡rios.

Escopo previsto:

-   logotipo;
-   marca do CRM;
-   pÃ¡gina de login;
-   sidebar/cabeÃ§alho;
-   dashboard;
-   favicon;
-   cores institucionais;
-   tipografia;
-   cards;
-   espaÃ§amentos;
-   loading;
-   erros;
-   aplicaÃ§Ã£o consistente da identidade em Clientes, Representadas e
    demais mÃ³dulos.

NÃ£o misturar redesign visual com lote de seguranÃ§a ou migration
estrutural.

------------------------------------------------------------------------

## 25. Front-end --- ordem recomendada

Estado da ordem funcional:

1.  SeguranÃ§a e isolamento de Clientes/Vendas/InteraÃ§Ãµes --- concluÃ­do
    estruturalmente no checkpoint `a7668fd`.
2.  Setup inicial e testes reais de autenticaÃ§Ã£o/perfis --- prÃ³xima fase
    de seguranÃ§a a definir e executar com controle.
3.  Concluir Representadas / contas.
4.  Integrar regras comerciais com Vendas.
5.  Integrar comissÃ£o/faturamento.
6.  Financeiro.
7.  Contabilidade.
8.  Agenda real.
9.  RelatÃ³rios/Dashboard reais.
10. Identidade visual profissional em lote prÃ³prio.

AlteraÃ§Ãµes visuais amplas devem ser feitas somente depois da validaÃ§Ã£o
funcional e de seguranÃ§a correspondente.

------------------------------------------------------------------------

## 26. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referÃªncia:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

"Leia o DOCUMENTO_MESTRE_CRM.md no GitHub e continue exatamente do
checkpoint registrado. Este documento Ã© a fonte oficial de continuidade
do projeto."

NÃ£o depender exclusivamente da memÃ³ria automÃ¡tica.

------------------------------------------------------------------------

## 27. MemÃ³ria e fontes oficiais

A continuidade oficial deve depender de:

1.  GitHub
2.  `DOCUMENTO_MESTRE_CRM.md`
3.  histÃ³rico das conversas
4.  arquivos do repositÃ³rio

O documento mestre deve ser atualizado em checkpoints relevantes.

GitHub e este documento sÃ£o os dois principais pontos de recuperaÃ§Ã£o do
projeto.

------------------------------------------------------------------------

## 28. Estado atual do projeto

Estado tÃ©cnico:

ESTÃVEL PARA CONTINUAR O DESENVOLVIMENTO

Ãšltimo checkpoint funcional:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

ValidaÃ§Ãµes do lote:

-   TypeScript: OK --- 0 erros
-   `git diff --check`: OK
-   Build: OK
-   42/42 pÃ¡ginas estÃ¡ticas geradas
-   Middleware: compilado
-   Login: infraestrutura criada
-   Logout: infraestrutura criada
-   SessÃ£o: infraestrutura criada
-   Setup inicial: criado, mas ainda nÃ£o executado
-   PermissÃµes: matriz criada
-   Isolamento de Clientes: implementado
-   Isolamento de Vendas: implementado
-   Isolamento de InteraÃ§Ãµes: implementado
-   Rotas por ID desses trÃªs mÃ³dulos: protegidas
-   Git commit: criado
-   GitHub push: concluÃ­do

Ainda pendente:

-   execuÃ§Ã£o segura do setup inicial real;
-   criaÃ§Ã£o real do Diretor;
-   criaÃ§Ã£o do Administrativo, se aplicÃ¡vel;
-   criaÃ§Ã£o futura de Preposto de teste;
-   testes funcionais de login/logout;
-   testes funcionais dos trÃªs perfis;
-   validaÃ§Ã£o prÃ¡tica do isolamento entre usuÃ¡rios;
-   integraÃ§Ã£o real da Agenda;
-   integraÃ§Ã£o real dos RelatÃ³rios;
-   lint;
-   auditoria das vulnerabilidades npm;
-   fechamento completo das contas bancÃ¡rias/recebimento;
-   formalizaÃ§Ã£o de contas 01/02/03;
-   integraÃ§Ã£o de regras comerciais com Vendas;
-   integraÃ§Ã£o total de comissÃ£o;
-   integraÃ§Ã£o total de faturamento;
-   integraÃ§Ã£o total de financeiro;
-   identidade visual futura;
-   substituiÃ§Ã£o controlada de dados fictÃ­cios por dados reais somente
    depois dos testes correspondentes.

------------------------------------------------------------------------

## 29. PrÃ³ximo passo exato

O lote de isolamento estrutural de Clientes, Vendas e InteraÃ§Ãµes foi
concluÃ­do e versionado.

NÃƒO repetir esse lote.

NÃƒO executar migration ou alteraÃ§Ã£o de schema automaticamente.

NÃƒO executar `npm audit fix` automaticamente.

NÃƒO adicionar `prisma/proposed_schema_diff.sql` ao Git.

NÃƒO criar contas bancÃ¡rias presumindo um `Escritorio`.

Antes de integraÃ§Ãµes funcionais maiores, a prÃ³xima fase deve partir do
estado real do banco e da seguranÃ§a.

SequÃªncia segura recomendada:

1.  Confirmar o estado real de `Escritorio` e `Usuario` antes de
    qualquer setup.
2.  Se o banco continuar sem raiz institucional, planejar e executar o
    setup inicial real de forma controlada.
3.  Criar o primeiro Diretor somente pelo fluxo validado de setup.
4.  Criar Administrativo somente se aplicÃ¡vel e com dados explicitamente
    fornecidos.
5.  Criar Preposto de teste apenas quando houver condiÃ§Ãµes para validar
    isolamento.
6.  Testar login/logout e permissÃµes de Diretor, Administrativo e
    Preposto.
7.  Testar na prÃ¡tica o isolamento de Clientes, Vendas e InteraÃ§Ãµes
    entre usuÃ¡rios.
8.  Somente depois dos testes de seguranÃ§a, avanÃ§ar para integraÃ§Ãµes
    funcionais maiores.
9.  Criar checkpoint Git/GitHub ao final de cada lote validado.

A execuÃ§Ã£o do setup real nÃ£o deve ser iniciada sem antes confirmar o
estado do banco.

------------------------------------------------------------------------

## 30. Regra de decisÃ£o tÃ©cnica

NÃ£o alterar cÃ³digo apenas para silenciar erro.

Sempre identificar:

Problema â†’ Causa raiz â†’ Risco â†’ CorreÃ§Ã£o â†’ Impacto

Evitar:

-   gambiarras;
-   casts excessivos;
-   duplicaÃ§Ã£o de regra;
-   quebra de API existente;
-   alteraÃ§Ã£o estrutural sem necessidade;
-   mudanÃ§a de banco sem validaÃ§Ã£o;
-   reescrita desnecessÃ¡ria;
-   criaÃ§Ã£o de campos sem regra de negÃ³cio definida;
-   autorizaÃ§Ã£o somente visual;
-   APIs retornando dados globais para usuÃ¡rio de escopo restrito.

------------------------------------------------------------------------

## 31. Regra final

O sistema deve evoluir preservando:

-   seguranÃ§a;
-   histÃ³rico;
-   previsibilidade;
-   rastreabilidade;
-   estabilidade;
-   isolamento de dados;
-   princÃ­pio de mÃ­nimo privilÃ©gio;
-   baixo risco de regressÃ£o;
-   clareza para manutenÃ§Ã£o futura.

A substituiÃ§Ã£o integral de arquivos editados manualmente Ã© a regra
operacional padrÃ£o para reduzir erros.

------------------------------------------------------------------------

## 32. Checkpoint de isolamento de dados --- 23/08/2026

Checkpoint Git/GitHub:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

Mensagem:

`feat: aplica isolamento de dados em clientes vendas e interacoes`

Branch:

`main`

Push para GitHub concluÃ­do com sucesso.

### 32.1 Escopo concluÃ­do

Foi concluÃ­do o primeiro lote de isolamento de dados por sessÃ£o,
escritÃ³rio e usuÃ¡rio nas APIs de:

-   Clientes;
-   Vendas;
-   InteraÃ§Ãµes.

Foram alterados e versionados exatamente 6 arquivos:

-   `app/api/clientes/route.ts`
-   `app/api/clientes/[id]/route.ts`
-   `app/api/vendas/route.ts`
-   `app/api/vendas/[id]/route.ts`
-   `app/api/interacoes/route.ts`
-   `app/api/interacoes/[id]/route.ts`

### 32.2 Clientes

A listagem passou a exigir sessÃ£o e filtrar por `escritorioId`.

Para Preposto, o acesso Ã© limitado aos clientes em que:

-   `responsavelPrincipalId = usuario logado`;
-   OU exista `ClienteParticipacao` ativa para o usuÃ¡rio.

A criaÃ§Ã£o registra:

-   `escritorioId` da sessÃ£o;
-   `originadoPorId`;
-   `responsavelPrincipalId`.

Preposto nÃ£o pode utilizar a API para atribuir o cliente criado a outro
usuÃ¡rio.

GET, PUT e DELETE por ID tambÃ©m passaram a validar o escopo antes de
acessar ou modificar o registro.

### 32.3 Vendas

A listagem passou a exigir sessÃ£o e filtrar por `escritorioId`.

Para Preposto, o acesso Ã© limitado Ã s vendas em que:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A criaÃ§Ã£o registra:

-   `escritorioId` da sessÃ£o;
-   `criadoPorId`;
-   `responsavelId`.

Preposto nÃ£o pode criar venda em nome de outro usuÃ¡rio.

GET, PUT e DELETE por ID passaram a validar o escopo da venda antes da
operaÃ§Ã£o.

AlteraÃ§Ã£o de cliente durante ediÃ§Ã£o tambÃ©m passou a validar o cliente
contra o escritÃ³rio e o escopo permitido.

### 32.4 InteraÃ§Ãµes

A listagem passou a exigir sessÃ£o e filtrar por `escritorioId`.

Para Preposto, o acesso Ã© limitado Ã s interaÃ§Ãµes em que:

-   `responsavelId = usuario logado`;
-   OU `criadoPorId = usuario logado`.

A criaÃ§Ã£o registra:

-   `escritorioId` da sessÃ£o;
-   `criadoPorId`;
-   `responsavelId`.

Antes da criaÃ§Ã£o, o cliente informado Ã© validado contra:

-   `escritorioId`;
-   carteira permitida ao Preposto.

GET, PUT e DELETE por ID tambÃ©m passaram a validar o escopo antes da
operaÃ§Ã£o.

Na ediÃ§Ã£o, o cliente informado Ã© novamente validado para impedir
associaÃ§Ã£o da interaÃ§Ã£o a cliente fora do escopo autorizado.

### 32.5 Agenda e RelatÃ³rios

Agenda e RelatÃ³rios foram revisados neste lote.

Estado encontrado:

-   Agenda ainda utiliza dados fictÃ­cios/estÃ¡ticos;
-   RelatÃ³rios ainda utiliza mÃ©tricas fictÃ­cias/estÃ¡ticas;
-   essas pÃ¡ginas ainda nÃ£o consultam os dados reais do banco.

Por esse motivo, nÃ£o foram alteradas neste lote.

Quando forem integradas ao banco, deverÃ£o obrigatoriamente respeitar:

-   `escritorioId`;
-   perfil;
-   `usuarioId`;
-   escopo de carteira;
-   princÃ­pio de mÃ­nimo privilÃ©gio.

### 32.6 ValidaÃ§Ãµes do lote

Executado:

`npx tsc --noEmit`

Resultado:

-   0 erros TypeScript.

Executado:

`git diff --check`

Resultado:

-   nenhuma inconsistÃªncia reportada.

Executado:

`npm run build`

Resultado:

-   `Compiled successfully`;
-   42/42 pÃ¡ginas estÃ¡ticas geradas;
-   Middleware compilado;
-   APIs processadas;
-   build de produÃ§Ã£o concluÃ­do com sucesso.

ObservaÃ§Ã£o:

O build continua informando:

-   `Skipping validation of types`
-   `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint permanece pendente para lote tÃ©cnico prÃ³prio.

### 32.7 Estado do arquivo temporÃ¡rio Prisma

O arquivo:

`prisma/proposed_schema_diff.sql`

continua local, nÃ£o rastreado pelo Git e nÃ£o foi incluÃ­do no checkpoint.

Estado esperado:

`?? prisma/proposed_schema_diff.sql`

Esse arquivo continua protegido pelas regras anteriores:

-   nÃ£o executar;
-   nÃ£o tratar como migration oficial;
-   nÃ£o adicionar ao Git;
-   nÃ£o excluir sem nova anÃ¡lise tÃ©cnica.

### 32.8 Regra operacional consolidada de ediÃ§Ã£o de arquivos

A partir deste checkpoint, para reduzir risco de erro manual:

1.  Toda alteraÃ§Ã£o manual deve comeÃ§ar com o comando para abrir o
    arquivo no Bloco de Notas.
2.  Quando o conteÃºdo atual jÃ¡ for conhecido e confiÃ¡vel, nÃ£o solicitar
    novamente o arquivo.
3.  Toda alteraÃ§Ã£o deve ser entregue como conteÃºdo integral, final e
    revisado do arquivo.
4.  O usuÃ¡rio deve substituir o arquivo inteiro, e nÃ£o inserir
    manualmente trechos.
5.  AlteraÃ§Ã£o parcial sÃ³ serÃ¡ usada quando a substituiÃ§Ã£o integral for
    tecnicamente inviÃ¡vel e isso for explicitamente explicado.
6.  ApÃ³s alteraÃ§Ã£o de cÃ³digo, validaÃ§Ã£o rÃ¡pida padrÃ£o:
    `npx tsc --noEmit`.
7.  ValidaÃ§Ãµes amplas ficam para o fechamento do lote.
8.  Checkpoint Git/GitHub somente apÃ³s validaÃ§Ã£o.
9.  NÃ£o usar `git add .` quando houver arquivo local protegido.
10. Adicionar explicitamente somente os arquivos aprovados.

### 32.9 Estado atual apÃ³s o checkpoint a7668fd

ConcluÃ­do:

-   infraestrutura de autenticaÃ§Ã£o;
-   middleware;
-   matriz inicial de permissÃµes;
-   isolamento de Clientes;
-   isolamento de Vendas;
-   isolamento de InteraÃ§Ãµes;
-   proteÃ§Ã£o das rotas por ID desses trÃªs mÃ³dulos;
-   validaÃ§Ã£o TypeScript;
-   validaÃ§Ã£o de diff;
-   build de produÃ§Ã£o;
-   checkpoint Git/GitHub.

Ainda pendente:

-   execuÃ§Ã£o segura do setup inicial real;
-   criaÃ§Ã£o real do Diretor;
-   criaÃ§Ã£o do Administrativo, se aplicÃ¡vel;
-   criaÃ§Ã£o futura de Preposto de teste;
-   testes funcionais dos trÃªs perfis;
-   validaÃ§Ã£o prÃ¡tica do isolamento entre usuÃ¡rios;
-   integraÃ§Ã£o real da Agenda;
-   integraÃ§Ã£o real dos RelatÃ³rios;
-   lint;
-   auditoria das vulnerabilidades npm;
-   conclusÃ£o das contas bancÃ¡rias/recebimento;
-   formalizaÃ§Ã£o das contas 01/02/03;
-   integraÃ§Ã£o de regras comerciais com Vendas;
-   integraÃ§Ã£o completa de comissÃ£o;
-   integraÃ§Ã£o completa de faturamento;
-   integraÃ§Ã£o completa de financeiro;
-   identidade visual em lote prÃ³prio.

### 32.10 PrÃ³xima etapa

O isolamento estrutural das APIs de Clientes, Vendas e InteraÃ§Ãµes foi
concluÃ­do.

A prÃ³xima fase deve comeÃ§ar pela confirmaÃ§Ã£o do estado real do banco
antes do setup inicial.

NÃ£o executar migration ou alteraÃ§Ã£o de schema automaticamente.

NÃ£o executar `npm audit fix` automaticamente.

NÃ£o adicionar `prisma/proposed_schema_diff.sql` ao Git.

Preservar o checkpoint:

`a7668fd6f05c46ebb40582894f9c7ed9963212bd`

GitHub e este documento sÃ£o os dois principais pontos de recuperaÃ§Ã£o do
projeto.

------------------------------------------------------------------------

## 33. Checkpoint funcional de autenticaÃ§Ã£o real e evoluÃ§Ã£o de InteraÃ§Ãµes --- 23/08/2026

Este checkpoint atualiza o estado operacional do projeto apÃ³s a execuÃ§Ã£o
real do setup inicial e os testes funcionais realizados em 23/08/2026.

Quando houver conflito entre esta seÃ§Ã£o e estados histÃ³ricos registrados
nas seÃ§Ãµes anteriores, esta seÃ§Ã£o representa o estado mais recente.

Checkpoint funcional local criado:

`2c11a78`

Mensagem:

`feat: aprimora fluxo operacional de interacoes`

Branch:

`main`

O push desse checkpoint ainda deve ser confirmado antes de considerar o
GitHub atualizado.

### 33.1 Setup inicial real executado

O setup inicial deixou de ser apenas infraestrutura preparada.

Estado real confirmado no PostgreSQL apÃ³s execuÃ§Ã£o:

-   Escritorio: 1 registro;
-   Usuario: 2 registros.

UsuÃ¡rios reais criados:

-   Luiz Fernando --- perfil Diretor;
-   Paula --- perfil Administrativo.

Ambos pertencem ao mesmo escritÃ³rio:

`Luiz SodrÃ© RepresentaÃ§Ãµes`

Os dois usuÃ¡rios estÃ£o ativos.

A consulta ao banco confirmou tambÃ©m que ambos possuem `senhaHash`
presente com 60 caracteres e que os hashes dos dois usuÃ¡rios sÃ£o
diferentes.

Portanto, ficam SUPERADOS os trechos anteriores que informavam:

-   Escritorio = 0;
-   Usuario = 0;
-   setup inicial ainda nÃ£o executado;
-   Diretor real ainda nÃ£o criado;
-   Administrativo real ainda nÃ£o criado.

### 33.2 Ambiente PostgreSQL local

PostgreSQL 16 estÃ¡ instalado localmente.

ServiÃ§o confirmado:

`postgresql-x64-16`

Estado:

`Running`

ExecutÃ¡vel utilizado:

`C:\Program Files\PostgreSQL\16\bin\psql.exe`

Banco utilizado:

`crm_luiz_sodre`

Porta:

`5432`

O `psql` nÃ£o estÃ¡ atualmente disponÃ­vel diretamente no PATH do Windows,
por isso as consultas foram executadas utilizando o caminho completo do
executÃ¡vel.

O `pg_hba.conf` local foi identificado utilizando `trust` para conexÃµes
localhost IPv4 e IPv6.

A questÃ£o de senha administrativa do PostgreSQL deve ser tratada
posteriormente em lote de seguranÃ§a prÃ³prio.

### 33.3 VariÃ¡veis de ambiente

Foi identificado e corrigido um erro de formataÃ§Ã£o da `DATABASE_URL`.

A causa do erro inicial do Prisma era o valor carregado com caracteres de
aspas incorretos, fazendo o Prisma interpretar que a URL nÃ£o comeÃ§ava com
`postgresql://` ou `postgres://`.

Depois da correÃ§Ã£o, a API:

`GET /api/auth/setup-inicial`

passou a consultar corretamente o banco.

Segredos e senhas nÃ£o devem ser registrados neste documento, enviados ao
GitHub ou compartilhados em conversas.

### 33.4 SessÃµes e usuÃ¡rios

Foi criado e integrado o indicador global de sessÃ£o:

`components/auth/user-session-menu.tsx`

Integrado em:

`app/layout.tsx`

O sistema passa a identificar visualmente:

-   usuÃ¡rio logado;
-   perfil;
-   aÃ§Ã£o de logout.

A posiÃ§Ã£o e identidade visual ainda devem ser refinadas no lote futuro de
padronizaÃ§Ã£o do front-end.

### 33.5 Teste simultÃ¢neo de sessÃµes

Durante os testes foram utilizadas telas com Diretor e Administrativo.

Foi constatada a necessidade de validar corretamente sessÃµes simultÃ¢neas
em navegadores independentes.

Abrir duas abas do mesmo navegador NÃƒO deve ser tratado como duas sessÃµes
independentes porque os cookies sÃ£o compartilhados.

Foi tentado Microsoft Edge como segundo navegador, mas o teste ainda nÃ£o
foi concluÃ­do de forma conclusiva.

PENDENTE:

-   validar login simultÃ¢neo em Chrome e Edge ou outro contexto isolado;
-   validar mÃºltiplos dispositivos;
-   confirmar que Diretor e Administrativo permanecem autenticados
    simultaneamente;
-   somente depois validar notificaÃ§Ãµes entre usuÃ¡rios.

NÃ£o existe decisÃ£o de limitar o CRM a uma Ãºnica mÃ¡quina ou sessÃ£o.

O comportamento esperado Ã© permitir mÃºltiplos dispositivos conforme as
permissÃµes do usuÃ¡rio.

### 33.6 Vendas --- ajustes operacionais

A pÃ¡gina:

`app/vendas/nova/page.tsx`

foi aprimorada para melhorar validaÃ§Ãµes e estados sem dados.

Regra de negÃ³cio definida:

Uma nova venda deve nascer normalmente como:

`Pendente`

O faturamento real serÃ¡ informado posteriormente apÃ³s confirmaÃ§Ã£o da
representada por e-mail, WhatsApp, telefone ou outro meio vÃ¡lido.

Essa evoluÃ§Ã£o futura deverÃ¡ alimentar os demais mÃ³dulos relacionados,
incluindo faturamento, comissÃ£o e financeiro.

Ainda deve ser revisado se o campo de status precisa permanecer visÃ­vel no
cadastro inicial ou ser totalmente controlado pelo fluxo de negÃ³cio.

### 33.7 Clientes --- validaÃ§Ã£o ainda pendente

Foi identificado durante testes que Novo Cliente permite salvar com
quantidade mÃ­nima de informaÃ§Ãµes.

NÃ£o foi definida ainda a regra final de obrigatoriedade para:

-   CNPJ;
-   telefone;
-   WhatsApp;
-   e-mail;
-   outros dados cadastrais.

NÃ£o tornar todos os campos obrigatÃ³rios arbitrariamente.

PrÃ³ximo lote deve definir:

-   cadastro mÃ­nimo operacional;
-   campos obrigatÃ³rios;
-   campos recomendados;
-   alertas;
-   validaÃ§Ãµes formais.

### 33.8 Representadas --- isolamento por escritÃ³rio reforÃ§ado

Foi alterada:

`app/api/representadas/route.ts`

A listagem passou a utilizar:

`escritorioId` da sessÃ£o autenticada.

A criaÃ§Ã£o tambÃ©m passou a vincular explicitamente a nova representada ao
escritÃ³rio da sessÃ£o.

Preposto nÃ£o deve cadastrar representadas institucionais.

PENDENTE estrutural identificado no cadastro de Representadas:

adicionar campos prÃ³prios para:

-   nÃºmero do endereÃ§o;
-   bairro;
-   regiÃ£o comercial/geogrÃ¡fica.

Exemplos de regiÃ£o:

-   Norte;
-   Sul;
-   Leste;
-   Oeste.

NÃ£o concatenar esses dados informalmente em `endereco`.

Antes de criar os campos, analisar Prisma, migration e impacto nas telas.

### 33.9 InteraÃ§Ãµes --- evoluÃ§Ã£o funcional concluÃ­da neste checkpoint

InteraÃ§Ãµes deixou de ser tratada apenas como histÃ³rico simples de Cliente
e passou a evoluir para uma central de rastreabilidade comercial.

Estrutura atual utilizada:

-   `clienteId`;
-   `representadaId`;
-   `vendaId`;
-   `criadoPorId`;
-   `responsavelId`;
-   `escritorioId`;
-   `proximoContatoEm`;
-   `statusFollowUp`;
-   `criadoEm`;
-   `atualizadoEm`.

Nenhuma migration foi necessÃ¡ria neste lote para essas funcionalidades.

### 33.10 Autoria de InteraÃ§Ãµes

O banco confirmou que `criadoPorId` estÃ¡ funcionando.

Consultas de teste mostraram:

-   nome do usuÃ¡rio;
-   perfil;
-   `criadoPorId`;
-   `responsavelId`;
-   `escritorioId`.

A API passa a usar exclusivamente a sessÃ£o autenticada para determinar o
autor.

O formulÃ¡rio nÃ£o deve escolher manualmente quem criou uma interaÃ§Ã£o.

A listagem passa a mostrar:

-   nome do autor;
-   perfil do autor.

### 33.11 Data e hora da InteraÃ§Ã£o

Regra definida:

A data e hora da criaÃ§Ã£o da interaÃ§Ã£o devem ser registradas
automaticamente pelo servidor.

O usuÃ¡rio nÃ£o deve informar manualmente a data/hora oficial da interaÃ§Ã£o
no fluxo normal.

Na ediÃ§Ã£o:

-   data original deve permanecer preservada;
-   autor original deve permanecer preservado.

O campo de data futura Ã© destinado apenas a:

`PrÃ³ximo acompanhamento`

PENDENTE:

melhorar o seletor visual de prÃ³ximo acompanhamento utilizando calendÃ¡rio
e experiÃªncia mais simples, com referÃªncia clara Ã  data atual.

### 33.12 InteraÃ§Ã£o vinculada a Cliente ou Representada

O fluxo foi ampliado para permitir que uma interaÃ§Ã£o seja relacionada a:

-   Cliente;
-   OU Representada.

NÃ£o deve estar ligada simultaneamente aos dois pelo formulÃ¡rio atual.

Exemplo operacional validado conceitualmente:

Paula pode registrar uma cobranÃ§a de relatÃ³rio de comissÃ£o diretamente na
Representada e informar um prÃ³ximo acompanhamento para nova cobranÃ§a caso
o documento nÃ£o seja recebido.

Isso permite transformar esquecimentos operacionais em tarefas
rastreÃ¡veis.

InteraÃ§Ãµes institucionais com Representadas ficam restritas a perfis
superiores conforme regra de autorizaÃ§Ã£o.

### 33.13 InteraÃ§Ãµes de Preposto

Regra funcional definida:

Preposto nÃ£o deve enxergar o histÃ³rico global do escritÃ³rio.

Ele deve enxergar interaÃ§Ãµes relacionadas aos clientes da sua prÃ³pria
carteira, inclusive quando uma interaÃ§Ã£o nesses clientes tiver sido
realizada pelo Diretor ou Administrativo.

A carteira Ã© determinada por:

-   `responsavelPrincipalId`;
-   OU `ClienteParticipacao` ativa.

InteraÃ§Ãµes institucionais da Representada nÃ£o devem ser expostas
automaticamente a Preposto sem regra especÃ­fica.

A validaÃ§Ã£o prÃ¡tica com um Preposto real ainda estÃ¡ pendente.

### 33.14 HistÃ³rico e filtros de InteraÃ§Ãµes

A pÃ¡gina:

`app/interacoes/page.tsx`

foi reorganizada para reduzir rolagem horizontal excessiva.

A apresentaÃ§Ã£o passou a agrupar as informaÃ§Ãµes em blocos mais compactos.

Foram criados filtros operacionais:

-   Todas;
-   Pendentes;
-   Acompanhar;
-   Finalizadas;
-   Sem acompanhamento.

Os filtros possuem contadores.

Conceitos atuais:

`Pendentes`

Representa acompanhamentos com data vencida e que ainda nÃ£o foram
finalizados.

`Acompanhar`

Inclui estados:

-   Aberto;
-   Em acompanhamento.

`Finalizadas`

Inclui:

-   `statusFollowUp = Finalizado`

`Sem acompanhamento`

Registros que nÃ£o exigem aÃ§Ã£o futura.

Essas regras devem ser reavaliadas com uso real antes de serem tratadas
como definitivas.

### 33.15 Status de acompanhamento

Estados utilizados neste lote:

-   Aberto;
-   Em acompanhamento;
-   Finalizado;
-   Sem acompanhamento.

O status pode ser alterado pela ediÃ§Ã£o da interaÃ§Ã£o.

Uma interaÃ§Ã£o em estado Aberto ou Em acompanhamento deve possuir data de
prÃ³ximo acompanhamento.

### 33.16 AtualizaÃ§Ã£o automÃ¡tica de InteraÃ§Ãµes

A pÃ¡gina de InteraÃ§Ãµes consulta novamente os registros a cada:

`15 segundos`

Essa implementaÃ§Ã£o Ã© polling periÃ³dico.

NÃ£o chamar tecnicamente de tempo real.

No futuro pode ser substituÃ­da por SSE, WebSocket ou outra soluÃ§Ã£o se o
benefÃ­cio operacional justificar a complexidade.

### 33.17 NotificaÃ§Ãµes globais de novas InteraÃ§Ãµes --- PENDENTE

Foi definida uma funcionalidade futura de alto valor.

Quando outro usuÃ¡rio registrar nova interaÃ§Ã£o, o usuÃ¡rio conectado deverÃ¡
receber:

-   aviso discreto no lado esquerdo;
-   mensagem semelhante a `Nova interaÃ§Ã£o realizada`;
-   duraÃ§Ã£o aproximada de 3 a 5 segundos;
-   Ã­cone persistente de notificaÃ§Ãµes;
-   contador de novas interaÃ§Ãµes nÃ£o visualizadas;
-   ao visualizar as novas interaÃ§Ãµes, o contador correspondente deve ser
    baixado.

O estado de leitura deve ser individual por usuÃ¡rio e persistente entre
dispositivos.

NÃ£o implementar exclusivamente com `localStorage`.

Provavelmente serÃ¡ necessÃ¡rio estado persistente no banco.

Antes disso, concluir o teste de mÃºltiplas sessÃµes/navegadores.

### 33.18 Tipos de InteraÃ§Ã£o

Tipos padronizados atualmente mantidos:

-   WhatsApp;
-   E-mail;
-   Visita;
-   LigaÃ§Ã£o.

A categoria:

`Outro`

foi retirada da navegaÃ§Ã£o/formulÃ¡rio principal.

DecisÃ£o futura:

criar administraÃ§Ã£o de Tipos de InteraÃ§Ã£o.

Exemplos:

-   IndicaÃ§Ã£o;
-   CaptaÃ§Ã£o;
-   Oportunidade de Venda;
-   Rede Social;
-   PÃ³s-venda;
-   outras categorias formalmente aprovadas.

NÃ£o permitir criaÃ§Ã£o livre indiscriminada por qualquer usuÃ¡rio porque isso
geraria duplicidades semÃ¢nticas.

Exemplo de problema a evitar:

-   IndicaÃ§Ã£o;
-   IndicaÃ§Ãµes;
-   Lead indicado;
-   Cliente indicado.

A criaÃ§Ã£o/ediÃ§Ã£o dos tipos deve ser administrada por perfil autorizado.

Essa funcionalidade exige anÃ¡lise estrutural prÃ³pria.

### 33.19 CÃ³digo comercial da InteraÃ§Ã£o --- PENDENTE E PRIORITÃRIO

Foi aprovada conceitualmente a criaÃ§Ã£o de um cÃ³digo comercial de
rastreamento para cada interaÃ§Ã£o.

Formato de referÃªncia:

`INT-000001`

Requisitos:

-   Ãºnico;
-   imutÃ¡vel;
-   visÃ­vel ao usuÃ¡rio;
-   pesquisÃ¡vel;
-   utilizÃ¡vel em Cliente;
-   utilizÃ¡vel em Representada;
-   utilizÃ¡vel em relatÃ³rios;
-   utilizÃ¡vel em notificaÃ§Ãµes;
-   utilizÃ¡vel em auditoria.

O `id` tÃ©cnico CUID nÃ£o deve substituir o cÃ³digo comercial.

A ediÃ§Ã£o de uma interaÃ§Ã£o NÃƒO deve criar um novo cÃ³digo de interaÃ§Ã£o.

A interaÃ§Ã£o permanece sendo o mesmo registro.

AlteraÃ§Ãµes devem possuir rastreabilidade prÃ³pria por auditoria/versÃ£o.

ImplementaÃ§Ã£o exige anÃ¡lise de schema e migration em lote estrutural
prÃ³prio.

### 33.20 EdiÃ§Ã£o de InteraÃ§Ãµes

Foram corrigidas:

-   `app/interacoes/[id]/page.tsx`;
-   `app/interacoes/[id]/editar/page.tsx`;
-   `app/api/interacoes/[id]/route.ts`.

A pÃ¡gina de detalhes agora suporta:

-   Cliente;
-   Representada.

Foi corrigido erro em que a pÃ¡gina assumia `cliente` sempre presente e
quebrava quando a interaÃ§Ã£o pertencia a uma Representada.

A ediÃ§Ã£o passa a preservar:

-   autor original;
-   data/hora original.

A ediÃ§Ã£o permite atualizar:

-   vÃ­nculo permitido;
-   tipo;
-   assunto;
-   descriÃ§Ã£o;
-   resultado;
-   prÃ³ximos passos;
-   prÃ³ximo acompanhamento;
-   situaÃ§Ã£o.

Registros alterados podem ser identificados visualmente como:

`Editada`

utilizando `criadoEm` e `atualizadoEm`.

### 33.21 ExclusÃ£o e auditoria --- nova polÃ­tica transversal PENDENTE

Durante os testes foi discutida uma nova regra para todo o CRM.

PrincÃ­pio:

Registros comerciais e histÃ³ricos nÃ£o devem ser apagados livremente.

PolÃ­tica planejada:

-   usuÃ¡rios comuns nÃ£o possuem exclusÃ£o definitiva;
-   Diretor ou perfil expressamente autorizado poderÃ¡ executar exclusÃ£o
    excepcional;
-   exclusÃ£o deve exigir justificativa;
-   deve registrar usuÃ¡rio;
-   data e hora;
-   mÃ³dulo;
-   ID/cÃ³digo do registro;
-   motivo;
-   contexto da exclusÃ£o.

Quando tecnicamente adequado, preferir:

`exclusÃ£o lÃ³gica / inativaÃ§Ã£o`

em vez de remoÃ§Ã£o fÃ­sica.

Quando a remoÃ§Ã£o fÃ­sica for realmente necessÃ¡ria, o registro de auditoria
deve sobreviver.

Essa regra deverÃ¡ ser aplicada transversalmente aos mÃ³dulos, nÃ£o apenas
InteraÃ§Ãµes.

Antes de implementar, auditar a estrutura existente de:

`Auditoria`

InteraÃ§Ãµes tiveram exclusÃ£o fÃ­sica temporariamente bloqueada enquanto essa
polÃ­tica definitiva nÃ£o Ã© implementada.

### 33.22 Rastreamento da InteraÃ§Ã£o na entidade de origem --- PENDENTE

Ainda nÃ£o foi testado de forma conclusiva se cada interaÃ§Ã£o aparece
adequadamente dentro das pÃ¡ginas especÃ­ficas de:

-   Cliente;
-   Representada.

Esse serÃ¡ um dos primeiros testes do prÃ³ximo lote.

Objetivo:

ao abrir um Cliente ou Representada, visualizar o histÃ³rico completo de
interaÃ§Ãµes relacionadas Ã quela entidade.

O futuro cÃ³digo `INT-...` deverÃ¡ aparecer tambÃ©m nesses histÃ³ricos.

### 33.23 Central de PendÃªncias / Follow-ups --- prÃ³xima evoluÃ§Ã£o funcional

A combinaÃ§Ã£o de:

-   `proximoContatoEm`;
-   `statusFollowUp`;
-   usuÃ¡rio responsÃ¡vel;
-   filtros;

prepara o sistema para uma futura Central de PendÃªncias.

Objetivo:

evitar que cobranÃ§as, retornos e aÃ§Ãµes comerciais dependam exclusivamente
da memÃ³ria humana.

A central deverÃ¡ considerar, no mÃ­nimo:

-   vencidos;
-   hoje;
-   prÃ³ximos;
-   em acompanhamento;
-   finalizados.

Exemplo real de uso:

cobranÃ§a de relatÃ³rio de comissÃ£o de uma Representada com nova cobranÃ§a
programada caso o relatÃ³rio nÃ£o seja recebido.

### 33.24 Front-end e identidade visual

Foi reafirmado durante os testes que o layout atual ainda nÃ£o Ã© considerado
definitivo.

PENDENTE:

-   tipografia;
-   tamanhos de fonte;
-   padronizaÃ§Ã£o de botÃµes;
-   posicionamento do indicador do usuÃ¡rio;
-   navegaÃ§Ã£o;
-   espaÃ§amento;
-   densidade das telas;
-   calendÃ¡rio;
-   consistÃªncia entre mÃ³dulos.

NÃ£o iniciar redesign amplo antes de terminar as funcionalidades e regras de
seguranÃ§a prioritÃ¡rias.

### 33.25 Financeiro --- melhoria visual registrada

Foi solicitada melhoria futura no calendÃ¡rio financeiro.

Objetivo visual:

-   dias com contas a pagar: destaque vermelho;
-   dias com contas a receber: destaque azul;
-   nÃºmeros destacados de forma clara.

Essa alteraÃ§Ã£o permanece pendente para lote prÃ³prio.

### 33.26 Acesso negado --- texto pendente

Foi validado que Administrativo Ã© bloqueado em ConfiguraÃ§Ãµes.

O comportamento de seguranÃ§a foi considerado correto.

PENDENTE:

alterar comunicaÃ§Ã£o textual para usar conceito semelhante a:

`Diretor da empresa`

em vez de:

`Diretor do sistema`

quando aplicÃ¡vel.

Motivo:

manter comunicaÃ§Ã£o apropriada caso o sistema venha a ser comercializado.

### 33.27 UsuÃ¡rios e Prepostos --- pendÃªncias

Ainda serÃ¡ necessÃ¡ria uma Ã¡rea operacional adequada para:

-   cadastro de Prepostos;
-   administraÃ§Ã£o de usuÃ¡rios;
-   ativaÃ§Ã£o/inativaÃ§Ã£o;
-   permissÃµes;
-   recuperaÃ§Ã£o/alteraÃ§Ã£o de senha;
-   gestÃ£o das carteiras.

Preposto real de teste ainda nÃ£o foi criado.

### 33.28 Senhas --- pendÃªncia futura

Foi decidido nÃ£o tratar a polÃ­tica final de senhas durante este lote.

PENDENTE:

-   geraÃ§Ã£o segura de senha pelo sistema;
-   redefiniÃ§Ã£o;
-   troca obrigatÃ³ria ou opcional;
-   recuperaÃ§Ã£o;
-   polÃ­tica compatÃ­vel com Diretor, Administrativo e Prepostos;
-   orientaÃ§Ã£o de uso de gerenciador de senhas.

Senhas curtas de apenas 6 dÃ­gitos nÃ£o devem ser adotadas automaticamente
sem anÃ¡lise de risco.

Nunca registrar senhas reais no documento mestre.

### 33.29 Arquivos modificados no checkpoint funcional 2c11a78

Foram versionados exatamente 10 arquivos:

-   `app/api/interacoes/[id]/route.ts`
-   `app/api/interacoes/route.ts`
-   `app/api/representadas/route.ts`
-   `app/interacoes/[id]/editar/page.tsx`
-   `app/interacoes/[id]/page.tsx`
-   `app/interacoes/nova/page.tsx`
-   `app/interacoes/page.tsx`
-   `app/layout.tsx`
-   `app/vendas/nova/page.tsx`
-   `components/auth/user-session-menu.tsx`

Resumo do commit:

-   4575 inserÃ§Ãµes;
-   1524 remoÃ§Ãµes.

### 33.30 ValidaÃ§Ãµes do checkpoint 2c11a78

Executado:

`git diff --check`

Resultado:

-   OK;
-   nenhuma inconsistÃªncia retornada.

Executado:

`npx tsc --noEmit`

Resultado:

-   OK;
-   0 erros TypeScript.

Executado:

`npm run build`

Resultado:

-   `Compiled successfully`;
-   42/42 pÃ¡ginas estÃ¡ticas geradas;
-   APIs processadas;
-   Middleware compilado;
-   build de produÃ§Ã£o concluÃ­do.

Next.js:

`15.2.4`

Middleware:

`38.8 kB`

O build continua informando:

-   `Skipping validation of types`;
-   `Skipping linting`.

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint continua pendente.

### 33.31 Estado Git apÃ³s o commit funcional

Commit criado:

`2c11a78`

Mensagem:

`feat: aprimora fluxo operacional de interacoes`

ApÃ³s o commit funcional, o estado Git retornou apenas:

`?? prisma/proposed_schema_diff.sql`

Esse arquivo continua propositalmente fora do Git.

NÃƒO:

-   executar;
-   excluir;
-   adicionar;
-   tratar como migration oficial;

sem anÃ¡lise e autorizaÃ§Ã£o explÃ­cita.

### 33.32 PrÃ³ximo lote recomendado

Ao iniciar a prÃ³xima conversa, NÃƒO repetir o lote de InteraÃ§Ãµes concluÃ­do.

SequÃªncia recomendada:

1.  confirmar push/checkpoint GitHub deste lote;
2.  validar InteraÃ§Ãµes dentro das pÃ¡ginas de Cliente e Representada;
3.  analisar cÃ³digo comercial `INT-...`;
4.  analisar versionamento/auditoria das ediÃ§Ãµes;
5.  implementar ou planejar Central de PendÃªncias;
6.  validar sessÃµes simultÃ¢neas em navegadores/dispositivos diferentes;
7.  somente depois desenvolver notificaÃ§Ãµes globais de novas interaÃ§Ãµes;
8.  definir cadastro mÃ­nimo obrigatÃ³rio de Clientes;
9.  planejar campos nÃºmero/bairro/regiÃ£o de Representadas;
10. planejar tipos configurÃ¡veis de InteraÃ§Ã£o;
11. criar Preposto de teste e validar isolamento real;
12. continuar os demais mÃ³dulos conforme prioridade funcional.

### 33.33 Regra operacional adicional consolidada

Para o desenvolvimento deste projeto, sempre que possÃ­vel o usuÃ¡rio
enviarÃ¡ a saÃ­da completa do terminal apÃ³s um bloco de comandos.

Isso permite verificar:

-   comandos executados;
-   erros intermediÃ¡rios;
-   resultados corretos;
-   estado do Git;
-   validaÃ§Ãµes;
-   sequÃªncia real das operaÃ§Ãµes.

Nunca enviar na captura ou texto:

-   senhas;
-   tokens;
-   `AUTH_SECRET`;
-   chaves de API;
-   outras credenciais.

Para comandos que abram paginador Git com:

`:` ou `(END)`

sair utilizando:

`q`

Quando for necessÃ¡rio evitar paginador, preferir:

`git --no-pager ...`

------------------------------------------------------------------------

## 34. PrÃ³xima conversa --- orientaÃ§Ã£o oficial de retomada

A prÃ³xima conversa deve comeÃ§ar lendo este documento na branch `main`.

Checkpoint funcional local a preservar:

`2c11a78`

Mensagem:

`feat: aprimora fluxo operacional de interacoes`

O checkpoint documental que incluir esta atualizaÃ§Ã£o deverÃ¡ ser registrado
logo apÃ³s a validaÃ§Ã£o do prÃ³prio documento.

Antes de qualquer novo desenvolvimento:

-   confirmar commit atual da branch `main`;
-   confirmar que o push dos checkpoints foi concluÃ­do;
-   executar `git status --short`;
-   confirmar que o Ãºnico arquivo local nÃ£o rastreado esperado continua
    sendo `prisma/proposed_schema_diff.sql`;
-   nÃ£o repetir alteraÃ§Ãµes jÃ¡ concluÃ­das;
-   nÃ£o executar migration automaticamente;
-   nÃ£o executar `npm audit fix`;
-   nÃ£o usar `git add .`.
