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
        <div className="flex-1 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 space-y-3 sm:space-y-4 overflow-auto">
          {/* Bot Connection Status - Shows real data from MT5 */}
          <BotConnectionStatus />

          {/* Aviso de Estado del Sistema - Compacto */}
          {isLoaded && (
            isDetected ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.12_0.02_250)] border border-[oklch(0.22_0.04_250)] rounded-md">
                <Clock className="w-3.5 h-3.5 text-[oklch(0.60_0.10_250)] flex-shrink-0" />
                <p className="text-[10px] sm:text-[11px] font-medium text-[oklch(0.68_0.06_250)]">
                  Pago detectado - Pendiente confirmacion
                </p>
              </div>
            ) : isPending ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.12_0.02_85)] border border-[oklch(0.22_0.04_85)] rounded-md">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.68_0.10_85)] animate-status-pending" />
                </span>
                <p className="text-[10px] sm:text-[11px] font-medium text-[oklch(0.70_0.06_85)]">
                  Sistema en pausa hasta regularizar servicio
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.12_0.02_145)] border border-[oklch(0.22_0.04_145)] rounded-md">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.55_0.12_145)] animate-status-active" />
                </span>
                <p className="text-[10px] sm:text-[11px] font-medium text-[oklch(0.60_0.08_145)]">
                  Sistema operando normalmente
                </p>
              </div>
            )
          )}

          {/* Metricas Principales - Grid uniforme */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${isPending ? 'opacity-90' : ''}`}>
            {/* Capital Inicial */}
            <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Capital Inicial
                </span>
                <Wallet className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                ${tradingData.balance.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                USD
              </p>
            </div>

            {/* Equity */}
            <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Equity
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                ${tradingData.equity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                USD
              </p>
            </div>

            {/* Profit Flotante */}
            <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Profit Flotante
                </span>
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight ${tradingData.profit >= 0 ? "text-[oklch(0.65_0.14_145)]" : "text-red-400"}`}>
                {tradingData.profit >= 0 ? "+" : ""}${tradingData.profit.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${tradingData.profit >= 0 ? "text-[oklch(0.55_0.12_145)]" : "text-red-400/70"}`}>
                {tradingData.balance > 0 ? `${tradingData.profit >= 0 ? "+" : ""}${((tradingData.profit / tradingData.balance) * 100).toFixed(2)}%` : "0.00%"}
              </p>
            </div>

            {/* Operaciones Semana */}
            <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Ops. Semana
                </span>
                <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                {tradingData.totalOperations}
              </p>
              <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mt-0.5">
                7 dias
              </p>
            </div>
          </div>

          {/* Coste del Servicio + Estado del Servicio + Bolsa de Beneficio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Coste del Servicio */}
            <div className="sm:col-span-2 bg-card border border-border/40 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Coste del Servicio
                </h2>
                <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded">
                  Info
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 sm:p-2.5 bg-muted/20 rounded border border-border/30">
                  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
                    Ops.
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground">8</p>
                </div>
                <div className="text-center p-2 sm:p-2.5 bg-muted/20 rounded border border-border/30">
                  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
                    c/u
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground">$1</p>
                </div>
                <div className="text-center p-2 sm:p-2.5 bg-muted/20 rounded border border-border/30">
                  <p className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
                    Total
                  </p>
                  <p className="text-base sm:text-lg font-bold text-foreground">$8</p>
                </div>
              </div>

              <Button
                onClick={() => setPaymentModalOpen(true)}
                className="w-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold h-10 text-[11px] sm:text-xs uppercase tracking-wider"
              >
                PAGAR SERVICIO
              </Button>
            </div>

            {/* Estado del Servicio - Compacto y centrado */}
            <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4 flex flex-col">
              <h2 className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 sm:mb-3">
                Estado
              </h2>

              <div className="flex-1 flex items-center justify-center">
                {isPending ? (
                  <div className="text-center p-3 bg-[oklch(0.15_0.03_85)] rounded border border-[oklch(0.25_0.05_85)] w-full">
                    <span className="relative flex h-2 w-2 mx-auto mb-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.70_0.12_85)] animate-status-pending" />
                    </span>
                    <p className="text-[11px] sm:text-xs font-semibold text-[oklch(0.75_0.08_85)]">En Espera</p>
                    <p className="text-[9px] sm:text-[10px] font-medium text-[oklch(0.65_0.06_85)] mt-0.5">${pendingAmount.toFixed(2)}</p>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-[oklch(0.15_0.03_145)] rounded border border-[oklch(0.25_0.05_145)] w-full">
                    <span className="relative flex h-2 w-2 mx-auto mb-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.58_0.14_145)] animate-status-active" />
                    </span>
                    <p className="text-[11px] sm:text-xs font-semibold text-[oklch(0.65_0.10_145)]">Activo</p>
                    <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground/60 mt-0.5">Al dia</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bolsa de Beneficio */}
            <ProfitBag
              totalProfit={tradingData.weeklyProfit}
              maxProfit={Math.max(tradingData.weeklyProfit * 2, 1000)}
            />
          </div>

          {/* Bloque de Confianza Institucional - Compacto */}
          <div className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border rounded-md ${
            isPending 
              ? 'bg-[oklch(0.12_0.01_85)] border-[oklch(0.20_0.03_85)]' 
              : 'bg-card/40 border-border/30'
          }`}>
            <span className="relative flex h-2 w-2 flex-shrink-0">
              {isPending ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.68_0.10_85)] animate-status-pending" />
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.55_0.12_145)] animate-status-active" />
              )}
            </span>
            <p className={`text-[10px] sm:text-[11px] font-medium ${
              isPending ? 'text-[oklch(0.65_0.06_85)]' : 'text-muted-foreground/70'
            }`}>
              {isPending 
                ? 'Sistema en espera. Operaciones pausadas hasta regularizar el servicio.'
                : 'Sistema ejecutando operaciones automaticas bajo parametros institucionales.'
              }
            </p>
          </div>

          {/* Rendimiento Semanal + Actividad en Tiempo Real */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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

          {/* Estado del Sistema - Compacto */}
          <div className="flex items-center justify-between gap-3 py-2.5 px-3 sm:px-4 bg-card/30 border border-border/30 rounded-md">
            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.68_0.12_85)] animate-status-pending" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-[oklch(0.70_0.08_85)]">
                    En Espera
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.55_0.14_145)] animate-status-active" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/70">
                    Activo
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Actualizado</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-foreground/70">2 min</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">Proxima op.</p>
                <p className="text-[10px] sm:text-[11px] font-medium text-foreground/70">Espera</p>
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
