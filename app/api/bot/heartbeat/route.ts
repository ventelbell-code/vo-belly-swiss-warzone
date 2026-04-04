import { NextResponse } from "next/server"

import { validateBotLicense } from "@/lib/saas/bot"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

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
    const now = new Date().toISOString()
    const connectionStatus = typeof body.connection_status === "string" && body.connection_status.trim()
      ? body.connection_status.trim()
      : "online"

    const { error } = await supabase.from("bot_heartbeats").insert({
      client_id: validation.context.clientId,
      license_id: validation.context.licenseId,
      binding_id: validation.context.bindingId,
      account_login: validation.context.binding?.account_login ?? String(body.account_login ?? ""),
      account_server: validation.context.binding?.account_server ?? String(body.account_server ?? ""),
      broker: typeof body.broker === "string" ? body.broker : null,
      bot_version: typeof body.bot_version === "string" ? body.bot_version : null,
      terminal_name: typeof body.terminal_name === "string" ? body.terminal_name : null,
      terminal_id: typeof body.terminal_id === "string" ? body.terminal_id : null,
      machine_id: typeof body.machine_id === "string" ? body.machine_id : null,
      connection_status: connectionStatus,
      payload: body.payload && typeof body.payload === "object" ? body.payload : {},
      received_at: now,
    })

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({
      success: true,
      ...validation.response,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Heartbeat failed."
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
