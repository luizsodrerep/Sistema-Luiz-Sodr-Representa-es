import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Criando dados de teste...")

  // Limpa dados antigos
  await prisma.representada.deleteMany({})

  // Cria representada 1 - Comissão Fixa
  const rep1 = await prisma.representada.create({
    data: {
      nome: "Empresa Teste 1",
      codigo: "REP-1234",
      cnpj: "12.345.678/0001-90",
      comissao: 5.5,
      tipoComissao: "fixa",
      faixasComissao: null,
      fechamentoComissao: "15/01",
      pagamentoComissao: "20/01",
      bancoComissao: "Banco do Brasil",
      contatoPrincipal: "João Silva",
      emailPrincipal: "joao@empresa.com",
      telefonePrincipal: "(11) 9999-9999",
      whatsappPrincipal: "(11) 98888-8888",
      endereco: "Rua Principal, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      status: "Ativa",
      observacoes: "Empresa parceira desde 2020",
      contratoAssinado: true,
      emiteNF: true,
    },
  })

  console.log("✅ Rep 1 criada:", rep1.id)

  // Cria representada 2 - Comissão Variada
  const rep2 = await prisma.representada.create({
    data: {
      nome: "Empresa Teste 2",
      codigo: "REP-5678",
      cnpj: "98.765.432/0001-10",
      comissao: null,
      tipoComissao: "variada",
      faixasComissao: JSON.stringify([
        { desconto: "0", comissao: "3.00" },
        { desconto: "5", comissao: "4.50" },
        { desconto: "10", comissao: "6.00" },
      ]),
      fechamentoComissao: "10/01",
      pagamentoComissao: "15/01",
      bancoComissao: "Caixa Econômica",
      contatoPrincipal: "Maria Santos",
      emailPrincipal: "maria@empresa2.com",
      telefonePrincipal: "(21) 8888-8888",
      whatsappPrincipal: "(21) 98765-4321",
      endereco: "Av Secundária, 456",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "20000-000",
      status: "Ativa",
      observacoes: "Nova parceira",
      contratoAssinado: false,
      emiteNF: true,
    },
  })

  console.log("✅ Rep 2 criada:", rep2.id)

  console.log("✅✅ Dados de teste criados com sucesso!")
  console.log("\n📋 IDs para testar:")
  console.log(`ID 1: ${rep1.id}`)
  console.log(`ID 2: ${rep2.id}`)
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })