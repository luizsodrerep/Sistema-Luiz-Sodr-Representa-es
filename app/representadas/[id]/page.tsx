"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { ContactButton } from "@/components/contact-buttons"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  Calendar,
  Check,
  CircleDollarSign,
  Edit,
  FileText,
  Globe,
  MapPin,
  Plus,
  Save,
  Target,
  Trash,
  User,
  Search,
  Upload,
  Download,
  FileCheck,
  LineChart,
} from "lucide-react"

export default function RepresentadaDetalhesPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Dados simulados da representada
  const representada = {
    id: params.id,
    nome: "Descartáveis Premium Ltda",
    cnpj: "12.345.678/0001-90",
    segmento: "Descartáveis",
    endereco: "Av. Industrial, 1000",
    bairro: "Distrito Industrial",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04000-000",
    telefone: "(11) 3456-7890",
    email: "contato@descartaveispremium.com.br",
    website: "www.descartaveispremium.com.br",
    contato: {
      nome: "Carlos Mendes",
      cargo: "Gerente Comercial",
      telefone: "(11) 98765-4321",
      email: "carlos@descartaveispremium.com.br",
    },
    gerente: "Paula Ferreira",
    gerenteId: "paula-ferreira",
    regiaoAtuacao: "São Paulo, Rio de Janeiro, Minas Gerais",
    comissao: {
      percentual: "10%",
      pagamento: "Faturamento", // ou "Liquidez"
      diaPagamento: "15",
      banco: "Itaú",
      agencia: "1234",
      conta: "56789-0",
      comNF: true, // Nova propriedade: se requer NF de serviços
    },
    prazos: {
      faturamento: "7 dias após pedido",
      entrega: "15 dias após faturamento",
    },
    metas: {
      anual: "R$ 960.000,00",
      mensal: "R$ 80.000,00",
      mensais: [
        { mes: "Janeiro", meta: "80.000,00", realizado: "78.500,00", status: "Quase" },
        { mes: "Fevereiro", meta: "80.000,00", realizado: "82.300,00", status: "Atingida" },
        { mes: "Março", meta: "80.000,00", realizado: "68.450,00", status: "Não Atingida" },
        { mes: "Abril", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Maio", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Junho", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Julho", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Agosto", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Setembro", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Outubro", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Novembro", meta: "80.000,00", realizado: null, status: "Pendente" },
        { mes: "Dezembro", meta: "80.000,00", realizado: null, status: "Pendente" },
      ],
    },
    compromissos: [
      { tipo: "Relatório de Comissão", dia: 5, mes: "Todos", status: "Pendente" },
      { tipo: "Emissão de NF", dia: 16, mes: "Todos", status: "Pendente" },
      { tipo: "Cobrança de Comissão", dia: 15, mes: "Todos", status: "Pendente" },
      { tipo: "Reunião Trimestral", dia: 15, mes: "Março, Junho, Setembro, Dezembro", status: "Pendente" },
    ],
    produtos: [
      { codigo: "CP200", nome: "Copo Descartável 200ml", preco: "R$ 120,00", unidade: "Caixa c/ 2500" },
      { codigo: "CP300", nome: "Copo Descartável 300ml", preco: "R$ 150,00", unidade: "Caixa c/ 2000" },
      { codigo: "GN3030", nome: "Guardanapo 30x30", preco: "R$ 45,00", unidade: "Fardo c/ 1000" },
      { codigo: "TL001", nome: "Talher Descartável", preco: "R$ 35,00", unidade: "Caixa c/ 1000" },
    ],
    notasFiscais: [
      { numero: "NF-001", data: "15/01/2023", valor: "R$ 5.200,00", status: "Paga", arquivo: "nf-001.pdf" },
      { numero: "NF-002", data: "15/02/2023", valor: "R$ 4.800,00", status: "Paga", arquivo: "nf-002.pdf" },
      { numero: "NF-003", data: "15/03/2023", valor: "R$ 6.845,00", status: "Pendente", arquivo: "nf-003.pdf" },
    ],
  }

  // Inicializar o formulário com os dados da representada quando entrar no modo de edição
  const handleEditClick = () => {
    setFormData({ ...representada })
    setIsEditing(true)
  }

  // Salvar as alterações
  const handleSaveClick = () => {
    // Aqui seria implementada a lógica para salvar os dados no backend
    toast({
      title: "Alterações salvas",
      description: "Os dados da representada foram atualizados com sucesso.",
    })
    setIsEditing(false)
  }

  // Cancelar a edição
  const handleCancelClick = () => {
    setIsEditing(false)
    setFormData(null)
  }

  // Função para lidar com o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = () => {
    // Aqui seria implementada a lógica para enviar o arquivo para o servidor
    if (selectedFile) {
      toast({
        title: "Arquivo enviado com sucesso!",
        description: `A nota fiscal "${selectedFile.name}" foi registrada no sistema.`,
      })
      setSelectedFile(null)

      // Registrar na contabilidade
      toast({
        title: "Registro contábil criado",
        description: "A nota fiscal foi registrada automaticamente na contabilidade.",
      })
    }
  }

  // Adicionar novo compromisso
  const adicionarCompromisso = () => {
    toast({
      title: "Compromisso adicionado",
      description: "O novo compromisso foi adicionado com sucesso.",
    })
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons backLabel="Voltar para Representadas" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{representada.nome}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleCancelClick}>
                  Cancelar
                </Button>
                <Button size="sm" className="gap-1" onClick={handleSaveClick}>
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="informacoes">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="compromissos">Compromissos</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="contabilidade">Contabilidade</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dados Cadastrais</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="nome">Razão Social</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="segmento">Segmento</Label>
                        <Input
                          id="segmento"
                          value={formData.segmento}
                          onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Razão Social:</dt>
                        <dd>{representada.nome}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">CNPJ:</dt>
                        <dd>{representada.cnpj}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Segmento:</dt>
                        <dd>{representada.segmento}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Website:</dt>
                        <dd>
                          <a
                            href={`https://${representada.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {representada.website}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="contato-nome">Nome do Contato</Label>
                        <Input
                          id="contato-nome"
                          value={formData.contato.nome}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contato: { ...formData.contato, nome: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="contato-cargo">Cargo</Label>
                        <Input
                          id="contato-cargo"
                          value={formData.contato.cargo}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contato: { ...formData.contato, cargo: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="contato-telefone">Telefone</Label>
                        <Input
                          id="contato-telefone"
                          value={formData.contato.telefone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contato: { ...formData.contato, telefone: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="contato-email">E-mail</Label>
                        <Input
                          id="contato-email"
                          value={formData.contato.email}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contato: { ...formData.contato, email: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Responsável:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {representada.contato.nome}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Cargo:</dt>
                        <dd>{representada.contato.cargo}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Telefone:</dt>
                        <dd className="flex items-center gap-2">
                          <span>{representada.contato.telefone}</span>
                          <ContactButton type="phone" value={representada.contato.telefone} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <dt className="font-medium">E-mail:</dt>
                        <dd className="flex items-center gap-2">
                          <span>{representada.contato.email}</span>
                          <ContactButton type="email" value={representada.contato.email} />
                        </dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input
                          id="endereco"
                          value={formData.endereco}
                          onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input
                          id="bairro"
                          value={formData.bairro}
                          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            value={formData.cidade}
                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="estado">Estado</Label>
                          <Select
                            value={formData.estado}
                            onValueChange={(value) => setFormData({ ...formData, estado: value })}
                          >
                            <SelectTrigger id="estado">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SP">SP</SelectItem>
                              <SelectItem value="RJ">RJ</SelectItem>
                              <SelectItem value="MG">MG</SelectItem>
                              <SelectItem value="ES">ES</SelectItem>
                              {/* Outros estados */}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Endereço:</dt>
                        <dd>{representada.endereco}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Bairro:</dt>
                        <dd>{representada.bairro}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Cidade/UF:</dt>
                        <dd className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {representada.cidade}/{representada.estado}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">CEP:</dt>
                        <dd>{representada.cep}</dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Informações Comerciais</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="gerente">Gerente Responsável</Label>
                        <Select
                          value={formData.gerente}
                          onValueChange={(value) => setFormData({ ...formData, gerente: value })}
                        >
                          <SelectTrigger id="gerente">
                            <SelectValue placeholder="Selecione o gerente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Paula Ferreira">Paula Ferreira</SelectItem>
                            <SelectItem value="Luiz Sodré">Luiz Sodré</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="regiao">Região de Atuação</Label>
                        <Textarea
                          id="regiao"
                          value={formData.regiaoAtuacao}
                          onChange={(e) => setFormData({ ...formData, regiaoAtuacao: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="prazo-faturamento">Prazo de Faturamento</Label>
                        <Input
                          id="prazo-faturamento"
                          value={formData.prazos.faturamento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prazos: { ...formData.prazos, faturamento: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="prazo-entrega">Prazo de Entrega</Label>
                        <Input
                          id="prazo-entrega"
                          value={formData.prazos.entrega}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prazos: { ...formData.prazos, entrega: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Gerente Responsável:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <Link href={`/usuarios/${representada.gerenteId}`} className="text-primary hover:underline">
                            {representada.gerente}
                          </Link>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Região de Atuação:</dt>
                        <dd className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {representada.regiaoAtuacao}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Prazo de Faturamento:</dt>
                        <dd>{representada.prazos.faturamento}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Prazo de Entrega:</dt>
                        <dd>{representada.prazos.entrega}</dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Comissões</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="percentual">Percentual de Comissão</Label>
                        <Input
                          id="percentual"
                          value={formData.comissao.percentual}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comissao: { ...formData.comissao, percentual: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="pagamento">Pagamento de Comissão</Label>
                        <Select
                          value={formData.comissao.pagamento}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              comissao: { ...formData.comissao, pagamento: value },
                            })
                          }
                        >
                          <SelectTrigger id="pagamento">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Faturamento">No Faturamento</SelectItem>
                            <SelectItem value="Liquidez">Na Liquidez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="dia-pagamento">Dia de Pagamento</Label>
                        <Input
                          id="dia-pagamento"
                          type="number"
                          min="1"
                          max="31"
                          value={formData.comissao.diaPagamento}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comissao: { ...formData.comissao, diaPagamento: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2 py-2">
                        <Label htmlFor="com-nf">Requer NF de Serviços</Label>
                        <Switch
                          id="com-nf"
                          checked={formData.comissao.comNF}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              comissao: { ...formData.comissao, comNF: checked },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="banco">Banco</Label>
                        <Input
                          id="banco"
                          value={formData.comissao.banco}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comissao: { ...formData.comissao, banco: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="agencia">Agência</Label>
                          <Input
                            id="agencia"
                            value={formData.comissao.agencia}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                comissao: { ...formData.comissao, agencia: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="conta">Conta</Label>
                          <Input
                            id="conta"
                            value={formData.comissao.conta}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                comissao: { ...formData.comissao, conta: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Percentual:</dt>
                        <dd className="flex items-center gap-1">
                          <CircleDollarSign className="h-3 w-3" />
                          {representada.comissao.percentual}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Pagamento:</dt>
                        <dd>No {representada.comissao.pagamento}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Dia de Pagamento:</dt>
                        <dd className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Dia {representada.comissao.diaPagamento} de cada mês
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Requer NF de Serviços:</dt>
                        <dd>{representada.comissao.comNF ? "Sim" : "Não"}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Dados Bancários:</dt>
                        <dd>
                          {representada.comissao.banco} - Ag. {representada.comissao.agencia} - C/C{" "}
                          {representada.comissao.conta}
                        </dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Metas e Desempenho</CardTitle>
                  <CardDescription>Acompanhamento de metas mensais e anuais</CardDescription>
                </div>
                <Button size="sm" className="gap-1">
                  <Target className="h-4 w-4" />
                  <span>Definir Metas</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Meta Anual (2023)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xl font-bold">R$ {representada.metas.anual}</div>
                      <div className="flex items-center text-xs">
                        <BarChart3 className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500">+5% vs ano anterior</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Meta Mensal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xl font-bold">R$ {representada.metas.mensal}</div>
                      <div className="flex items-center text-xs">
                        <Target className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-blue-500">Meta mensal fixa</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">Realizado (Ano Atual)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="text-xl font-bold">R$ 229.250,00</div>
                      <div className="text-xs text-muted-foreground">23,9% da meta anual</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Progresso Anual</h3>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "23.9%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 229.250,00</span>
                    <span>Meta: R$ 960.000,00</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Metas Mensais (2023)</h3>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-13 text-xs font-medium bg-muted/20 p-2">
                      <div>Mês</div>
                      <div>Jan</div>
                      <div>Fev</div>
                      <div>Mar</div>
                      <div>Abr</div>
                      <div>Mai</div>
                      <div>Jun</div>
                      <div>Jul</div>
                      <div>Ago</div>
                      <div>Set</div>
                      <div>Out</div>
                      <div>Nov</div>
                      <div>Dez</div>
                    </div>

                    <div className="grid grid-cols-13 text-xs p-2 border-t">
                      <div className="font-medium">Meta</div>
                      {representada.metas.mensais.map((meta, i) => (
                        <div key={i}>R$ {meta.meta}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-13 text-xs p-2 border-t">
                      <div className="font-medium">Realizado</div>
                      {representada.metas.mensais.map((meta, i) => (
                        <div
                          key={i}
                          className={
                            meta.realizado
                              ? Number.parseFloat(meta.realizado.replace(".", "").replace(",", ".")) >=
                                Number.parseFloat(meta.meta.replace(".", "").replace(",", "."))
                                ? "text-green-500 font-medium"
                                : "text-red-500"
                              : ""
                          }
                        >
                          {meta.realizado || "-"}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-13 text-xs p-2 border-t">
                      <div className="font-medium">Status</div>
                      {representada.metas.mensais.map((meta, i) => (
                        <div key={i}>
                          {meta.status === "Atingida" ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : meta.status === "Quase" ? (
                            <div className="text-yellow-500">~</div>
                          ) : meta.status === "Não Atingida" ? (
                            <div className="text-red-500">✗</div>
                          ) : (
                            "-"
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Histórico de Desempenho</h3>
                  <div className="h-[200px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Análise de Perdas por Cortes</h3>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor Vendido</TableHead>
                        <TableHead>Valor Faturado</TableHead>
                        <TableHead>Diferença</TableHead>
                        <TableHead>Perda (%)</TableHead>
                        <TableHead>Impacto na Meta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Março/2023</TableCell>
                        <TableCell>R$ 45.800,00</TableCell>
                        <TableCell>R$ 43.250,00</TableCell>
                        <TableCell className="text-red-500">-R$ 2.550,00</TableCell>
                        <TableCell className="text-red-500">-5,57%</TableCell>
                        <TableCell className="text-amber-500">Meta não atingida</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fevereiro/2023</TableCell>
                        <TableCell>R$ 38.500,00</TableCell>
                        <TableCell>R$ 37.800,00</TableCell>
                        <TableCell className="text-red-500">-R$ 700,00</TableCell>
                        <TableCell className="text-red-500">-1,82%</TableCell>
                        <TableCell className="text-green-500">Meta atingida</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Janeiro/2023</TableCell>
                        <TableCell>R$ 32.400,00</TableCell>
                        <TableCell>R$ 31.950,00</TableCell>
                        <TableCell className="text-red-500">-R$ 450,00</TableCell>
                        <TableCell className="text-red-500">-1,39%</TableCell>
                        <TableCell className="text-green-500">Meta atingida</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Motivos de Cortes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Falta de estoque</span>
                        </div>
                        <span>68%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Alteração de preço</span>
                        </div>
                        <span>15%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span>Erro de digitação</span>
                        </div>
                        <span>12%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span>Outros</span>
                        </div>
                        <span>5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Impacto nas Comissões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                        <LineChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Comissão Esperada (Trimestre)</span>
                        <span className="font-medium">R$ 11.670,00</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Comissão Real (Trimestre)</span>
                        <span className="font-medium">R$ 11.300,00</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-red-500">
                        <span>Perda em Comissões</span>
                        <span className="font-medium">-R$ 370,00 (-3,17%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="produtos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Catálogo de Produtos</CardTitle>
                  <CardDescription>Produtos disponíveis desta representada</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Catálogo PDF</span>
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Novo Produto</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 text-xs font-medium bg-muted/20 p-2">
                    <div>Código</div>
                    <div>Produto</div>
                    <div>Unidade</div>
                    <div>Preço</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {representada.produtos.map((produto, i) => (
                    <div key={i} className="grid grid-cols-5 text-xs p-2 border-t">
                      <div>{produto.codigo}</div>
                      <div>{produto.nome}</div>
                      <div>{produto.unidade}</div>
                      <div>{produto.preco}</div>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Produtos Mais Vendidos</h3>
                  <div className="h-[200px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compromissos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Compromissos Mensais</CardTitle>
                  <CardDescription>Tarefas recorrentes relacionadas a esta representada</CardDescription>
                </div>
                <Button size="sm" className="gap-1" onClick={adicionarCompromisso}>
                  <Plus className="h-4 w-4" />
                  <span>Novo Compromisso</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="grid grid-cols-5 text-xs font-medium bg-muted/20 p-2">
                    <div>Tipo</div>
                    <div>Dia</div>
                    <div>Mês</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {representada.compromissos.map((compromisso, i) => (
                    <div key={i} className="grid grid-cols-5 text-xs p-2 border-t">
                      <div>{compromisso.tipo}</div>
                      <div>Dia {compromisso.dia}</div>
                      <div>{compromisso.mes}</div>
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            compromisso.status === "Concluído"
                              ? "bg-green-100 text-green-800"
                              : compromisso.status === "Em Andamento"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {compromisso.status}
                        </span>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Próximos Compromissos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          <FileText className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Relatório de Comissão</p>
                          <p className="text-[10px] text-muted-foreground">Dia 5 de Abril</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-6 text-[10px]">
                        Concluir
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          <CircleDollarSign className="h-3 w-3 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Cobrança de Comissão</p>
                          <p className="text-[10px] text-muted-foreground">Dia 15 de Abril</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-6 text-[10px]">
                        Concluir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Histórico de Vendas</CardTitle>
                  <CardDescription>Vendas realizadas desta representada</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                  <Link href="/vendas/nova">
                    <Button size="sm" className="gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Nova Venda</span>
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="grid grid-cols-7 text-xs font-medium bg-muted/20 p-2">
                    <div>Pedido</div>
                    <div>Cliente</div>
                    <div>Data</div>
                    <div>Valor</div>
                    <div>Comissão</div>
                    <div>Status</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {[
                    {
                      id: "12345",
                      cliente: "Distribuidora ABC Ltda",
                      clienteId: "1",
                      data: "15/03/2023",
                      valor: "R$ 5.200,00",
                      comissao: "R$ 520,00",
                      status: "Faturado",
                    },
                    {
                      id: "12289",
                      cliente: "Supermercado Silva",
                      clienteId: "2",
                      data: "28/02/2023",
                      valor: "R$ 3.800,00",
                      comissao: "R$ 380,00",
                      status: "Faturado",
                    },
                    {
                      id: "12156",
                      cliente: "Confeitaria Doce",
                      clienteId: "3",
                      data: "15/02/2023",
                      valor: "R$ 4.500,00",
                      comissao: "R$ 450,00",
                      status: "Faturado",
                    },
                    {
                      id: "12098",
                      cliente: "Atacadão Produtos",
                      clienteId: "4",
                      data: "30/01/2023",
                      valor: "R$ 6.200,00",
                      comissao: "R$ 620,00",
                      status: "Faturado",
                    },
                  ].map((venda, i) => (
                    <div key={i} className="grid grid-cols-7 text-xs p-2 border-t">
                      <div>#{venda.id}</div>
                      <div>
                        <Link href={`/clientes/${venda.clienteId}`} className="text-primary hover:underline">
                          {venda.cliente}
                        </Link>
                      </div>
                      <div>{venda.data}</div>
                      <div>{venda.valor}</div>
                      <div>{venda.comissao}</div>
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            venda.status === "Faturado"
                              ? "bg-green-100 text-green-800"
                              : venda.status === "Pendente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {venda.status}
                        </span>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Search className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Evolução de Vendas</h3>
                  <div className="h-[200px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contabilidade" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Notas Fiscais de Serviço</CardTitle>
                  <CardDescription>Registro de NFs emitidas para esta representada</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Exportar</span>
                  </Button>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Nova NF</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 border rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Enviar Nota Fiscal</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="nf-numero">Número da NF</Label>
                        <Input id="nf-numero" placeholder="Ex: NF-004" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="nf-data">Data de Emissão</Label>
                        <Input id="nf-data" type="date" className="h-8 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="nf-valor">Valor</Label>
                        <Input id="nf-valor" placeholder="R$ 0,00" className="h-8 text-xs" />
                      </div>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="nf-upload">Arquivo da NF</Label>
                      <Input id="nf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                    <Button onClick={handleFileUpload} disabled={!selectedFile} className="gap-1">
                      <Upload className="h-4 w-4" />
                      Enviar Nota Fiscal
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-6 text-xs font-medium bg-muted/20 p-2">
                    <div>Número</div>
                    <div>Data</div>
                    <div>Valor</div>
                    <div>Status</div>
                    <div>Arquivo</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {representada.notasFiscais.map((nf, i) => (
                    <div key={i} className="grid grid-cols-6 text-xs p-2 border-t">
                      <div>{nf.numero}</div>
                      <div>{nf.data}</div>
                      <div>{nf.valor}</div>
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            nf.status === "Paga" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {nf.status}
                        </span>
                      </div>
                      <div>
                        <Button variant="link" size="sm" className="h-6 p-0 text-xs">
                          {nf.arquivo}
                        </Button>
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <FileCheck className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Histórico de Comissões</h3>
                  <div className="h-[200px] w-full bg-muted/10 rounded-md flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

