"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  Wallet,
  RefreshCw,
  Clock
} from "lucide-react"

interface TradeData {
  id: string
  account_id: string
  broker: string
  balance: number
  equity: number
  profit: number
  updated_at: string
  created_at: string
}

interface BotConnectionStatusProps {
  accountId?: string
}

export function BotConnectionStatus({ accountId }: BotConnectionStatusProps) {
  const [tradeData, setTradeData] = useState<TradeData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const supabase = createClient()

  const fetchTradeData = async () => {
    try {
      let query = supabase
        .from("trades")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)

      if (accountId) {
        query = query.eq("account_id", accountId)
      }

      const { data, error } = await query.single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching trade data:", error)
        setIsConnected(false)
        setTradeData(null)
      } else if (data) {
        setTradeData(data)
        
        // Check if data is recent (within 120 seconds)
        const updatedAt = new Date(data.updated_at)
        const now = new Date()
        const diffSeconds = (now.getTime() - updatedAt.getTime()) / 1000
        setIsConnected(diffSeconds < 120)
      } else {
        setIsConnected(false)
        setTradeData(null)
      }

      setLastCheck(new Date())
    } catch (err) {
      console.error("Error:", err)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTradeData()

    // Poll every 30 seconds
    const interval = setInterval(fetchTradeData, 30000)

    // Subscribe to realtime updates
    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as TradeData
            if (!accountId || newData.account_id === accountId) {
              setTradeData(newData)
              setIsConnected(true)
              setLastCheck(new Date())
            }
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [accountId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return `Hace ${diffSeconds}s`
    if (diffSeconds < 3600) return `Hace ${Math.floor(diffSeconds / 60)}m`
    if (diffSeconds < 86400) return `Hace ${Math.floor(diffSeconds / 3600)}h`
    return `Hace ${Math.floor(diffSeconds / 86400)}d`
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Verificando estado del bot...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      {/* Connection Status Header */}
      <div className={`px-6 py-4 border-b ${
        isConnected 
          ? "bg-emerald-500/10 border-emerald-500/20" 
          : "bg-red-500/10 border-red-500/20"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="relative">
                <Wifi className="w-5 h-5 text-emerald-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className={`text-sm font-semibold ${
                isConnected ? "text-emerald-400" : "text-red-400"
              }`}>
                {isConnected ? "Bot Conectado" : "Bot Desconectado"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isConnected 
                  ? "Recibiendo datos en tiempo real desde MT5"
                  : "Sin datos recientes del bot MT5"
                }
              </p>
            </div>
          </div>
          {tradeData && (
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                Broker
              </p>
              <p className="text-xs font-medium text-foreground">
                {tradeData.broker || "Deriv"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trade Data */}
      {tradeData ? (
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Balance */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Balance
                </p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(tradeData.balance)}
              </p>
            </div>

            {/* Equity */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Equity
                </p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(tradeData.equity)}
              </p>
            </div>

            {/* Profit */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Profit
                </p>
              </div>
              <p className={`text-lg font-semibold ${
                tradeData.profit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {tradeData.profit >= 0 ? "+" : ""}{formatCurrency(tradeData.profit)}
              </p>
            </div>

            {/* Last Update */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Ultima Actualizacion
                </p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatTimeAgo(tradeData.updated_at)}
              </p>
            </div>
          </div>

          {/* Account ID */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Account ID: <span className="font-mono text-foreground">{tradeData.account_id}</span>
              </p>
              <button 
                onClick={fetchTradeData}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-6">
          <div className="text-center py-4">
            <WifiOff className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              No se encontraron datos del bot
            </p>
            <p className="text-xs text-muted-foreground/60">
              Asegurate de que el EA este corriendo en MT5 y enviando datos al webhook
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
