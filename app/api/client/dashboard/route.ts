import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      // Return demo data if client not found
      return NextResponse.json({
        client: {
          id: clientId,
          name: "Cliente Demo",
          service_status: "EN ESPERA DE PAGO",
          service_debt: 150,
          profit_share_percentage: 30,
          stats: {
            total_profit: 2847.5,
            total_operations: 156,
            win_rate: 73.2,
            this_month_profit: 523.4,
            pending_commission: 157.02,
          },
        },
      });
    }

    // Get operations stats
    const { data: operations } = await supabase
      .from("operations")
      .select("profit, result")
      .eq("client_id", clientId);

    // Calculate stats
    const totalProfit =
      operations?.reduce((sum, op) => sum + (op.profit || 0), 0) || 0;
    const totalOperations = operations?.length || 0;
    const winningOps =
      operations?.filter((op) => op.result === "WIN").length || 0;
    const winRate =
      totalOperations > 0 ? (winningOps / totalOperations) * 100 : 0;

    // Get this month's operations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthOperations } = await supabase
      .from("operations")
      .select("profit")
      .eq("client_id", clientId)
      .gte("close_time", startOfMonth.toISOString());

    const thisMonthProfit =
      monthOperations?.reduce((sum, op) => sum + (op.profit || 0), 0) || 0;

    // Calculate pending commission
    const pendingCommission =
      thisMonthProfit * ((client.profit_share_percentage || 30) / 100);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        service_status: client.service_status,
        service_debt: client.service_debt || 0,
        profit_share_percentage: client.profit_share_percentage || 30,
        stats: {
          total_profit: totalProfit,
          total_operations: totalOperations,
          win_rate: Math.round(winRate * 10) / 10,
          this_month_profit: thisMonthProfit,
          pending_commission: Math.round(pendingCommission * 100) / 100,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
