"use client"

import { ContactButton, type ContactType } from "@/components/contact-buttons"

interface ContactButtonsGroupProps {
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  coordinates?: { latitude: number; longitude: number }
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  onContactInitiated?: (type: ContactType, value: string) => void
}

export function ContactButtonsGroup({
  phone,
  whatsapp,
  email,
  address,
  coordinates,
  size = "sm",
  variant = "outline",
  className = "",
  onContactInitiated,
}: ContactButtonsGroupProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {whatsapp && (
        <ContactButton
          type="whatsapp"
          value={whatsapp}
          label="WhatsApp"
          size={size}
          variant={variant}
          onContactInitiated={onContactInitiated}
        />
      )}

      {phone && (
        <ContactButton
          type="phone"
          value={phone}
          label="Telefone"
          size={size}
          variant={variant}
          onContactInitiated={onContactInitiated}
        />
      )}

      {email && (
        <ContactButton
          type="email"
          value={email}
          label="E-mail"
          size={size}
          variant={variant}
          onContactInitiated={onContactInitiated}
        />
      )}

      {coordinates && (
        <ContactButton
          type="map"
          value={`${coordinates.latitude},${coordinates.longitude}`}
          label="Mapa"
          size={size}
          variant={variant}
          onContactInitiated={onContactInitiated}
        />
      )}

      {address && (
        <ContactButton
          type="visit"
          value={address}
          label="Visita"
          size={size}
          variant={variant}
          onContactInitiated={onContactInitiated}
        />
      )}
    </div>
  )
}

