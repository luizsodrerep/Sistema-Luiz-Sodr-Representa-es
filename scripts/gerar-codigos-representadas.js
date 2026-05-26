require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function run() {
  const representadas = await prisma.representada.findMany({
    where: {
      codigo: null,
    },
  });

  for (const rep of representadas) {
    await prisma.representada.update({
      where: {
        id: rep.id,
      },
      data: {
        codigo: "REP-" + rep.id.substring(0, 6).toUpperCase(),
      },
    });
  }

  console.log("Codigos gerados:", representadas.length);

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});