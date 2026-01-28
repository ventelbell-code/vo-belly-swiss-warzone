import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { clientId, amount } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current client data
    const { data: client, error: fetchError } = await supabase
      .from("clients")
      .select("service_debt, name")
      .eq("id", clientId)
      .single();

    if (fetchError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Update client status to ACTIVO and reset debt
    const { error: updateError } = await supabase
      .from("clients")
      .update({
        service_status: "ACTIVO",
        service_debt: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (updateError) {
      console.error("Error updating client status:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm payment" },
        { status: 500 }
      );
    }

    // Record the payment
    const paymentAmount = amount || client.service_debt || 0;
    if (paymentAmount > 0) {
      await supabase.from("payments").insert({
        client_id: clientId,
        amount: paymentAmount,
        currency: "USDT",
        payment_method: "TRC20",
        status: "completed",
        notes: "Pago confirmado manualmente por administrador",
      });
    }

    // Log the activity
    await supabase.from("activity_log").insert({
      client_id: clientId,
      action: "payment_confirmed",
      details: {
        previous_status: "PAGO REPORTADO",
        new_status: "ACTIVO",
        amount: paymentAmount,
        currency: "USDT",
        confirmed_by: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully",
    });
  } catch (error) {
    console.error("Error in confirm-payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
