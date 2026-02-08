import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const today = new Date().toISOString().slice(0, 10);

    // operaciones de hoy
    const { data: tradesToday } = await supabase
      .from("trades")
      .select("profit")
      .gte("created_at", `${today}T00:00:00`);

    const tradesCount = tradesToday?.length || 0;
    const pnlToday =
      tradesToday?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;

    // última operación
    const { data: lastTrade } = await supabase
      .from("trades")
      .select("symbol, profit, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      status: "ACTIVE",
      tradesToday: tradesCount,
      pnlToday: Number(pnlToday.toFixed(2)),
      lastTrade: lastTrade ?? null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[API STATS ERROR]", err);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
