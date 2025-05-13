'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.setAttribute('data-pathname', pathname)
  }, [pathname])

  return <>{children}</>
}
