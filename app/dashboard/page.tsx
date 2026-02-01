"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Wallet, 
  TrendingUp, 
  Calendar,
  Activity,
  History,
  Settings,
  LogOut,
  LayoutDashboard,
  Clock
} from "lucide-react"
import { useServiceStatus } from "@/hooks/use-service-status"
import { useRealTradingData } from "@/hooks/use-real-trading-data"
import { PaymentModal } from "@/components/dashboard/payment-modal"
import { BotConnectionStatus } from "@/components/dashboard/bot-connection-status"
import { Button } from "@/components/ui/button"
import { WeeklyPerformance } from "@/components/dashboard/weekly-performance"
import { ProfitBag } from "@/components/dashboard/profit-bag"
import { LiveActivityTimeline } from "@/components/dashboard/live-activity-timeline"
import { DailyControlPanel } from "@/components/dashboard/daily-control-panel"

// Datos de ejemplo con puntos intradiarios para curva realista
const weeklyData = [
  { day: "Lunes", shortDay: "Lun", profit: 245.80, percentage: 0.49, operations: 3, cumulative: 50245.80, 
    intraday: [50000, 50120, 50085, 50180, 50145, 50245.80] },
  { day: "Martes", shortDay: "Mar", profit: 189.50, percentage: 0.38, operations: 2, cumulative: 50435.30,
    intraday: [50245.80, 50310, 50280, 50385, 50435.30] },
  { day: "Miercoles", shortDay: "Mie", profit: -45.20, percentage: -0.09, operations: 1, cumulative: 50390.10,
    intraday: [50435.30, 50480, 50420, 50350, 50390.10] },
  { day: "Jueves", shortDay: "Jue", profit: 312.40, percentage: 0.62, operations: 2, cumulative: 50702.50,
    intraday: [50390.10, 50450, 50410, 50520, 50580, 50650, 50702.50] },
  { day: "Viernes", shortDay: "Vie", profit: 156.90, percentage: 0.31, operations: 2, cumulative: 50859.40,
    intraday: [50702.50, 50780, 50740, 50820, 50859.40] },
  { day: "Sabado", shortDay: "Sab", profit: 0, percentage: 0, operations: 0, cumulative: 50859.40,
    intraday: [50859.40] },
  { day: "Domingo", shortDay: "Dom", profit: 0, percentage: 0, operations: 0, cumulative: 50859.40,
    intraday: [50859.40] },
]

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Historial", href: "/dashboard/history", icon: History, active: false },
  { label: "Configuracion", href: "/dashboard/settings", icon: Settings, active: false },
  { label: "Admin", href: "/admin", icon: Settings, active: false, isAdmin: true },
]

export default function DashboardClientePage() {
  const { status, pendingAmount, isLoaded, isDetected } = useServiceStatus()
  const tradingData = useRealTradingData()
  const isPending = status === "pending"
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  
  // Use real data from Supabase, fallback to demo data if loading or no data
  const weeklyDataToUse = tradingData.weeklyData.length > 0 ? tradingData.weeklyData : weeklyData

  const handlePaymentReported = async () => {
    setPaymentModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <Image
          src="/logo-transparent.png"
          alt="BELLYSWISS WARZONE"
          width={120}
          height={50}
          className="w-24 h-auto object-contain"
          priority
        />
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.70_0.12_85)] animate-status-pending" />
            </span>
          ) : (
            <span className="relative flex h-2.5 w-2.5">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.55_0.15_145)] animate-status-active" />
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[10px] font-bold text-foreground/80">UD</span>
          </div>
        </div>
      </header>

      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Image
            src="/logo-transparent.png"
            alt="BELLYSWISS WARZONE"
            width={180}
            height={80}
            className="w-36 h-auto object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.filter(item => !item.isAdmin).map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-[11px] font-medium uppercase tracking-[0.1em] transition-all duration-200 ${
                    item.active 
                      ? 'bg-sidebar-accent text-sidebar-foreground' 
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Admin Link - Discreto */}
            <li className="pt-4 mt-4 border-t border-sidebar-border/30">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2 rounded-md text-[9px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/30 hover:text-sidebar-foreground/50 hover:bg-sidebar-accent/30 transition-all duration-200"
              >
                <Settings className="w-3 h-3" />
                Admin
              </Link>
            </li>
          </ul>
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            {isPending ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.70_0.12_85)] animate-status-pending" />
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-[oklch(0.70_0.10_85)]">
                  En Espera
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.55_0.15_145)] animate-status-active" />
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-sidebar-foreground/60">
                  Sistema Activo
                </span>
              </>
            )}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64">
        {/* Header - Desktop only */}
        <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-8">
          <div>
            <h1 className="text-base font-semibold text-foreground">Dashboard Cliente</h1>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Resumen de tu cuenta de inversion
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Usuario Demo</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cuenta Premium</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-bold text-foreground/80">UD</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-5 sm:space-y-6 lg:space-y-8 overflow-auto">
          {/* Bot Connection Status - Shows real data from MT5 */}
          <BotConnectionStatus />

          {/* Aviso de Estado del Sistema */}
          {isLoaded && (
            isDetected ? (
              <div className="flex items-center gap-3 px-5 py-4 bg-[oklch(0.14_0.02_250)] border border-[oklch(0.24_0.06_250)] rounded-lg">
                <Clock className="w-4 h-4 text-[oklch(0.65_0.12_250)] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[oklch(0.75_0.08_250)]">
                    Pago detectado en blockchain
                  </p>
                  <p className="text-xs text-[oklch(0.60_0.06_250)]">
                    Tu pago USDT ha sido detectado y esta pendiente de confirmacion por el administrador.
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-3 px-5 py-4 bg-[oklch(0.14_0.02_85)] border border-[oklch(0.24_0.05_85)] rounded-lg">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.70_0.12_85)] animate-status-pending" />
                </span>
                <p className="text-sm font-medium text-[oklch(0.75_0.08_85)]">
                  El sistema entrara en pausa si el servicio no se regulariza.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 bg-[oklch(0.14_0.02_145)] border border-[oklch(0.24_0.05_145)] rounded-lg">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.58_0.14_145)] animate-status-active" />
                </span>
                <p className="text-sm font-medium text-[oklch(0.65_0.10_145)]">
                  Sistema Operando con Normalidad
                </p>
              </div>
            )
          )}

          {/* Metricas Principales */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 ${isPending ? 'opacity-90' : ''}`}>
            {/* Capital Inicial */}
            <div className={`bg-card border border-border/50 rounded-lg p-4 sm:p-5 lg:p-6 transition-all duration-300 ${isPending ? 'hover:border-border/50' : 'hover:border-border/80'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground">
                  Capital Inicial
                </span>
                <Wallet className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  ${tradingData.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  USD
                </p>
              </div>
            </div>

            {/* Equity */}
            <div className={`bg-card border border-border/50 rounded-lg p-4 sm:p-5 lg:p-6 transition-all duration-300 ${isPending ? 'hover:border-border/50' : 'hover:border-border/80'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground">
                  Equity
                </span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  ${tradingData.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  USD
                </p>
              </div>
            </div>

            {/* Profit Flotante */}
            <div className={`bg-card border border-border/50 rounded-lg p-4 sm:p-5 lg:p-6 transition-all duration-300 ${isPending ? 'hover:border-border/50' : 'hover:border-border/80'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground">
                  Profit Flotante
                </span>
                <Calendar className="w-4 h-4 text-success" />
              </div>
              <div className="space-y-1">
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${tradingData.profit >= 0 ? "text-[oklch(0.70_0.16_145)]" : "text-red-400"}`}>
                  {tradingData.profit >= 0 ? "+" : ""}${tradingData.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${tradingData.profit >= 0 ? "text-[oklch(0.62_0.14_145)]" : "text-red-400/80"}`}>
                  {tradingData.balance > 0 ? `${tradingData.profit >= 0 ? "+" : ""}${((tradingData.profit / tradingData.balance) * 100).toFixed(2)}%` : "0.00%"}
                </p>
              </div>
            </div>

            {/* Operaciones Semana */}
            <div className={`bg-card border border-border/50 rounded-lg p-4 sm:p-5 lg:p-6 transition-all duration-300 ${isPending ? 'hover:border-border/50' : 'hover:border-border/80'}`}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground">
                  Operaciones Semana
                </span>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  {tradingData.totalOperations}
                </p>
                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ultimos 7 dias
                </p>
              </div>
            </div>
          </div>

          {/* Coste del Servicio + Estado del Servicio + Bolsa de Beneficio */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {/* Coste del Servicio - 2 columnas */}
            <div className="lg:col-span-2 bg-card border border-border/50 rounded-lg p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground">
                  Coste del Servicio
                </h2>
                <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/40 px-2 sm:px-2.5 py-1 rounded">
                  Informativo
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4">
                <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-muted/30 rounded border border-border/40">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.1em] text-muted-foreground mb-1.5 sm:mb-2">
                    Ops. Cerradas
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">8</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-muted/30 rounded border border-border/40">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.1em] text-muted-foreground mb-1.5 sm:mb-2">
                    Coste/Op
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">$1.00</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 lg:p-4 bg-muted/30 rounded border border-border/40">
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] sm:tracking-[0.1em] text-muted-foreground mb-1.5 sm:mb-2">
                    Total
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">$8.00</p>
                </div>
              </div>

              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground text-center mb-4">
                Este panel es informativo. Los pagos se realizan externamente.
              </p>

              {/* Payment Button - Always visible, no conditions */}
              <Button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11 sm:h-12 text-xs sm:text-sm uppercase tracking-wider"
              >
                PAGAR SERVICIO
              </Button>
            </div>

            {/* Estado del Servicio - 1 columna, compacto */}
            <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
              <h2 className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground mb-3 sm:mb-4">
                Estado del Servicio
              </h2>

              <div className="space-y-3 mb-3 sm:mb-4">
                {/* Estado Actual - Dinamico */}
                {isPending ? (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-3 bg-[oklch(0.18_0.04_85)] rounded border border-[oklch(0.28_0.06_85)]">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.72_0.14_85)] animate-status-pending" />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] sm:text-sm font-semibold text-[oklch(0.78_0.10_85)] block">En Espera de Pago</span>
                      <p className="text-[11px] sm:text-xs font-medium text-[oklch(0.70_0.08_85)] mt-0.5">Pendiente: ${pendingAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 sm:py-3 bg-[oklch(0.18_0.04_145)] rounded border border-[oklch(0.28_0.06_145)]">
                    <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.60_0.16_145)] animate-status-active" />
                    </span>
                    <span className="text-[13px] sm:text-sm font-semibold text-[oklch(0.68_0.12_145)]">Sistema Activo</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground leading-relaxed">
                El sistema se mantiene activo mientras el servicio este al dia.
              </p>
            </div>

            {/* Bolsa de Beneficio */}
            <ProfitBag
              totalProfit={tradingData.weeklyProfit}
              maxProfit={Math.max(tradingData.weeklyProfit * 2, 1000)}
            />
          </div>

          {/* Bloque de Confianza Institucional */}
          <div className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 border rounded-lg ${
            isPending 
              ? 'bg-[oklch(0.12_0.01_85)] border-[oklch(0.22_0.04_85)]' 
              : 'bg-card/50 border-border/40'
          }`}>
            <span className="relative flex h-2.5 w-2.5 mt-0.5 sm:mt-1 flex-shrink-0">
              {isPending ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.70_0.12_85)] animate-status-pending" />
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.58_0.14_145)] animate-status-active" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.10em] sm:tracking-[0.12em] mb-1.5 sm:mb-2 ${
                isPending ? 'text-[oklch(0.72_0.08_85)]' : 'text-foreground/80'
              }`}>
                {isPending ? 'Operativa en Modo Lectura' : 'Operativa Institucional Activa'}
              </h3>
              <p className={`text-[12px] sm:text-sm font-medium leading-relaxed ${
                isPending ? 'text-[oklch(0.62_0.05_85)]' : 'text-muted-foreground'
              }`}>
                {isPending 
                  ? 'El sistema se encuentra en espera. Las nuevas ejecuciones estan temporalmente pausadas hasta regularizar el servicio.'
                  : 'El sistema ejecuta operaciones de forma automatica bajo parametros institucionales. El rendimiento y la continuidad dependen del estado del servicio.'
                }
              </p>
            </div>
          </div>

          {/* Rendimiento Semanal + Actividad en Tiempo Real */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {/* Rendimiento Semanal - 2 columnas */}
            <div className="lg:col-span-2">
              <WeeklyPerformance 
                data={weeklyDataToUse}
                weekRange="20 - 26 Enero, 2026"
                totalProfit={tradingData.weeklyProfit}
                totalPercentage={tradingData.weeklyPercentage}
              />
            </div>
            
            {/* Actividad en Tiempo Real - 1 columna */}
            <LiveActivityTimeline />
          </div>

          {/* Control de Operativa Diaria */}
          <DailyControlPanel />

          {/* Estado del Sistema */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-4 sm:px-6 bg-card/50 border border-border/40 rounded-lg">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isPending ? (
                <>
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.72_0.14_85)] animate-status-pending" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.10em] sm:tracking-[0.12em] text-[oklch(0.75_0.10_85)]">
                    En Espera de Pago
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[oklch(0.60_0.16_145)] animate-status-active" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.10em] sm:tracking-[0.12em] text-foreground/80">
                    Sistema Activo
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-left sm:text-right">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ultima actualizacion</p>
                <p className="text-[12px] sm:text-sm font-medium text-foreground/80">Hace 2 minutos</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Proxima operacion</p>
                <p className="text-[12px] sm:text-sm font-medium text-foreground/80">En espera</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
        <div className="flex items-center justify-around py-1.5 px-1 safe-area-pb">
          {navItems.filter(item => !item.isAdmin).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-md min-w-[56px] min-h-[48px] transition-all duration-200 ${
                item.active 
                  ? 'text-sidebar-foreground bg-sidebar-accent' 
                  : 'text-sidebar-foreground/50 active:bg-sidebar-accent/30'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-medium uppercase tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Payment Modal - Always available */}
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onPaymentReported={handlePaymentReported}
        pendingAmount={pendingAmount}
      />
    </div>
  )
}
