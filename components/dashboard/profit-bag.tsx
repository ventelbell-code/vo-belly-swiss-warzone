"use client"

import { useState, useEffect, useCallback } from "react"

interface ProfitBagProps {
  totalProfit: number
  maxProfit?: number // For calculating fill level
  recentOperations?: Array<{
    id: string
    profit: number
    timestamp: number
  }>
}

interface FallingCoin {
  id: string
  amount: number
  startTime: number
}

export function ProfitBag({ 
  totalProfit, 
  maxProfit = 20000,
  recentOperations = []
}: ProfitBagProps) {
  const [fallingCoins, setFallingCoins] = useState<FallingCoin[]>([])
  const [displayedProfit, setDisplayedProfit] = useState(totalProfit)
  const [lastProcessedOp, setLastProcessedOp] = useState<string | null>(null)

  // Calculate fill percentage (0-100)
  const fillPercentage = Math.min((totalProfit / maxProfit) * 100, 100)
  
  // Animate profit counter
  useEffect(() => {
    if (displayedProfit === totalProfit) return
    
    const diff = totalProfit - displayedProfit
    const step = diff / 20
    const interval = setInterval(() => {
      setDisplayedProfit(prev => {
        const next = prev + step
        if ((step > 0 && next >= totalProfit) || (step < 0 && next <= totalProfit)) {
          clearInterval(interval)
          return totalProfit
        }
        return next
      })
    }, 30)
    
    return () => clearInterval(interval)
  }, [totalProfit, displayedProfit])

  // Process new positive operations
  useEffect(() => {
    if (recentOperations.length === 0) return
    
    const latestOp = recentOperations[recentOperations.length - 1]
    if (latestOp.id === lastProcessedOp) return
    if (latestOp.profit <= 0) {
      setLastProcessedOp(latestOp.id)
      return
    }
    
    // Add falling coin animation
    setFallingCoins(prev => [...prev, {
      id: latestOp.id,
      amount: latestOp.profit,
      startTime: Date.now()
    }])
    setLastProcessedOp(latestOp.id)
    
    // Remove coin after animation
    setTimeout(() => {
      setFallingCoins(prev => prev.filter(c => c.id !== latestOp.id))
    }, 1500)
  }, [recentOperations, lastProcessedOp])

  // Simulate a new operation (for demo)
  const simulateOperation = useCallback(() => {
    const profit = Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 20 : -Math.floor(Math.random() * 30) - 10
    const newOp = {
      id: `op-${Date.now()}`,
      profit,
      timestamp: Date.now()
    }
    
    if (profit > 0) {
      setFallingCoins(prev => [...prev, {
        id: newOp.id,
        amount: profit,
        startTime: Date.now()
      }])
      
      setTimeout(() => {
        setFallingCoins(prev => prev.filter(c => c.id !== newOp.id))
        setDisplayedProfit(prev => prev + profit)
      }, 1500)
    }
  }, [])

  return (
    <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-foreground/80">
          Bolsa de Beneficio
        </h2>
        <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Acumulado
        </span>
      </div>

      {/* Bag Container */}
      <div className="flex flex-col items-center">
        {/* Bag Visual */}
        <div 
          className="relative w-20 h-24 sm:w-24 sm:h-28 cursor-pointer group"
          onClick={simulateOperation}
          title="Click para simular operacion"
        >
          {/* Falling Coins */}
          {fallingCoins.map((coin) => (
            <div
              key={coin.id}
              className="absolute left-1/2 -translate-x-1/2 z-10 animate-coin-fall"
              style={{ top: -20 }}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[oklch(0.65_0.12_85)] text-[oklch(0.20_0.05_85)] text-[10px] font-bold shadow-lg">
                $
              </div>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-[oklch(0.65_0.12_145)] whitespace-nowrap animate-fade-up">
                +${coin.amount.toFixed(0)}
              </span>
            </div>
          ))}

          {/* Bag SVG */}
          <svg viewBox="0 0 100 120" className="w-full h-full">
            {/* Bag Shadow */}
            <ellipse 
              cx="50" 
              cy="115" 
              rx="35" 
              ry="4" 
              fill="rgba(0,0,0,0.2)"
            />
            
            {/* Bag Body - Outline */}
            <path
              d="M20 45 C15 50, 12 70, 15 90 C18 105, 35 110, 50 110 C65 110, 82 105, 85 90 C88 70, 85 50, 80 45 L70 40 L30 40 Z"
              fill="none"
              stroke="rgba(120, 140, 160, 0.3)"
              strokeWidth="1.5"
              className="transition-all duration-500"
            />
            
            {/* Bag Fill Level */}
            <defs>
              <clipPath id="bagClip">
                <path d="M20 45 C15 50, 12 70, 15 90 C18 105, 35 110, 50 110 C65 110, 82 105, 85 90 C88 70, 85 50, 80 45 L70 40 L30 40 Z" />
              </clipPath>
              <linearGradient id="fillGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgba(80, 180, 150, 0.4)" />
                <stop offset="100%" stopColor="rgba(80, 180, 150, 0.15)" />
              </linearGradient>
            </defs>
            
            {/* Fill Rectangle (animated height) */}
            <rect
              x="10"
              y={110 - (fillPercentage * 0.7)}
              width="80"
              height={fillPercentage * 0.7 + 5}
              fill="url(#fillGradient)"
              clipPath="url(#bagClip)"
              className="transition-all duration-700 ease-out"
            />
            
            {/* Bag Body - Main */}
            <path
              d="M20 45 C15 50, 12 70, 15 90 C18 105, 35 110, 50 110 C65 110, 82 105, 85 90 C88 70, 85 50, 80 45 L70 40 L30 40 Z"
              fill="rgba(30, 35, 45, 0.6)"
              stroke="rgba(80, 180, 150, 0.25)"
              strokeWidth="1"
              className="transition-all duration-300 group-hover:stroke-[rgba(80,180,150,0.4)]"
            />
            
            {/* Bag Neck/Opening */}
            <ellipse
              cx="50"
              cy="42"
              rx="22"
              ry="6"
              fill="rgba(25, 30, 40, 0.9)"
              stroke="rgba(80, 180, 150, 0.2)"
              strokeWidth="1"
            />
            
            {/* Bag Tie/Ribbon */}
            <path
              d="M38 32 Q42 38, 50 38 Q58 38, 62 32"
              fill="none"
              stroke="rgba(80, 180, 150, 0.35)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="30" r="3" fill="rgba(80, 180, 150, 0.4)" />
            
            {/* Dollar Sign in center */}
            <text
              x="50"
              y="78"
              textAnchor="middle"
              fill="rgba(80, 180, 150, 0.5)"
              fontSize="20"
              fontWeight="600"
              className="select-none"
            >
              $
            </text>
          </svg>

          {/* Fill Level Indicator */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-1 h-16 bg-border/30 rounded-full overflow-hidden">
              <div 
                className="w-full bg-[oklch(0.55_0.12_145)] rounded-full transition-all duration-700 ease-out"
                style={{ height: `${fillPercentage}%`, marginTop: `${100 - fillPercentage}%` }}
              />
            </div>
            <span className="text-[7px] text-muted-foreground/40 mt-1">
              {Math.round(fillPercentage)}%
            </span>
          </div>
        </div>

        {/* Total Display */}
        <div className="text-center mt-3 sm:mt-4">
          <p className="text-xl sm:text-2xl font-bold text-[oklch(0.70_0.14_145)] tabular-nums">
            ${displayedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
            Beneficio Acumulado
          </p>
        </div>
      </div>
    </div>
  )
}
