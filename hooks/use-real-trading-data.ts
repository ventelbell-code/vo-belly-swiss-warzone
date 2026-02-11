"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

/** Prefer env so dashboard and bot status use the same account as MT5 webhook. */
const DEFAULT_ACCOUNT_ID = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MT5_ACCOUNT_ID
  ? process.env.NEXT_PUBLIC_MT5_ACCOUNT_ID
  : "TEST_ACCOUNT_001"

function toNum(v: unknown): number {
  if (v == null || v === "") return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) bot_status: balance, equity, last_seen, account_id (single source for account state)
        let statusQuery = supabase
          .from("bot_status")
          .select("account_id, broker, balance, equity, last_seen, updated_at")
          .order("last_seen", { ascending: false })
          .limit(1)

        statusQuery = statusQuery.eq("account_id", DEFAULT_ACCOUNT_ID)
        let { data: botRow } = await statusQuery.maybeSingle()
        if (!botRow) {
          const { data: anyRow } = await supabase
            .from("bot_status")
            .select("account_id, broker, balance, equity, last_seen, updated_at")
            .order("last_seen", { ascending: false })
            .limit(1)
            .maybeSingle()
          botRow = anyRow
        }

        const accountId = (botRow as { account_id?: string } | null)?.account_id ?? DEFAULT_ACCOUNT_ID
        const balance = toNum((botRow as { balance?: unknown } | null)?.balance)
        const equity = toNum((botRow as { equity?: unknown } | null)?.equity)
        const lastSeen = (botRow as { last_seen?: string } | null)?.last_seen ?? (botRow as { updated_at?: string } | null)?.updated_at ?? null
        const broker = (botRow as { broker?: string } | null)?.broker ?? "Deriv"

        const lastSeenDate = lastSeen ? new Date(lastSeen) : null
        const isConnected = lastSeenDate ? (Date.now() - lastSeenDate.getTime()) / 1000 < 120 : false

        // 2) Latest trade profit from trades for this account
        const { data: latestTrade } = await supabase
          .from("trades")
          .select("profit")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        const profit = toNum((latestTrade as { profit?: unknown } | null)?.profit)

        // 3) Operations for weekly data
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const { data: operations } = await supabase
          .from("operations")
          .select("*")
          .gte("closed_at", weekAgo.toISOString())
          .order("closed_at", { ascending: false })

        // Build weekly data from operations
        const weeklyMap = new Map<string, { profit: number; operations: number }>()
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          weeklyMap.set(d.toISOString().split("T")[0], { profit: 0, operations: 0 })
        }
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

        const initialBalance = balance || 50000
        let cumulative = initialBalance - (operations?.reduce((acc: number, op: { profit?: number }) => acc + (op.profit || 0), 0) || 0)
        const sortedDays = Array.from(weeklyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
        const weeklyData: DayData[] = sortedDays.map(([dateStr, dayData]) => {
          const date = new Date(dateStr)
          const dayIndex = date.getDay()
          const startCumulative = cumulative
          cumulative += dayData.profit
          let intradayPoints: number[] = [startCumulative]
          if (dayData.operations > 0 && dayData.profit !== 0) {
            const numPoints = Math.max(3, dayData.operations * 2)
            const profitPerPoint = dayData.profit / numPoints
            let runningTotal = startCumulative
            for (let i = 0; i < numPoints; i++) {
              const variance = (Math.random() - 0.5) * Math.abs(profitPerPoint) * 0.3
              runningTotal += profitPerPoint + variance
              intradayPoints.push(runningTotal)
            }
            intradayPoints[intradayPoints.length - 1] = cumulative
          } else {
            intradayPoints.push(cumulative)
          }
          return {
            day: DAYS[dayIndex],
            shortDay: SHORT_DAYS[dayIndex],
            profit: dayData.profit,
            percentage: initialBalance > 0 ? (dayData.profit / initialBalance) * 100 : 0,
            operations: dayData.operations,
            cumulative,
            intraday: intradayPoints,
          }
        })

        const weeklyProfit = weeklyData.reduce((acc, d) => acc + d.profit, 0)
        const totalOperations = weeklyData.reduce((acc, d) => acc + d.operations, 0)
        const weeklyPercentage = initialBalance > 0 ? (weeklyProfit / initialBalance) * 100 : 0

        setData({
          balance,
          equity,
          profit,
          broker,
          accountId,
          lastUpdate: lastSeen,
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
    const interval = setInterval(fetchData, 30000)
    const channel = supabase
      .channel("trading-data-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bot_status" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "operations" }, () => fetchData())
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  return data
}
