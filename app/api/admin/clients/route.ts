import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// GET - Listar todos los clientes con sus cuentas MT5
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: clients, error } = await supabase
      .from("clients")
      .select(`
        *,
        mt5_accounts(*),
        system_state(*),
        client_settings(*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch clients" },
        { status: 500 }
      )
    }

    // Calcular metricas por cliente
    const clientsWithMetrics = await Promise.all(
      (clients || []).map(async (client) => {
        const { data: operations } = await supabase
          .from("operations")
          .select("profit")
          .eq("client_id", client.id)

        const totalProfit = operations?.reduce((sum, op) => sum + (op.profit || 0), 0) || 0
        const totalOps = operations?.length || 0

        return {
          ...client,
          metrics: {
            totalProfit,
            totalOperations: totalOps,
            currentBalance: (client.initial_capital || 0) + totalProfit,
          },
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: clientsWithMetrics,
    })
  } catch (error) {
    console.error("Admin clients API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, email, plan, initial_capital } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Crear cliente
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        name,
        email,
        plan: plan || "standard",
        initial_capital: initial_capital || 50000,
        is_active: true,
        service_status: "ACTIVO",
        service_debt: 0,
        profit_share_percentage: 30,
      })
      .select()
      .single()

    if (clientError) {
      console.error("Error creating client:", clientError)
      return NextResponse.json(
        { success: false, error: "Failed to create client" },
        { status: 500 }
      )
    }

    // Crear estado del sistema para el cliente
    await supabase.from("system_state").insert({
      client_id: client.id,
      is_active: true,
      is_pending: false,
      pending_amount: 0,
    })

    // Crear configuracion por defecto
    await supabase.from("client_settings").insert({
      client_id: client.id,
      lot_size: 0.01,
      daily_limit: 20,
    })

    return NextResponse.json({
      success: true,
      data: client,
    })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
