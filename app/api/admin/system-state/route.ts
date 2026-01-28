import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Obtener estado del sistema de un cliente
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

    const { data: state, error } = await supabase
      .from("system_state")
      .select("*")
      .eq("client_id", clientId)
      .single()

    if (error) {
      console.error("Error fetching system state:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch system state" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: state,
    })
  } catch (error) {
    console.error("System state API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Actualizar estado del sistema (activar/pausar servicio)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { client_id, is_active, is_pending, pending_amount } = body

    if (!client_id) {
      return NextResponse.json(
        { success: false, error: "client_id is required" },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof is_active === "boolean") updateData.is_active = is_active
    if (typeof is_pending === "boolean") updateData.is_pending = is_pending
    if (typeof pending_amount === "number") updateData.pending_amount = pending_amount

    const { data: state, error } = await supabase
      .from("system_state")
      .update(updateData)
      .eq("client_id", client_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating system state:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update system state" },
        { status: 500 }
      )
    }

    // Registrar actividad
    await supabase.from("activity_log").insert({
      client_id,
      action: "system_state_changed",
      details: updateData,
    })

    return NextResponse.json({
      success: true,
      data: state,
    })
  } catch (error) {
    console.error("Update system state error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
