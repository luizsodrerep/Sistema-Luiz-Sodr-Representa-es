"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Edit, Mail, Phone, Save, User } from "lucide-react"

export default function UsuarioDetalhesPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  // Dados simulados do usuário
  const usuario = {
    id: "2",
    nome: "Luiz Sodré",
    cargo: "Vendedor Externo",
    email: "luiz@luizsodre.com.br",
    telefone: "(11) 99876-5432",
    departamento: "Vendas",
    tipo: "Externo",
    dataCadastro: "01/01/2020",
    ultimoAcesso: "15/03/2023 16:45",
    permissoes: [
      "Gerenciar Clientes",
      "Gerenciar Vendas",
      "Registrar Interações",
      "Visualizar Comissões",
      "Visualizar Relatórios",
    ],
  }

  // Inicializar o formulário com os dados do usuário quando entrar no modo de edição
  const handleEditClick = () => {
    setFormData({ ...usuario })
    setIsEditing(true)
  }

  // Salvar as alterações
  const handleSaveClick = () => {
    // Aqui seria implementada a lógica para salvar os dados no backend
    toast({
      title: "Alterações salvas",
      description: "Os dados do usuário foram atualizados com sucesso.",
    })
    setIsEditing(false)
  }

  // Cancelar a edição
  const handleCancelClick = () => {
    setIsEditing(false)
    setFormData(null)
  }

  // Função simulada de toast para feedback
  const toast = (props: { title: string; description: string }) => {
    console.log(`Toast: ${props.title} - ${props.description}`)
    // Em uma implementação real, isso mostraria uma notificação na interface
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Botões de navegação */}
        <NavigationButtons backLabel="Voltar para Usuários" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">{usuario.nome}</h2>
            <div className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
              {usuario.cargo}
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
              <Button variant="outline" size="sm" className="gap-1" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="informacoes">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="nome">Nome Completo</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                          id="departamento"
                          value={formData.departamento}
                          onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Input
                          id="tipo"
                          value={formData.tipo}
                          onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">Nome:</dt>
                        <dd className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {usuario.nome}
                        </dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Cargo:</dt>
                        <dd>{usuario.cargo}</dd>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <dt className="font-medium">Departamento:</dt>
                        <dd>{usuario.departamento}</dd>
                      </div>
                      <div className="flex justify-between py-1">
                        <dt className="font-medium">Tipo:</dt>
                        <dd>{usuario.tipo}</dd>
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
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    </div>
                  ) : (
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between py-1 border-b">
                        <dt className="font-medium">E-mail:</dt>
                        <dd className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${usuario.email}`} className="text-primary hover:underline">
                            {usuario.email}
                          </a>
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <dt className="font-medium">Telefone:</dt>
                        <dd className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {usuario.telefone}
                        </dd>
                      </div>
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <dt className="font-medium">Data de Cadastro:</dt>
                    <dd>{usuario.dataCadastro}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="font-medium">Último Acesso:</dt>
                    <dd>{usuario.ultimoAcesso}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permissões do Usuário</CardTitle>
                <CardDescription>Gerenciamento de acessos e funcionalidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Permissões Atuais</h3>
                    <ul className="space-y-1">
                      {usuario.permissoes.map((permissao, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                          {permissao}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Gerenciar Permissões</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Gerenciar Clientes",
                        "Gerenciar Vendas",
                        "Registrar Interações",
                        "Visualizar Comissões",
                        "Visualizar Relatórios",
                        "Gerenciar Representadas",
                        "Configurações do Sistema",
                        "Gerenciar Usuários",
                      ].map((permissao, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`perm-${i}`}
                            checked={usuario.permissoes.includes(permissao)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor={`perm-${i}`} className="text-sm">
                            {permissao}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button size="sm">Salvar Permissões</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atividades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Atividades</CardTitle>
                <CardDescription>Histórico de ações realizadas pelo usuário</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { data: "15/03/2023 16:45", acao: "Login no sistema", ip: "189.123.45.70" },
                    { data: "15/03/2023 16:50", acao: "Registro de interação com cliente", ip: "189.123.45.70" },
                    { data: "15/03/2023 17:15", acao: "Cadastro de venda", ip: "189.123.45.70" },
                    { data: "14/03/2023 10:30", acao: "Atualização de cliente", ip: "189.123.45.70" },
                    { data: "14/03/2023 14:20", acao: "Visualização de relatório", ip: "189.123.45.70" },
                  ].map((atividade, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="text-sm">{atividade.data}</div>
                      <div className="text-sm font-medium">{atividade.acao}</div>
                      <div className="text-xs text-muted-foreground">IP: {atividade.ip}</div>
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

