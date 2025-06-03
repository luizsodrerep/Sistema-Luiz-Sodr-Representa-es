"use client"

import { notFound } from "next/navigation"
import { useParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState, useRef } from "react"
import { Edit, Save, Trash, User, } from "lucide-react"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Tabs, TabsList, TabsTrigger, TabsContent, } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent, } from "@/components/ui/card"

interface Contato {
  id: number
  nome: string
  cargo: string
  telefone: string
  email: string
}

interface Cliente {
  id: number
  nome: string
  nomeFantasia: string
  cnpj: string
  inscricaoEstadual: string
  categoria: string
  telefone: string
  whatsapp: string
  email: string
  website: string
  responsavel: string
  cargo: string
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  status: string
  diasInativo: number
  contatos: Contato[]
}

export default function ClienteDetalhesPage() {
  const params = useParams();
  const id = params.id;

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Cliente>>({})

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const res = await fetch(`/api/clientes/${id}`)
        if (!res.ok) {
          throw new Error("Cliente não encontrado")
        }
        const data = await res.json()
        setCliente(data)
        setFormData(data)
      } catch (error) {
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    fetchCliente()
  }, [id])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    if (cliente) {
      setFormData(cliente)
    }
  }

  const handleSaveClick = async () => {
    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar");
      }

      const updated = await res.json();
      setCliente(updated);
      setFormData(updated);
      toast({
        title: "Alterações salvas",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        //description: error.message,
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Carregando...</div>
  }

  if (!cliente) {
    return notFound()
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <NavigationButtons backLabel="Voltar para Clientes" backHref="/clientes" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{cliente.nome}</h2>
            <div
              className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cliente.status === "Ativo"
                ? "bg-green-100 text-green-800"
                : cliente.status === "Inativo"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {cliente.status === "Inativo"
                ? `${cliente.status} há ${cliente.diasInativo} dias`
                : cliente.status}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancelClick}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveClick}>
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="informacoes">
          <TabsList>
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
          </TabsList>
          <TabsContent value="informacoes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dados Cadastrais</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <>
                      <Label>Razão Social</Label>
                      <Input
                        value={formData.nome || ""}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                      <Label>Nome Fantasia</Label>
                      <Input
                        value={formData.nomeFantasia || ""}
                        onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                      />
                      <Label>CNPJ</Label>
                      <Input
                        value={formData.cnpj || ""}
                        onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      />
                      <Label>Inscrição Estadual</Label>
                      <Input
                        value={formData.inscricaoEstadual || ""}
                        onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                      />
                      <Label>Categoria</Label>
                      <Input
                        value={formData.categoria || ""}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      />
                    </>
                  ) : (
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt>Razão Social:</dt>
                        <dd>{cliente.nome}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Nome Fantasia:</dt>
                        <dd>{cliente.nomeFantasia}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>CNPJ:</dt>
                        <dd>{cliente.cnpj}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Inscrição Estadual:</dt>
                        <dd>{cliente.inscricaoEstadual}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Categoria:</dt>
                        <dd>{cliente.categoria}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Status:</dt>
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
                <CardHeader>
                  <CardTitle className="text-base">Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <>
                      <Label>Responsável</Label>
                      <Input
                        value={formData.responsavel || ""}
                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      />
                      <Label>Cargo</Label>
                      <Input
                        value={formData.cargo || ""}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      />
                      <Label>Telefone</Label>
                      <Input
                        value={formData.telefone || ""}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      />
                      <Label>WhatsApp</Label>
                      <Input
                        value={formData.whatsapp || ""}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                      <Label>Email</Label>
                      <Input
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <Label>Website</Label>
                      <Input
                        value={formData.website || ""}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      />
                    </>
                  ) : (
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt>Responsável:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {cliente.responsavel}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Cargo:</dt>
                        <dd>{cliente.cargo}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Telefone:</dt>
                        <dd>{cliente.telefone}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>WhatsApp:</dt>
                        <dd>{cliente.whatsapp}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Email:</dt>
                        <dd>{cliente.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Website:</dt>
                        <dd>{cliente.website}</dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}