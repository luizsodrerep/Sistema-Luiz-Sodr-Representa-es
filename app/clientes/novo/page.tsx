"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import SidebarLayout from "@/app/components/menu"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Save } from "lucide-react"
import { NavigationButtons } from "@/components/navigation-buttons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NovoClientePage() {
  const [formData, setFormData] = useState({
    tipo: "juridica",
    categoria: "distribuidor",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SidebarLayout>
          {/* Botões de navegação */}
          {/* <NavigationButtons backLabel="Voltar para Clientes" /> */}
          <NavigationButtons backLabel="Voltar para Clientes" backHref="/clientes"/>
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle>Cadastro de Cliente</CardTitle>
              <CardDescription>Preencha os dados para cadastrar um novo cliente</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Dados Básicos</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="tipo">Tipo de Cliente</Label>
                        <Select value={formData.tipo} onValueChange={(value) => handleChange("tipo", value)}>
                          <SelectTrigger id="tipo">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                            <SelectItem value="fisica">Pessoa Física</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.tipo === "juridica" ? (
                        <>
                          <div>
                            <Label htmlFor="razao-social">Razão Social</Label>
                            <Input id="razao-social" placeholder="Razão Social completa" />
                          </div>
                          <div>
                            <Label htmlFor="nome-fantasia">Nome Fantasia</Label>
                            <Input id="nome-fantasia" placeholder="Nome Fantasia" />
                          </div>
                          <div>
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" placeholder="00.000.000/0000-00" />
                          </div>
                          <div>
                            <Label htmlFor="inscricao-estadual">Inscrição Estadual</Label>
                            <Input id="inscricao-estadual" placeholder="Inscrição Estadual" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="nome">Nome Completo</Label>
                            <Input id="nome" placeholder="Nome completo" />
                          </div>
                          <div>
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" placeholder="000.000.000-00" />
                          </div>
                          <div>
                            <Label htmlFor="rg">RG</Label>
                            <Input id="rg" placeholder="RG" />
                          </div>
                        </>
                      )}

                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                          <SelectTrigger id="categoria">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="distribuidor">Distribuidor</SelectItem>
                            <SelectItem value="atacado">Atacado</SelectItem>
                            <SelectItem value="varejo">Varejo</SelectItem>
                            <SelectItem value="confeitaria">Confeitaria</SelectItem>
                            <SelectItem value="padaria">Padaria</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Contato</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="responsavel">Nome do Responsável</Label>
                        <Input id="responsavel" placeholder="Nome do contato principal" />
                      </div>
                      <div>
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input id="cargo" placeholder="Cargo do responsável" />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <div className="flex items-center gap-2">
                          <Input id="telefone" placeholder="(00) 0000-0000" className="flex-1" />
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input id="whatsapp" placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <div className="flex items-center gap-2">
                          <Input id="email" placeholder="email@exemplo.com" className="flex-1" />
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" placeholder="www.exemplo.com.br" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço e Informações Comerciais */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Endereço</h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <Label htmlFor="cep">CEP</Label>
                          <Input id="cep" placeholder="00000-000" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="buscar-cep">Buscar</Label>
                          <Button id="buscar-cep" className="w-full">
                            Buscar por CEP
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input id="endereco" placeholder="Rua, Avenida, etc." />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <Label htmlFor="numero">Número</Label>
                          <Input id="numero" placeholder="Nº" />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="complemento">Complemento</Label>
                          <Input id="complemento" placeholder="Sala, Apto, etc." />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bairro">Bairro</Label>
                        <Input id="bairro" placeholder="Bairro" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input id="cidade" placeholder="Cidade" />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor="estado">Estado</Label>
                          <Select defaultValue="SP">
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
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input id="latitude" placeholder="Ex: -23.5505" />
                        </div>
                        <div>
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input id="longitude" placeholder="Ex: -46.6333" />
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" className="w-full gap-2">
                          <MapPin className="h-4 w-4" />
                          Selecionar no Mapa
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Informações Comerciais</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="limite-credito">Limite de Crédito</Label>
                        <Input id="limite-credito" placeholder="R$ 0,00" />
                      </div>
                      <div>
                        <Label htmlFor="condicoes-pagamento">Condições de Pagamento</Label>
                        <Input id="condicoes-pagamento" placeholder="Ex: 30/60/90 dias" />
                      </div>
                      <div>
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                          id="observacoes"
                          placeholder="Informações adicionais sobre o cliente"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </SidebarLayout>
      </div>
    </div>
  )
}

