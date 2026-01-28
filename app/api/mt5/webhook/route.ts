import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Tipos para las operaciones del EA
interface MT5Operation {
  ticket: number
  symbol: string
  type: "BUY" | "SELL"
  lots: number
  open_price: number
  close_price: number
  profit: number
  commission: number
  swap: number
  open_time: string
  close_time: string
  magic_number?: number
  comment?: string
}

interface MT5WebhookPayload {
  action: "operation_closed" | "heartbeat" | "status_update" | "sync_operations"
  api_key: string
  account_id: number
  broker?: string
  balance?: number
  equity?: number
  operations?: MT5Operation[]
  operation?: MT5Operation
  timestamp: string
}

// Validar API key y obtener cuenta MT5
async function validateApiKey(supabase: ReturnType<typeof createClient>, apiKey: string, accountId: number) {
  const { data: account, error } = await supabase
    .from("mt5_accounts")
    .select("*, clients(*)")
    .eq("api_key", apiKey)
    .eq("account_id", accountId)
    .eq("is_active", true)
    .single()

  if (error || !account) {
    return { valid: false, account: null, client: null }
  }

  return { valid: true, account, client: account.clients }
}

// Calcular tipo de operacion basado en profit y duracion
function getOperationType(profit: number, durationMinutes: number): string {
  if (durationMinutes < 5) return "Scalp"
  if (profit > 50) return "Expansion"
  return "Swing"
}

// POST - Recibir datos del EA
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const payload: MT5WebhookPayload = await request.json()

    // Validar campos requeridos
    if (!payload.api_key || !payload.account_id || !payload.action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: api_key, account_id, action" },
        { status: 400 }
      )
    }

    // Validar API key
    const { valid, account, client } = await validateApiKey(supabase, payload.api_key, payload.account_id)
    if (!valid || !account || !client) {
      return NextResponse.json(
        { success: false, error: "Invalid API key or account" },
        { status: 401 }
      )
    }

    // Verificar si el cliente tiene el servicio activo
    const { data: systemState } = await supabase
      .from("system_state")
      .select("*")
      .eq("client_id", client.id)
      .single()

    const isServiceActive = systemState?.is_active ?? true

    switch (payload.action) {
      case "heartbeat": {
        // Actualizar ultimo contacto de la cuenta MT5
        await supabase
          .from("mt5_accounts")
          .update({
            last_sync: new Date().toISOString(),
            balance: payload.balance,
            equity: payload.equity,
          })
          .eq("id", account.id)

        // Registrar actividad
        await supabase.from("activity_log").insert({
          client_id: client.id,
          action: "heartbeat",
          details: { account_id: payload.account_id, balance: payload.balance, equity: payload.equity },
        })

        return NextResponse.json({
          success: true,
          service_active: isServiceActive,
          message: "Heartbeat received",
        })
      }

      case "operation_closed": {
        if (!payload.operation) {
          return NextResponse.json(
            { success: false, error: "Missing operation data" },
            { status: 400 }
          )
        }

        const op = payload.operation
        const openTime = new Date(op.open_time)
        const closeTime = new Date(op.close_time)
        const durationMinutes = (closeTime.getTime() - openTime.getTime()) / 60000

        // Verificar si ya existe esta operacion (por ticket)
        const { data: existingOp } = await supabase
          .from("operations")
          .select("id")
          .eq("mt5_ticket", op.ticket)
          .eq("mt5_account_id", account.id)
          .single()

        if (existingOp) {
          return NextResponse.json({
            success: true,
            message: "Operation already recorded",
            operation_id: existingOp.id,
          })
        }

        // Calcular porcentaje basado en balance
        const percentage = payload.balance ? (op.profit / payload.balance) * 100 : 0

        // Insertar operacion
        const { data: newOp, error: insertError } = await supabase
          .from("operations")
          .insert({
            client_id: client.id,
            mt5_account_id: account.id,
            mt5_ticket: op.ticket,
            asset: op.symbol,
            asset_type: "Sintetico",
            op_type: getOperationType(op.profit, durationMinutes),
            direction: op.type,
            lots: op.lots,
            open_price: op.open_price,
            close_price: op.close_price,
            profit: op.profit,
            percentage,
            commission: op.commission,
            swap: op.swap,
            open_time: op.open_time,
            close_time: op.close_time,
            duration_minutes: Math.round(durationMinutes),
            magic_number: op.magic_number,
            comment: op.comment,
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error inserting operation:", insertError)
          return NextResponse.json(
            { success: false, error: "Failed to record operation" },
            { status: 500 }
          )
        }

        // Actualizar balance de la cuenta MT5
        await supabase
          .from("mt5_accounts")
          .update({
            balance: payload.balance,
            equity: payload.equity,
            last_sync: new Date().toISOString(),
          })
          .eq("id", account.id)

        // Registrar actividad
        await supabase.from("activity_log").insert({
          client_id: client.id,
          action: "operation_closed",
          details: {
            ticket: op.ticket,
            symbol: op.symbol,
            profit: op.profit,
            type: op.type,
          },
        })

        return NextResponse.json({
          success: true,
          message: "Operation recorded",
          operation_id: newOp.id,
          service_active: isServiceActive,
        })
      }

      case "sync_operations": {
        if (!payload.operations || !Array.isArray(payload.operations)) {
          return NextResponse.json(
            { success: false, error: "Missing operations array" },
            { status: 400 }
          )
        }

        let synced = 0
        let skipped = 0

        for (const op of payload.operations) {
          // Verificar si ya existe
          const { data: existingOp } = await supabase
            .from("operations")
            .select("id")
            .eq("mt5_ticket", op.ticket)
            .eq("mt5_account_id", account.id)
            .single()

          if (existingOp) {
            skipped++
            continue
          }

          const openTime = new Date(op.open_time)
          const closeTime = new Date(op.close_time)
          const durationMinutes = (closeTime.getTime() - openTime.getTime()) / 60000
          const percentage = payload.balance ? (op.profit / payload.balance) * 100 : 0

          const { error: insertError } = await supabase.from("operations").insert({
            client_id: client.id,
            mt5_account_id: account.id,
            mt5_ticket: op.ticket,
            asset: op.symbol,
            asset_type: "Sintetico",
            op_type: getOperationType(op.profit, durationMinutes),
            direction: op.type,
            lots: op.lots,
            open_price: op.open_price,
            close_price: op.close_price,
            profit: op.profit,
            percentage,
            commission: op.commission,
            swap: op.swap,
            open_time: op.open_time,
            close_time: op.close_time,
            duration_minutes: Math.round(durationMinutes),
            magic_number: op.magic_number,
            comment: op.comment,
          })

          if (!insertError) synced++
        }

        // Actualizar balance
        await supabase
          .from("mt5_accounts")
          .update({
            balance: payload.balance,
            equity: payload.equity,
            last_sync: new Date().toISOString(),
          })
          .eq("id", account.id)

        // Registrar actividad
        await supabase.from("activity_log").insert({
          client_id: client.id,
          action: "sync_operations",
          details: { synced, skipped, total: payload.operations.length },
        })

        return NextResponse.json({
          success: true,
          message: `Synced ${synced} operations, skipped ${skipped} duplicates`,
          synced,
          skipped,
          service_active: isServiceActive,
        })
      }

      case "status_update": {
        // Actualizar estado de la cuenta
        await supabase
          .from("mt5_accounts")
          .update({
            balance: payload.balance,
            equity: payload.equity,
            broker: payload.broker,
            last_sync: new Date().toISOString(),
          })
          .eq("id", account.id)

        return NextResponse.json({
          success: true,
          service_active: isServiceActive,
          message: "Status updated",
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${payload.action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("MT5 Webhook error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Health check y documentacion
export async function GET() {
  return NextResponse.json({
    status: "online",
    version: "1.0.0",
    endpoints: {
      POST: {
        description: "Receive MT5 EA data",
        actions: ["heartbeat", "operation_closed", "sync_operations", "status_update"],
        required_fields: ["api_key", "account_id", "action"],
      },
    },
    documentation: "Contact admin for API key and integration guide",
  })
}
