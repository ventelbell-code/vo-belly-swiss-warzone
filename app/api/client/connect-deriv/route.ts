import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Generar API key segura
function generateApiKey(): string {
  return `bsw_${randomBytes(32).toString("hex")}`
}

// Servidores Deriv conocidos (autodeteccion)
const DERIV_SERVERS = {
  real: "Deriv-Server",
  demo: "Deriv-Demo",
}

// POST - Conectar cuenta Deriv del cliente
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { client_id, account_id } = body

    if (!client_id || !account_id) {
      return NextResponse.json(
        { success: false, error: "client_id y account_id son requeridos" },
        { status: 400 }
      )
    }

    // Validar que account_id sea numerico
    if (!/^\d+$/.test(account_id.toString())) {
      return NextResponse.json(
        { success: false, error: "El Account ID debe ser numerico" },
        { status: 400 }
      )
    }

    // Verificar que el cliente existe
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("id", client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si el cliente ya tiene una cuenta conectada
    const { data: existingAccount } = await supabase
      .from("mt5_accounts")
      .select("id, account_id")
      .eq("client_id", client_id)
      .eq("is_active", true)
      .single()

    if (existingAccount) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Ya tienes una cuenta conectada. Contacta al soporte si necesitas cambiarla." 
        },
        { status: 400 }
      )
    }

    // Verificar que no existe ya una cuenta con ese account_id
    const { data: duplicateAccount } = await supabase
      .from("mt5_accounts")
      .select("id")
      .eq("account_id", account_id)
      .single()

    if (duplicateAccount) {
      return NextResponse.json(
        { success: false, error: "Esta cuenta ya esta registrada en el sistema" },
        { status: 400 }
      )
    }

    // Generar API key unica
    const apiKey = generateApiKey()

    // Crear cuenta MT5 (siempre REAL, broker Deriv, servidor autodetectado)
    const { data: account, error: accountError } = await supabase
      .from("mt5_accounts")
      .insert({
        client_id,
        account_id: account_id.toString(),
        broker: "Deriv",
        server: DERIV_SERVERS.real,
        account_type: "REAL",
        balance: 0,
        equity: 0,
        api_key: apiKey,
        is_active: true,
      })
      .select()
      .single()

    if (accountError) {
      console.error("Error creating MT5 account:", accountError)
      return NextResponse.json(
        { success: false, error: "Error al conectar la cuenta. Intenta de nuevo." },
        { status: 500 }
      )
    }

    // Registrar actividad
    await supabase.from("activity_log").insert({
      client_id,
      action: "DERIV_ACCOUNT_CONNECTED",
      details: { account_id, broker: "Deriv" },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        account_id: account.account_id,
        broker: account.broker,
        is_active: account.is_active,
      },
      message: "Cuenta Deriv conectada correctamente",
    })
  } catch (error) {
    console.error("Connect Deriv error:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// GET - Obtener cuenta conectada del cliente
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "client_id es requerido" },
        { status: 400 }
      )
    }

    const { data: account, error } = await supabase
      .from("mt5_accounts")
      .select("id, account_id, broker, balance, equity, is_active, created_at")
      .eq("client_id", clientId)
      .eq("is_active", true)
      .single()

    if (error || !account) {
      return NextResponse.json({
        success: true,
        data: null,
        connected: false,
      })
    }

    return NextResponse.json({
      success: true,
      data: account,
      connected: true,
    })
  } catch (error) {
    console.error("Get connected account error:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
