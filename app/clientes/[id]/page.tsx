
"use client"

import { use } from "react"
import Link from "next/link"
import type React from "react"
import { useRef } from "react";
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ShareButtons } from "@/components/share-buttons"
import { ContactButton } from "@/components/contact-buttons"
import { NavigationButtons } from "@/components/navigation-buttons"
import { ContactButtonsGroup } from "@/components/contact-buttons-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  CircleDollarSign,
  Edit,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Trash,
  Upload,
  User,
  Image,
  Video,
  Save,
  Plus,
} from "lucide-react"

export default function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const { id } = use(params)

  // Na implementação real, buscaríamos os dados do cliente com base no ID
  const cliente = {
    //id: params.id,
    nome: "Distribuidora ABBC Ltda",
    nomeFantasia: "ABC Distribuidora",
    cnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123.456.789.000",
    categoria: "Distribuidor",
    telefone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    email: "contato@abcdistribuidora.com.br",
    website: "www.abcdistribuidora.com.br",
    responsavel: "João Silva",
    cargo: "Gerente Comercial",
    endereco: "Av. Paulista, 1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    coordenadas: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
    limiteCredito: "R$ 50.000,00",
    condicoesPagamento: "30/60/90 dias",
    ultimaCompra: "15/03/2023",
    ticketMedio: "R$ 5.200,00",
    status: "Inativo",
    diasInativo: 45,
    observacoes: "Cliente desde 2018. Compras regulares mensais.",
  }

  // Últimas vendas do cliente
  const ultimasVendas = [
    {
      id: "12345",
      data: "15/03/2023",
      valor: "R$ 5.200,00",
      representada: "Descartáveis Premium Ltda",
      representadaId: "1",
      produtos: "Copos 200ml (50cx), Guardanapos (30pct)",
      status: "Faturado",
    },
    {
      id: "12289",
      data: "28/02/2023",
      valor: "R$ 3.800,00",
      representada: "Embalagens Eco Ltda",
      representadaId: "2",
      produtos: "Embalagens biodegradáveis (40cx)",
      status: "Faturado",
    },
    {
      id: "12156",
      data: "15/02/2023",
      valor: "R$ 4.500,00",
      representada: "Descartáveis Premium Ltda",
      representadaId: "1",
      produtos: "Copos 300ml (40cx), Talheres (50pct)",
      status: "Faturado",
    },
    {
      id: "12098",
      data: "30/01/2023",
      valor: "R$ 6.200,00",
      representada: "Papel & Cia",
      representadaId: "3",
      produtos: "Guardanapos personalizados (100pct), Toalhas (30pct)",
      status: "Faturado",
    },
  ]

  // Documentos do cliente
  const documentos = [
    {
      nome: "Contrato.pdf",
      tipo: "PDF",
      tamanho: "1.2 MB",
      data: "15/01/2023",
      categoria: "Contrato",
      icon: <FileText className="h-3 w-3 text-red-500" />,
    },
    {
      nome: "Fachada.jpg",
      tipo: "Imagem",
      tamanho: "3.5 MB",
      data: "20/01/2023",
      categoria: "Foto",
      icon: <Image className="h-3 w-3 text-blue-500" />,
    },
    {
      nome: "Apresentacao.mp4",
      tipo: "Vídeo",
      tamanho: "15.8 MB",
      data: "05/02/2023",
      categoria: "Vídeo",
      icon: <Video className="h-3 w-3 text-purple-500" />,
    },
    {
      nome: "Catalogo_Produtos.pdf",
      tipo: "PDF",
      tamanho: "4.7 MB",
      data: "10/02/2023",
      categoria: "Catálogo",
      icon: <FileText className="h-3 w-3 text-red-500" />,
    },
    {
      nome: "Post_Instagram.jpg",
      tipo: "Imagem",
      tamanho: "1.8 MB",
      data: "01/03/2023",
      categoria: "Redes Sociais",
      icon: <Image className="h-3 w-3 text-blue-500" />,
    },
    {
      nome: "Pedido_12345.pdf",
      tipo: "PDF",
      tamanho: "0.8 MB",
      data: "15/03/2023",
      categoria: "Pedido",
      icon: <FileText className="h-3 w-3 text-red-500" />,
    },
  ]

  // Inicializar o formulário com os dados do cliente quando entrar no modo de edição
  const handleEditClick = () => {
    setFormData({ ...cliente })
    setIsEditing(true)
  }

  // Salvar as alterações
  const handleSaveClick = () => {
    // Aqui seria implementada a lógica para salvar os dados no backend
    toast({
      title: "Alterações salvas",
      description: "Os dados do cliente foram atualizados com sucesso.",
    })
    setIsEditing(false)
  }

  // Cancelar a edição
  const handleCancelClick = () => {
    setIsEditing(false)
    setFormData(null)
  }

  // Função para lidar com o upload de arquivo
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setSelectedFile(e.target.files[0])
  //   }
  // }

  const handleFileUpload = () => {
    // Aqui seria implementada a lógica para enviar o arquivo para o servidor
    if (selectedFile) {
      toast({
        title: "Arquivo enviado com sucesso!",
        description: `O arquivo "${selectedFile.name}" foi enviado e registrado no histórico do cliente.`,
      })
      setSelectedFile(null)
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Arquivo PDF selecionado:", file.name);
      // 👉 Aqui você pode fazer upload ou leitura do arquivo
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons backLabel="Voltar para Clientes" backHref="/clientes" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{cliente.nome}</h2>
            <div
              className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cliente.status === "Ativo"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : cliente.status === "Inativo"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
            >
              {cliente.status === "Inativo" ? `${cliente.status} há ${cliente.diasInativo} dias` : cliente.status}
            </div>
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="interacoes">Interações</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
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
                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                        <Input
                          id="nomeFantasia"
                          value={formData.nomeFantasia}
                          onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
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
                        <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                        <Input
                          id="inscricaoEstadual"
                          value={formData.inscricaoEstadual}
                          onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Input
                          id="categoria"
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Razão Social:</dt>
                        <dd>{cliente.nome}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Nome Fantasia:</dt>
                        <dd>{cliente.nomeFantasia}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">CNPJ:</dt>
                        <dd>{cliente.cnpj}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Inscrição Estadual:</dt>
                        <dd>{cliente.inscricaoEstadual}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Categoria:</dt>
                        <dd>{cliente.categoria}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Status:</dt>
                        <dd>
                          {cliente.status === "Inativo"
                            ? `${cliente.status} há ${cliente.diasInativo} dias`
                            : cliente.status}
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
                        <Label htmlFor="responsavel">Responsável</Label>
                        <Input
                          id="responsavel"
                          value={formData.responsavel}
                          onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          value={formData.cargo}
                          onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Responsável:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {cliente.responsavel}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Cargo:</dt>
                        <dd>{cliente.cargo}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Telefone:</dt>
                        <dd className="flex items-center gap-2">
                          <span>{cliente.telefone}</span>
                          <ContactButton type="phone" value={cliente.telefone} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">WhatsApp:</dt>
                        <dd className="flex items-center gap-2">
                          <span>{cliente.whatsapp}</span>
                          <ContactButton type="whatsapp" value={cliente.whatsapp} />
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">E-mail:</dt>
                        <dd className="flex items-center gap-2">
                          <span>{cliente.email}</span>
                          <ContactButton type="email" value={cliente.email} />
                        </dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Website:</dt>
                        <dd>{cliente.website}</dd>
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
                        <Input
                          id="estado"
                          value={formData.estado}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        />
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
                        <dd>{cliente.endereco}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Bairro:</dt>
                        <dd>{cliente.bairro}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Cidade/UF:</dt>
                        <dd className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cliente.cidade}/{cliente.estado}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">CEP:</dt>
                        <dd>{cliente.cep}</dd>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <dt className="font-medium">Coordenadas:</dt>
                        <dd className="flex items-center gap-2">
                          <span>
                            {cliente.coordenadas.latitude.toFixed(4)}, {cliente.coordenadas.longitude.toFixed(4)}
                          </span>
                          <ContactButton
                            type="map"
                            value={`${cliente.coordenadas.latitude}, ${cliente.coordenadas.longitude}`}
                          />
                        </dd>
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
                        <Label htmlFor="limiteCredito">Limite de Crédito</Label>
                        <Input
                          id="limiteCredito"
                          value={formData.limiteCredito}
                          onChange={(e) => setFormData({ ...formData, limiteCredito: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
                        <Input
                          id="condicoesPagamento"
                          value={formData.condicoesPagamento}
                          onChange={(e) => setFormData({ ...formData, condicoesPagamento: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Última Compra:</dt>
                        <dd className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {cliente.ultimaCompra}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Ticket Médio:</dt>
                        <dd className="flex items-center gap-1">
                          <CircleDollarSign className="h-3 w-3" />
                          {cliente.ticketMedio}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Limite de Crédito:</dt>
                        <dd>{cliente.limiteCredito}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Condições de Pagamento:</dt>
                        <dd>{cliente.condicoesPagamento}</dd>
                      </div>
                    </dl>
                  )}

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Últimas Vendas</h4>
                    <div className="space-y-3">
                      {ultimasVendas.map((venda) => (
                        <div key={venda.id} className="rounded-md border p-2 text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">Pedido #{venda.id}</span>
                            <span>{venda.data}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <Link
                              href={`/representadas/${venda.representadaId}`}
                              className="text-primary hover:underline"
                            >
                              {venda.representada}
                            </Link>
                            <span className="font-medium">{venda.valor}</span>
                          </div>
                          <div className="text-muted-foreground truncate" title={venda.produtos}>
                            {venda.produtos}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}
                            >
                              {venda.status}
                            </div>
                            <ShareButtons
                              fileUrl={`/pedidos/${venda.id}.pdf`}
                              fileName={`Pedido_${venda.id}.pdf`}
                              //clientId={cliente.id}
                              clientName={cliente.nome}
                              orderId={venda.id}
                              orderInfo={`${venda.valor} - ${venda.representada}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Input
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{cliente.observacoes}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Nova seção de Representadas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Representadas Compradas</CardTitle>
                <CardDescription>Histórico de compras por representada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "1",
                      nome: "Descartáveis Premium Ltda",
                      ultimaCompra: "15/03/2023",
                      diasSemCompra: 18,
                      totalCompras: "R$ 15.900,00",
                      status: "Ativo",
                      contato: {
                        telefone: "(11) 3456-7890",
                        whatsapp: "(11) 98765-4321",
                        email: "contato@descartaveispremium.com.br",
                      },
                    },
                    {
                      id: "2",
                      nome: "Embalagens Eco Ltda",
                      ultimaCompra: "28/02/2023",
                      diasSemCompra: 33,
                      totalCompras: "R$ 7.600,00",
                      status: "Atenção",
                      contato: {
                        telefone: "(11) 2345-6789",
                        whatsapp: "(11) 97654-3210",
                        email: "vendas@embalagenseco.com.br",
                      },
                    },
                    {
                      id: "3",
                      nome: "Papel & Cia",
                      ultimaCompra: "15/01/2023",
                      diasSemCompra: 77,
                      totalCompras: "R$ 10.700,00",
                      status: "Inativo",
                      contato: {
                        telefone: "(11) 3344-5566",
                        whatsapp: "(11) 96543-2109",
                        email: "comercial@papelecia.com.br",
                      },
                    },
                  ].map((representada) => (
                    <div key={representada.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link
                            href={`/representadas/${representada.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {representada.nome}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-1">
                            Última compra: {representada.ultimaCompra} ({representada.diasSemCompra} dias atrás)
                          </div>
                          <div className="text-sm mt-1">
                            Total de compras: <span className="font-medium">{representada.totalCompras}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            representada.status === "Ativo" && "border-green-500 text-green-500",
                            representada.status === "Atenção" && "border-yellow-500 text-yellow-500",
                            representada.status === "Inativo" && "border-red-500 text-red-500",
                          )}
                        >
                          {representada.status}
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">
                          <Button variant="outline" size="sm" className="h-7 text-xs mr-2">
                            Ver Histórico
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Nova Venda
                          </Button>
                        </div>

                        <ContactButtonsGroup
                          phone={representada.contato.telefone}
                          whatsapp={representada.contato.whatsapp}
                          email={representada.contato.email}
                          onContactInitiated={(type, value) => {
                            // Em uma implementação real, registraríamos esta interação no CRM
                            console.log(`Contato iniciado: ${type} para ${value}`)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interacoes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Histórico de Interações</CardTitle>
                <Link href="/interacoes/nova">
                  <Button size="sm" className="gap-1">
                    <Plus className="h-3 w-3" />
                    Nova Interação
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Ligação Telefônica</p>
                            <p className="text-xs text-muted-foreground">10/03/2023 às 14:30</p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Responsável:
                          <Link href="/usuarios/luiz-sodre" className="text-primary hover:underline ml-1">
                            Luiz Sodré
                          </Link>
                          (Externo)
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        Cliente solicitou orçamento para copos descartáveis 200ml. Enviado por e-mail.
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Próximo contato: 15/03/2023</div>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}
                        >
                          Aguardando Retorno
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendas" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Histórico de Vendas</CardTitle>
                <div className="flex gap-2">

                  <Link href="/vendas/nova">
                    <Button size="sm" className=" gap-1">
                      <CircleDollarSign className="h-4 w-4" />
                      <span>Nova Venda</span>
                    </Button>
                  </Link>

                  <>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      title="Selecionar PDF"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleButtonClick}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Importar PDF</span>
                    </Button>
                  </>

                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 border rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Enviar Arquivo de Venda</h3>
                  <div className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="pdf-upload">Selecione um arquivo PDF</Label>
                      <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                    <Button onClick={handleFileUpload} disabled={!selectedFile} className="gap-1">
                      <Upload className="h-4 w-4" />
                      Enviar Arquivo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {ultimasVendas.map((venda, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-2">
                            <CircleDollarSign className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Pedido #{venda.id}</p>
                            <p className="text-xs text-muted-foreground">{venda.data}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">{venda.valor}</div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Representada:</span>
                        <Link
                          href={`/representadas/${venda.representadaId}`}
                          className="text-primary hover:underline ml-1"
                        >
                          {venda.representada}
                        </Link>
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Produtos:</span> {venda.produtos}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Pagamento: 30/60/90 dias</div>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}
                        >
                          {venda.status}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Ver PDF
                        </Button>
                        <ShareButtons
                          fileUrl={`/pedidos/${venda.id}.pdf`}
                          fileName={`Pedido_${venda.id}.pdf`}
                          //clientId={cliente.id}
                          clientName={cliente.nome}
                          orderId={venda.id}
                          orderInfo={`${venda.valor} - ${venda.representada}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card>
              <CardHeader>
                <CardTitle>Financeiro</CardTitle>
                <CardDescription>Informações financeiras e histórico de pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo do financeiro será exibido aqui.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>Documentos e arquivos relacionados ao cliente</CardDescription>
                </div>

                <>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Selecionar documento"
                  />

                  <Button size="sm" className="gap-1" onClick={handleButtonClick}>
                    <Upload className="h-4 w-4" />
                    <span>Adicionar Documentos</span>
                  </Button>
                </>

              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {documentos.map((documento, index) => (
                    <div key={index} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        {documento.icon}
                        <div className="text-sm font-medium">{documento.nome}</div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Tipo: {documento.tipo}
                        <br />
                        Tamanho: {documento.tamanho}
                        <br />
                        Data: {documento.data}
                        <br />
                        Categoria: {documento.categoria}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button variant="outline" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

