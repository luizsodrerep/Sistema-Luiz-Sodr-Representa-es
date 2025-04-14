import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Home } from "lucide-react"

interface NavigationButtonsProps {
  backLabel?: string
  backHref?: string
  showHome?: boolean
}

export function NavigationButtons({ backLabel = "Voltar", backHref = "..", showHome = true }: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Link href={backHref}>
        <Button variant="outline" size="sm" className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          <span>{backLabel}</span>
        </Button>
      </Link>

      {showHome && (
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1">
            <Home className="h-4 w-4" />
            <span>Página Inicial</span>
          </Button>
        </Link>
      )}
    </div>
  )
}

