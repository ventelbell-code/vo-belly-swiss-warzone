"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface TradeData {
  id: string
  account_id: string
  broker: string
  balance: number
  equity: number
  profit: number
  updated_at: string
}

interface Operation {
  id: string
  asset: string
  operation_type: string
  profit: number
  lot_size: number
  entry_price: number
  exit_price: number
  opened_at: string
  closed_at: string
  duration_seconds: number
}

interface DayData {
  day: string
  shortDay: string
  profit: number
  percentage: number
  operations: number
  cumulative: number
  intraday: number[]
}

interface RealTradingData {
  // Current account state
  balance: number
  equity: number
  profit: number
  broker: string
  accountId: string
  lastUpdate: string | null
  isConnected: boolean
  
  // Weekly performance
  weeklyData: DayData[]
  weeklyProfit: number
  weeklyPercentage: number
  totalOperations: number
  
  // Recent operations
  recentOperations: Operation[]
  
  // Loading state
  isLoading: boolean
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
const SHORT_DAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

export function useRealTradingData(): RealTradingData {
  const [data, setData] = useState<RealTradingData>({
    balance: 0,
    equity: 0,
    profit: 0,
    broker: "Deriv",
    accountId: "",
    lastUpdate: null,
    isConnected: false,
    weeklyData: [],
    weeklyProfit: 0,
    weeklyPercentage: 0,
    totalOperations: 0,
    recentOperations: [],
    isLoading: true,
  })

 const supabase = createClient()
const ACCOUNT_ID = "TEST123"
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get latest trade data (account state)
        



const { data: tradeData } = await supabase
  .from("trades")
  .select("*")
  .eq("account_id", ACCOUNT_ID)
  .single()


        // Get operations from the last 7 days
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        
        const { data: operations } = await supabase
          .from("operations")
          .select("*")
          .gte("closed_at", weekAgo.toISOString())
          .order("closed_at", { ascending: false })

        // Calculate connection status
        let isConnected = false
        if (tradeData?.updated_at) {
          const updatedAt = new Date(tradeData.updated_at)
          const now = new Date()
          const diffSeconds = (now.getTime() - updatedAt.getTime()) / 1000
          isConnected = diffSeconds < 120
        }

        // Build weekly data from operations
        const weeklyMap = new Map<string, { profit: number; operations: number }>()
        
        // Initialize all 7 days
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dayKey = d.toISOString().split("T")[0]
          weeklyMap.set(dayKey, { profit: 0, operations: 0 })
        }

        // Aggregate operations by day
        if (operations) {
          for (const op of operations) {
            if (op.closed_at) {
              const dayKey = new Date(op.closed_at).toISOString().split("T")[0]
              const existing = weeklyMap.get(dayKey)
              if (existing) {
                existing.profit += op.profit || 0
                existing.operations += 1
              }
            }
          }
        }

        // Convert to array format
        const initialBalance = tradeData?.balance || 50000
        let cumulative = initialBalance - (operations?.reduce((acc, op) => acc + (op.profit || 0), 0) || 0)
        
        const weeklyData: DayData[] = []
        const sortedDays = Array.from(weeklyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
        
        for (const [dateStr, dayData] of sortedDays) {
          const date = new Date(dateStr)
          const dayIndex = date.getDay()
          cumulative += dayData.profit
          
          weeklyData.push({
            day: DAYS[dayIndex],
            shortDay: SHORT_DAYS[dayIndex],
            profit: dayData.profit,
            percentage: initialBalance > 0 ? (dayData.profit / initialBalance) * 100 : 0,
            operations: dayData.operations,
            cumulative,
            intraday: [cumulative - dayData.profit, cumulative],
          })
        }

        // Calculate totals
        const weeklyProfit = weeklyData.reduce((acc, d) => acc + d.profit, 0)
        const totalOperations = weeklyData.reduce((acc, d) => acc + d.operations, 0)
        const weeklyPercentage = initialBalance > 0 ? (weeklyProfit / initialBalance) * 100 : 0

        setData({
          balance: tradeData?.balance || 0,
          equity: tradeData?.equity || 0,
          profit: tradeData?.profit || 0,
          broker: tradeData?.broker || "Deriv",
          accountId: tradeData?.account_id || "",
          lastUpdate: tradeData?.updated_at || null,
          isConnected,
          weeklyData,
          weeklyProfit,
          weeklyPercentage,
          totalOperations,
          recentOperations: (operations || []).slice(0, 10),
          isLoading: false,
        })
      } catch (err) {
        console.error("Error fetching trading data:", err)
        setData(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchData()

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000)

    // Subscribe to realtime updates
    const channel = supabase
      .channel("trading-data-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operations" },
        () => fetchData()
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  return data
}
