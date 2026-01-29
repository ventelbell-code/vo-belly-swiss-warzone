import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "client_id is required" },
        { status: 400 }
      )
    }

    // Obtener cliente y sus cuentas MT5
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*, mt5_accounts(*)")
      .eq("id", clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Calcular fechas
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)

    // Obtener todas las operaciones del cliente
    const { data: allOperations } = await supabase
      .from("operations")
      .select("*")
      .eq("client_id", clientId)
      .order("close_time", { ascending: false })

    // Operaciones de hoy
    const todayOperations = allOperations?.filter(
      op => new Date(op.close_time) >= todayStart
    ) || []

    // Operaciones de la semana
    const weekOperations = allOperations?.filter(
      op => new Date(op.close_time) >= weekStart
    ) || []

    // Calcular metricas totales
    const totalProfit = allOperations?.reduce((sum, op) => sum + (op.profit || 0), 0) || 0
    const todayProfit = todayOperations.reduce((sum, op) => sum + (op.profit || 0), 0)
    const weekProfit = weekOperations.reduce((sum, op) => sum + (op.profit || 0), 0)

    // Win rate
    const totalOps = allOperations?.length || 0
    const winningOps = allOperations?.filter(op => op.profit > 0).length || 0
    const winRate = totalOps > 0 ? (winningOps / totalOps) * 100 : 0

    // Operaciones de hoy
    const todayWinning = todayOperations.filter(op => op.profit > 0).length
    const todayLosing = todayOperations.filter(op => op.profit < 0).length

    // Calcular porcentajes
    const initialCapital = client.initial_capital || 50000
    const totalPercentage = (totalProfit / initialCapital) * 100
    const todayPercentage = (todayProfit / initialCapital) * 100
    const weekPercentage = (weekProfit / initialCapital) * 100

    // Obtener estado del sistema
    const { data: systemState } = await supabase
      .from("system_state")
      .select("*")
      .eq("client_id", clientId)
      .single()

    // Obtener configuracion
    const { data: settings } = await supabase
      .from("client_settings")
      .select("*")
      .eq("client_id", clientId)
      .single()

    // Calcular profit semanal por dia
    const weeklyData = []
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dayOps = allOperations?.filter(op => {
        const opDate = new Date(op.close_time)
        return opDate >= date && opDate < nextDate
      }) || []
      
      const dayProfit = dayOps.reduce((sum, op) => sum + (op.profit || 0), 0)
      const dayPercentage = (dayProfit / initialCapital) * 100
      
      weeklyData.push({
        day: date.toLocaleDateString("es-ES", { weekday: "long" }),
        shortDay: dayNames[date.getDay()],
        date: date.toISOString().split("T")[0],
        profit: Math.round(dayProfit * 100) / 100,
        percentage: Math.round(dayPercentage * 100) / 100,
        operations: dayOps.length,
      })
    }

    // Ultimas operaciones para timeline
    const recentOperations = (allOperations || []).slice(0, 10).map(op => ({
      id: op.id,
      profit: op.profit,
      percentage: op.percentage,
      opType: op.op_type,
      asset: op.asset,
      timestamp: op.close_time,
      ticket: op.mt5_ticket,
    }))

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          plan: client.plan,
          initialCapital,
          currentBalance: initialCapital + totalProfit,
        },
        accounts: client.mt5_accounts,
        metrics: {
          totalProfit: Math.round(totalProfit * 100) / 100,
          totalPercentage: Math.round(totalPercentage * 100) / 100,
          todayProfit: Math.round(todayProfit * 100) / 100,
          todayPercentage: Math.round(todayPercentage * 100) / 100,
          weekProfit: Math.round(weekProfit * 100) / 100,
          weekPercentage: Math.round(weekPercentage * 100) / 100,
          totalOperations: totalOps,
          todayOperations: todayOperations.length,
          todayWinning,
          todayLosing,
          winRate: Math.round(winRate * 10) / 10,
        },
        weeklyData,
        recentOperations,
        systemState: {
          isActive: systemState?.is_active ?? true,
          isPending: systemState?.is_pending ?? false,
          pendingAmount: systemState?.pending_amount ?? 0,
          lastUpdate: systemState?.updated_at,
        },
        settings: {
          lotSize: settings?.lot_size ?? 0.01,
          dailyLimit: settings?.daily_limit ?? 20,
          operationsToday: todayOperations.length,
        },
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
