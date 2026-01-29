"use client"

import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Title Section */}
      <div className="animate-fade-in">
        <h1 className="text-xl font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Date */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="uppercase tracking-wider">{currentDate}</span>
        </div>

        {/* Secure Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 rounded-lg border border-border/50">
          <Shield className="w-3.5 h-3.5 text-success" />
          <span className="text-sm font-medium uppercase tracking-wider text-foreground/80">
            Seguro
          </span>
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </Button>
      </div>
    </header>
  )
}
