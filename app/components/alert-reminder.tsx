"use client"

import { useState } from "react"

interface AlertReminderProps {
  title?: string
  description?: string
  time?: string
  onDismiss?: () => void
}

export function AlertReminder({ title, description, time, onDismiss }: AlertReminderProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onDismiss && typeof onDismiss === "function") onDismiss()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          {time && <p className="text-xs text-red-500 mt-1">{time}</p>}
        </div>
        <button onClick={handleDismiss} className="ml-4 text-gray-400 hover:text-gray-600">✕</button>
      </div>
    </div>
  )
}
