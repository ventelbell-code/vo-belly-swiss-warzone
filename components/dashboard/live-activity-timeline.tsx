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
    <div className="bg-card border border-border/40 rounded-md p-3 sm:p-4 h-full flex flex-col">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.55_0.14_145)] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.55_0.14_145)]" />
          </span>
          <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/70">
            Actividad
          </h2>
        </div>
        <span className="text-[8px] sm:text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
          BOOM 1000
        </span>
      </div>

      {/* Timeline - Flex grow to fill space */}
      <div className="relative flex-1 overflow-hidden">
        {/* Linea vertical */}
        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border/20" />

        {/* Actividades - Compact list */}
        <div className="space-y-0.5">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`relative flex items-center gap-2 py-1.5 px-1 rounded transition-all duration-200 cursor-default ${
                activity.isNew 
                  ? 'bg-muted/15 animate-fade-in' 
                  : 'hover:bg-muted/10'
              }`}
              onMouseEnter={() => setHoveredId(activity.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Punto - Compact */}
              <div className="relative z-10 flex-shrink-0">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  {activity.isNew && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping ${
                      activity.profit > 0 ? 'bg-[oklch(0.50_0.12_145)]' : 'bg-[oklch(0.50_0.12_25)]'
                    }`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 transition-transform duration-200 ${
                    activity.profit >= 0 
                      ? 'bg-[oklch(0.50_0.12_145)]' 
                      : 'bg-[oklch(0.50_0.12_25)]'
                  } ${activity.isNew ? 'scale-125' : ''}`} />
                </span>
              </div>

              {/* Contenido - Compact */}
              <div className="flex-1 flex items-center justify-between min-w-0 gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className={`text-[11px] sm:text-xs font-bold tabular-nums ${
                    activity.profit >= 0 
                      ? 'text-[oklch(0.60_0.12_145)]' 
                      : 'text-[oklch(0.60_0.12_25)]'
                  }`}>
                    {activity.profit >= 0 ? '+' : ''}${activity.profit.toFixed(0)}
                  </span>
                  <span className={`text-[7px] sm:text-[8px] font-semibold uppercase tracking-wide px-1 py-0.5 rounded ${
                    activity.opType === 'Scalp' 
                      ? 'bg-[oklch(0.18_0.03_220)] text-[oklch(0.60_0.08_220)]'
                      : activity.opType === 'Expansion'
                        ? 'bg-[oklch(0.18_0.03_145)] text-[oklch(0.60_0.08_145)]'
                        : 'bg-[oklch(0.18_0.03_60)] text-[oklch(0.60_0.08_60)]'
                  }`}>
                    {activity.opType.slice(0, 3)}
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground/50 tabular-nums flex-shrink-0">
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

      {/* Footer - Minimal */}
      <div className="mt-2 pt-2 border-t border-border/20">
        <p className="text-[8px] sm:text-[9px] font-medium text-muted-foreground/50 text-center">
          Indices sinteticos
        </p>
      </div>
    </div>
  )
}
