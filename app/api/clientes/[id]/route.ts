import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🟩 GET - Obter um cliente
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (params.id);
    if ((!id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id  },
      include: {
        contatos: true,
        interacoes: true,
        vendas: true,
      },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

// 🟦 PUT - Atualizar um cliente
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (params.id);
    if ((!id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();

    const {
      nome,
      nomeFantasia,
      cnpj,
      inscricaoEstadual,
      categoria,
      telefone,
      whatsapp,
      email,
      website,
      responsavel,
      cidade,
      estado,
      ultimaCompra,
      status,
      contato,
    } = body;

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        nomeFantasia,
        cnpj,
        inscricaoEstadual,
        categoria,
        telefone,
        whatsapp,
        email,
        website,
        responsavel,
        cidade,
        estado,
        status,
        ultimaCompra: ultimaCompra ? new Date(ultimaCompra) : undefined,
      },
    });

    let contatoResultado = null;

    if (contato) {
      // Verifica se já existe algum contato com esse email e clienteId
      const contatoExistente = await prisma.contato.findFirst({
        where: {
          clienteId: id,
          email: contato.email,
        },
      });

      if (contatoExistente) {
        contatoResultado = await prisma.contato.update({
          where: { id: contatoExistente.id },
          data: {
            nome: contato.nome,
            cargo: contato.cargo,
            telefone: contato.telefone,
            email: contato.email,
            representadaId: contato.representadaId ?? null,
          },
        });
      } else {
        contatoResultado = await prisma.contato.create({
          data: {
            clienteId: id,
            nome: contato.nome,
            cargo: contato.cargo,
            telefone: contato.telefone,
            email: contato.email,
            representadaId: contato.representadaId ?? null,
          },
        });
      }
    }

    return NextResponse.json({ cliente, contato: contatoResultado });
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

// 🟥 DELETE - Deletar um cliente
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (params.id);
    if ((!id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.cliente.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cliente deletado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}
