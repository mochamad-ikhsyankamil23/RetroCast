import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            // Primary (Glossy Aero Gradient)
            "glossy-button px-6 py-2 text-white hover:shadow-glow": variant === 'primary',
            // Secondary (Glass)
            "bg-white/20 backdrop-blur-md border border-white/50 text-aero-text hover:bg-white/30 px-6 py-2 shadow-sm": variant === 'secondary',
            // Danger (Glossy Red)
            "relative overflow-hidden bg-gradient-to-br from-red-400 to-red-600 text-white font-semibold shadow-md border border-white/40 hover:scale-105 active:scale-95 px-6 py-2 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-glossy-overlay before:pointer-events-none": variant === 'danger',
            // Ghost (Transparent hover)
            "bg-transparent text-aero-text hover:bg-white/20 px-4 py-2 rounded-lg": variant === 'ghost',
            // Sizes
            "text-sm px-4 py-1.5": size === 'sm',
            "text-base px-6 py-2": size === 'md',
            "text-lg px-8 py-3": size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
