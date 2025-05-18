"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Mail, MessageSquare, Phone, ExternalLink, Calendar } from "lucide-react"

export type ContactType = "whatsapp" | "email" | "phone" | "map" | "visit"

interface ContactButtonProps {
  type: ContactType
  value: string
  label?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  onContactInitiated?: (type: ContactType, value: string) => void
}

export function ContactButton({
  type,
  value,
  label,
  size = "sm",
  variant = "outline",
  className = "",
  onContactInitiated,
}: ContactButtonProps) {
  const handleContact = () => {
    // Registrar a ação de contato (em uma implementação real, isso seria salvo no banco de dados)
    if (onContactInitiated) {
      onContactInitiated(type, value)
    }

    // Executar a ação de contato apropriada
    switch (type) {
      case "whatsapp":
        // Remover caracteres não numéricos
        const numeroLimpo = value.replace(/\D/g, "")
        window.open(`https://wa.me/55${numeroLimpo}`, "_blank")
        toast({
          title: "WhatsApp iniciado",
          description: `Abrindo chat com ${value}`,
        })
        break

      case "email":
        window.open(`mailto:${value}`, "_blank")
        toast({
          title: "E-mail iniciado",
          description: `Abrindo e-mail para ${value}`,
        })
        break

      case "phone":
        window.open(`tel:${value.replace(/\D/g, "")}`, "_blank")
        toast({
          title: "Ligação iniciada",
          description: `Ligando para ${value}`,
        })
        break

      case "map":
        // Assumindo que value é "latitude,longitude"
        const [lat, lng] = value.split(",").map((coord) => Number.parseFloat(coord.trim()))
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank")
        toast({
          title: "Mapa aberto",
          description: "Abrindo localização no Google Maps",
        })
        break

      case "visit":
        // Agendar visita (abrir modal de agendamento em uma implementação real)
        toast({
          title: "Agendar visita",
          description: `Agendando visita para ${value}`,
        })
        break
    }
  }

  // Determinar o ícone com base no tipo
  const getIcon = () => {
    switch (type) {
      case "whatsapp":
        return <MessageSquare className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      case "email":
        return <Mail className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      case "phone":
        return <Phone className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      case "map":
        return <ExternalLink className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      case "visit":
        return <Calendar className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
    }
  }

  // Determinar a cor do botão com base no tipo
  const getButtonClass = () => {
    switch (type) {
      case "whatsapp":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "email":
        return ""
      case "phone":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      case "map":
        return ""
      case "visit":
        return "bg-purple-500 hover:bg-purple-600 text-white"
    }
  }

  // Se tiver label, mostrar botão com texto, senão mostrar apenas ícone
  if (label) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`${className} ${variant === "default" ? getButtonClass() : ""}`}
        onClick={handleContact}
      >
        {getIcon()}
        <span className="ml-1">{label}</span>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size="icon"
      className={`${className} h-6 w-6 rounded-full ${variant === "default" ? getButtonClass() : ""}`}
      onClick={handleContact}
    >
      {getIcon()}
    </Button>
  )
}

