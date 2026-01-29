"use client"

import { useState, useMemo } from "react"
import { Calendar, TrendingUp, Activity, Target } from "lucide-react"

// Activo operado - Solo indices sinteticos
const OPERATED_ASSET = {
  name: "BOOM 1000",
  type: "Indice Sintetico"
}

// Tipos de operacion
type OperationType = "Scalp" | "Expansion" | "Rescate"

// Datos de ejemplo de operaciones cerradas (solo BOOM 1000 Index)
const tradeHistory = [
  { id: 1, date: "2026-01-27T14:32:00", profit: 85.40, percentage: 0.17, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
  { id: 2, date: "2026-01-27T11:15:00", profit: 62.30, percentage: 0.12, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
  { id: 3, date: "2026-01-27T09:45:00", profit: -28.50, percentage: -0.06, asset: OPERATED_ASSET, opType: "Rescate" as OperationType },
  { id: 4, date: "2026-01-26T16:20:00", profit: 156.90, percentage: 0.31, asset: OPERATED_ASSET, opType: "Expansion" as OperationType },
  { id: 5, date: "2026-01-26T13:10:00", profit: 94.20, percentage: 0.19, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
  { id: 6, date: "2026-01-26T10:05:00", profit: -42.30, percentage: -0.08, asset: OPERATED_ASSET, opType: "Rescate" as OperationType },
  { id: 7, date: "2026-01-25T15:45:00", profit: 178.60, percentage: 0.36, asset: OPERATED_ASSET, opType: "Expansion" as OperationType },
  { id: 8, date: "2026-01-25T12:30:00", profit: 67.80, percentage: 0.14, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
  { id: 9, date: "2026-01-24T14:20:00", profit: 312.40, percentage: 0.62, asset: OPERATED_ASSET, opType: "Expansion" as OperationType },
  { id: 10, date: "2026-01-24T11:00:00", profit: -65.20, percentage: -0.13, asset: OPERATED_ASSET, opType: "Rescate" as OperationType },
  { id: 11, date: "2026-01-23T16:40:00", profit: 189.50, percentage: 0.38, asset: OPERATED_ASSET, opType: "Expansion" as OperationType },
  { id: 12, date: "2026-01-23T13:25:00", profit: 56.30, percentage: 0.11, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
  { id: 13, date: "2026-01-22T15:15:00", profit: 245.80, percentage: 0.49, asset: OPERATED_ASSET, opType: "Expansion" as OperationType },
  { id: 14, date: "2026-01-22T10:50:00", profit: -35.60, percentage: -0.07, asset: OPERATED_ASSET, opType: "Rescate" as OperationType },
  { id: 15, date: "2026-01-21T14:30:00", profit: 128.90, percentage: 0.26, asset: OPERATED_ASSET, opType: "Scalp" as OperationType },
]

type FilterPeriod = "today" | "7days" | "30days"

export function HistoryAudit() {
  const [filter, setFilter] = useState<FilterPeriod>("7days")
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null)

  // Filtrar operaciones segun el periodo
  const filteredTrades = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return tradeHistory.filter(trade => {
      const tradeDate = new Date(trade.date)
      
      switch (filter) {
        case "today":
          return tradeDate >= todayStart
        case "7days":
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return tradeDate >= sevenDaysAgo
        case "30days":
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return tradeDate >= thirtyDaysAgo
        default:
          return true
      }
    })
  }, [filter])

  // Calcular metricas de auditoria
  const auditMetrics = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const totalProfit = tradeHistory.reduce((sum, t) => sum + t.profit, 0)
    const todayTrades = tradeHistory.filter(t => new Date(t.date) >= todayStart)
    const todayProfit = todayTrades.reduce((sum, t) => sum + t.profit, 0)
    const totalOperations = tradeHistory.length
    const winningTrades = tradeHistory.filter(t => t.profit > 0).length
    const winRate = totalOperations > 0 ? (winningTrades / totalOperations) * 100 : 0

    return {
      totalProfit,
      todayProfit,
      totalOperations,
      winRate,
      todayOperations: todayTrades.length
    }
  }, [])

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    }
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear solo hora para tooltip
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Auditoria de Rendimiento */}
      <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted-foreground/80">
            Auditoria de Rendimiento
          </h2>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-muted-foreground/50 bg-muted/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            Solo Lectura
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-5">
          {/* Profit Total Historico */}
          <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Profit Total
              </span>
            </div>
            <p className={`text-base sm:text-xl font-semibold ${auditMetrics.totalProfit >= 0 ? 'text-[oklch(0.65_0.12_145)]' : 'text-[oklch(0.65_0.12_25)]'}`}>
              {auditMetrics.totalProfit >= 0 ? '+' : ''}${auditMetrics.totalProfit.toFixed(2)}
            </p>
          </div>

          {/* Profit del Dia */}
          <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Profit Hoy
              </span>
            </div>
            <p className={`text-base sm:text-xl font-semibold ${auditMetrics.todayProfit >= 0 ? 'text-[oklch(0.65_0.12_145)]' : 'text-[oklch(0.65_0.12_25)]'}`}>
              {auditMetrics.todayProfit >= 0 ? '+' : ''}${auditMetrics.todayProfit.toFixed(2)}
            </p>
          </div>

          {/* Total Operaciones */}
          <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Operaciones
              </span>
            </div>
            <p className="text-base sm:text-xl font-semibold text-foreground">
              {auditMetrics.totalOperations}
            </p>
          </div>

          {/* Win Rate */}
          <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/30">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Win Rate
              </span>
            </div>
            <p className="text-base sm:text-xl font-semibold text-foreground">
              {auditMetrics.winRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="border-t border-border/20 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 text-center">
            Datos calculados a partir de operaciones reales cerradas.
          </p>
          <p className="text-[8px] sm:text-[9px] text-muted-foreground/40 text-center">
            Opera exclusivamente en indices sinteticos.
          </p>
        </div>
      </div>

      {/* Historial de Operaciones */}
      <div className="bg-card border border-border/50 rounded-lg">
        <div className="p-4 sm:p-6 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-muted-foreground/80">
              Historial de Operaciones
            </h2>
            
            {/* Filtros rapidos */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {[
                { key: "today" as FilterPeriod, label: "Hoy" },
                { key: "7days" as FilterPeriod, label: "7d" },
                { key: "30days" as FilterPeriod, label: "30d" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-1.5 text-[9px] sm:text-[9px] font-medium uppercase tracking-wider rounded transition-all duration-200 ${
                    filter === f.key
                      ? 'bg-muted/50 text-foreground'
                      : 'text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-muted/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-border/20">
          {filteredTrades.length === 0 ? (
            <div className="px-4 py-6 text-center text-[11px] text-muted-foreground/50">
              No hay operaciones en este periodo.
            </div>
          ) : (
            filteredTrades.map((trade) => (
              <div 
                key={trade.id} 
                className={`px-4 py-3 ${
                  trade.profit >= 0 
                    ? 'active:bg-[oklch(0.15_0.02_145)]' 
                    : 'active:bg-[oklch(0.15_0.02_25)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      trade.profit >= 0 ? 'bg-[oklch(0.55_0.12_145)]' : 'bg-[oklch(0.55_0.12_25)]'
                    }`} />
                    <span className={`text-[14px] font-semibold tabular-nums ${
                      trade.profit >= 0 ? 'text-[oklch(0.60_0.10_145)]' : 'text-[oklch(0.60_0.10_25)]'
                    }`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </span>
                    <span className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      trade.opType === 'Scalp' 
                        ? 'bg-[oklch(0.18_0.03_220)] text-[oklch(0.65_0.08_220)]'
                        : trade.opType === 'Expansion'
                          ? 'bg-[oklch(0.18_0.03_145)] text-[oklch(0.65_0.08_145)]'
                          : 'bg-[oklch(0.18_0.03_60)] text-[oklch(0.65_0.08_60)]'
                    }`}>
                      {trade.opType}
                    </span>
                  </div>
                  <span className={`text-[11px] tabular-nums ${
                    trade.percentage >= 0 ? 'text-[oklch(0.55_0.08_145)]' : 'text-[oklch(0.55_0.08_25)]'
                  }`}>
                    {trade.percentage >= 0 ? '+' : ''}{trade.percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatDate(trade.date)}
                  </span>
                  <span className="text-[9px] text-muted-foreground/50">
                    {trade.asset.name}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-4 sm:px-6 py-3 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Fecha / Hora
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Activo
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Tipo
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Profit / Loss
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[11px] text-muted-foreground/50">
                    No hay operaciones en este periodo.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr 
                    key={trade.id} 
                    className={`border-b border-border/10 transition-colors cursor-default relative ${
                      trade.profit >= 0 
                        ? 'hover:bg-[oklch(0.15_0.02_145)]' 
                        : 'hover:bg-[oklch(0.15_0.02_25)]'
                    }`}
                    onMouseEnter={() => setHoveredTrade(trade.id)}
                    onMouseLeave={() => setHoveredTrade(null)}
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] text-muted-foreground/70 relative">
                      {formatDate(trade.date)}
                      {/* Tooltip */}
                      {hoveredTrade === trade.id && (
                        <div className="absolute left-6 bottom-full mb-2 z-50 pointer-events-none">
                          <div className={`px-3 py-2 rounded-md shadow-lg border ${
                            trade.profit >= 0 
                              ? 'bg-[oklch(0.12_0.02_145)] border-[oklch(0.25_0.04_145)]' 
                              : 'bg-[oklch(0.12_0.02_25)] border-[oklch(0.25_0.04_25)]'
                          }`}>
                            <div className="text-[9px] space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground/60">Hora:</span>
                                <span className="text-foreground/80 font-medium">{formatTime(trade.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground/60">Profit:</span>
                                <span className={`font-semibold ${
                                  trade.profit >= 0 ? 'text-[oklch(0.65_0.12_145)]' : 'text-[oklch(0.65_0.12_25)]'
                                }`}>
                                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground/60">Tipo:</span>
                                <span className="text-foreground/80 font-medium">{trade.opType}</span>
                              </div>
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className={`absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent ${
                            trade.profit >= 0 
                              ? 'border-t-[6px] border-t-[oklch(0.12_0.02_145)]' 
                              : 'border-t-[6px] border-t-[oklch(0.12_0.02_25)]'
                          }`} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium text-foreground/80">
                          {trade.asset.name}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground/40">
                          {trade.asset.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-medium uppercase tracking-wider ${
                        trade.opType === 'Scalp' 
                          ? 'bg-[oklch(0.18_0.03_220)] text-[oklch(0.65_0.08_220)]'
                          : trade.opType === 'Expansion'
                            ? 'bg-[oklch(0.18_0.03_145)] text-[oklch(0.65_0.08_145)]'
                            : 'bg-[oklch(0.18_0.03_60)] text-[oklch(0.65_0.08_60)]'
                      }`}>
                        {trade.opType}
                      </span>
                    </td>
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 text-right text-[12px] font-semibold tabular-nums ${
                      trade.profit >= 0 ? 'text-[oklch(0.60_0.10_145)]' : 'text-[oklch(0.60_0.10_25)]'
                    }`}>
                      {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                    </td>
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 text-right text-[11px] tabular-nums ${
                      trade.percentage >= 0 ? 'text-[oklch(0.55_0.08_145)]' : 'text-[oklch(0.55_0.08_25)]'
                    }`}>
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          trade.profit >= 0 ? 'bg-[oklch(0.55_0.12_145)]' : 'bg-[oklch(0.55_0.12_25)]'
                        }`} />
                        {trade.percentage >= 0 ? '+' : ''}{trade.percentage.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con resumen */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/20 bg-muted/10">
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground/50">
            <span>
              {filteredTrades.length} operacion{filteredTrades.length !== 1 ? 'es' : ''}
            </span>
            <span>
              {filter === 'today' ? 'Hoy' : filter === '7days' ? '7 dias' : '30 dias'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
