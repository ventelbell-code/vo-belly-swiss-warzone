import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Generic MT5 payload - multi-symbol support
interface MT5Payload {
  // Required
  action: "heartbeat" | "trade_update" | "operation_closed" | "ping"
  account_id: string | number
  
  // Optional - sent with heartbeat/trade_update
  broker?: string
  balance?: number
  equity?: number
  profit?: number
  
  // Optional - sent with operation_closed
  bot_id?: string
  symbol?: string
  side?: "BUY" | "SELL"
  ticket?: number
  lots?: number
  open_price?: number
  close_price?: number
  trade_profit?: number
  
  // Timestamp
  timestamp?: string
}

// POST - Receive MT5 EA data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Parse body
    let payload: MT5Payload
    try {
      payload = await request.json()
    } catch {
      console.log("[v0] Invalid JSON received")
      return NextResponse.json(
        { success: false, error: "Invalid JSON" },
        { status: 400 }
      )
    }

    // Log received payload for debugging
    console.log("[v0] MT5 Webhook received:", JSON.stringify(payload))

    // Validate required field
    if (!payload.account_id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: account_id" },
        { status: 400 }
      )
    }

    const accountId = String(payload.account_id)
    const now = new Date().toISOString()

    switch (payload.action) {
      case "ping": {
        // Simple ping - just confirm the endpoint is alive
        return NextResponse.json({
          success: true,
          message: "pong",
          timestamp: now,
        })
      }

      case "heartbeat":
      case "trade_update": {
        // Upsert into trades table (the one BotConnectionStatus reads)
        const { error: upsertError } = await supabase
          .from("trades")
          .upsert(
            {
              account_id: accountId,
              broker: payload.broker || "Deriv",
              balance: payload.balance ?? 0,
              equity: payload.equity ?? 0,
              profit: payload.profit ?? 0,
              updated_at: now,
            },
            { onConflict: "account_id" }
          )

        if (upsertError) {
          console.log("[v0] Error upserting trade:", upsertError)
          return NextResponse.json(
            { success: false, error: "Database error" },
            { status: 500 }
          )
        }

        // Also upsert into accounts table for backup
        await supabase
          .from("accounts")
          .upsert(
            {
              account_id: accountId,
              broker: payload.broker || "Deriv",
              balance: payload.balance ?? 0,
              equity: payload.equity ?? 0,
              profit: payload.profit ?? 0,
              updated_at: now,
            },
            { onConflict: "account_id" }
          )

        // Log activity
        await supabase.from("activity_log").insert({
          action: payload.action,
          activity_type: "bot_heartbeat",
          description: `Bot heartbeat from account ${accountId}`,
          details: {
            account_id: accountId,
            broker: payload.broker,
            balance: payload.balance,
            equity: payload.equity,
            profit: payload.profit,
          },
        })

        return NextResponse.json({
          success: true,
          message: "Heartbeat recorded",
          timestamp: now,
        })
      }

      case "operation_closed": {
        // Record closed operation
        console.log("[v0] Operation closed:", payload)

        // Update trades table with latest balance/equity
        if (payload.balance !== undefined) {
          await supabase
            .from("trades")
            .upsert(
              {
                account_id: accountId,
                broker: payload.broker || "Deriv",
                balance: payload.balance ?? 0,
                equity: payload.equity ?? 0,
                profit: payload.profit ?? 0,
                updated_at: now,
              },
              { onConflict: "account_id" }
            )
        }

        // Log activity
        await supabase.from("activity_log").insert({
          action: "operation_closed",
          activity_type: "trade",
          description: `Trade closed: ${payload.symbol} ${payload.side}`,
          details: {
            account_id: accountId,
            bot_id: payload.bot_id,
            symbol: payload.symbol,
            side: payload.side,
            ticket: payload.ticket,
            profit: payload.trade_profit,
            lots: payload.lots,
          },
        })

        return NextResponse.json({
          success: true,
          message: "Operation recorded",
          timestamp: now,
        })
      }

      default: {
        // Unknown action but still valid POST - accept it
        console.log("[v0] Unknown action:", payload.action)
        
        // Update trades anyway if we have balance data
        if (payload.balance !== undefined) {
          await supabase
            .from("trades")
            .upsert(
              {
                account_id: accountId,
                broker: payload.broker || "Deriv",
                balance: payload.balance ?? 0,
                equity: payload.equity ?? 0,
                profit: payload.profit ?? 0,
                updated_at: now,
              },
              { onConflict: "account_id" }
            )
        }

        return NextResponse.json({
          success: true,
          message: "Data received",
          timestamp: now,
        })
      }
    }
  } catch (error) {
    console.error("[v0] MT5 Webhook error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Return message confirming endpoint is alive
export async function GET() {
  return new NextResponse("Only POST requests allowed", { 
    status: 200,
    headers: { "Content-Type": "text/plain" }
  })
}
