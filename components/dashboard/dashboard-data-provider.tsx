"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useDashboardData, type DashboardData } from "@/hooks/use-dashboard-data"

// Datos demo para fallback cuando no hay conexion a la API
const DEMO_DATA: DashboardData = {
  client: {
    id: "demo",
    name: "Usuario Demo",
    email: "demo@bellyswiss.com",
    plan: "Premium",
    initialCapital: 50000,
    currentBalance: 62459.40,
  },
  accounts: [
    {
      id: "demo-account",
      account_id: 12345678,
      broker: "Deriv",
      balance: 62459.40,
      equity: 62459.40,
      is_active: true,
      last_sync: new Date().toISOString(),
    },
  ],
  metrics: {
    totalProfit: 12459.40,
    totalPercentage: 24.92,
    todayProfit: 312.40,
    todayPercentage: 0.62,
    weekProfit: 859.40,
    weekPercentage: 1.72,
    totalOperations: 156,
    todayOperations: 8,
    todayWinning: 6,
    todayLosing: 2,
    winRate: 75.6,
  },
  weeklyData: [
    { day: "Lunes", shortDay: "Lun", date: "2026-01-20", profit: 245.80, percentage: 0.49, operations: 3 },
    { day: "Martes", shortDay: "Mar", date: "2026-01-21", profit: 189.50, percentage: 0.38, operations: 2 },
    { day: "Miercoles", shortDay: "Mie", date: "2026-01-22", profit: -45.20, percentage: -0.09, operations: 1 },
    { day: "Jueves", shortDay: "Jue", date: "2026-01-23", profit: 312.40, percentage: 0.62, operations: 2 },
    { day: "Viernes", shortDay: "Vie", date: "2026-01-24", profit: 156.90, percentage: 0.31, operations: 2 },
    { day: "Sabado", shortDay: "Sab", date: "2026-01-25", profit: 0, percentage: 0, operations: 0 },
    { day: "Domingo", shortDay: "Dom", date: "2026-01-26", profit: 0, percentage: 0, operations: 0 },
  ],
  recentOperations: [
    { id: "1", profit: 45.20, percentage: 0.09, opType: "Scalp", asset: "Boom 1000", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), ticket: 1001 },
    { id: "2", profit: 78.50, percentage: 0.16, opType: "Expansion", asset: "Boom 1000", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), ticket: 1002 },
    { id: "3", profit: -22.30, percentage: -0.04, opType: "Scalp", asset: "Crash 500", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), ticket: 1003 },
    { id: "4", profit: 56.80, percentage: 0.11, opType: "Swing", asset: "Boom 500", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), ticket: 1004 },
    { id: "5", profit: 34.10, percentage: 0.07, opType: "Scalp", asset: "Boom 1000", timestamp: new Date(Date.now() - 60 * 60000).toISOString(), ticket: 1005 },
    { id: "6", profit: 89.40, percentage: 0.18, opType: "Expansion", asset: "Crash 1000", timestamp: new Date(Date.now() - 90 * 60000).toISOString(), ticket: 1006 },
    { id: "7", profit: -15.60, percentage: -0.03, opType: "Scalp", asset: "Boom 1000", timestamp: new Date(Date.now() - 120 * 60000).toISOString(), ticket: 1007 },
    { id: "8", profit: 45.30, percentage: 0.09, opType: "Scalp", asset: "Boom 500", timestamp: new Date(Date.now() - 150 * 60000).toISOString(), ticket: 1008 },
  ],
  systemState: {
    isActive: true,
    isPending: false,
    pendingAmount: 0,
    lastUpdate: new Date().toISOString(),
  },
  settings: {
    lotSize: 0.01,
    dailyLimit: 20,
    operationsToday: 8,
  },
}

interface DashboardContextType {
  data: DashboardData
  isLoading: boolean
  isError: boolean
  isDemo: boolean
  refresh: () => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardDataProvider")
  }
  return context
}

interface DashboardDataProviderProps {
  children: ReactNode
  clientId?: string | null
}

export function DashboardDataProvider({ children, clientId }: DashboardDataProviderProps) {
  const { data, isLoading, isError, refresh } = useDashboardData(clientId || null)

  // Usar datos demo si no hay clientId, hay error, o esta cargando sin datos previos
  const isDemo = !clientId || isError || (!data && !isLoading)
  const effectiveData = data || DEMO_DATA

  return (
    <DashboardContext.Provider
      value={{
        data: effectiveData,
        isLoading,
        isError,
        isDemo,
        refresh: refresh || (() => {}),
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}
