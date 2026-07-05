'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Package, ShoppingCart, Bell, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Sellers', href: '/sellers', icon: Users },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen } = useAppStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!isSidebarOpen) return null

  return (
    <aside className="w-64 glass-panel m-4 flex flex-col justify-between h-[calc(100vh-2rem)] sticky top-4">
      <div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-aero-text to-blue-600 drop-shadow-sm flex items-center gap-2">
            <span className="text-3xl">🛞</span> RetroCast
          </h1>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                  isActive 
                    ? "bg-white/40 shadow-inner text-aero-text" 
                    : "text-aero-text/80 hover:bg-white/20 hover:text-aero-text"
                )}
              >
                <item.icon size={20} className={isActive ? "text-blue-500" : ""} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4">
        <button 
          onClick={handleLogout}
          className="w-full glossy-button flex items-center justify-center gap-2 py-3"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
