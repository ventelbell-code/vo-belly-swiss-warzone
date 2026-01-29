"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  icon?: LucideIcon
  className?: string
  animationDelay?: number
  children?: React.ReactNode
}

export function MetricCard({ 
  title, 
  icon: Icon, 
  className, 
  animationDelay = 0,
  children 
}: MetricCardProps) {
  return (
    <div 
      className={cn(
        "bg-card border border-border/50 rounded-lg p-6 transition-all duration-300",
        "hover:border-border hover:shadow-lg hover:shadow-black/20",
        "animate-card-appear opacity-0",
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {Icon && (
          <Icon className="w-4 h-4 text-steel-dark" />
        )}
      </div>

      {/* Content */}
      <div className="min-h-[80px] flex items-center justify-center">
        {children || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-border border-t-steel-dark rounded-full animate-spin opacity-30" />
          </div>
        )}
      </div>
    </div>
  )
}
