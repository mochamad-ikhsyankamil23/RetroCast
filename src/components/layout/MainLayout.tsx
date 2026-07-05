'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  if (isAuthPage) {
    return <main>{children}</main>
  }

  return (
    <div className="flex min-h-screen bg-aero-bg relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-4 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
