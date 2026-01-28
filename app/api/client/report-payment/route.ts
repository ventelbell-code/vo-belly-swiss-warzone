import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update client status to PAGO REPORTADO
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        service_status: "PAGO REPORTADO",
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (updateError) {
      console.error("Error updating client status:", updateError);
      return NextResponse.json(
        { error: "Failed to report payment" },
        { status: 500 }
      );
    }

    // Log the activity
    await supabase.from("activity_log").insert({
      client_id: clientId,
      action: "payment_reported",
      details: {
        previous_status: "EN ESPERA DE PAGO",
        new_status: "PAGO REPORTADO",
        method: "USDT_TRC20",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment reported successfully",
    });
  } catch (error) {
    console.error("Error in report-payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
