import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge-glass",
        {
          "bg-white/40 text-aero-text": variant === 'default',
          "bg-green-400/30 text-green-800 border-green-200/50": variant === 'success',
          "bg-yellow-400/30 text-yellow-800 border-yellow-200/50": variant === 'warning',
          "bg-red-400/30 text-red-800 border-red-200/50": variant === 'danger',
          "bg-blue-400/30 text-blue-800 border-blue-200/50": variant === 'info',
        },
        className
      )}
      {...props}
    />
  )
}
