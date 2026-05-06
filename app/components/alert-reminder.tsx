"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertReminderProps {
  title: string
  description: string
  date: string
  type: "task" | "meeting" | "deadline" | "payment"
  onDismiss: () => void
  onPostpone: (minutes: number) => void
}

export function AlertReminder({ title, description, date, type, onDismiss, onPostpone }: AlertReminderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const handlePostpone = (minutes: number) => {
    setIsVisible(false)
    setTimeout(() => {
      onPostpone(minutes)
    }, 300)
  }

  const getIconByType = () => {
    switch (type) {
      case "task":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "meeting":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "deadline":
        return <Bell className="h-5 w-5 text-red-500" />
      case "payment":
        return <Bell className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isMinimized ? "w-12 h-12 overflow-hidden" : "w-80",
      )}
    >
      <Card
        className={cn(
          "p-4 shadow-lg border-l-4",
          type === "task"
            ? "border-l-blue-500"
            : type === "meeting"
              ? "border-l-purple-500"
              : type === "deadline"
                ? "border-l-red-500"
                : "border-l-green-500",
        )}
      >
        {isMinimized ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 absolute top-0 left-0 right-0 bottom-0 m-auto"
            onClick={() => setIsMinimized(false)}
          >
            {getIconByType()}
          </Button>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getIconByType()}
                <h3 className="font-medium">Lembrete</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
                  <Clock className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="mb-3">
              <h4 className="font-medium text-sm">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
              <p className="text-xs mt-1">{date}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(5)}>
                +5min
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(10)}>
                +10min
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(15)}>
                +15min
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(30)}>
                +30min
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(60)}>
                +1h
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handlePostpone(60 * 24)}>
                +1d
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

