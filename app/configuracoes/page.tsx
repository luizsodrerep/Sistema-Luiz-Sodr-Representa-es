import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Cloud, Database, Lock, Shield, User } from "lucide-react"
import { NavigationButtons } from "@/components/navigation-buttons"
import { GoogleCalendarIntegration } from "@/components/google-calendar-integration"
import { ReminderSettings } from "@/components/reminder-settings"

export default function ConfiguracoesPage() {
  return (
    <PageLayout title="Configurações">
      {/* Botões de navegação */}
      <NavigationButtons backLabel="Voltar" backHref="/dashboard" />

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-8">
          <TabsTrigger value="geral" className="text-xxs">
            Geral
          </TabsTrigger>
          <TabsTrigger value="integracao" className="text-xxs">
            Integrações
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xxs">
            Usuários
          </TabsTrigger>
          <TabsTrigger value="empresa" className="text-xxs">
            Empresa
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="text-xxs">
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-2 mt-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Configurações Gerais</CardTitle>
                <CardDescription className="card-description">
                  Ajuste as configurações básicas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="timezone" className="text-xxs">
                    Fuso Horário
                  </Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger id="timezone" className="h-8 text-xxs">
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo" className="text-xxs">
                        América/São Paulo
                      </SelectItem>
                      <SelectItem value="America/Recife" className="text-xxs">
                        América/Recife
                      </SelectItem>
                      <SelectItem value="America/Manaus" className="text-xxs">
                        América/Manaus
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="language" className="text-xxs">
                    Idioma
                  </Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger id="language" className="h-8 text-xxs">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR" className="text-xxs">
                        Português (Brasil)
                      </SelectItem>
                      <SelectItem value="en-US" className="text-xxs">
                        English (US)
                      </SelectItem>
                      <SelectItem value="es" className="text-xxs">
                        Español
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currency" className="text-xxs">
                    Moeda
                  </Label>
                  <Select defaultValue="BRL">
                    <SelectTrigger id="currency" className="h-8 text-xxs">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL" className="text-xxs">
                        Real (R$)
                      </SelectItem>
                      <SelectItem value="USD" className="text-xxs">
                        Dólar (US$)
                      </SelectItem>
                      <SelectItem value="EUR" className="text-xxs">
                        Euro (€)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="text-xxs">
                    Modo Escuro
                  </Label>
                  <Switch id="dark-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-xxs">
                    Notificações do Sistema
                  </Label>
                  <Switch id="notifications" defaultChecked />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Notificações</CardTitle>
                <CardDescription className="card-description">Configure como deseja receber alertas</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-primary" />
                    <Label htmlFor="email-notif" className="text-xxs">
                      Notificações por E-mail
                    </Label>
                  </div>
                  <Switch id="email-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-primary" />
                    <Label htmlFor="whatsapp-notif" className="text-xxs">
                      Notificações por WhatsApp
                    </Label>
                  </div>
                  <Switch id="whatsapp-notif" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3 w-3 text-primary" />
                    <Label htmlFor="browser-notif" className="text-xxs">
                      Notificações no Navegador
                    </Label>
                  </div>
                  <Switch id="browser-notif" defaultChecked />
                </div>

                <div className="space-y-1 pt-2">
                  <Label htmlFor="notif-frequency" className="text-xxs">
                    Frequência de Resumos
                  </Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="notif-frequency" className="h-8 text-xxs">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime" className="text-xxs">
                        Tempo Real
                      </SelectItem>
                      <SelectItem value="daily" className="text-xxs">
                        Diário
                      </SelectItem>
                      <SelectItem value="weekly" className="text-xxs">
                        Semanal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xxs">Tipos de Notificação</Label>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-2">
                      <Switch id="notif-followup" defaultChecked />
                      <Label htmlFor="notif-followup" className="text-xxs">
                        Follow-ups
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="notif-sales" defaultChecked />
                      <Label htmlFor="notif-sales" className="text-xxs">
                        Vendas
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="notif-clients" defaultChecked />
                      <Label htmlFor="notif-clients" className="text-xxs">
                        Clientes
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="notif-system" defaultChecked />
                      <Label htmlFor="notif-system" className="text-xxs">
                        Sistema
                      </Label>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Notificações</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Aparência do Sistema</CardTitle>
              <CardDescription className="card-description">Personalize a interface do CRM</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="primary-color" className="text-xxs">
                    Cor Primária
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input type="color" id="primary-color" defaultValue="#0066b3" className="w-8 h-8 p-1" />
                    <Input type="text" value="#0066b3" className="h-8 text-xxs" readOnly />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="secondary-color" className="text-xxs">
                    Cor Secundária
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input type="color" id="secondary-color" defaultValue="#ff8c00" className="w-8 h-8 p-1" />
                    <Input type="text" value="#ff8c00" className="h-8 text-xxs" readOnly />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="font-size" className="text-xxs">
                    Tamanho da Fonte
                  </Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="font-size" className="h-8 text-xxs">
                      <SelectValue placeholder="Tamanho da fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small" className="text-xxs">
                        Pequeno
                      </SelectItem>
                      <SelectItem value="normal" className="text-xxs">
                        Normal
                      </SelectItem>
                      <SelectItem value="large" className="text-xxs">
                        Grande
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="density" className="text-xxs">
                    Densidade da Interface
                  </Label>
                  <Select defaultValue="compact">
                    <SelectTrigger id="density" className="h-8 text-xxs">
                      <SelectValue placeholder="Densidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact" className="text-xxs">
                        Compacta
                      </SelectItem>
                      <SelectItem value="normal" className="text-xxs">
                        Normal
                      </SelectItem>
                      <SelectItem value="comfortable" className="text-xxs">
                        Confortável
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full h-8 text-xxs mt-4">Aplicar Tema</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="space-y-2 mt-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Integração com WhatsApp</CardTitle>
                <CardDescription className="card-description">Configure a API do WhatsApp Business</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-token" className="text-xxs">
                    Token de Acesso
                  </Label>
                  <Input id="whatsapp-token" type="password" className="h-8 text-xxs" placeholder="••••••••••••••••" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="whatsapp-number" className="text-xxs">
                    Número de Telefone
                  </Label>
                  <Input id="whatsapp-number" className="h-8 text-xxs" placeholder="5511999999999" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-active" className="text-xxs">
                    Ativar Integração
                  </Label>
                  <Switch id="whatsapp-active" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-auto" className="text-xxs">
                    Respostas Automáticas
                  </Label>
                  <Switch id="whatsapp-auto" defaultChecked />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Integração com E-mail</CardTitle>
                <CardDescription className="card-description">
                  Configure o servidor SMTP para envio de e-mails
                </CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="smtp-server" className="text-xxs">
                    Servidor SMTP
                  </Label>
                  <Input id="smtp-server" className="h-8 text-xxs" placeholder="smtp.exemplo.com" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="smtp-port" className="text-xxs">
                      Porta
                    </Label>
                    <Input id="smtp-port" className="h-8 text-xxs" placeholder="587" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="smtp-security" className="text-xxs">
                      Segurança
                    </Label>
                    <Select defaultValue="tls">
                      <SelectTrigger id="smtp-security" className="h-8 text-xxs">
                        <SelectValue placeholder="Segurança" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xxs">
                          Nenhuma
                        </SelectItem>
                        <SelectItem value="ssl" className="text-xxs">
                          SSL
                        </SelectItem>
                        <SelectItem value="tls" className="text-xxs">
                          TLS
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="smtp-user" className="text-xxs">
                    Usuário
                  </Label>
                  <Input id="smtp-user" className="h-8 text-xxs" placeholder="contato@luizsodre.com.br" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="smtp-password" className="text-xxs">
                    Senha
                  </Label>
                  <Input id="smtp-password" type="password" className="h-8 text-xxs" placeholder="••••••••••••••••" />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Testar e Salvar</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Google Maps API</CardTitle>
                <CardDescription className="card-description">Para geolocalização de clientes</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="maps-key" className="text-xxs">
                    Chave da API
                  </Label>
                  <Input id="maps-key" type="password" className="h-8 text-xxs" placeholder="••••••••••••••••" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maps-active" className="text-xxs">
                    Ativar Integração
                  </Label>
                  <Switch id="maps-active" defaultChecked />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">VoIP / Telefonia</CardTitle>
                <CardDescription className="card-description">Para registro de ligações</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="voip-provider" className="text-xxs">
                    Provedor
                  </Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="voip-provider" className="h-8 text-xxs">
                      <SelectValue placeholder="Provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio" className="text-xxs">
                        Twilio
                      </SelectItem>
                      <SelectItem value="totalvoice" className="text-xxs">
                        TotalVoice
                      </SelectItem>
                      <SelectItem value="other" className="text-xxs">
                        Outro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="voip-key" className="text-xxs">
                    Chave da API
                  </Label>
                  <Input id="voip-key" type="password" className="h-8 text-xxs" placeholder="••••••••••••••••" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="voip-active" className="text-xxs">
                    Ativar Integração
                  </Label>
                  <Switch id="voip-active" />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Google Calendar</CardTitle>
                <CardDescription className="card-description">Para sincronização de agenda</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="calendar-key" className="text-xxs">
                    Chave da API
                  </Label>
                  <Input id="calendar-key" type="password" className="h-8 text-xxs" placeholder="••••••••••••••••" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="calendar-active" className="text-xxs">
                    Ativar Integração
                  </Label>
                  <Switch id="calendar-active" defaultChecked />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-2 mt-2">
          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Gerenciamento de Usuários</CardTitle>
              <CardDescription className="card-description">Adicione e gerencie usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xxs font-medium">Usuários Ativos</h3>
                  <Button variant="outline" size="sm" className="h-7 text-xxs">
                    <User className="h-3 w-3 mr-1" />
                    Novo Usuário
                  </Button>
                </div>

                <div className="border rounded-sm">
                  <div className="grid grid-cols-5 text-xxs font-medium bg-muted/20 p-1">
                    <div>Nome</div>
                    <div>E-mail</div>
                    <div>Cargo</div>
                    <div>Perfil</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {[
                    { nome: "Luiz Sodré", email: "luiz@luizsodre.com.br", cargo: "Diretor", perfil: "Administrador" },
                    { nome: "Maria Silva", email: "maria@luizsodre.com.br", cargo: "Vendedora", perfil: "Vendedor" },
                    { nome: "João Santos", email: "joao@luizsodre.com.br", cargo: "Gerente", perfil: "Gerente" },
                    { nome: "Ana Oliveira", email: "ana@luizsodre.com.br", cargo: "Assistente", perfil: "Assistente" },
                  ].map((usuario, i) => (
                    <div key={i} className="grid grid-cols-5 text-xxs p-1 border-t">
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] text-primary">
                          {usuario.nome.charAt(0)}
                        </div>
                        <span>{usuario.nome}</span>
                      </div>
                      <div className="flex items-center">{usuario.email}</div>
                      <div className="flex items-center">{usuario.cargo}</div>
                      <div className="flex items-center">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                            usuario.perfil === "Administrador"
                              ? "bg-primary/10 text-primary"
                              : usuario.perfil === "Gerente"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {usuario.perfil}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <User className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Lock className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h3 className="text-xxs font-medium">Perfis de Acesso</h3>

                <div className="border rounded-sm">
                  <div className="grid grid-cols-3 text-xxs font-medium bg-muted/20 p-1">
                    <div>Perfil</div>
                    <div>Permissões</div>
                    <div className="text-right">Ações</div>
                  </div>

                  {[
                    { perfil: "Administrador", permissoes: "Acesso total ao sistema" },
                    { perfil: "Gerente", permissoes: "Acesso a relatórios e gestão de vendedores" },
                    { perfil: "Vendedor", permissoes: "Acesso a clientes, vendas e interações" },
                    { perfil: "Assistente", permissoes: "Acesso limitado a interações e cadastros" },
                  ].map((perfil, i) => (
                    <div key={i} className="grid grid-cols-3 text-xxs p-1 border-t">
                      <div className="flex items-center">{perfil.perfil}</div>
                      <div className="flex items-center">{perfil.permissoes}</div>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <Lock className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-2 mt-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Dados da Empresa</CardTitle>
                <CardDescription className="card-description">Informações da sua empresa</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="company-name" className="text-xxs">
                    Razão Social
                  </Label>
                  <Input id="company-name" className="h-8 text-xxs" defaultValue="Luiz Sodré Representações Ltda" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="company-fantasy" className="text-xxs">
                    Nome Fantasia
                  </Label>
                  <Input id="company-fantasy" className="h-8 text-xxs" defaultValue="Luiz Sodré Representações" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="company-cnpj" className="text-xxs">
                      CNPJ
                    </Label>
                    <Input id="company-cnpj" className="h-8 text-xxs" defaultValue="12.345.678/0001-90" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company-ie" className="text-xxs">
                      Inscrição Estadual
                    </Label>
                    <Input id="company-ie" className="h-8 text-xxs" defaultValue="123.456.789.000" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="company-address" className="text-xxs">
                    Endereço
                  </Label>
                  <Input
                    id="company-address"
                    className="h-8 text-xxs"
                    defaultValue="Av. Paulista, 1000, São Paulo/SP"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="company-phone" className="text-xxs">
                      Telefone
                    </Label>
                    <Input id="company-phone" className="h-8 text-xxs" defaultValue="(11) 3456-7890" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company-email" className="text-xxs">
                      E-mail
                    </Label>
                    <Input id="company-email" className="h-8 text-xxs" defaultValue="contato@luizsodre.com.br" />
                  </div>
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Informações</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Identidade Visual</CardTitle>
                <CardDescription className="card-description">Personalize a marca no sistema</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="flex justify-center p-2 border rounded-sm">
                  <div className="flex flex-col items-center gap-2">
                    <img src="/images/logo.png" alt="Logo" className="h-16 w-16" />
                    <Button variant="outline" size="sm" className="h-7 text-xxs">
                      Alterar Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="company-slogan" className="text-xxs">
                    Slogan
                  </Label>
                  <Input
                    id="company-slogan"
                    className="h-8 text-xxs"
                    defaultValue="Excelência em representação comercial"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="company-website" className="text-xxs">
                    Website
                  </Label>
                  <Input id="company-website" className="h-8 text-xxs" defaultValue="www.luizsodre.com.br" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="company-facebook" className="text-xxs">
                      Facebook
                    </Label>
                    <Input id="company-facebook" className="h-8 text-xxs" placeholder="@luizsodre" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company-instagram" className="text-xxs">
                      Instagram
                    </Label>
                    <Input id="company-instagram" className="h-8 text-xxs" placeholder="@luizsodre" />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="company-linkedin" className="text-xxs">
                      LinkedIn
                    </Label>
                    <Input id="company-linkedin" className="h-8 text-xxs" placeholder="@luizsodre" />
                  </div>
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Identidade</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-2 mt-2">
          <div className="grid gap-2 md:grid-cols-2">
            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Segurança do Sistema</CardTitle>
                <CardDescription className="card-description">Configure as políticas de segurança</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="password-policy" className="text-xxs">
                    Política de Senhas
                  </Label>
                  <Select defaultValue="strong">
                    <SelectTrigger id="password-policy" className="h-8 text-xxs">
                      <SelectValue placeholder="Política de senhas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic" className="text-xxs">
                        Básica (mínimo 6 caracteres)
                      </SelectItem>
                      <SelectItem value="medium" className="text-xxs">
                        Média (letras e números)
                      </SelectItem>
                      <SelectItem value="strong" className="text-xxs">
                        Forte (letras, números e símbolos)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password-expiry" className="text-xxs">
                    Expiração de Senhas
                  </Label>
                  <Select defaultValue="90">
                    <SelectTrigger id="password-expiry" className="h-8 text-xxs">
                      <SelectValue placeholder="Expiração de senhas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30" className="text-xxs">
                        30 dias
                      </SelectItem>
                      <SelectItem value="60" className="text-xxs">
                        60 dias
                      </SelectItem>
                      <SelectItem value="90" className="text-xxs">
                        90 dias
                      </SelectItem>
                      <SelectItem value="never" className="text-xxs">
                        Nunca
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="two-factor" className="text-xxs">
                    Autenticação em Dois Fatores
                  </Label>
                  <Switch id="two-factor" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="session-timeout" className="text-xxs">
                    Timeout de Sessão
                  </Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="session-timeout" className="h-8 text-xxs w-32">
                      <SelectValue placeholder="Timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="text-xxs">
                        15 minutos
                      </SelectItem>
                      <SelectItem value="30" className="text-xxs">
                        30 minutos
                      </SelectItem>
                      <SelectItem value="60" className="text-xxs">
                        60 minutos
                      </SelectItem>
                      <SelectItem value="never" className="text-xxs">
                        Nunca
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ip-restriction" className="text-xxs">
                    Restrição de IP
                  </Label>
                  <Switch id="ip-restriction" />
                </div>

                <Button className="w-full h-8 text-xxs mt-2">Salvar Configurações</Button>
              </CardContent>
            </Card>

            <Card className="card-container">
              <CardHeader className="card-header">
                <CardTitle className="card-title">Backup e Recuperação</CardTitle>
                <CardDescription className="card-description">Configure backups automáticos</CardDescription>
              </CardHeader>
              <CardContent className="card-content space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="backup-frequency" className="text-xxs">
                    Frequência de Backup
                  </Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backup-frequency" className="h-8 text-xxs">
                      <SelectValue placeholder="Frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly" className="text-xxs">
                        A cada hora
                      </SelectItem>
                      <SelectItem value="daily" className="text-xxs">
                        Diário
                      </SelectItem>
                      <SelectItem value="weekly" className="text-xxs">
                        Semanal
                      </SelectItem>
                      <SelectItem value="monthly" className="text-xxs">
                        Mensal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="backup-retention" className="text-xxs">
                    Retenção de Backup
                  </Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="backup-retention" className="h-8 text-xxs">
                      <SelectValue placeholder="Retenção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7" className="text-xxs">
                        7 dias
                      </SelectItem>
                      <SelectItem value="30" className="text-xxs">
                        30 dias
                      </SelectItem>
                      <SelectItem value="90" className="text-xxs">
                        90 dias
                      </SelectItem>
                      <SelectItem value="365" className="text-xxs">
                        1 ano
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="backup-storage" className="text-xxs">
                    Armazenamento
                  </Label>
                  <Select defaultValue="cloud">
                    <SelectTrigger id="backup-storage" className="h-8 text-xxs">
                      <SelectValue placeholder="Armazenamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local" className="text-xxs">
                        Local
                      </SelectItem>
                      <SelectItem value="cloud" className="text-xxs">
                        Nuvem
                      </SelectItem>
                      <SelectItem value="both" className="text-xxs">
                        Ambos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="backup-auto" className="text-xxs">
                    Backup Automático
                  </Label>
                  <Switch id="backup-auto" defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" className="h-8 text-xxs">
                    <Cloud className="h-3 w-3 mr-1" />
                    Backup Manual
                  </Button>
                  <Button variant="outline" className="h-8 text-xxs">
                    <Database className="h-3 w-3 mr-1" />
                    Restaurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="card-container">
            <CardHeader className="card-header">
              <CardTitle className="card-title">Registro de Atividades</CardTitle>
              <CardDescription className="card-description">Logs de acesso e ações no sistema</CardDescription>
            </CardHeader>
            <CardContent className="card-content">
              <div className="border rounded-sm">
                <div className="grid grid-cols-4 text-xxs font-medium bg-muted/20 p-1">
                  <div>Data/Hora</div>
                  <div>Usuário</div>
                  <div>Ação</div>
                  <div>IP</div>
                </div>

                {[
                  { data: "15/03/2023 14:32", usuario: "Luiz Sodré", acao: "Login no sistema", ip: "189.123.45.67" },
                  {
                    data: "15/03/2023 14:30",
                    usuario: "Maria Silva",
                    acao: "Cadastro de cliente",
                    ip: "189.123.45.68",
                  },
                  { data: "15/03/2023 14:25", usuario: "João Santos", acao: "Registro de venda", ip: "189.123.45.69" },
                  {
                    data: "15/03/2023 14:20",
                    usuario: "Ana Oliveira",
                    acao: "Alteração de cadastro",
                    ip: "189.123.45.70",
                  },
                  {
                    data: "15/03/2023 14:15",
                    usuario: "Luiz Sodré",
                    acao: "Exportação de relatório",
                    ip: "189.123.45.67",
                  },
                ].map((log, i) => (
                  <div key={i} className="grid grid-cols-4 text-xxs p-1 border-t">
                    <div>{log.data}</div>
                    <div>{log.usuario}</div>
                    <div>{log.acao}</div>
                    <div>{log.ip}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" className="h-7 text-xxs">
                  <Shield className="h-3 w-3 mr-1" />
                  Ver Todos os Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Integração com Google Calendar */}
        <GoogleCalendarIntegration userId="luiz.sodre" userName="Luiz Sodré" />

        {/* Configurações de Lembretes */}
        <ReminderSettings />
      </div>
    </PageLayout>
  )
}

