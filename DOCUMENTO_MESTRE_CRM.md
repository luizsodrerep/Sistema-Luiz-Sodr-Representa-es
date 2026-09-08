\# DOCUMENTO MESTRE — CRM LUIZ SODRÉ REPRESENTAÇÕES



\## 1. FINALIDADE



Este documento é a memória técnica e operacional persistente do projeto

Sistema CRM Luiz Sodré Representações.



Ele deve ser tratado como uma das fontes oficiais de continuidade do

projeto juntamente com:



1\. GitHub oficial;

2\. código atual do repositório;

3\. banco PostgreSQL;

4\. histórico das conversas do projeto.



O objetivo deste arquivo é permitir abrir novas conversas sem refazer

diagnósticos, módulos e validações já concluídos.



O assistente deve ler este documento antes de propor alterações

relevantes.



\---



\## 2. REGRA CENTRAL DO PROJETO



O CRM deve seguir a cadeia:



DADOS → INDICADORES → ANÁLISE → DECISÃO → AÇÃO



O sistema não deve ser tratado apenas como cadastro.



Toda evolução deve preservar:



\- histórico;

\- rastreabilidade;

\- autoria;

\- segurança;

\- isolamento por escritório;

\- responsabilidades;

\- regras comerciais;

\- vendas;

\- faturamentos;

\- títulos;

\- comissões;

\- financeiro;

\- contabilidade;

\- agenda;

\- interações;

\- auditoria;

\- autenticação;

\- autorização.



\---



\## 3. REGRA OPERACIONAL DO PROJETO



Luiz Sodré não trabalha como programador e as alterações manuais devem

minimizar risco.



Procedimento obrigatório:



1\. informar PRIMEIRO o comando `notepad` para abrir o arquivo;

2\. fornecer o ARQUIVO COMPLETO FINAL quando houver alteração manual;

3\. usar:

&#x20;  `Ctrl+A → apagar → colar arquivo completo → Ctrl+S`;

4\. evitar substituições parciais de código;

5\. não pedir novamente arquivos que já estejam disponíveis e

&#x20;  suficientemente atualizados no GitHub;

6\. após alteração de código executar:

&#x20;  `npx tsc --noEmit`;

7\. ao final de lote lógico executar conforme aplicável:

&#x20;  `npx tsc --noEmit`;

&#x20;  `git diff --check`;

&#x20;  `npm run build`;

&#x20;  `git status --short`;

8\. não executar build enquanto Paula estiver utilizando `npm run dev`;

9\. não usar `git add .` quando existir arquivo que deva ficar fora do

&#x20;  Git;

10\. não executar commit, push, migration ou alteração estrutural sem

&#x20;   verificar o estado antes.



\---



\## 4. REGRA DE NÃO DUPLICAÇÃO



Existe apenas UM CRM oficial.



Não criar como forma de segurança:



\- segundo projeto;

\- segunda pasta do sistema;

\- repositório duplicado;

\- branch chamada backup;

\- clone paralelo;

\- outra instalação do CRM;

\- ZIP recorrente do sistema tratado como versão alternativa.



Git/GitHub deve preservar versões dentro do MESMO projeto.



Uma eventual cópia de segurança do banco PostgreSQL é uma proteção de

dados e não um segundo sistema, mas somente deve ser executada em

procedimento controlado e explicitamente aprovado.



\---



\## 5. STACK ATUAL



\- Next.js 15.2.4

\- React 18

\- TypeScript

\- Prisma 5.22.0

\- PostgreSQL

\- Tailwind CSS

\- jose

\- bcryptjs

\- ExcelJS

\- Windows / PowerShell



Não atualizar Next.js, Prisma ou dependências estruturais sem

necessidade técnica comprovada.



\---



\## 6. REPOSITÓRIO OFICIAL



Repositório:



`https://github.com/luizsodrerep/Sistema-Luiz-Sodr-Representa-es.git`



Branch oficial:



`main`



Não criar branch paralela somente para funcionar como backup.



\---



\## 7. CHECKPOINT FUNCIONAL ATUAL



Checkpoint de código mais recente:



`208be23`



Mensagem:



`checkpoint: consolida seguranca APIs agenda financeiro e modulos operacionais`



Data:



08/09/2026.



Esse checkpoint contém 16 arquivos alterados:



\- `app/agenda/page.tsx`

\- `app/api/clientes/exportar/route.ts`

\- `app/api/clientes/importar/route.ts`

\- `app/api/contas-bancarias/route.ts`

\- `app/api/empresas-escritorio/route.ts`

\- `app/api/financeiro/route.ts`

\- `app/api/representadas/\[id]/contas-recebimento/route.ts`

\- `app/api/representadas/\[id]/contratos/\[contratoId]/route.ts`

\- `app/api/representadas/\[id]/contratos/route.ts`

\- `app/api/representadas/\[id]/regras-comerciais/\[regraId]/route.ts`

\- `app/api/representadas/\[id]/regras-comerciais/route.ts`

\- `app/financeiro/page.tsx`

\- `app/interacoes-ai/page.tsx`

\- `app/redes-sociais/page.tsx`

\- `app/relatorios/page.tsx`

\- `components/auth/user-session-menu.tsx`



Estatística do checkpoint:



`14534 insertions(+), 3700 deletions(-)`



Validações anteriores ao commit:



`npx tsc --noEmit`



Resultado:



0 erros.



`git diff --check`



Resultado:



sem inconsistências.



`git diff --cached --check`



Resultado:



sem inconsistências.



\---



\## 8. CHECKPOINTS IMPORTANTES ANTERIORES



Checkpoint anterior:



`3e30b96`



Mensagem:



`feat: consolida vendas dashboard e regras comerciais`



Esse checkpoint consolidou principalmente:



\- Dashboard real;

\- Vendas;

\- página principal da Representada;

\- Regras Comerciais.



Validações daquele checkpoint:



\- TypeScript OK;

\- `git diff --check` OK;

\- `npm run build` OK;

\- Next.js 15.2.4;

\- 56 páginas estáticas no build.



Checkpoint anterior:



`1ae1fe8`



Relacionado à consolidação inicial de Contabilidade.



Outros checkpoints de recuperação anteriormente preservados:



\- `732c760`

\- `150836c`



Histórico mais antigo permanece disponível no Git.



\---



\## 9. ARQUIVO QUE DEVE PERMANECER FORA DO GIT



Arquivo local atualmente não versionado:



`public/foto sistema minha area paula.jpeg`



Ele aparece como:



`?? "public/foto sistema minha area paula.jpeg"`



Não usar `git add .` enquanto esse arquivo não tiver decisão explícita

de versionamento.



\---



\## 10. REGRA CRÍTICA SOBRE DEV E BUILD



Paula utiliza o CRM no mesmo ambiente local enquanto Luiz desenvolve.



Já ocorreu corrupção da pasta `.next` quando `npm run build` foi

executado enquanto o servidor `npm run dev` estava em uso.



Isso provocou:



`Cannot find module './4447.js'`



e respostas 500 em APIs.



Regra permanente:



NÃO executar `npm run build` enquanto existir servidor `next dev`

ativo utilizado por Paula.



Antes de build verificar:



```powershell

Get-CimInstance Win32\_Process |

&#x20; Where-Object { $\_.CommandLine -match 'next dev' } |

&#x20; Select-Object ProcessId,CommandLine
