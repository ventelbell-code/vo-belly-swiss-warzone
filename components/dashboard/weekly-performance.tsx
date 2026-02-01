"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"

// MetaTrader Blue Color - Classic MT4/MT5 blue
const MT_BLUE = "oklch(0.58 0.18 250)" // MetaTrader classic blue
const MT_BLUE_LIGHT = "oklch(0.65 0.16 250)"
const MT_BLUE_DARK = "oklch(0.48 0.15 250)"
const MT_BLUE_RGB = "65, 105, 225" // For rgba usage

interface DayData {
  day: string
  shortDay: string
  profit: number
  percentage: number
  operations: number
  cumulative: number
  intraday?: number[]
}

interface WeeklyPerformanceProps {
  data: DayData[]
  weekRange: string
  totalProfit: number
  totalPercentage: number
}

const timeRanges = ["1D", "1W", "1M", "6M", "1Y", "ALL"] as const

export function WeeklyPerformance({ data, weekRange, totalProfit, totalPercentage }: WeeklyPerformanceProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [selectedRange, setSelectedRange] = useState<typeof timeRanges[number]>("1W")
  const [animationProgress, setAnimationProgress] = useState(0)
  const [pulseOpacity, setPulseOpacity] = useState(0.5)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animate chart on load
  useEffect(() => {
    let start: number | null = null
    const duration = 1200
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimationProgress(eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [selectedRange])

  // Pulse animation for the final point (real-time indicator)
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseOpacity(prev => {
        const next = prev + 0.05
        return next > 1 ? 0.3 : next
      })
    }, 50)
    
    return () => clearInterval(pulseInterval)
  }, [])

  // Draw equity curve
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Build all equity points from intraday data for realistic curve
    const allEquityPoints: number[] = []
    data.forEach(d => {
      if (d.intraday && d.intraday.length > 0) {
        // Skip first point if it duplicates last point (except for first day)
        const startIdx = allEquityPoints.length > 0 && d.intraday[0] === allEquityPoints[allEquityPoints.length - 1] ? 1 : 0
        allEquityPoints.push(...d.intraday.slice(startIdx))
      } else {
        allEquityPoints.push(d.cumulative)
      }
    })
    
    const minValue = Math.min(...allEquityPoints) * 0.9985
    const maxValue = Math.max(...allEquityPoints) * 1.0015
    const valueRange = maxValue - minValue

    // Draw subtle grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Draw Y-axis labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.font = "9px system-ui"
    ctx.textAlign = "right"
    
    for (let i = 0; i <= 4; i++) {
      const value = maxValue - (valueRange / 4) * i
      const y = padding.top + (chartHeight / 4) * i
      ctx.fillText(`$${(value / 1000).toFixed(2)}k`, padding.left - 8, y + 3)
    }

    // Draw X-axis labels (days)
    ctx.textAlign = "center"
    data.forEach((d, i) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * i
      ctx.fillText(d.shortDay, x, height - 10)
    })

    // Calculate all chart points from intraday data
    const chartPoints = allEquityPoints.map((value, i) => ({
      x: padding.left + (chartWidth / (allEquityPoints.length - 1)) * i,
      y: padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight,
      value
    }))
    
    // Map day indices to chart point indices for hover interaction
    const dayPointIndices: number[] = []
    let pointIdx = 0
    data.forEach((d, dayIdx) => {
      dayPointIndices[dayIdx] = pointIdx
      if (d.intraday) {
        pointIdx += d.intraday.length - (dayIdx > 0 ? 1 : 0)
      } else {
        pointIdx += 1
      }
    })
    
    // Calculate day end points aligned with their actual position on the curve
    // Each day's point should be at the last intraday point position
    let cumulativePointIndex = 0
    const dayEndPoints = data.map((d, i) => {
      // Calculate how many points this day contributed
      const dayPoints = d.intraday ? d.intraday.length : 1
      const skipFirst = i > 0 && d.intraday && d.intraday[0] === data[i-1].cumulative ? 1 : 0
      cumulativePointIndex += dayPoints - skipFirst
      
      // Position X at the last point of this day in the chartPoints array
      const pointIndex = Math.min(cumulativePointIndex - 1, chartPoints.length - 1)
      const chartPoint = chartPoints[pointIndex]
      
      return {
        x: chartPoint?.x ?? padding.left + (chartWidth / (data.length - 1)) * i,
        y: chartPoint?.y ?? (padding.top + chartHeight - ((d.cumulative - minValue) / valueRange) * chartHeight),
        data: d,
        isLast: i === data.length - 1
      }
    })

    // Limit chart points to animation progress
    const animatedChartPoints = chartPoints.slice(0, Math.ceil(chartPoints.length * animationProgress))
    
    if (animatedChartPoints.length < 2) return

    // Draw area fill with gradient - MetaTrader Blue
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, `rgba(${MT_BLUE_RGB}, 0.15)`)
    gradient.addColorStop(1, `rgba(${MT_BLUE_RGB}, 0)`)
    
    ctx.beginPath()
    ctx.moveTo(animatedChartPoints[0].x, height - padding.bottom)
    animatedChartPoints.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.lineTo(animatedChartPoints[animatedChartPoints.length - 1].x, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line with straight segments (realistic trading curve)
    ctx.beginPath()
    ctx.moveTo(animatedChartPoints[0].x, animatedChartPoints[0].y)
    
    // Straight line segments between points to show real volatility
    for (let i = 1; i < animatedChartPoints.length; i++) {
      ctx.lineTo(animatedChartPoints[i].x, animatedChartPoints[i].y)
    }
    
    ctx.strokeStyle = `rgba(${MT_BLUE_RGB}, 0.9)`
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Draw day end markers (dots aligned with actual curve position)
    dayEndPoints.forEach((p, i) => {
      const isHovered = hoveredDay === i
      const isLastPoint = i === data.length - 1 || (i < data.length - 1 && data.slice(i + 1).every(d => d.profit === 0))
      const radius = isHovered ? 5 : isLastPoint ? 4 : 3
      
      // Glow effect for hovered point - MetaTrader Blue
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${MT_BLUE_RGB}, 0.3)`
        ctx.fill()
      }
      
      // Pulsing glow for the last active point (real-time indicator)
      if (isLastPoint && !isHovered) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 8 + pulseOpacity * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${MT_BLUE_RGB}, ${pulseOpacity * 0.35})`
        ctx.fill()
      }
      
      // Main dot - MetaTrader Blue
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered 
        ? `rgba(${MT_BLUE_RGB}, 1)` 
        : isLastPoint 
          ? `rgba(${MT_BLUE_RGB}, ${0.7 + pulseOpacity * 0.3})` 
          : `rgba(${MT_BLUE_RGB}, 0.6)`
      ctx.fill()
      
      // Inner highlight
      ctx.beginPath()
      ctx.arc(p.x, p.y, radius - 1, 0, Math.PI * 2)
      ctx.fillStyle = isHovered 
        ? "rgba(100, 140, 255, 1)" 
        : isLastPoint 
          ? "rgba(85, 125, 240, 0.9)" 
          : "rgba(70, 110, 220, 0.7)"
      ctx.fill()
    })

    // Draw tooltip for hovered day
    if (hoveredDay !== null && dayEndPoints[hoveredDay]) {
      const p = dayEndPoints[hoveredDay]
      const d = p.data
      
      const tooltipWidth = 135
      const tooltipHeight = 72
      let tooltipX = p.x - tooltipWidth / 2
      let tooltipY = p.y - tooltipHeight - 18
      
      // Keep tooltip in bounds horizontally
      if (tooltipX < padding.left) tooltipX = padding.left
      if (tooltipX + tooltipWidth > width - padding.right) tooltipX = width - padding.right - tooltipWidth
      
      // If tooltip would go above canvas, position it below the point
      if (tooltipY < 5) {
        tooltipY = p.y + 18
      }
      
      // Tooltip shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      const radius2 = 6
      ctx.beginPath()
      ctx.roundRect(tooltipX + 2, tooltipY + 2, tooltipWidth, tooltipHeight, radius2)
      ctx.fill()
      
      // Tooltip background - MetaTrader Blue accent
      ctx.fillStyle = "rgba(15, 20, 30, 0.97)"
      ctx.strokeStyle = `rgba(${MT_BLUE_RGB}, 0.5)`
      ctx.lineWidth = 1
      
      ctx.beginPath()
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, radius2)
      ctx.fill()
      ctx.stroke()
      
      // Tooltip text - Day label
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
      ctx.font = "600 9px system-ui"
      ctx.textAlign = "left"
      ctx.fillText(d.day.toUpperCase(), tooltipX + 12, tooltipY + 18)
      
      // Profit value (larger) - MetaTrader Blue for profit
      ctx.fillStyle = d.profit >= 0 ? `rgba(${MT_BLUE_RGB}, 1)` : "rgba(220, 110, 110, 1)"
      ctx.font = "bold 15px system-ui"
      ctx.fillText(`${d.profit >= 0 ? '+' : ''}$${d.profit.toFixed(2)}`, tooltipX + 12, tooltipY + 40)
      
      // Operations and percentage
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "10px system-ui"
      ctx.fillText(`${d.operations} operaciones`, tooltipX + 12, tooltipY + 58)
      
      // Percentage on the right - MetaTrader Blue
      ctx.textAlign = "right"
      ctx.fillStyle = d.percentage >= 0 ? `rgba(${MT_BLUE_RGB}, 0.85)` : "rgba(200, 100, 100, 0.8)"
      ctx.fillText(`${d.percentage >= 0 ? '+' : ''}${d.percentage.toFixed(2)}%`, tooltipX + tooltipWidth - 12, tooltipY + 58)
      
      // Draw pointer/arrow to point
      ctx.beginPath()
      if (tooltipY < p.y) {
        // Arrow pointing down
        ctx.moveTo(p.x - 6, tooltipY + tooltipHeight)
        ctx.lineTo(p.x, tooltipY + tooltipHeight + 6)
        ctx.lineTo(p.x + 6, tooltipY + tooltipHeight)
      } else {
        // Arrow pointing up
        ctx.moveTo(p.x - 6, tooltipY)
        ctx.lineTo(p.x, tooltipY - 6)
        ctx.lineTo(p.x + 6, tooltipY)
      }
      ctx.closePath()
      ctx.fillStyle = "rgba(15, 20, 30, 0.97)"
      ctx.fill()
    }
  }, [data, hoveredDay, animationProgress, pulseOpacity])

  // Store day end point positions for hit detection
  const dayPointPositionsRef = useRef<Array<{x: number, y: number}>>([])

  // Calculate day end point positions (mirroring the chart drawing logic)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Build all equity points
    const allEquityPoints: number[] = []
    data.forEach(d => {
      if (d.intraday && d.intraday.length > 0) {
        const startIdx = allEquityPoints.length > 0 && d.intraday[0] === allEquityPoints[allEquityPoints.length - 1] ? 1 : 0
        allEquityPoints.push(...d.intraday.slice(startIdx))
      } else {
        allEquityPoints.push(d.cumulative)
      }
    })
    
    const minValue = Math.min(...allEquityPoints) * 0.9985
    const maxValue = Math.max(...allEquityPoints) * 1.0015
    const valueRange = maxValue - minValue

    // Calculate chart points
    const chartPoints = allEquityPoints.map((value, i) => ({
      x: padding.left + (chartWidth / (allEquityPoints.length - 1)) * i,
      y: padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight,
    }))

    // Calculate day end positions
    let cumulativePointIndex = 0
    const positions = data.map((d, i) => {
      const dayPoints = d.intraday ? d.intraday.length : 1
      const skipFirst = i > 0 && d.intraday && d.intraday[0] === data[i-1].cumulative ? 1 : 0
      cumulativePointIndex += dayPoints - skipFirst
      const pointIndex = Math.min(cumulativePointIndex - 1, chartPoints.length - 1)
      const chartPoint = chartPoints[pointIndex]
      
      return {
        x: chartPoint?.x ?? padding.left + (chartWidth / (data.length - 1)) * i,
        y: chartPoint?.y ?? (padding.top + chartHeight - ((d.cumulative - minValue) / valueRange) * chartHeight),
      }
    })
    
    dayPointPositionsRef.current = positions
  }, [data])

  // Handle mouse move on canvas - proximity-based detection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const hitRadius = 18 // Radius for proximity detection
    let closestDayIndex: number | null = null
    let closestDistance = Infinity
    
    // Check distance to each day point
    dayPointPositionsRef.current.forEach((pos, index) => {
      const dx = mouseX - pos.x
      const dy = mouseY - pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < hitRadius && distance < closestDistance) {
        closestDistance = distance
        closestDayIndex = index
      }
    })
    
    setHoveredDay(closestDayIndex)
  }

  return (
    <div className="bg-card border border-border/40 rounded-md overflow-hidden">
      {/* Header - Compact */}
      <div className="p-3 sm:p-4 border-b border-border/20">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-foreground/80">
              Rendimiento Semanal
            </h2>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 mt-0.5">
              {weekRange}
            </p>
          </div>
          <div className="text-right">
            <p 
              className="text-lg sm:text-xl font-bold"
              style={{ color: totalProfit >= 0 ? 'rgb(65, 105, 225)' : 'rgb(220, 110, 110)' }}
            >
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </p>
            <p 
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider"
              style={{ color: totalPercentage >= 0 ? 'rgba(65, 105, 225, 0.7)' : 'rgba(200, 100, 100, 0.7)' }}
            >
              {totalPercentage >= 0 ? '+' : ''}{totalPercentage.toFixed(2)}% semana
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Daily Profit Grid - Square boxes, symmetric, MetaTrader Blue */}
        <div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {data.map((item, index) => {
              const isHovered = hoveredDay === index
              const hasProfit = item.profit !== 0
              
              return (
                <div 
                  key={item.day}
                  className={`relative aspect-square flex flex-col items-center justify-center p-1.5 sm:p-2 rounded border transition-all duration-200 cursor-pointer ${
                    isHovered 
                      ? 'border-[oklch(0.50_0.15_250)] bg-[oklch(0.14_0.03_250)]' 
                      : 'border-border/30 bg-card/40 hover:border-border/50 hover:bg-card/60'
                  }`}
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Day label - centered */}
                  <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-0.5 sm:mb-1">
                    {item.shortDay}
                  </span>
                  
                  {/* Profit value - MetaTrader Blue */}
                  <p className={`text-[10px] sm:text-sm font-bold tabular-nums leading-none ${
                    !hasProfit 
                      ? 'text-muted-foreground/30' 
                      : item.profit > 0 
                        ? `text-[${MT_BLUE}]` 
                        : 'text-red-400'
                  }`}
                  style={hasProfit && item.profit > 0 ? { color: 'rgb(65, 105, 225)' } : undefined}
                  >
                    {!hasProfit ? '—' : `${item.profit > 0 ? '+' : ''}${Math.abs(item.profit).toFixed(0)}`}
                  </p>
                  
                  {/* Percentage - small, below profit */}
                  {hasProfit && (
                    <p className={`text-[7px] sm:text-[8px] font-semibold tabular-nums mt-0.5 ${
                      item.percentage > 0 
                        ? 'text-[rgb(65,105,225)]/70' 
                        : 'text-red-400/70'
                    }`}
                    style={item.percentage > 0 ? { color: 'rgba(65, 105, 225, 0.7)' } : undefined}
                    >
                      {item.percentage > 0 ? '+' : ''}{item.percentage.toFixed(1)}%
                    </p>
                  )}
                  
                  {/* Status dot - top right corner */}
                  <div className={`absolute top-1 right-1 w-1 h-1 rounded-full ${
                    !hasProfit 
                      ? 'bg-muted-foreground/15' 
                      : item.profit > 0 
                        ? 'bg-[rgb(65,105,225)]' 
                        : 'bg-red-400'
                  }`} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Equity Curve Chart */}
        <div>
          {/* Time range selector - MetaTrader Blue accents */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.10em] sm:tracking-[0.12em] text-foreground/70">
              Curva de Rendimiento
            </span>
            <div className="flex gap-0.5 sm:gap-1">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range)
                    setAnimationProgress(0)
                  }}
                  className={`px-1.5 sm:px-2 py-1 text-[8px] sm:text-[9px] font-medium uppercase tracking-wider rounded transition-all duration-200 ${
                    selectedRange === range
                      ? 'bg-[rgba(65,105,225,0.15)] text-[rgb(100,140,255)]'
                      : 'text-muted-foreground/40 hover:text-muted-foreground/60'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart canvas - MetaTrader style background */}
          <div className="relative h-32 sm:h-40 bg-[oklch(0.09_0.01_250)] rounded border border-border/20">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredDay(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
