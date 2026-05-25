const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

function gerarCodigo() {
  const numero = Math.floor(1000 + Math.random() * 9000)
  return `LSR-${numero}`
}

async function main() {
  const representadas = await prisma.representada.findMany({
    where: {
      codigo: null,
    },
  })

  for (const rep of representadas) {
    let codigo
    let existe = true

    while (existe) {
      codigo = gerarCodigo()

      const codigoExistente = await prisma.representada.findFirst({
        where: {
          codigo,
        },
      })

      existe = !!codigoExistente
    }

    await prisma.representada.update({
      where: {
        id: rep.id,
      },
      data: {
        codigo,
      },
    })

    console.log(`Representada ${rep.nome} => ${codigo}`)
  }

  console.log("FINALIZADO")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })