// app/representadas/novo/page.tsx

"use client"

import React from "react"
import SidebarLayout from "@/app/components/menu"
import { NavigationButtons } from "@/components/navigation-buttons"

export default function NovaRepresentadaPage() {
  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mt-4">
          <NavigationButtons backLabel="Voltar para Representadas" backHref="/representadas" />
        </h1>
      </div>
    </SidebarLayout>
  )
}
