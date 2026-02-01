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
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [shimmerActive, setShimmerActive] = useState(false)
  
  useEffect(() => {
    // Activate shimmer after initial flash completes
    const timer = setTimeout(() => {
      setShimmerActive(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Deep gradient background with depth - institutional dark */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.05_0.005_260)] via-background to-[oklch(0.04_0.008_260)]" />
      
      {/* Radial gradient for central focus - subtle silver/blue tint */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 80% at 50% 20%, rgba(50, 55, 70, 0.12) 0%, transparent 60%)'
        }}
      />

      {/* Animated grid pattern - institutional data flow */}
      <div className="absolute inset-0 grid-institutional">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(180,185,195,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(180,185,195,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Data stream lines - horizontal flow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Silver stream 1 */}
        <div 
          className="absolute h-[1px] data-flow-bg"
          style={{
            top: '25%',
            left: '-10%',
            right: '-10%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(180,185,195,0.08) 20%, rgba(180,185,195,0.15) 50%, rgba(180,185,195,0.08) 80%, transparent 100%)',
            animationDelay: '0s',
          }}
        />
        {/* Silver stream 2 */}
        <div 
          className="absolute h-[1px] data-flow-bg"
          style={{
            top: '45%',
            left: '-10%',
            right: '-10%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(180,185,195,0.06) 30%, rgba(180,185,195,0.12) 50%, rgba(180,185,195,0.06) 70%, transparent 100%)',
            animationDelay: '10s',
          }}
        />
        {/* Green tenue stream */}
        <div 
          className="absolute h-[1px] data-flow-bg"
          style={{
            top: '65%',
            left: '-10%',
            right: '-10%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(100,160,120,0.04) 25%, rgba(100,160,120,0.08) 50%, rgba(100,160,120,0.04) 75%, transparent 100%)',
            animationDelay: '5s',
          }}
        />
        {/* Silver stream 3 */}
        <div 
          className="absolute h-[1px] data-flow-bg"
          style={{
            top: '80%',
            left: '-10%',
            right: '-10%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(180,185,195,0.05) 20%, rgba(180,185,195,0.1) 50%, rgba(180,185,195,0.05) 80%, transparent 100%)',
            animationDelay: '15s',
          }}
        />
      </div>

      {/* Vertical data columns - very subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.4]">
        <div 
          className="absolute w-[1px] h-full data-flow-bg"
          style={{
            left: '20%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(180,185,195,0.06) 30%, rgba(180,185,195,0.03) 70%, transparent 100%)',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute w-[1px] h-full data-flow-bg"
          style={{
            left: '50%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(100,160,120,0.04) 40%, rgba(100,160,120,0.02) 60%, transparent 100%)',
            animationDelay: '8s',
          }}
        />
        <div 
          className="absolute w-[1px] h-full data-flow-bg"
          style={{
            left: '80%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(180,185,195,0.05) 35%, rgba(180,185,195,0.025) 65%, transparent 100%)',
            animationDelay: '12s',
          }}
        />
      </div>

      {/* Algorithmic texture - subtle noise pattern */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Corner vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.3) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-7xl mx-auto">
          <AnimatedLogo size="md" />
          <Link href="/login">
            <button 
              className="btn-glass-institutional h-10 px-5 rounded-md text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.15em] text-white/80 hover:text-white/95"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.75) 0%, rgba(25, 27, 35, 0.65) 100%)',
              }}
            >
              <span className="relative z-10">Acceder</span>
            </button>
          </Link>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 lg:py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/[0.02] border border-white/[0.06] rounded-full backdrop-blur-sm">
              <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.12_145)] opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-full w-full bg-[oklch(0.55_0.12_145)]" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/80">
                Sistema Operativo 24/7
              </span>
            </div>

            {/* Main Heading - Institutional Silver Effect */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] sm:leading-tight tracking-tight text-balance">
              <span 
                className={`silver-title-institutional ${shimmerActive ? 'shimmer-active' : ''}`}
                style={{
                  display: 'inline-block',
                  letterSpacing: '-0.02em',
                }}
              >
                Trading Algoritmico
              </span>
              <br />
              <span 
                className={`silver-title-institutional ${shimmerActive ? 'shimmer-active' : ''}`}
                style={{
                  display: 'inline-block',
                  letterSpacing: '-0.02em',
                  animationDelay: '0.15s',
                }}
              >
                de Nivel Institucional
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed text-pretty px-2 sm:px-0">
              Tecnologia avanzada de trading automatizado con monitoreo en tiempo real. 
              Maximiza tu potencial de inversion con algoritmos probados.
            </p>

            {/* CTA Button - Glassmorphism Institutional */}
            <div className="flex items-center justify-center pt-6">
              <Link href="/login">
                <button 
                  className="btn-glass-institutional h-14 px-10 rounded-lg font-semibold uppercase tracking-[0.15em] text-[13px] text-white/90 flex items-center justify-center gap-3 group"
                >
                  <span className="relative z-10">Acceder al Terminal</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="group p-5 sm:p-6 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 backdrop-blur-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/[0.06] transition-colors">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 mb-2 uppercase tracking-wide">
                  Trading Automatico
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                  Algoritmos que operan 24/7 sin intervencion manual, ejecutando estrategias optimizadas.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-5 sm:p-6 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 backdrop-blur-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/[0.06] transition-colors">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 mb-2 uppercase tracking-wide">
                  Monitoreo en Tiempo Real
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                  Dashboard completo con metricas actualizadas y seguimiento de operaciones en vivo.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-5 sm:p-6 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 backdrop-blur-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/[0.06] transition-colors">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 mb-2 uppercase tracking-wide">
                  Gestion de Riesgo
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                  Parametros institucionales de control de riesgo integrados en cada operacion.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-5 sm:p-6 bg-white/[0.015] border border-white/[0.04] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 backdrop-blur-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/[0.06] transition-colors">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground/90 mb-2 uppercase tracking-wide">
                  Rendimiento Consistente
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                  Estrategias probadas con historico de rendimiento y transparencia total.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="p-4 sm:p-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/90">24/7</p>
                <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/70 mt-1.5 sm:mt-2">
                  Operacion Continua
                </p>
              </div>
              <div className="p-4 sm:p-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/90">100%</p>
                <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/70 mt-1.5 sm:mt-2">
                  Automatizado
                </p>
              </div>
              <div className="p-4 sm:p-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[oklch(0.60_0.12_145)]">+15%</p>
                <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/70 mt-1.5 sm:mt-2">
                  Rendimiento Mensual
                </p>
              </div>
              <div className="p-4 sm:p-0">
                <div className="flex justify-center">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-foreground/70" />
                </div>
                <p className="text-[9px] sm:text-[11px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/70 mt-1.5 sm:mt-2">
                  Acceso Seguro
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-6 sm:py-8 border-t border-white/[0.03]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground/40 font-medium">
              Sistema de monitoreo de rendimiento
            </p>
            <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground/40 font-medium">
              BELLYSWISS WARZONE 2026
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
