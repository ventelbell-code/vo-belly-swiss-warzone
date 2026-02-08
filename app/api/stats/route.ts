import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fecha de hoy (YYYY-MM-DD)
    const today = new Date().toISOString().slice(0, 10);

    // Última operación
    const { data: lastTrade } = await supabase
      .from("trades")
      .select("symbol, profit, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Operaciones de hoy
    const { data: tradesToday } = await supabase
      .from("trades")
      .select("profit")
      .gte("created_at", `${today}T00:00:00`);

    const tradesCount = tradesToday?.length || 0;

    const pnlToday =
      tradesToday?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;

    return NextResponse.json({
      status: "ACTIVE",
      tradesToday: tradesCount,
      pnlToday: Number(pnlToday.toFixed(2)),
      lastTrade: lastTrade
        ? {
            symbol: lastTrade.symbol,
            profit: lastTrade.profit,
            time: lastTrade.created_at,
          }
        : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[STATS API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
