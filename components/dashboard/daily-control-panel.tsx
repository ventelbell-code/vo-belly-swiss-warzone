"use client"

import React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Settings, Target, Activity } from "lucide-react"

// Lot size options with profit per operation
const LOT_OPTIONS = [
  { value: 0.10, profit: 1 },
  { value: 0.15, profit: 1.5 },
  { value: 0.20, profit: 2 },
  { value: 0.25, profit: 2.5 },
  { value: 0.30, profit: 3 },
  { value: 0.40, profit: 4 },
  { value: 0.50, profit: 5 },
  { value: 0.75, profit: 7.5 },
  { value: 1.00, profit: 10 },
  { value: 1.50, profit: 15 },
  { value: 2.00, profit: 20 },
]

// Daily operations limit options
const OPERATIONS_OPTIONS = [5, 10, 15, 20, 30, 40, 50, 75, 100]

const STORAGE_KEY = "bellyswiss_daily_control"

interface DailyControlState {
  lotSize: number
  dailyLimit: number
  operationsToday: number
  lastResetDate: string
}

const defaultState: DailyControlState = {
  lotSize: 0.20,
  dailyLimit: 20,
  operationsToday: 12,
  lastResetDate: new Date().toISOString().split('T')[0],
}

// Circular Dial Component
function CircularDial({ 
  value, 
  options, 
  onChange, 
  label,
  formatValue,
  color = "145"
}: { 
  value: number
  options: number[]
  onChange: (value: number) => void
  label: string
  formatValue: (v: number) => string
  color?: string
}) {
  const dialRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)
  
  const currentIndex = options.findIndex(o => o === value)
  const totalOptions = options.length
  
  // Animate display value
  useEffect(() => {
    const duration = 200
    const startValue = displayValue
    const endValue = value
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (endValue - startValue) * eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return
    
    const rect = dialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX)
    const normalizedAngle = ((angle + Math.PI * 1.5) % (Math.PI * 2)) / (Math.PI * 2)
    
    const newIndex = Math.round(normalizedAngle * (totalOptions - 1))
    const clampedIndex = Math.max(0, Math.min(totalOptions - 1, newIndex))
    
    if (options[clampedIndex] !== value) {
      onChange(options[clampedIndex])
    }
  }, [options, totalOptions, value, onChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleInteraction(e.clientX, e.clientY)
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    const touch = e.touches[0]
    handleInteraction(touch.clientX, touch.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      handleInteraction(touch.clientX, touch.clientY)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, handleInteraction])

  // Calculate rotation for indicator
  const rotation = (currentIndex / (totalOptions - 1)) * 270 - 135

  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground/70 mb-2 sm:mb-3">
        {label}
      </span>
      
      {/* Dial Container - Larger on mobile for touch */}
      <div 
        ref={dialRef}
        className="relative w-28 h-28 sm:w-32 sm:h-32 cursor-pointer select-none touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-border/30" />
        
        {/* Track Background */}
        <svg className="absolute inset-0 w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="198"
            strokeDashoffset="66"
            className="text-muted/20"
          />
          {/* Active Track */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={`oklch(0.55 0.12 ${color})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="198"
            strokeDashoffset={198 - (currentIndex / (totalOptions - 1)) * 132}
            className="transition-all duration-200"
          />
        </svg>

        {/* Tick Marks - Hidden on small mobile for cleaner look */}
        <div className="hidden sm:block">
          {options.map((_, i) => {
            const tickRotation = (i / (totalOptions - 1)) * 270 - 135
            const isActive = i <= currentIndex
            return (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{ transform: `rotate(${tickRotation}deg)` }}
              >
                <div 
                  className={`absolute top-2 left-1/2 -translate-x-1/2 w-0.5 h-2 rounded-full transition-colors duration-200 ${
                    isActive ? `bg-[oklch(0.55_0.12_${color})]` : 'bg-muted/30'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Indicator Needle */}
        <div
          className="absolute w-full h-full transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div 
            className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-1.5 sm:w-1 h-3 sm:h-4 rounded-full"
            style={{ backgroundColor: `oklch(0.65 0.15 ${color})` }}
          />
        </div>

        {/* Center Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border border-border/50 flex flex-col items-center justify-center shadow-lg">
            <span 
              className="text-2xl sm:text-3xl font-bold tabular-nums transition-all duration-200"
              style={{ color: `oklch(0.80 0.12 ${color})` }}
            >
              {formatValue(displayValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Select Dots - Larger touch targets on mobile */}
      <div className="flex gap-1 sm:gap-1.5 mt-3 sm:mt-4">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-all duration-200 ${
              i === currentIndex 
                ? `scale-110 sm:scale-125`
                : 'bg-muted/30 hover:bg-muted/50 active:bg-muted/60'
            }`}
            style={i === currentIndex ? { backgroundColor: `oklch(0.55 0.12 ${color})` } : {}}
            title={formatValue(opt)}
          />
        ))}
      </div>
    </div>
  )
}

// Animated Counter
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value)
  
  useEffect(() => {
    const duration = 300
    const startValue = displayValue
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (value - startValue) * eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [value])

  return (
    <span className="tabular-nums">
      {prefix}{typeof displayValue === 'number' ? displayValue.toFixed(displayValue % 1 === 0 ? 0 : 2) : displayValue}{suffix}
    </span>
  )
}

export function DailyControlPanel() {
  const [state, setState] = useState<DailyControlState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const today = new Date().toISOString().split('T')[0]
        
        if (parsed.lastResetDate !== today) {
          parsed.operationsToday = 0
          parsed.lastResetDate = today
        }
        
        setState(parsed)
      } catch {
        setState(defaultState)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isLoaded])

  const setLotSize = useCallback((value: number) => {
    setState(prev => ({ ...prev, lotSize: value }))
  }, [])

  const setDailyLimit = useCallback((value: number) => {
    setState(prev => ({ ...prev, dailyLimit: value }))
  }, [])

  // Calculate derived values
  const selectedLot = LOT_OPTIONS.find(l => l.value === state.lotSize) || LOT_OPTIONS[2]
  const remainingOps = Math.max(0, state.dailyLimit - state.operationsToday)
  const isLimitReached = state.operationsToday >= state.dailyLimit
  const estimatedDailyProfit = selectedLot.profit * state.dailyLimit

  if (!isLoaded) {
    return (
      <div className="bg-card border border-border/50 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-muted/30 rounded w-1/3 mb-4" />
        <div className="h-40 bg-muted/20 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border/40 rounded-md overflow-hidden">
      {/* Header - Compact */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
            <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-foreground/80">
              Control de Operativa
            </h2>
          </div>
          {/* Status Indicator - Compact */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
            isLimitReached 
              ? 'bg-[oklch(0.15_0.03_85)]' 
              : 'bg-[oklch(0.15_0.03_145)]'
          }`}>
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                isLimitReached 
                  ? 'bg-[oklch(0.68_0.12_85)] animate-status-pending' 
                  : 'bg-[oklch(0.55_0.14_145)] animate-status-active'
              }`} />
            </span>
            <span className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider ${
              isLimitReached 
                ? 'text-[oklch(0.70_0.08_85)]' 
                : 'text-[oklch(0.60_0.10_145)]'
            }`}>
              {isLimitReached ? 'Pausa' : 'Activo'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Dial Controls - Compact */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Lot Size Dial */}
          <CircularDial
            value={state.lotSize}
            options={LOT_OPTIONS.map(l => l.value)}
            onChange={setLotSize}
            label="Lotaje"
            formatValue={(v) => v.toFixed(2)}
            color="145"
          />
          
          {/* Operations Dial */}
          <CircularDial
            value={state.dailyLimit}
            options={OPERATIONS_OPTIONS}
            onChange={setDailyLimit}
            label="Operaciones"
            formatValue={(v) => Math.round(v).toString()}
            color="220"
          />
        </div>

        {/* Dynamic Information - Compact grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/20">
          {/* Profit Per Op */}
          <div className="text-center p-2 bg-[oklch(0.12_0.02_145)] border border-[oklch(0.20_0.04_145)] rounded">
            <p className="text-[8px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-0.5">c/Op</p>
            <span className="text-sm font-bold text-[oklch(0.60_0.12_145)] tabular-nums">
              $<AnimatedCounter value={selectedLot.profit} />
            </span>
          </div>

          {/* Daily Goal */}
          <div className="text-center p-2 bg-[oklch(0.12_0.02_220)] border border-[oklch(0.20_0.04_220)] rounded">
            <p className="text-[8px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-0.5">Objetivo</p>
            <span className="text-sm font-bold text-[oklch(0.60_0.12_220)] tabular-nums">
              $<AnimatedCounter value={estimatedDailyProfit} />
            </span>
          </div>

          {/* Remaining */}
          <div className={`text-center p-2 rounded border ${
            isLimitReached 
              ? 'bg-[oklch(0.12_0.02_85)] border-[oklch(0.20_0.04_85)]' 
              : 'bg-muted/10 border-border/20'
          }`}>
            <p className="text-[8px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-0.5">Restantes</p>
            <span className={`text-sm font-bold tabular-nums ${
              isLimitReached 
                ? 'text-[oklch(0.68_0.10_85)]' 
                : 'text-foreground/80'
            }`}>
              {remainingOps}/{state.dailyLimit}
            </span>
          </div>
        </div>

        {/* Status Message - Only if limit reached */}
        {isLimitReached && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.12_0.02_85)] border border-[oklch(0.20_0.04_85)] rounded">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[oklch(0.68_0.10_85)] animate-status-pending" />
            </span>
            <p className="text-[10px] font-medium text-[oklch(0.68_0.06_85)]">
              Objetivo alcanzado - Pausa hasta manana
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
