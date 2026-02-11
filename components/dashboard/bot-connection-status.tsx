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

/** Bot status row from Supabase bot_status table (heartbeat from MT5 EA). */
interface BotStatusData {
  account_id: string
  broker: string | null
  balance: number | null
  equity: number | null
  last_seen: string
  created_at: string
  updated_at: string
}

/** Latest trade profit for display (from trades table). */
interface LatestTradeProfit {
  profit: number
}

/** Bot is "connected" when we have any bot_status row (data received). Staleness is shown via "Última actualización". */

function toNumber(value: unknown): number {
  if (value == null || value === "") return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

interface BotConnectionStatusProps {
  accountId?: string
}

export function BotConnectionStatus({ accountId }: BotConnectionStatusProps) {
  const [botStatus, setBotStatus] = useState<BotStatusData | null>(null)
  const [latestProfit, setLatestProfit] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const supabase = createClient()

  const fetchBotStatus = async () => {
    try {
      // 1) Read from bot_status (balance, equity, last_seen, account_id)
      let statusQuery = supabase
        .from("bot_status")
        .select("account_id, broker, balance, equity, last_seen, created_at, updated_at")
        .order("last_seen", { ascending: false })
        .limit(1)

      if (accountId) {
        statusQuery = statusQuery.eq("account_id", accountId)
      }

      const { data: statusData, error: statusError } = await statusQuery.maybeSingle()

      if (statusError) {
        console.error("Error fetching bot_status:", statusError)
        setBotStatus(null)
        setIsConnected(false)
        setLastCheck(new Date())
        return
      }

      if (statusData) {
        setBotStatus(statusData as BotStatusData)
        setIsConnected(true)
      } else {
        setBotStatus(null)
        setIsConnected(false)
      }

      // 2) Optional: get latest trade profit for this account (from trades)
      const accId = statusData?.account_id ?? accountId
      if (accId) {
        const { data: tradeRow } = await supabase
          .from("trades")
          .select("profit")
          .eq("account_id", accId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
        setLatestProfit(toNumber((tradeRow as LatestTradeProfit | null)?.profit))
      } else {
        setLatestProfit(0)
      }

      setLastCheck(new Date())
    } catch (err) {
      console.error("Error fetching bot status:", err)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBotStatus()

    const interval = setInterval(fetchBotStatus, 30000)

    const channel = supabase
      .channel("bot_status-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bot_status",
        },
        (payload) => {
          if (payload.new) {
            const row = payload.new as BotStatusData
            if (!accountId || row.account_id === accountId) {
              setBotStatus(row)
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

  const balance = toNumber(botStatus?.balance)
  const equity = toNumber(botStatus?.equity)
  const lastSeenAt = botStatus?.last_seen ?? botStatus?.updated_at

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
                  ? "Datos recibidos desde el bot MT5"
                  : "Sin datos del bot MT5"
                }
              </p>
            </div>
          </div>
          {botStatus && (
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                Broker
              </p>
              <p className="text-xs font-medium text-foreground">
                {botStatus.broker || "Deriv"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bot status: balance, equity, last_seen, account_id */}
      {botStatus ? (
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
                {formatCurrency(balance)}
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
                {formatCurrency(equity)}
              </p>
            </div>

            {/* Profit (from latest trade) */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Profit
                </p>
              </div>
              <p className={`text-lg font-semibold ${
                latestProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}>
                {latestProfit >= 0 ? "+" : ""}{formatCurrency(latestProfit)}
              </p>
            </div>

            {/* Last Update (last_seen from bot_status) */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                  Ultima Actualizacion
                </p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {lastSeenAt ? formatTimeAgo(lastSeenAt) : "—"}
              </p>
            </div>
          </div>

          {/* Account ID */}
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                Account ID: <span className="font-mono text-foreground">{botStatus.account_id}</span>
              </p>
              <button 
                onClick={fetchBotStatus}
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
