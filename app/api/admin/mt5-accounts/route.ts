import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Generar API key segura
function generateApiKey(): string {
  return `bsw_${randomBytes(32).toString("hex")}`
}

// GET - Listar cuentas MT5
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    let query = supabase
      .from("mt5_accounts")
      .select("*, clients(name, email)")
      .order("created_at", { ascending: false })

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data: accounts, error } = await query

    if (error) {
      console.error("Error fetching MT5 accounts:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch accounts" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: accounts,
    })
  } catch (error) {
    console.error("MT5 accounts API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva cuenta MT5
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { client_id, account_id, broker, balance } = body

    if (!client_id || !account_id) {
      return NextResponse.json(
        { success: false, error: "client_id and account_id are required" },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      )
    }

    // Verificar que no existe ya una cuenta con ese account_id
    const { data: existingAccount } = await supabase
      .from("mt5_accounts")
      .select("id")
      .eq("account_id", account_id)
      .single()

    if (existingAccount) {
      return NextResponse.json(
        { success: false, error: "An account with this ID already exists" },
        { status: 400 }
      )
    }

    // Generar API key unica
    const apiKey = generateApiKey()

    // Crear cuenta MT5
    const { data: account, error: accountError } = await supabase
      .from("mt5_accounts")
      .insert({
        client_id,
        account_id,
        broker: broker || "Deriv",
        balance: balance || 0,
        equity: balance || 0,
        api_key: apiKey,
        is_active: true,
      })
      .select()
      .single()

    if (accountError) {
      console.error("Error creating MT5 account:", accountError)
      return NextResponse.json(
        { success: false, error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...account,
        api_key: apiKey, // Mostrar API key solo en la creacion
      },
      message: "Account created. Save the API key - it won't be shown again.",
    })
  } catch (error) {
    console.error("Create MT5 account error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar cuenta MT5
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, is_active, broker } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (typeof is_active === "boolean") updateData.is_active = is_active
    if (broker) updateData.broker = broker

    const { data: account, error } = await supabase
      .from("mt5_accounts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating MT5 account:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: account,
    })
  } catch (error) {
    console.error("Update MT5 account error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Regenerar API key
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("id")
    const action = searchParams.get("action")

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      )
    }

    if (action === "regenerate_key") {
      const newApiKey = generateApiKey()

      const { data: account, error } = await supabase
        .from("mt5_accounts")
        .update({ api_key: newApiKey })
        .eq("id", accountId)
        .select()
        .single()

      if (error) {
        console.error("Error regenerating API key:", error)
        return NextResponse.json(
          { success: false, error: "Failed to regenerate API key" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...account,
          api_key: newApiKey,
        },
        message: "API key regenerated. Save the new key - it won't be shown again.",
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Regenerate API key error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
