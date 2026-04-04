import { NextResponse } from "next/server"

import { buildEventHash, validateBotLicense } from "@/lib/saas/bot"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

function resolveIsoTime(body: Record<string, unknown>) {
  if (typeof body.event_time === "string" && body.event_time.trim()) {
    return new Date(body.event_time).toISOString()
  }

  if (typeof body.event_time_unix === "number" && Number.isFinite(body.event_time_unix)) {
    return new Date(body.event_time_unix * 1000).toISOString()
  }

  if (typeof body.server_time_unix === "number" && Number.isFinite(body.server_time_unix)) {
    return new Date(body.server_time_unix * 1000).toISOString()
  }

  return new Date().toISOString()
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = await validateBotLicense(body, { allowBind: true })

    if (!validation.valid || !validation.context) {
      return NextResponse.json(
        {
          success: false,
          ...validation.response,
        },
        { status: 200 },
      )
    }

    const supabase = createAdminClient()
    const receivedAt = new Date().toISOString()
    const event = asString(body.event)

    if (event === "snapshot") {
      const { error } = await supabase.from("bot_snapshots").insert({
        client_id: validation.context.clientId,
        license_id: validation.context.licenseId,
        binding_id: validation.context.bindingId,
        account_login: validation.context.binding?.account_login ?? String(body.account_login ?? ""),
        account_server: validation.context.binding?.account_server ?? String(body.account_server ?? ""),
        balance: asNumber(body.balance),
        equity: asNumber(body.equity),
        floating_profit: asNumber(body.floating_profit),
        realized_profit: asNumber(body.realized_profit),
        open_positions: typeof body.open_positions === "number" ? body.open_positions : null,
        currency: asString(body.currency),
        payload: body.payload && typeof body.payload === "object" ? body.payload : {},
        received_at: receivedAt,
      })

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({
        success: true,
        event: "snapshot",
        ...validation.response,
      })
    }

    if (event === "trade_event") {
      const eventType = asString(body.event_type)
      const externalTicket = asString(body.external_ticket)
      const symbol = asString(body.symbol)

      if (!eventType || !externalTicket || !symbol) {
        return NextResponse.json(
          {
            success: false,
            valid: true,
            can_trade: validation.canTrade,
            status: "invalid_request",
            message: "Missing event_type, external_ticket or symbol.",
          },
          { status: 400 },
        )
      }

      const eventTime = resolveIsoTime(body)
      const eventHash = asString(body.event_hash) || buildEventHash({
        licenseId: validation.context.licenseId,
        eventType,
        externalTicket,
        symbol,
        eventTime,
        profit: asNumber(body.profit),
        volume: asNumber(body.volume),
      })

      const { error } = await supabase.from("bot_trade_events").upsert(
        {
          client_id: validation.context.clientId,
          license_id: validation.context.licenseId,
          binding_id: validation.context.bindingId,
          event_hash: eventHash,
          event_type: eventType,
          external_ticket: externalTicket,
          symbol,
          direction: asString(body.direction),
          volume: asNumber(body.volume),
          entry_price: asNumber(body.entry_price),
          close_price: asNumber(body.close_price),
          profit: asNumber(body.profit),
          swap: asNumber(body.swap),
          commission: asNumber(body.commission),
          event_time: eventTime,
          payload: body.payload && typeof body.payload === "object" ? body.payload : {},
          received_at: receivedAt,
        },
        {
          onConflict: "event_hash",
        },
      )

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({
        success: true,
        event: "trade_event",
        event_hash: eventHash,
        ...validation.response,
      })
    }

    return NextResponse.json(
      {
        success: false,
        valid: true,
        can_trade: validation.canTrade,
        status: "unsupported_event",
        message: "Supported events: snapshot, trade_event.",
      },
      { status: 400 },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed."
    return NextResponse.json(
      {
        success: false,
        valid: false,
        can_trade: false,
        status: "server_error",
        message,
      },
      { status: 500 },
    )
  }
}
