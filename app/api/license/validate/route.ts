import { NextResponse } from "next/server"

import { validateBotLicense } from "@/lib/saas/bot"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await validateBotLicense(body, { allowBind: true })

    return NextResponse.json(result.response, {
      status: result.valid ? 200 : 200,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "License validation failed."
    return NextResponse.json(
      {
        valid: false,
        can_trade: false,
        status: "server_error",
        message,
      },
      { status: 500 },
    )
  }
}
