\# DOCUMENTO MESTRE — CRM LUIZ SODRÉ REPRESENTAÇÕES



\## 1. Finalidade deste documento



Este arquivo é a memória técnica persistente do projeto CRM Luiz Sodré Representações.



Ele deve ser tratado como fonte oficial de continuidade entre conversas, etapas de desenvolvimento e checkpoints técnicos.



Sempre que houver:



\- conclusão de módulo;

\- alteração estrutural relevante;

\- nova migration;

\- mudança importante de regra de negócio;

\- correção ampla;

\- novo checkpoint Git/GitHub;

\- decisão arquitetural importante;



este documento deve ser atualizado antes de iniciar uma nova grande etapa.



\---



\## 2. Regra principal de continuidade



O CRM deve seguir a cadeia:



DADOS → INDICADORES → ANÁLISE → DECISÃO → AÇÃO



O sistema não deve ser tratado apenas como cadastro.



A arquitetura deve preservar:



\- rastreabilidade;

\- histórico;

\- regras comerciais;

\- responsabilidades;

\- participação de usuários;

\- vendas;

\- faturamentos;

\- comissões;

\- financeiro;

\- obrigações;

\- interações;

\- auditoria.



\---



\## 3. Escopo deste projeto



Este projeto trata exclusivamente do CRM e gestão comercial.



Assuntos paralelos, como troca de veículo, devem ser tratados em conversa/projeto separado.



\---



\## 4. Perfil operacional do sistema



A entidade central é o escritório.



Clientes pertencem ao escritório.



Usuários do escritório podem possuir:



\- responsabilidade por clientes;

\- participação em clientes;

\- responsabilidade por vendas;

\- responsabilidade por interações;

\- atuação por região;

\- histórico próprio.



O sistema deve suportar Luiz, Paula e futuros prepostos sem depender de estruturas fixas.



\---



\## 5. Stack atual



\- Next.js: 15.2.4

\- TypeScript

\- Prisma: 5.22.0

\- PostgreSQL

\- Tailwind CSS

\- Windows

\- Projeto local prioritário antes de qualquer expansão para nuvem



Não atualizar Next.js, Prisma ou outras dependências estruturais sem necessidade técnica comprovada.



\---



\## 6. Regra de trabalho com arquivos



O usuário não possui experiência com programação.



Portanto, deve ser seguido este procedimento:



1\. O assistente informa o comando para abrir o arquivo no Bloco de Notas.

2\. O usuário envia o conteúdo completo do arquivo.

3\. O assistente analisa o arquivo inteiro.

4\. Quando houver correção, o assistente deve devolver o arquivo inteiro corrigido.

5\. Evitar alterações por pequenos blocos, salvo necessidade técnica excepcional.

6\. Depois de salvo, validar em lote lógico quando isso for seguro.

7\. Não pedir novamente o mesmo arquivo sem motivo.

8\. Solicitar novamente apenas se o arquivo tiver sido alterado depois da análise anterior ou se houver necessidade técnica de confirmação.



Objetivo: reduzir risco de erro manual, reduzir confusão e economizar tokens.



\---



\## 7. Política de segurança do código



Não executar ou orientar automaticamente:



\- git commit;

\- git push;

\- criação de branch;

\- merge;

\- alteração de schema;

\- migration;

\- upgrade de dependências;



sem validar o estado técnico antes.



Sempre verificar:



\- `npx tsc --noEmit`

\- `npm run build`

\- estado do Git



antes de checkpoint relevante.



\---



\## 8. Política de Git/GitHub



Nova regra oficial:



Sempre que um módulo, lote relevante ou alteração estrutural importante estiver validado, deve ser criado um checkpoint Git/GitHub antes de avançar.



Não criar commit para cada pequena alteração isolada.



Critério ideal para checkpoint:



\- alteração relevante concluída;

\- TypeScript validado;

\- build validado;

\- arquivos revisados;

\- estado do Git conferido.



GitHub é a fonte oficial do código versionado.



\---



\## 9. Checkpoint Git atual



Repositório:



https://github.com/luizsodrerep/Sistema-Luiz-Sodr-Representa-es.git



Branch:



main



Commit atual validado:



33b1d21d712e7daf4dc8f2cfeb863300032d12f9



Mensagem:



checkpoint: estrutura integrada CRM e correcoes TypeScript



Esse commit foi enviado com sucesso ao GitHub.



\---



\## 10. Estado de validação técnica atual



Última validação:



`npx tsc --noEmit`



Resultado:



0 erros TypeScript



Última validação:



`npm run build`



Resultado:



build concluído com sucesso



Next.js:



15.2.4



Resultado do build:



\- Compiled successfully

\- 33/33 static pages geradas

\- rotas dinâmicas processadas

\- APIs processadas

\- build concluído duas vezes com sucesso



Observação:



O build informa:



\- Skipping validation of types

\- Skipping linting



A tipagem foi validada separadamente com:



`npx tsc --noEmit`



Lint ainda não foi validado nesta etapa.



\---



\## 11. Evolução dos erros TypeScript



Estado inicial registrado:



28 erros em 17 arquivos



Depois das correções sucessivas:



27 erros

24 erros

23 erros

15 erros

9 erros

6 erros

0 erros



Estado atual:



0 erros TypeScript



\---



\## 12. Correções realizadas neste checkpoint



\### 12.1 Next.js 15 — params assíncronos



Corrigidos:



\- app/api/representadas/\[id]/comissao/route.ts

\- app/api/representadas/\[id]/route.ts

\- app/api/vendas/\[id]/route.ts

\- app/api/interacoes/\[id]/route.ts

\- app/interacoes/\[id]/page.tsx

\- app/interacoes/\[id]/editar/page.tsx



Rotas de API passaram a usar:



`params: Promise<{ id: string }>`



e:



`const { id } = await params`



Páginas client dinâmicas passaram a usar:



`use(params)`



\---



\### 12.2 Representadas



Corrigido:



\- app/representadas/nova/page.tsx



Problema:



`handleChange` não aceitava `HTMLSelectElement`



Correção:



Inclusão de:



`HTMLSelectElement`



no tipo do evento.



\---



\### 12.3 Calendários



Corrigidos:



\- app/agenda/page.tsx

\- app/contabilidade/calendario/page.tsx

\- app/financeiro/calendario/page.tsx



Problema:



Uso incompatível de:



\- `day`

\- `displayValue`



no componente customizado `Day`



Correção:



Migração para uso de:



\- `modifiers`

\- `modifiersClassNames`



mantendo os estados visuais.



\---



\### 12.4 Excel / Buffer



Corrigidos:



\- app/api/clientes/exportar/route.ts

\- app/api/clientes/importar/route.ts

\- app/api/templates/route.ts



Problemas:



Incompatibilidade entre:



\- Buffer

\- Uint8Array

\- ArrayBuffer

\- BodyInit

\- ExcelJS



Foram aplicadas adaptações de compatibilidade sem upgrade de dependências.



\---



\### 12.5 Layout / AlertReminder



Corrigido:



\- app/layout.tsx



Problema:



`AlertReminder` aceitava:



\- title

\- description

\- time

\- onDismiss



mas o layout enviava:



\- date

\- type



Correção:



`date` → `time`



`type` removido



\---



\### 12.6 Contact Buttons



Corrigido:



\- components/contact-buttons.tsx



Problema:



API externa aceitava:



\- sm

\- md

\- lg



mas Button interno aceitava:



\- sm

\- default

\- lg

\- icon



Correção:



`md` passou a ser convertido internamente para `default`



A API pública foi preservada.



\---



\### 12.7 Sales Comparison



Corrigido:



\- components/sales-comparison.tsx



Problema:



Radix Select retorna `string`, mas o estado aceitava apenas:



\- month

\- quarter

\- semester

\- year



Correção:



Criado tipo:



`SalesPeriod`



e conversão controlada no `onValueChange`.



\---



\### 12.8 Tailwind



Corrigido:



\- tailwind.config.ts



Problema:



`height: 0`



não era aceito pelo tipo atual.



Correção:



`height: "0"`



nos keyframes accordion-down e accordion-up.



\---



\## 13. Prisma — estrutura integrada



Arquivo:



prisma/schema.prisma



Migration criada e aplicada:



prisma/migrations/20260821213558\_estrutura\_integrada\_crm/migration.sql



Migration:



20260821213558\_estrutura\_integrada\_crm



Estrutura integrada contempla:



\- Escritorio

\- EmpresaEscritorio

\- Usuario

\- ClienteParticipacao

\- ContratoRepresentada

\- RegraComercialRepresentada

\- Faturamento

\- TituloVenda

\- ComissaoMovimento

\- NFComissao

\- ContaBancaria

\- RepresentadaContaRecebimento

\- ObrigacaoOperacional

\- Auditoria



Também foram ampliados:



\- Cliente

\- Representada

\- Venda

\- Interacao

\- Financeiro



\---



\## 14. Arquivo temporário Prisma



Existe localmente:



prisma/proposed\_schema\_diff.sql



Esse arquivo foi usado como artefato de comparação do Prisma.



Ele NÃO foi incluído no commit do checkpoint.



A migration oficial é:



prisma/migrations/20260821213558\_estrutura\_integrada\_crm/migration.sql



Não tratar `proposed\_schema\_diff.sql` como migration oficial.



\---



\## 15. Regras de negócio de comissão



Comissão não deve ser tratada apenas como:



valor da venda × percentual



Existem regras diferentes por representada.



O sistema precisa suportar:



\- comissão por faturamento;

\- comissão por liquidez;

\- estornos;

\- recuperações;

\- parcelas;

\- cortes;

\- diferentes datas de pagamento;

\- conta PF;

\- conta PJ;

\- exigência de NF;

\- não exigência de NF;

\- histórico da regra comercial;

\- vigência de regra;

\- regra por representada;

\- regra específica por cliente;

\- base de cálculo;

\- percentual aplicado;

\- comissão prevista;

\- movimentos de comissão;

\- NF de comissão.



\---



\## 16. Representadas — prioridade funcional



O módulo prioritário continua sendo:



Representadas



Clientes é módulo já consolidado e deve ser tratado como referência de UX, não como molde obrigatório.



Próxima etapa funcional planejada:



auditoria completa de Representadas



Avaliar:



\- cadastro

\- edição

\- visualização

\- regras comerciais

\- contratos

\- comissão

\- contas de recebimento

\- integração com vendas

\- integração com faturamento

\- integração com comissão

\- UX

\- campos

\- navegação

\- consistência visual

\- dados simulados

\- dados reais

\- validações



\---



\## 17. Front-end



Depois da estabilização de backend e TypeScript, o front-end pode ser revisado por módulo.



Ordem recomendada:



1\. Representadas

2\. Vendas

3\. Interações

4\. Financeiro

5\. Contabilidade

6\. Agenda

7\. Dashboard



Alterações visuais devem ser feitas somente depois da validação funcional do módulo correspondente.



\---



\## 18. Regra para novas conversas



Novas conversas podem ser abertas dentro deste mesmo projeto.



Ao iniciar nova conversa, usar como referência:



`DOCUMENTO\_MESTRE\_CRM.md`



Mensagem recomendada para início de nova conversa:



“Leia o DOCUMENTO\_MESTRE\_CRM.md e continue exatamente do checkpoint registrado. Este documento é a fonte oficial de continuidade do projeto.”



Não depender exclusivamente da memória automática.



\---



\## 19. Memória do projeto



A memória permanente deste projeto está desabilitada.



Portanto, a continuidade oficial deve depender de:



1\. GitHub

2\. DOCUMENTO\_MESTRE\_CRM.md

3\. histórico das conversas

4\. arquivos do repositório



O documento mestre deve ser atualizado em checkpoints relevantes.



\---



\## 20. Estado atual do projeto



Estado técnico:



ESTÁVEL PARA CONTINUAR O DESENVOLVIMENTO



Validações:



\- TypeScript: OK

\- Build: OK

\- Migration: aplicada

\- Prisma Client: gerado

\- Git commit: criado

\- GitHub push: concluído



Ainda pendente:



\- lint

\- testes funcionais

\- auditoria do módulo Representadas

\- revisão de front-end por módulo

\- substituição de dados simulados

\- validação de fluxos de negócio

\- integração total de comissão

\- integração total de faturamento

\- integração total de financeiro

\- auditoria funcional



\---



\## 21. Próximo passo recomendado



Iniciar nova conversa dentro do projeto.



Primeiro passo da nova conversa:



1\. Ler este documento.

2\. Confirmar o commit atual.

3\. Verificar o estado do Git.

4\. Auditar o módulo Representadas.

5\. Separar:

&#x20;  - backend

&#x20;  - API

&#x20;  - Prisma

&#x20;  - front-end

&#x20;  - regras comerciais

&#x20;  - UX

6\. Corrigir por blocos lógicos.

7\. Validar.

8\. Criar novo checkpoint Git/GitHub.

9\. Atualizar este documento.



\---



\## 22. Regra de decisão técnica



Não alterar código apenas para silenciar erro.



Sempre identificar:



Problema → Causa raiz → Risco → Correção → Impacto



Evitar:



\- gambiarras;

\- casts excessivos;

\- duplicação de regra;

\- quebra de API existente;

\- alteração estrutural sem necessidade;

\- mudança de banco sem validação;

\- reescrita desnecessária;

\- criação de campos sem regra de negócio definida.



\---



\## 23. Regra final



O sistema deve evoluir preservando:



\- segurança;

\- histórico;

\- previsibilidade;

\- rastreabilidade;

\- estabilidade;

\- baixo risco de regressão;

\- clareza para manutenção futura.



GitHub e este documento são os dois principais pontos de recuperação do projeto.

