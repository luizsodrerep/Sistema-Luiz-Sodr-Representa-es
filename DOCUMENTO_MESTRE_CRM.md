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
- auditoria.

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

O sistema deve suportar Luiz, Paula e futuros prepostos sem depender de estruturas fixas.

---

## 5. Stack atual

- Next.js: 15.2.4
- TypeScript
- Prisma: 5.22.0
- PostgreSQL
- Tailwind CSS
- Windows
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

`6dcd74a25dfc8523c2e25ddcafb524c5bd3a1631`

Mensagem:

`feat: conclui estrutura funcional de representadas`

Esse commit foi enviado com sucesso ao GitHub em 22/08/2026.

Checkpoint técnico anterior relevante:

`33b1d21d712e7daf4dc8f2cfeb863300032d12f9`

Mensagem:

`checkpoint: estrutura integrada CRM e correcoes TypeScript`

O commit documental posterior `15d90e0...` adicionou o documento mestre sem alterar o código funcional.

---

## 10. Estado de validação técnica atual

Última validação antes do checkpoint `6dcd74a`:

`npx tsc --noEmit`

Resultado:

- 0 erros TypeScript.

Última validação:

`npm run build`

Resultado:

- build concluído com sucesso;
- Next.js 15.2.4;
- `Compiled successfully`;
- 35/35 páginas estáticas geradas;
- rotas dinâmicas processadas;
- APIs processadas.

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

0 erros TypeScript no checkpoint `6dcd74a`.

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
- Conta 03 será uma opção adicional disponível ao diretor do escritório;
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

O cadastro atual de representadas ainda precisa ser auditado para garantir o vínculo correto com o escritório antes de liberar cadastro completo de contas bancárias a partir do módulo Representadas.

Não criar conta bancária escolhendo ou presumindo um escritório arbitrariamente.

O próximo trabalho estrutural deve resolver essa origem de `escritorioId` de forma determinística.

---

## 19. Front-end — ordem recomendada

Ordem funcional recomendada:

1. Finalizar Representadas
2. Vendas
3. Interações
4. Financeiro
5. Contabilidade
6. Agenda
7. Dashboard

Alterações visuais devem ser feitas somente depois da validação funcional do módulo correspondente.

---

## 20. Regra para novas conversas

Novas conversas podem ser abertas dentro deste mesmo projeto.

Ao iniciar nova conversa, usar como referência:

`DOCUMENTO_MESTRE_CRM.md`

Mensagem recomendada:

“Leia o DOCUMENTO_MESTRE_CRM.md e continue exatamente do checkpoint registrado. Este documento é a fonte oficial de continuidade do projeto.”

Não depender exclusivamente da memória automática.

---

## 21. Memória e fontes oficiais

A continuidade oficial deve depender de:

1. GitHub
2. `DOCUMENTO_MESTRE_CRM.md`
3. histórico das conversas
4. arquivos do repositório

O documento mestre deve ser atualizado em checkpoints relevantes.

---

## 22. Estado atual do projeto

Estado técnico:

ESTÁVEL PARA CONTINUAR O DESENVOLVIMENTO

Validações do último lote:

- TypeScript: OK — 0 erros
- Build: OK
- 35/35 páginas estáticas geradas no build
- Migration integrada anterior: aplicada
- Prisma Client: gerado
- Git commit funcional: criado
- GitHub push: concluído
- Commit funcional: `6dcd74a25dfc8523c2e25ddcafb524c5bd3a1631`

Ainda pendente:

- lint;
- fechamento completo do submódulo de contas bancárias/recebimento;
- vínculo seguro Representada → Escritório;
- formalização da regra de contas 01/02/03;
- integração de regras comerciais com Vendas;
- integração total de comissão;
- integração total de faturamento;
- integração total de financeiro;
- auditoria funcional dos próximos módulos;
- substituição de dados simulados por dados reais apenas após conclusão dos testes.

Durante a fase atual, usar apenas dados fictícios para testes funcionais.

---

## 23. Próximo passo recomendado

Continuar no módulo Representadas antes de iniciar Vendas.

Sequência imediata:

1. Confirmar origem correta do `escritorioId` para representadas.
2. Definir tecnicamente a modelagem das contas 01/02/03.
3. Validar se a modelagem exige alteração de `schema.prisma`.
4. Se exigir, realizar alteração e migration somente após validação explícita.
5. Criar `POST`/edição necessários para cadastro de `ContaBancaria`.
6. Integrar “Nova conta bancária” na tela de Contas de Recebimento.
7. Aplicar limite de até 3 contas e regra da Conta 01 principal.
8. Testar criação, edição, vínculo, inativação e futuro rateio.
9. Validar `npx tsc --noEmit`.
10. Validar `npm run build`.
11. Conferir Git.
12. Criar novo checkpoint Git/GitHub.
13. Atualizar este documento.
14. Somente então iniciar o módulo Vendas.

---

## 24. Regra de decisão técnica

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
- criação de campos sem regra de negócio definida.

---

## 25. Regra final

O sistema deve evoluir preservando:

- segurança;
- histórico;
- previsibilidade;
- rastreabilidade;
- estabilidade;
- baixo risco de regressão;
- clareza para manutenção futura.

GitHub e este documento são os dois principais pontos de recuperação do projeto.