"use client"

import { useState, useEffect, useCallback } from "react"

// Tipos de operacion
type OperationType = "Scalp" | "Expansion" | "Rescate"

interface LiveActivity {
  id: number
  timestamp: Date
  asset: string
  profit: number
  opType: OperationType
  isNew: boolean
}

// Actividad simulada inicial
const initialActivities: LiveActivity[] = [
  { id: 1, timestamp: new Date(Date.now() - 180000), asset: "BOOM 1000", profit: 85.40, opType: "Scalp", isNew: false },
  { id: 2, timestamp: new Date(Date.now() - 420000), asset: "BOOM 1000", profit: 62.30, opType: "Expansion", isNew: false },
  { id: 3, timestamp: new Date(Date.now() - 720000), asset: "BOOM 1000", profit: -28.50, opType: "Rescate", isNew: false },
  { id: 4, timestamp: new Date(Date.now() - 1200000), asset: "BOOM 1000", profit: 156.90, opType: "Expansion", isNew: false },
  { id: 5, timestamp: new Date(Date.now() - 1800000), asset: "BOOM 1000", profit: 94.20, opType: "Scalp", isNew: false },
]

// Operaciones posibles para simulacion
const possibleOperations = [
  { profit: 45.20, opType: "Scalp" as OperationType },
  { profit: 78.60, opType: "Expansion" as OperationType },
  { profit: -32.10, opType: "Rescate" as OperationType },
  { profit: 124.50, opType: "Scalp" as OperationType },
  { profit: 67.80, opType: "Expansion" as OperationType },
  { profit: 89.30, opType: "Scalp" as OperationType },
  { profit: -18.40, opType: "Rescate" as OperationType },
  { profit: 156.20, opType: "Expansion" as OperationType },
]

export function LiveActivityTimeline() {
  const [activities, setActivities] = useState<LiveActivity[]>(initialActivities)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [nextId, setNextId] = useState(6)

  // Formatear tiempo relativo
  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return "Ahora"
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }, [])

  // Formatear hora exacta
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [])

  // Simular nueva operacion cada 15-30 segundos (solo para demo)
  useEffect(() => {
    const addNewActivity = () => {
      const randomOp = possibleOperations[Math.floor(Math.random() * possibleOperations.length)]
      
      const newActivity: LiveActivity = {
        id: nextId,
        timestamp: new Date(),
        asset: "BOOM 1000",
        profit: randomOp.profit,
        opType: randomOp.opType,
        isNew: true,
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 7)])
      setNextId(prev => prev + 1)

      // Quitar flag isNew despues de la animacion
      setTimeout(() => {
        setActivities(prev => 
          prev.map(a => a.id === newActivity.id ? { ...a, isNew: false } : a)
        )
      }, 2000)
    }

    const interval = setInterval(() => {
      addNewActivity()
    }, 20000 + Math.random() * 15000) // 20-35 segundos

    return () => clearInterval(interval)
  }, [nextId])

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.60_0.16_145)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[oklch(0.60_0.16_145)]" />
          </span>
          <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-foreground/80">
            Actividad en Vivo
          </h2>
        </div>
        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          BOOM 1000
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linea vertical */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/30" />

        {/* Actividades */}
        <div className="space-y-0.5 sm:space-y-1">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`relative flex items-center gap-2 sm:gap-3 py-2 sm:py-2 px-1.5 sm:px-2 rounded transition-all duration-300 cursor-default ${
                activity.isNew 
                  ? 'bg-muted/20 animate-fade-in' 
                  : 'hover:bg-muted/10'
              }`}
              onMouseEnter={() => setHoveredId(activity.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Punto con animacion */}
              <div className="relative z-10 flex-shrink-0">
                <span className="relative flex h-4 w-4 items-center justify-center">
                  {/* Pulse para operaciones nuevas positivas */}
                  {activity.isNew && activity.profit > 0 && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.15_145)] opacity-50 animate-ping" />
                  )}
                  {/* Pulse para operaciones nuevas negativas */}
                  {activity.isNew && activity.profit < 0 && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.15_25)] opacity-50 animate-ping" />
                  )}
                  {/* Punto principal */}
                  <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 transition-transform duration-300 ${
                    activity.profit >= 0 
                      ? 'bg-[oklch(0.55_0.15_145)]' 
                      : 'bg-[oklch(0.55_0.15_25)]'
                  } ${activity.isNew ? 'scale-125' : ''} ${hoveredId === activity.id ? 'scale-150' : ''}`} />
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className={`text-[13px] sm:text-sm font-bold tabular-nums ${
                    activity.profit >= 0 
                      ? 'text-[oklch(0.68_0.14_145)]' 
                      : 'text-[oklch(0.68_0.14_25)]'
                  }`}>
                    {activity.profit >= 0 ? '+' : ''}${activity.profit.toFixed(2)}
                  </span>
                  <span className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded ${
                    activity.opType === 'Scalp' 
                      ? 'bg-[oklch(0.20_0.04_220)] text-[oklch(0.70_0.10_220)]'
                      : activity.opType === 'Expansion'
                        ? 'bg-[oklch(0.20_0.04_145)] text-[oklch(0.70_0.10_145)]'
                        : 'bg-[oklch(0.20_0.04_60)] text-[oklch(0.70_0.10_60)]'
                  }`}>
                    {activity.opType}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground tabular-nums flex-shrink-0">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>

              {/* Tooltip - Posicionado hacia el centro del dashboard */}
              {hoveredId === activity.id && (
                <div 
                  className="fixed z-[100] pointer-events-none animate-tooltip-fade-in"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="px-5 py-4 rounded-lg shadow-2xl border border-[#1a2535] whitespace-nowrap"
                       style={{ backgroundColor: '#0B1220' }}>
                    <div className="text-[11px] space-y-2.5">
                      {/* Activo */}
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#6b7a8f] font-medium uppercase tracking-wider text-[9px]">Activo</span>
                        <span className="text-white font-semibold">{activity.asset}</span>
                      </div>
                      {/* Hora */}
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#6b7a8f] font-medium uppercase tracking-wider text-[9px]">Hora</span>
                        <span className="text-white font-semibold tabular-nums">{formatTime(activity.timestamp)}</span>
                      </div>
                      {/* Profit */}
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#6b7a8f] font-medium uppercase tracking-wider text-[9px]">Profit</span>
                        <span className={`font-bold text-[13px] ${
                          activity.profit >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'
                        }`}>
                          {activity.profit >= 0 ? '+' : ''}${activity.profit.toFixed(2)}
                        </span>
                      </div>
                      {/* Tipo */}
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-[#6b7a8f] font-medium uppercase tracking-wider text-[9px]">Tipo</span>
                        <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          activity.opType === 'Scalp' 
                            ? 'bg-[#1e3a5f] text-[#60a5fa]'
                            : activity.opType === 'Expansion'
                              ? 'bg-[#14532d] text-[#4ade80]'
                              : 'bg-[#422006] text-[#fbbf24]'
                        }`}>
                          {activity.opType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-border/30">
        <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground text-center">
          Opera en indices sinteticos
        </p>
      </div>
    </div>
  )
}
