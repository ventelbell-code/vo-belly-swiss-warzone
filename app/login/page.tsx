"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login delay for UI feedback
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Navigate to dashboard (no real auth - structure only)
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Deep gradient background with depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[oklch(0.06_0.01_260)]" />
      
      {/* Radial gradient for central focus */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(40, 50, 70, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Algorithmic texture - subtle noise pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Login card with enhanced glassmorphism */}
      <Card className="w-full max-w-md mx-4 bg-card/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] animate-fade-in-up animate-glow-pulse relative overflow-hidden">
        {/* Inner highlight border */}
        <div className="absolute inset-0 rounded-lg border border-white/[0.03] pointer-events-none" />
        
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%)'
          }}
        />
        
        <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-10 relative z-10">
          {/* Logo */}
          <div className="flex justify-center">
            <AnimatedLogo size="lg" className="sm:w-80" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/80"
              >
                Correo Electronico
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@bellyswiss.com"
                  className="bg-white/[0.03] border border-white/[0.08] focus:border-white/20 focus:bg-white/[0.05] h-11 sm:h-12 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 transition-all duration-500 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] rounded-md px-3 sm:px-4"
                  required
                />
                {/* Focus glow effect */}
                <div className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_20px_rgba(100,130,180,0.1)]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/80"
              >
                Contrasena
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-white/[0.03] border border-white/[0.08] focus:border-white/20 focus:bg-white/[0.05] h-11 sm:h-12 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 transition-all duration-500 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] rounded-md px-3 sm:px-4"
                  required
                />
                {/* Focus glow effect */}
                <div className="absolute inset-0 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[0_0_20px_rgba(100,130,180,0.1)]" />
              </div>
            </div>

            <div className="pt-1 sm:pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-14 bg-gradient-to-b from-white/95 to-white/85 text-[oklch(0.08_0.005_260)] hover:from-white hover:to-white/95 font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[12px] sm:text-[13px] transition-all duration-500 relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] rounded-md"
              >
                <span className={`relative z-10 ${isLoading ? "opacity-0" : "opacity-100"}`}>
                  ACCEDER AL TERMINAL
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-5 h-5 border-2 border-[oklch(0.08_0.005_260)]/30 border-t-[oklch(0.08_0.005_260)] rounded-full animate-spin" />
                  </div>
                )}
                {/* Hover shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
              </Button>
            </div>
          </form>

          {/* Footer text */}
          <div className="text-center pt-1 sm:pt-2">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground/50 font-medium">
              Acceso institucional restringido
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom branding */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 px-4">
        <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-muted-foreground/25 font-medium text-center">
          Sistema de monitoreo de rendimiento
        </p>
      </div>
    </main>
  )
}
