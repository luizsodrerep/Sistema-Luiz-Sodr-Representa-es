import type { ReactNode } from "react"

interface PageLayoutProps {
  title: string
  children: ReactNode
}

export function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

