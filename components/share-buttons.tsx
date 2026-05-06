"use client"

import { useState } from "react"
import { Share2, MessageSquare, Mail, Download, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface ShareButtonsProps {
  fileUrl?: string
  fileName?: string
  clientId?: string
  clientName?: string
  orderId?: string
  orderInfo?: string
}

export function ShareButtons({
  fileUrl,
  fileName = "documento.pdf",
  clientId,
  clientName,
  orderId,
  orderInfo,
}: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false)

  // Função para registrar a interação de compartilhamento
  const registerShareInteraction = async (method: string) => {
    // Em uma implementação real, isso enviaria uma requisição para a API
    // para registrar a interação no histórico do cliente
    console.log(`Compartilhamento via ${method} registrado para cliente ${clientId} - ${clientName}`)

    // Simulação de registro bem-sucedido
    toast({
      title: "Compartilhamento registrado",
      description: `Compartilhamento via ${method} registrado no histórico do cliente.`,
    })
  }

  // Compartilhar via WhatsApp
  const shareViaWhatsApp = () => {
    setIsSharing(true)

    const message = `Olá! Segue o pedido ${orderId || ""} ${orderInfo || ""}. Acesse o documento em: ${fileUrl || "[URL do documento]"}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank")
    registerShareInteraction("WhatsApp")

    setIsSharing(false)
  }

  // Compartilhar via E-mail
  const shareViaEmail = () => {
    setIsSharing(true)

    const subject = `Pedido ${orderId || ""} - ${clientName || ""}`
    const body = `Olá!\n\nSegue o pedido ${orderId || ""} ${orderInfo || ""}.\n\nAcesse o documento em: ${fileUrl || "[URL do documento]"}\n\nAtenciosamente,\nLuiz Sodré Representações`

    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank")
    registerShareInteraction("E-mail")

    setIsSharing(false)
  }

  // Copiar link
  const copyLink = () => {
    setIsSharing(true)

    navigator.clipboard.writeText(fileUrl || window.location.href)
    registerShareInteraction("Link copiado")

    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    })

    setIsSharing(false)
  }

  // Download do arquivo
  const downloadFile = () => {
    if (fileUrl) {
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      registerShareInteraction("Download")
    } else {
      toast({
        title: "Erro ao baixar",
        description: "O arquivo não está disponível para download.",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xxs gap-1" disabled={isSharing}>
          <Share2 className="h-3 w-3" />
          Compartilhar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={shareViaWhatsApp}>
          <MessageSquare className="h-3 w-3 mr-2 text-green-500" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail}>
          <Mail className="h-3 w-3 mr-2 text-blue-500" />
          <span>E-mail</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink}>
          <Copy className="h-3 w-3 mr-2" />
          <span>Copiar link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadFile}>
          <Download className="h-3 w-3 mr-2" />
          <span>Baixar arquivo</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

