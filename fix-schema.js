const fs = require("fs");
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Cliente {
  id                String   @id @default(cuid())
  razaoSocial       String
  nomeFantasia      String?
  cnpj              String?
  inscricaoEstadual String?
  contato           String?
  cargo             String?
  email             String?
  telefone          String?
  whatsapp          String?
  endereco          String?
  bairro            String?
  cidade            String?
  estado            String?
  cep               String?
  regiao            String?
  rota              String?
  categoria         String?
  status            String   @default("Ativo")
  aceitaEmail       Boolean  @default(true)
  observacoes       String?
  criadoEm          DateTime @default(now())
  atualizadoEm      DateTime @updatedAt

  interacoes Interacao[]
  vendas     Venda[]
}

model Representada {
  id                 String   @id @default(cuid())
  nome               String
  cnpj               String?
  contratoAssinado   Boolean  @default(false)
  emiteNF            Boolean  @default(true)
  comissao           Float?
  fechamentoComissao String?
  pagamentoComissao  String?
  bancoComissao      String?
  contatoPrincipal   String?
  emailPrincipal     String?
  telefonePrincipal  String?
  whatsappPrincipal  String?
  contatoFinanceiro  String?
  emailFinanceiro    String?
  telefoneFinanceiro String?
  contatoLogistica   String?
  emailLogistica     String?
  telefoneLogistica  String?
  endereco           String?
  cidade             String?
  estado             String?
  cep                String?
  site               String?
  status             String   @default("Ativa")
  observacoes        String?
  criadoEm           DateTime @default(now())
  atualizadoEm       DateTime @updatedAt

  vendas Venda[]
}

model Venda {
  id                  String    @id @default(cuid())
  data                DateTime
  clienteId           String
  representadaId      String
  numeroPedido        String?
  produto             String?
  quantidade          Int?
  valorTotal          Float?
  desconto            Float?
  condicaoPagamento   String?
  previsaoFaturamento DateTime?
  comissao            Float?
  status              String    @default("Pendente")
  arquivoUrl          String?
  observacoes         String?
  criadoEm            DateTime  @default(now())
  atualizadoEm        DateTime  @updatedAt

  cliente      Cliente      @relation(fields: [clienteId], references: [id])
  representada Representada @relation(fields: [representadaId], references: [id])
}

model Interacao {
  id            String   @id @default(cuid())
  data          DateTime
  clienteId     String
  tipo          String
  assunto       String?
  descricao     String?
  resultado     String?
  proximosPasso String?
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt

  cliente Cliente @relation(fields: [clienteId], references: [id])
}

model Financeiro {
  id           String    @id @default(cuid())
  data         DateTime
  tipo         String
  categoria    String?
  descricao    String?
  valor        Float
  status       String    @default("Pendente")
  vencimento   DateTime?
  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt
}`;
fs.writeFileSync("prisma/schema.prisma", schema, "utf8");
console.log("OK");
