import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Obtener operaciones con filtros
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const clientId = searchParams.get("client_id")
    const period = searchParams.get("period") || "today"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "client_id is required" },
        { status: 400 }
      )
    }

    // Calcular rango de fechas segun periodo
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "all":
        startDate = new Date(0)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    // Query operaciones
    const { data: operations, error, count } = await supabase
      .from("operations")
      .select("*, mt5_accounts(account_id, broker)", { count: "exact" })
      .eq("client_id", clientId)
      .gte("close_time", startDate.toISOString())
      .order("close_time", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching operations:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch operations" },
        { status: 500 }
      )
    }

    // Calcular metricas
    const totalProfit = operations?.reduce((sum, op) => sum + (op.profit || 0), 0) || 0
    const winningOps = operations?.filter(op => op.profit > 0).length || 0
    const losingOps = operations?.filter(op => op.profit < 0).length || 0
    const winRate = operations?.length ? (winningOps / operations.length) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        operations,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
        metrics: {
          totalProfit,
          winningOps,
          losingOps,
          winRate: Math.round(winRate * 10) / 10,
          totalOps: operations?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("Operations API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
