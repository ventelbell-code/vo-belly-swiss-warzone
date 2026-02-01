"use client"

import Link from "next/link"
import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  Bot,
  Lock
} from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Deep gradient background with depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[oklch(0.06_0.01_260)]" />
      
      {/* Radial gradient for central focus */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(40, 50, 70, 0.15) 0%, transparent 70%)'
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
          <AnimatedLogo size="md" />
          <Link href="/login">
            <Button 
              variant="outline" 
              className="text-[11px] font-medium uppercase tracking-[0.15em] border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 bg-transparent"
            >
              Acceder
            </Button>
          </Link>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.60_0.16_145)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.60_0.16_145)]" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Sistema Operativo 24/7
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance">
              Trading Algoritmico
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/60">
                de Nivel Institucional
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              Tecnologia avanzada de trading automatizado con monitoreo en tiempo real. 
              Maximiza tu potencial de inversion con algoritmos probados.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button 
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-b from-white/95 to-white/85 text-[oklch(0.08_0.005_260)] hover:from-white hover:to-white/95 font-semibold uppercase tracking-[0.15em] text-[13px] transition-all duration-500 shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] group"
                >
                  Acceder al Terminal
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-14 px-8 text-[13px] font-medium uppercase tracking-[0.15em] border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 bg-transparent"
                >
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Bot className="w-6 h-6 text-white/70" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Trading Automatico
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Algoritmos que operan 24/7 sin intervencion manual, ejecutando estrategias optimizadas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <BarChart3 className="w-6 h-6 text-white/70" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Monitoreo en Tiempo Real
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dashboard completo con metricas actualizadas y seguimiento de operaciones en vivo.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Shield className="w-6 h-6 text-white/70" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Gestion de Riesgo
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Parametros institucionales de control de riesgo integrados en cada operacion.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-500">
                <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <TrendingUp className="w-6 h-6 text-white/70" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Rendimiento Consistente
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Estrategias probadas con historico de rendimiento y transparencia total.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16 border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">24/7</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mt-2">
                  Operacion Continua
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">100%</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mt-2">
                  Automatizado
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-[oklch(0.70_0.16_145)]">+15%</p>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mt-2">
                  Rendimiento Mensual
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">
                  <Lock className="w-8 h-8 mx-auto" />
                </p>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground mt-2">
                  Acceso Seguro
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/[0.05]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-medium">
              Sistema de monitoreo de rendimiento
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-medium">
              BELLYSWISS WARZONE 2026
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
