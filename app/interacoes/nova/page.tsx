"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Check, Mail, MessageSquare, Phone, Upload } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { NavigationButtons } from "@/components/navigation-buttons"

export default function NovaInteracaoPage() {
  const [date, setDate] = useState<Date>()
  const [tipoInteracao, setTipoInteracao] = useState<string>("whatsapp")
  const [anexos, setAnexos] = useState<File[]>([])
  const [responsavel, setResponsavel] = useState<string>("luiz")
  const [tipoAtendimento, setTipoAtendimento] = useState<string>("externo")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnexos(Array.from(e.target.files))
    }
  }

  return (
    <PageLayout title="Nova Interação">
      {/* Botões de navegação */}
      <NavigationButtons backLabel="Voltar para Interações" />

      <Card className="card-container">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Registrar Nova Interação</CardTitle>
          <CardDescription className="card-description">
            Preencha os dados para registrar um novo contato com cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="card-content space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="cliente" className="text-xxs">
                  Cliente
                </Label>
                <Select>
                  <SelectTrigger id="cliente" className="h-8 text-xxs">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribuidora-abc" className="text-xxs">
                      Distribuidora ABC
                    </SelectItem>
                    <SelectItem value="supermercado-silva" className="text-xxs">
                      Supermercado Silva
                    </SelectItem>
                    <SelectItem value="confeitaria-doce" className="text-xxs">
                      Confeitaria Doce
                    </SelectItem>
                    <SelectItem value="atacadao-produtos" className="text-xxs">
                      Atacadão Produtos
                    </SelectItem>
                    <SelectItem value="mercado-central" className="text-xxs">
                      Mercado Central
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="tipo-interacao" className="text-xxs">
                  Tipo de Interação
                </Label>
                <Select value={tipoInteracao} onValueChange={setTipoInteracao}>
                  <SelectTrigger id="tipo-interacao" className="h-8 text-xxs">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp" className="text-xxs">
                      WhatsApp
                    </SelectItem>
                    <SelectItem value="email" className="text-xxs">
                      E-mail
                    </SelectItem>
                    <SelectItem value="visita" className="text-xxs">
                      Visita
                    </SelectItem>
                    <SelectItem value="ligacao" className="text-xxs">
                      Ligação
                    </SelectItem>
                    <SelectItem value="indicacao" className="text-xxs">
                      Indicação de Representada
                    </SelectItem>
                    <SelectItem value="outro" className="text-xxs">
                      Outro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoInteracao === "whatsapp" && (
                <div className="space-y-1">
                  <Label htmlFor="whatsapp" className="text-xxs">
                    Número de WhatsApp
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="whatsapp" className="h-8 text-xxs" placeholder="(11) 99999-9999" />
                    <Button variant="outline" size="sm" className="h-8 text-xxs gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Abrir Chat
                    </Button>
                  </div>
                </div>
              )}

              {tipoInteracao === "email" && (
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xxs">
                    E-mail
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="email" className="h-8 text-xxs" placeholder="cliente@empresa.com.br" />
                    <Button variant="outline" size="sm" className="h-8 text-xxs gap-1">
                      <Mail className="h-3 w-3" />
                      Abrir E-mail
                    </Button>
                  </div>
                </div>
              )}

              {tipoInteracao === "visita" && (
                <div className="space-y-1">
                  <Label htmlFor="endereco" className="text-xxs">
                    Endereço da Visita
                  </Label>
                  <Input id="endereco" className="h-8 text-xxs" placeholder="Rua, número, bairro, cidade" />
                </div>
              )}

              {tipoInteracao === "ligacao" && (
                <div className="space-y-1">
                  <Label htmlFor="telefone" className="text-xxs">
                    Telefone
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input id="telefone" className="h-8 text-xxs" placeholder="(11) 3456-7890" />
                    <Button variant="outline" size="sm" className="h-8 text-xxs gap-1">
                      <Phone className="h-3 w-3" />
                      Ligar
                    </Button>
                  </div>
                </div>
              )}

              {tipoInteracao === "indicacao" && (
                <div className="space-y-1">
                  <Label htmlFor="representada" className="text-xxs">
                    Representada Indicada
                  </Label>
                  <Input id="representada" className="h-8 text-xxs" placeholder="Nome da empresa indicada" />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="responsavel" className="text-xxs">
                  Responsável
                </Label>
                <Select value={responsavel} onValueChange={setResponsavel}>
                  <SelectTrigger id="responsavel" className="h-8 text-xxs">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luiz" className="text-xxs">
                      Luiz Sodré
                    </SelectItem>
                    <SelectItem value="maria" className="text-xxs">
                      Maria Silva
                    </SelectItem>
                    <SelectItem value="joao" className="text-xxs">
                      João Santos
                    </SelectItem>
                    <SelectItem value="ana" className="text-xxs">
                      Ana Oliveira
                    </SelectItem>
                    <SelectItem value="paula" className="text-xxs">
                      Paula Ferreira
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="tipo-atendimento" className="text-xxs">
                  Tipo de Atendimento
                </Label>
                <Select value={tipoAtendimento} onValueChange={setTipoAtendimento}>
                  <SelectTrigger id="tipo-atendimento" className="h-8 text-xxs">
                    <SelectValue placeholder="Selecione o tipo de atendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno" className="text-xxs">
                      Interno (Escritório)
                    </SelectItem>
                    <SelectItem value="externo" className="text-xxs">
                      Externo (Campo)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="data" className="text-xxs">
                  Data e Hora
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-8 w-full justify-start text-left font-normal text-xxs",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>

                  <Select defaultValue="now">
                    <SelectTrigger className="h-8 text-xxs w-32">
                      <SelectValue placeholder="Hora" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now" className="text-xxs">
                        Agora
                      </SelectItem>
                      <SelectItem value="09:00" className="text-xxs">
                        09:00
                      </SelectItem>
                      <SelectItem value="10:00" className="text-xxs">
                        10:00
                      </SelectItem>
                      <SelectItem value="11:00" className="text-xxs">
                        11:00
                      </SelectItem>
                      <SelectItem value="14:00" className="text-xxs">
                        14:00
                      </SelectItem>
                      <SelectItem value="15:00" className="text-xxs">
                        15:00
                      </SelectItem>
                      <SelectItem value="16:00" className="text-xxs">
                        16:00
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="descricao" className="text-xxs">
                  Descrição da Interação
                </Label>
                <Textarea
                  id="descricao"
                  className="min-h-[120px] text-xxs"
                  placeholder="Descreva detalhes da interação com o cliente..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="status" className="text-xxs">
                  Status da Interação
                </Label>
                <Select defaultValue="concluido">
                  <SelectTrigger id="status" className="h-8 text-xxs">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concluido" className="text-xxs">
                      Concluído
                    </SelectItem>
                    <SelectItem value="pendente" className="text-xxs">
                      Pendente
                    </SelectItem>
                    <SelectItem value="aguardando" className="text-xxs">
                      Aguardando Retorno
                    </SelectItem>
                    <SelectItem value="agendado" className="text-xxs">
                      Follow-up Agendado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="anexos" className="text-xxs">
                  Anexos
                </Label>
                <div className="border border-dashed rounded-sm p-2">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xxs text-muted-foreground">Arraste arquivos ou clique para selecionar</p>
                    <Input id="anexos" type="file" multiple className="h-8 text-xxs" onChange={handleFileChange} />
                  </div>

                  {anexos.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xxs font-medium">Arquivos selecionados:</p>
                      {anexos.map((file, i) => (
                        <div key={i} className="flex items-center gap-1 text-xxs">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xxs">Agendar Follow-up?</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className="h-8 w-full justify-start text-left font-normal text-xxs">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        <span>Data do Follow-up</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>

                  <Select>
                    <SelectTrigger className="h-8 text-xxs w-32">
                      <SelectValue placeholder="Motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retorno" className="text-xxs">
                        Retorno
                      </SelectItem>
                      <SelectItem value="proposta" className="text-xxs">
                        Proposta
                      </SelectItem>
                      <SelectItem value="negociacao" className="text-xxs">
                        Negociação
                      </SelectItem>
                      <SelectItem value="fechamento" className="text-xxs">
                        Fechamento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xxs">
              Cancelar
            </Button>
            <Button size="sm" className="h-8 text-xxs">
              Salvar Interação
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}

