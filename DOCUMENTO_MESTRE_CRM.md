# DOCUMENTO MESTRE — CRM LUIZ SODRÉ REPRESENTAÇÕES

## 1. Finalidade deste documento

Este arquivo é a memória técnica persistente do projeto CRM Luiz Sodré Representações.

Ele deve ser tratado como fonte oficial de continuidade entre conversas, etapas de desenvolvimento e checkpoints técnicos.

Sempre que houver:

- conclusão de módulo;
- alteração estrutural relevante;
- nova migration;
- mudança importante de regra de negócio;
- correção ampla;
- novo checkpoint Git/GitHub;
- decisão arquitetural importante;

este documento deve ser atualizado antes de iniciar uma nova grande etapa.

---

## 2. Regra principal de continuidade

O CRM deve seguir a cadeia:

DADOS → INDICADORES → ANÁLISE → DECISÃO → AÇÃO

O sistema não deve ser tratado apenas como cadastro.

A arquitetura deve preservar:

- rastreabilidade;
- histórico;
- regras comerciais;
- responsabilidades;
- participação de usuários;
- vendas;
- faturamentos;
- comissões;
- financeiro;
- obrigações;
- interações;
- auditoria;
- autenticação;
- autorização;
- isolamento de dados por usuário.

---

## 3. Escopo deste projeto

Este projeto trata exclusivamente do CRM e gestão comercial.

Assuntos paralelos devem ser tratados em conversa/projeto separado.

---

## 4. Perfil operacional do sistema

A entidade central é o escritório.

Clientes pertencem ao escritório.

Usuários do escritório podem possuir:

- responsabilidade por clientes;
- participação em clientes;
- responsabilidade por vendas;
- responsabilidade por interações;
- atuação por região;
- histórico próprio.

O sistema deve suportar Diretor, Administrativo e futuros Prepostos sem depender de estruturas fixas.

---

## 5. Stack atual

- Next.js: 15.2.4
- TypeScript
- Prisma: 5.22.0
- PostgreSQL
- Tailwind CSS
- Windows
- bcryptjs
- jose
- Projeto local prioritário antes de qualquer expansão para nuvem

Não atualizar Next.js, Prisma ou outras dependências estruturais sem necessidade técnica comprovada.

---

## 6. Regra de trabalho com arquivos

O usuário não possui experiência com programação.

Procedimento obrigatório:

1. O assistente informa o comando para abrir o arquivo no Bloco de Notas.
2. O usuário envia o conteúdo completo do arquivo quando necessário.
3. O assistente analisa o arquivo inteiro.
4. Quando houver correção, o assistente deve devolver o arquivo inteiro corrigido.
5. Evitar alterações por pequenos blocos, salvo necessidade técnica excepcional.
6. Depois de salvo, validar em lote lógico quando isso for seguro.
7. Não pedir novamente o mesmo arquivo sem motivo.
8. Solicitar novamente apenas se o arquivo tiver sido alterado depois da análise anterior ou se houver necessidade técnica de confirmação.

Objetivo: reduzir risco de erro manual, confusão e retrabalho.

---

## 7. Política de segurança do código

Não executar ou orientar automaticamente:

- git commit;
- git push;
- criação de branch;
- merge;
- alteração de schema;
- migration;
- upgrade de dependências;
- npm audit fix;
- npm audit fix --force;

sem validar o estado técnico antes.

Sempre verificar:

- `npx tsc --noEmit`
- `npm run build`
- estado do Git

antes de checkpoint relevante.

---

## 8. Política de Git/GitHub

Sempre que um módulo, lote relevante ou alteração estrutural importante estiver validado, deve ser criado um checkpoint Git/GitHub antes de avançar.

Não criar commit para cada pequena alteração isolada.

Critério ideal para checkpoint:

- alteração relevante concluída;
- TypeScript validado;
- build validado;
- arquivos revisados;
- estado do Git conferido.

GitHub é a fonte oficial do código versionado.

---

## 9. Checkpoint Git atual

Repositório:

`https://github.com/luizsodrerep/Sistema-Luiz-Sodr-Representa-es.git`

Branch:

`main`

Commit funcional validado mais recente:

`53c41c23ab310b8f10fd0e4aec85205c0ca8ff32`

Mensagem:

`feat: adiciona autenticacao e controle de acesso`

Esse commit foi enviado com sucesso ao GitHub em 23/08/2026.

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

---

## 10. Estado de validação técnica atual

Última validação antes do checkpoint `53c41c2`:

`npx tsc --noEmit`

Resultado:

- 0 erros TypeScript.

Última validação:

`npm run build`

Resultado:

- build concluído com sucesso;
- Next.js 15.2.4;
- `Compiled successfully`;
- 42/42 páginas estáticas geradas;
- rotas dinâmicas processadas;
- APIs processadas;
- Middleware compilado com 38.8 kB.

O primeiro build do lote apresentou dois pontos:

1. warnings do `jose` relacionados a `CompressionStream` e `DecompressionStream` no Edge Runtime;
2. erro de `useSearchParams()` sem `Suspense` na página `/acesso-negado`.

A página `/acesso-negado` foi corrigida com `Suspense`.

No build final:

- o build foi concluído com sucesso;
- o erro de `/acesso-negado` desapareceu;
- os warnings anteriores do `jose` não reapareceram.

Observação:

O build informa:

- `Skipping validation of types`
- `Skipping linting`

A tipagem foi validada separadamente com `npx tsc --noEmit`.

Lint ainda não foi validado nesta etapa.

---

## 11. Evolução dos erros TypeScript

Estado inicial registrado:

28 erros em 17 arquivos.

Depois das correções sucessivas:

27 → 24 → 23 → 15 → 9 → 6 → 0 erros.

Estado atual:

0 erros TypeScript no checkpoint `53c41c2`.

---

## 12. Correções técnicas históricas consolidadas

### 12.1 Next.js 15 — params assíncronos

Corrigidos, entre outros:

- `app/api/representadas/[id]/comissao/route.ts`
- `app/api/representadas/[id]/route.ts`
- `app/api/vendas/[id]/route.ts`
- `app/api/interacoes/[id]/route.ts`
- `app/interacoes/[id]/page.tsx`
- `app/interacoes/[id]/editar/page.tsx`

Rotas de API passaram a usar `params: Promise<{ id: string }>` e `const { id } = await params`.

### 12.2 Representadas — correção inicial de tipagem

Corrigido `app/representadas/nova/page.tsx` para aceitar `HTMLSelectElement` no `handleChange`.

### 12.3 Calendários

Corrigidos:

- `app/agenda/page.tsx`
- `app/contabilidade/calendario/page.tsx`
- `app/financeiro/calendario/page.tsx`

Uso incompatível de `day` e `displayValue` foi substituído por `modifiers` e `modifiersClassNames`.

### 12.4 Excel / Buffer

Corrigidos:

- `app/api/clientes/exportar/route.ts`
- `app/api/clientes/importar/route.ts`
- `app/api/templates/route.ts`

Compatibilidade entre Buffer, Uint8Array, ArrayBuffer, BodyInit e ExcelJS foi ajustada sem upgrade de dependências.

### 12.5 Layout / AlertReminder

`date` foi convertido para `time` e `type` removido no uso de `AlertReminder`.

### 12.6 Contact Buttons

`md` passou a ser convertido internamente para `default`, preservando a API pública.

### 12.7 Sales Comparison

Criado tipo `SalesPeriod` e conversão controlada no `onValueChange`.

### 12.8 Tailwind

`height: 0` foi corrigido para `height: "0"` nos keyframes de accordion.

---

## 13. Prisma — estrutura integrada

Arquivo:

`prisma/schema.prisma`

Migration oficial criada e aplicada:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

A estrutura integrada contempla:

- Escritorio
- EmpresaEscritorio
- Usuario
- ClienteParticipacao
- ContratoRepresentada
- RegraComercialRepresentada
- Faturamento
- TituloVenda
- ComissaoMovimento
- NFComissao
- ContaBancaria
- RepresentadaContaRecebimento
- ObrigacaoOperacional
- Auditoria

Também foram ampliados:

- Cliente
- Representada
- Venda
- Interacao
- Financeiro

---

## 14. Arquivo temporário Prisma

Existe localmente:

`prisma/proposed_schema_diff.sql`

Esse arquivo foi usado como artefato de comparação do Prisma.

Ele NÃO foi incluído nos checkpoints Git/GitHub.

A migration oficial continua sendo:

`prisma/migrations/20260821213558_estrutura_integrada_crm/migration.sql`

Não tratar `proposed_schema_diff.sql` como migration oficial, não executá-lo e não adicioná-lo ao Git sem nova validação técnica explícita.

Estado após o checkpoint `53c41c2`:

`?? prisma/proposed_schema_diff.sql`

Isso é proposital.

---

## 15. Regras de negócio de comissão

Comissão não deve ser tratada apenas como valor da venda × percentual.

O sistema precisa suportar:

- comissão por faturamento;
- comissão por liquidez;
- estornos;
- recuperações;
- parcelas;
- cortes;
- diferentes datas de pagamento;
- conta PF;
- conta PJ;
- exigência de NF;
- não exigência de NF;
- histórico da regra comercial;
- vigência de regra;
- regra por representada;
- regra específica por cliente;
- base de cálculo;
- percentual aplicado;
- comissão prevista;
- movimentos de comissão;
- NF de comissão.

Contrato e emissão de NF são dimensões diferentes.

Ausência de NF não deve significar automaticamente ausência de contrato.

---

## 16. Representadas — estado funcional no checkpoint 6dcd74a

O módulo Representadas foi ampliado e auditado em lote relevante.

Fluxos básicos validados funcionalmente com dados fictícios:

- cadastro de representada;
- comissão fixa;
- comissão variada;
- faixas adicionais de comissão;
- visualização;
- edição;
- conversão fixa → variada;
- conversão variada → fixa;
- exclusão de representada sem vínculos.

A API de exclusão foi protegida para impedir remoção de representadas com histórico/vínculos em:

- contratos;
- regras comerciais;
- vendas;
- interações;
- notas de comissão;
- contas de recebimento;
- financeiro.

Quando houver vínculos, a regra correta é inativar ou suspender em vez de apagar o histórico.

### 16.1 APIs criadas

- `app/api/representadas/[id]/contratos/route.ts`
- `app/api/representadas/[id]/contratos/[contratoId]/route.ts`
- `app/api/representadas/[id]/regras-comerciais/route.ts`
- `app/api/representadas/[id]/regras-comerciais/[regraId]/route.ts`
- `app/api/representadas/[id]/contas-recebimento/route.ts`
- `app/api/representadas/[id]/contas-recebimento/[vinculoId]/route.ts`
- `app/api/contas-bancarias/route.ts`
- `app/api/empresas-escritorio/route.ts`

Também foram reforçadas:

- `app/api/representadas/route.ts`
- `app/api/representadas/[id]/route.ts`

As APIs passaram a usar whitelist explícita de campos em vez de repassar `...body` diretamente ao Prisma.

### 16.2 Telas criadas

- `app/representadas/[id]/contratos/page.tsx`
- `app/representadas/[id]/regras-comerciais/page.tsx`
- `app/representadas/[id]/contas-recebimento/page.tsx`

A página principal da representada recebeu acessos diretos para:

- Contratos
- Regras Comerciais
- Contas de Recebimento
- Editar
- Excluir

### 16.3 Contratos

Estrutura funcional criada para:

- formalização física, digital, e-mail, verbal ou outra;
- início e encerramento;
- vigência;
- revisões;
- empresa do escritório;
- origem/documento;
- observações;
- proteção contra exclusão quando existir regra comercial vinculada.

### 16.4 Regras comerciais

Estrutura funcional criada para:

- regra padrão por representada;
- regra específica por cliente;
- vínculo opcional a contrato;
- vigência;
- pedido mínimo;
- mínimo de parcela;
- prazo de entrega;
- prazo de faturamento;
- frete;
- região;
- comissão fixa;
- comissão variada por faixas;
- reconhecimento de comissão;
- fechamento e pagamento;
- bloqueio de exclusão quando a regra já tiver sido usada em vendas.

### 16.5 Contas de recebimento

Estrutura inicial criada para vincular contas bancárias existentes à representada.

A auditoria funcional detectou uma lacuna:

A tela consegue selecionar/vincular contas já existentes, mas ainda não possui fluxo completo para cadastrar uma nova `ContaBancaria`.

Essa lacuna deve ser resolvida antes de considerar o submódulo de contas encerrado.

---

## 17. Regra de negócio das contas 01 / 02 / 03

Decisão funcional registrada em 22/08/2026:

- cada representada poderá possuir até 3 opções de conta de recebimento cadastradas;
- Conta 01 será a principal/prioritária;
- Conta 01 será normalmente destinada a recebimentos de comissão com NF;
- Conta 02 será alternativa normalmente destinada a recebimentos sem NF;
- Conta 03 será uma opção adicional disponível ao Diretor do escritório;
- as três contas podem permanecer cadastradas mesmo quando apenas uma estiver recebendo naquele momento;
- a arquitetura deve permitir no futuro dividir o recebimento de uma comissão entre duas ou três contas;
- a ordem 01/02/03 deve ser estável e não depender apenas da ordem visual da consulta;
- percentual de destino deve permitir futuro rateio controlado;
- contrato e NF não devem ser amarrados de forma automática entre si.

Estado do schema atual:

`RepresentadaContaRecebimento` ainda não possui campos formais específicos para ordem/prioridade/finalidade 01/02/03.

Antes de alterar Prisma, migrations ou banco, deve existir validação explícita e checkpoint próprio.

---

## 18. Vínculo Representada → Escritório

`ContaBancaria.escritorioId` é obrigatório no Prisma.

`Representada.escritorioId` é opcional no schema atual.

A auditoria pelo Prisma Studio confirmou em 22/08/2026:

- Representada: 3 registros;
- ContratoRepresentada: 1;
- RegraComercialRepresentada: 1;
- ContaBancaria: 0;
- RepresentadaContaRecebimento: 0;
- EmpresaEscritorio: 0;
- Escritorio: 0;
- Usuario: 0.

Portanto, atualmente ainda não existe um `Escritorio` real no banco para ser usado como raiz institucional.

O setup inicial criado no checkpoint `53c41c2` resolverá essa raiz posteriormente.

Não criar conta bancária escolhendo ou presumindo um escritório arbitrariamente.

---

## 19. Autenticação e autorização — checkpoint 53c41c2

Foi criado um lote estrutural de autenticação e controle de acesso.

Dependências adicionadas:

- `bcryptjs`
- `jose`

`AUTH_SECRET` foi configurado localmente no `.env.local`.

O valor do `AUTH_SECRET` nunca deve ser enviado para conversas, GitHub ou documentação pública.

### 19.1 Infraestrutura criada

Arquivos:

- `lib/auth/session.ts`
- `lib/auth/server.ts`
- `lib/auth/permissions.ts`
- `middleware.ts`

### 19.2 APIs de autenticação

Criadas:

- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/setup-inicial/route.ts`

### 19.3 Telas

Criadas:

- `app/login/page.tsx`
- `app/setup-inicial/page.tsx`
- `app/acesso-negado/page.tsx`

Criado também:

- `components/auth/user-session-menu.tsx`

O componente foi integrado em:

- `app/layout.tsx`

### 19.4 Login

A API de login suporta:

- login por e-mail;
- login por identificador/login;
- senha com bcrypt;
- bloqueio de usuário inativo;
- bloqueio de usuário sem senha configurada;
- validação de perfil;
- cookie HttpOnly;
- SameSite Lax;
- cookie Secure em produção;
- atualização de `ultimoAcessoEm`.

### 19.5 Setup inicial

A API e página de setup inicial estão prontas para criar:

- primeiro `Escritorio`;
- primeiro usuário `Diretor`;
- usuário `Administrativo` opcional;
- senha armazenada como hash;
- login automático do Diretor após setup.

Proteção:

O setup somente funciona enquanto:

- total de `Escritorio` = 0;
- total de `Usuario` = 0.

Depois disso, retorna conflito e não cria uma segunda raiz acidentalmente.

IMPORTANTE:

O setup inicial REAL ainda NÃO foi executado.

Nenhum usuário real foi criado por esse fluxo até o checkpoint `53c41c2`.

---

## 20. Perfis e política de segurança

Perfis definidos:

- Diretor
- Administrativo
- Preposto

A segurança deve trabalhar com duas camadas:

1. RBAC — permissão por perfil/recurso/ação;
2. escopo de dados — permissão sobre registros específicos.

Esconder botões não é considerado segurança suficiente.

Toda API sensível deve validar:

- sessão;
- perfil;
- ação;
- escritório;
- escopo do registro.

### 20.1 Diretor

Diretor possui acesso integral ao sistema.

Inclui:

- dados comerciais;
- financeiro;
- contabilidade;
- usuários;
- configurações;
- auditoria;
- contas bancárias;
- gestão estrutural.

### 20.2 Administrativo

Administrativo possui acesso operacional ampliado.

Inclui:

- clientes;
- representadas;
- contratos;
- regras comerciais;
- contas de recebimento;
- vendas;
- interações;
- agenda;
- relatórios;
- financeiro;
- contabilidade.

Não deve administrar:

- usuários;
- configurações estruturais;
- auditoria administrativa;
- permissões superiores.

### 20.3 Preposto

Preposto deve operar com princípio de mínimo privilégio.

Não pode acessar níveis superiores de Diretoria ou Administração.

Não deve acessar:

- contas bancárias;
- contas de recebimento;
- financeiro;
- contabilidade;
- usuários;
- configurações;
- auditoria;
- dados globais do escritório.

Pode acessar somente o necessário para sua atividade:

- seu dashboard;
- sua carteira;
- representadas necessárias à sua função;
- regras comerciais necessárias à venda;
- suas vendas;
- suas interações;
- sua agenda;
- seus relatórios;
- consultas relacionadas à própria função.

---

## 21. Escopo de dados do Preposto

O middleware bloqueia áreas e ações, mas NÃO substitui o filtro de registros nas APIs.

Próxima etapa obrigatória:

Aplicar isolamento por `usuarioId` nas APIs acessíveis ao Preposto.

### 21.1 Vendas

Preposto deve visualizar registros quando:

- `responsavelId = usuario logado`;
- OU `criadoPorId = usuario logado`.

Não deve visualizar vendas globais do escritório.

### 21.2 Clientes

Preposto deve visualizar clientes quando:

- `responsavelPrincipalId = usuario logado`;
- OU existir `ClienteParticipacao` ativa para o usuário.

### 21.3 Interações

Preposto deve visualizar registros quando:

- `responsavelId = usuario logado`;
- OU `criadoPorId = usuario logado`.

### 21.4 Agenda

Agenda de Preposto deve ser derivada somente dos registros relacionados ao próprio usuário.

### 21.5 Relatórios

Relatórios do Preposto devem ser calculados somente sobre seu universo filtrado.

Nunca usar dados globais do escritório em relatório de usuário simples.

---

## 22. Middleware

O middleware atual valida:

- presença de sessão;
- validade criptográfica do token;
- páginas públicas;
- APIs públicas de autenticação;
- recurso solicitado;
- perfil;
- método HTTP convertido em ação.

Mapeamento:

- GET → ver
- HEAD → ver
- OPTIONS → ver
- POST → criar
- PUT → editar
- PATCH → editar
- DELETE → excluir

Resultados:

- sem autenticação em API → 401;
- sessão inválida → 401;
- operação sem permissão → 403;
- página sem permissão → `/acesso-negado`.

O middleware não deve ser tratado como único controle de segurança de dados.

---

## 23. Vulnerabilidades npm

Após instalar `bcryptjs` e `jose`, o npm informou:

- 8 vulnerabilidades;
- 2 moderate;
- 5 high;
- 1 critical.

Não foi executado:

- `npm audit fix`
- `npm audit fix --force`

Essas vulnerabilidades precisam ser auditadas em lote técnico próprio.

Não aplicar correção automática sem analisar dependências afetadas e risco de breaking changes.

---

## 24. Identidade visual futura

Foi registrada uma etapa futura exclusiva para identidade visual profissional.

Essa etapa deve ocorrer depois de autenticação/segurança estarem estabilizadas e versionadas.

Quando chegar o momento, solicitar o logotipo atual e demais materiais necessários.

Escopo previsto:

- logotipo;
- marca do CRM;
- página de login;
- sidebar/cabeçalho;
- dashboard;
- favicon;
- cores institucionais;
- tipografia;
- cards;
- espaçamentos;
- loading;
- erros;
- aplicação consistente da identidade em Clientes, Representadas e demais módulos.

Não misturar redesign visual com lote de segurança ou migration estrutural.

---

## 25. Front-end — ordem recomendada

Ordem funcional recomendada atual:

1. Segurança e isolamento de dados
2. Concluir Representadas / contas
3. Vendas
4. Interações
5. Financeiro
6. Contabilidade
7. Agenda
8. Dashboard
9. Identidade visual profissional em lote próprio

Alterações visuais amplas devem ser feitas somente depois da validação funcional e de segurança correspondente.

---

## 26. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referência:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

“Leia o DOCUMENTO_MESTRE_CRM.md no GitHub e continue exatamente do checkpoint registrado. Este documento é a fonte oficial de continuidade do projeto.”

Não depender exclusivamente da memória automática.

---

## 27. Memória e fontes oficiais

A continuidade oficial deve depender de:

1. GitHub
2. `DOCUMENTO_MESTRE_CRM.md`
3. histórico das conversas
4. arquivos do repositório

O documento mestre deve ser atualizado em checkpoints relevantes.

---

## 28. Estado atual do projeto

Estado técnico:

ESTÁVEL PARA CONTINUAR O DESENVOLVIMENTO

Último checkpoint funcional:

`53c41c23ab310b8f10fd0e4aec85205c0ca8ff32`

Validações:

- TypeScript: OK — 0 erros
- Build: OK
- 42/42 páginas estáticas geradas
- Middleware: compilado
- Login: infraestrutura criada
- Logout: infraestrutura criada
- Sessão: infraestrutura criada
- Setup inicial: criado, mas ainda não executado
- Permissões: matriz criada
- Git commit: criado
- GitHub push: concluído

Ainda pendente:

- isolamento de dados por usuário nas APIs;
- execução segura do setup inicial;
- criação real de Diretor e Administrativo;
- testes funcionais de login/logout;
- testes funcionais dos três perfis;
- criação futura de Preposto de teste;
- lint;
- auditoria das vulnerabilidades npm;
- fechamento completo das contas bancárias/recebimento;
- formalização de contas 01/02/03;
- integração de regras comerciais com Vendas;
- integração total de comissão;
- integração total de faturamento;
- integração total de financeiro;
- identidade visual futura;
- substituição de dados fictícios por dados reais somente depois dos testes.

Durante a fase atual, continuar utilizando dados fictícios.

---

## 29. Próximo passo exato

NÃO executar o setup inicial real ainda.

NÃO criar usuários reais ainda.

NÃO alterar Prisma agora.

NÃO executar migration agora.

NÃO executar `npm audit fix` agora.

Próxima etapa:

AUDITORIA E ISOLAMENTO DE DADOS DAS APIs ACESSÍVEIS AO PREPOSTO.

Primeiro arquivo:

`app/api/vendas/route.ts`

Procedimento:

1. Ler o arquivo completo atual.
2. Identificar GET e POST existentes.
3. Integrar `obterSessaoAtual` / sessão autenticada.
4. Garantir `escritorioId` a partir da sessão.
5. Para Diretor: acesso conforme regra integral.
6. Para Administrativo: acesso operacional do escritório.
7. Para Preposto: filtrar vendas próprias/atribuídas.
8. Impedir Preposto de criar venda em nome de outro usuário.
9. Preservar APIs existentes e regras comerciais.
10. Validar TypeScript.
11. Auditar `app/api/vendas/[id]/route.ts`.
12. Depois repetir a estratégia em Clientes.
13. Depois Interações.
14. Depois Agenda/Relatórios.
15. Somente quando o isolamento estiver validado, executar setup real.
16. Testar Diretor / Administrativo / Preposto.
17. Criar novo checkpoint.

---

## 30. Regra de decisão técnica

Não alterar código apenas para silenciar erro.

Sempre identificar:

Problema → Causa raiz → Risco → Correção → Impacto

Evitar:

- gambiarras;
- casts excessivos;
- duplicação de regra;
- quebra de API existente;
- alteração estrutural sem necessidade;
- mudança de banco sem validação;
- reescrita desnecessária;
- criação de campos sem regra de negócio definida;
- autorização somente visual;
- APIs retornando dados globais para usuário de escopo restrito.

---

## 31. Regra final

O sistema deve evoluir preservando:

- segurança;
- histórico;
- previsibilidade;
- rastreabilidade;
- estabilidade;
- isolamento de dados;
- princípio de mínimo privilégio;
- baixo risco de regressão;
- clareza para manutenção futura.

GitHub e este documento são os dois principais pontos de recuperação do projeto.