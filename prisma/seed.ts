/**
 * SEED DESATIVADO POR SEGURANCA.
 *
 * Este CRM utiliza banco PostgreSQL com dados reais.
 *
 * O antigo seed apagava Representadas existentes e criava
 * dados ficticios. Esse comportamento nao e permitido no
 * ambiente operacional do Sistema Luiz Sodre Representacoes.
 *
 * Este arquivo permanece apenas para impedir que uma eventual
 * execucao de "prisma db seed" cause alteracoes no banco real.
 *
 * NAO adicionar aqui deleteMany, create, update, upsert ou
 * qualquer outra operacao de escrita sem uma decisao tecnica
 * futura, isolada e explicitamente autorizada.
 */

async function main() {
  console.log(
    "Seed desativado por seguranca: nenhuma alteracao foi realizada no banco."
  )
}

main().catch((error) => {
  console.error("Erro ao executar seed desativado:", error)
  process.exitCode = 1
})