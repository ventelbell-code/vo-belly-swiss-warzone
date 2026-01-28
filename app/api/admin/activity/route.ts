import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET - Obtener log de actividad
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const clientId = searchParams.get("client_id")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("activity_log")
      .select("*, clients(name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data: activities, error, count } = await query

    if (error) {
      console.error("Error fetching activity log:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch activity log" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      },
    })
  } catch (error) {
    console.error("Activity log API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
