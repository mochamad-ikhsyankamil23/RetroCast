'use client'

import React from 'react'
import { Menu, Bell } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function Header() {
  const { toggleSidebar } = useAppStore()

  return (
    <header className="h-20 glass-panel mx-4 mt-4 mb-6 flex items-center justify-between px-6 sticky top-4 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-white/20 transition-colors text-aero-text"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/20 transition-colors text-aero-text">
          <Bell size={24} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse-glow" />
        </button>
        
        <div className="flex items-center gap-3 ml-2 border-l border-white/30 pl-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-aero-cyan to-aero-green p-[2px] shadow-sm">
            <div className="w-full h-full rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center font-bold text-aero-text">
              AD
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-aero-text leading-tight">Admin User</p>
            <p className="text-xs text-aero-text/70">Collector</p>
          </div>
        </div>
      </div>
    </header>
  )
}
