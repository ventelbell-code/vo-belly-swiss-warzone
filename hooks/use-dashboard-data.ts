import useSWR from "swr"

interface MT5Account {
  id: string
  account_id: number
  broker: string
  balance: number
  equity: number
  is_active: boolean
  last_sync: string
}

interface DashboardMetrics {
  totalProfit: number
  totalPercentage: number
  todayProfit: number
  todayPercentage: number
  weekProfit: number
  weekPercentage: number
  totalOperations: number
  todayOperations: number
  todayWinning: number
  todayLosing: number
  winRate: number
}

interface WeeklyDataPoint {
  day: string
  shortDay: string
  date: string
  profit: number
  percentage: number
  operations: number
}

interface RecentOperation {
  id: string
  profit: number
  percentage: number
  opType: string
  asset: string
  timestamp: string
  ticket: number
}

interface SystemState {
  isActive: boolean
  isPending: boolean
  pendingAmount: number
  lastUpdate: string | null
}

interface Settings {
  lotSize: number
  dailyLimit: number
  operationsToday: number
}

interface ClientInfo {
  id: string
  name: string
  email: string
  plan: string
  initialCapital: number
  currentBalance: number
}

export interface DashboardData {
  client: ClientInfo
  accounts: MT5Account[]
  metrics: DashboardMetrics
  weeklyData: WeeklyDataPoint[]
  recentOperations: RecentOperation[]
  systemState: SystemState
  settings: Settings
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch data")
  const json = await res.json()
  if (!json.success) throw new Error(json.error || "Failed to fetch data")
  return json.data
}

export function useDashboardData(clientId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    clientId ? `/api/dashboard/stats?client_id=${clientId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refrescar cada 30 segundos
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}

// Hook para operaciones con paginacion
interface Operation {
  id: string
  mt5_ticket: number
  asset: string
  asset_type: string
  op_type: string
  direction: string
  lots: number
  profit: number
  percentage: number
  open_time: string
  close_time: string
  mt5_accounts?: {
    account_id: number
    broker: string
  }
}

interface OperationsData {
  operations: Operation[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  metrics: {
    totalProfit: number
    winningOps: number
    losingOps: number
    winRate: number
    totalOps: number
  }
}

export function useOperations(
  clientId: string | null,
  period: "today" | "7days" | "30days" | "all" = "today",
  limit = 50,
  offset = 0
) {
  const { data, error, isLoading, mutate } = useSWR<OperationsData>(
    clientId
      ? `/api/operations?client_id=${clientId}&period=${period}&limit=${limit}&offset=${offset}`
      : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
    }
  )

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}
