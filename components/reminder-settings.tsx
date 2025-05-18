"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { BellRing, Clock, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ReminderSettings() {
  const [settings, setSettings] = useState({
    enablePostSaleReminders: true,
    postSaleDays: 15,
    enableInactiveClientReminders: true,
    inactiveClientDays: 30,
    enableBirthdayReminders: true,
    birthdayReminderDays: 3,
    enableCalendarSync: true,
    reminderTime: "09:00",
    notificationMethod: "all",
  })

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações de lembretes foram atualizadas com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <span>Configurações de Lembretes</span>
        </CardTitle>
        <CardDescription>Configure como e quando você deseja receber lembretes automáticos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="post-sale-reminder">Lembretes pós-venda</Label>
              <p className="text-xs text-muted-foreground">Receber lembretes para contatar clientes após faturamento</p>
            </div>
            <Switch
              id="post-sale-reminder"
              checked={settings.enablePostSaleReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, enablePostSaleReminders: checked })}
            />
          </div>

          {settings.enablePostSaleReminders && (
            <div className="ml-6 border-l pl-6 space-y-2">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="post-sale-days">Dias após faturamento:</Label>
                <Input
                  id="post-sale-days"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.postSaleDays}
                  onChange={(e) => setSettings({ ...settings, postSaleDays: Number.parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lembretes serão criados {settings.postSaleDays} dias após o faturamento para verificar reposições
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inactive-client-reminder">Lembretes de clientes inativos</Label>
              <p className="text-xs text-muted-foreground">Receber lembretes sobre clientes sem compras recentes</p>
            </div>
            <Switch
              id="inactive-client-reminder"
              checked={settings.enableInactiveClientReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, enableInactiveClientReminders: checked })}
            />
          </div>

          {settings.enableInactiveClientReminders && (
            <div className="ml-6 border-l pl-6 space-y-2">
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="inactive-days">Dias sem compra:</Label>
                <Input
                  id="inactive-days"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.inactiveClientDays}
                  onChange={(e) => setSettings({ ...settings, inactiveClientDays: Number.parseInt(e.target.value) })}
                  className="h-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lembretes serão criados quando um cliente ficar {settings.inactiveClientDays} dias sem comprar
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="calendar-sync">Sincronizar com Google Calendar</Label>
              <p className="text-xs text-muted-foreground">
                Adicionar lembretes automaticamente ao seu Google Calendar
              </p>
            </div>
            <Switch
              id="calendar-sync"
              checked={settings.enableCalendarSync}
              onCheckedChange={(checked) => setSettings({ ...settings, enableCalendarSync: checked })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-time">Horário padrão para lembretes:</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
              className="h-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-method">Método de notificação:</Label>
          <Select
            value={settings.notificationMethod}
            onValueChange={(value) => setSettings({ ...settings, notificationMethod: value })}
          >
            <SelectTrigger id="notification-method">
              <SelectValue placeholder="Selecione o método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Apenas E-mail</SelectItem>
              <SelectItem value="system">Apenas Sistema</SelectItem>
              <SelectItem value="all">E-mail e Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  )
}

