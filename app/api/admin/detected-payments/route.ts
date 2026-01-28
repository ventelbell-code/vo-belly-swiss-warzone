import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - List all detected payments
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: payments, error } = await supabase
      .from("detected_payments")
      .select(`
        *,
        clients (
          id,
          name,
          email,
          service_debt,
          service_status
        )
      `)
      .order("block_timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[v0] Error fetching detected payments:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Confirm a detected payment
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { paymentId, clientId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get the payment details
    const { data: payment, error: paymentError } = await supabase
      .from("detected_payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Use provided clientId or the one from payment
    const targetClientId = clientId || payment.client_id;

    if (!targetClientId) {
      return NextResponse.json(
        { error: "No client associated with this payment" },
        { status: 400 }
      );
    }

    // Start transaction: update payment status and client status
    // Update payment status to CONFIRMADO
    const { error: updatePaymentError } = await supabase
      .from("detected_payments")
      .update({
        status: "CONFIRMADO",
        confirmed_at: new Date().toISOString(),
        client_id: targetClientId,
      })
      .eq("id", paymentId);

    if (updatePaymentError) {
      console.error("[v0] Error updating payment:", updatePaymentError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // Update client status to ACTIVO and reset debt
    const { error: updateClientError } = await supabase
      .from("clients")
      .update({
        service_status: "ACTIVO",
        service_debt: 0,
      })
      .eq("id", targetClientId);

    if (updateClientError) {
      console.error("[v0] Error updating client:", updateClientError);
      return NextResponse.json(
        { error: "Failed to update client status" },
        { status: 500 }
      );
    }

    // Record payment in payments table
    const { error: recordPaymentError } = await supabase
      .from("payments")
      .insert({
        client_id: targetClientId,
        amount: payment.amount_usdt,
        type: "usdt_trc20",
        status: "completed",
        reference: payment.tx_id,
        notes: `Pago USDT detectado automaticamente - TxID: ${payment.tx_id}`,
      });

    if (recordPaymentError) {
      console.error("[v0] Error recording payment:", recordPaymentError);
    }

    // Log activity
    await supabase.from("activity_log").insert({
      action: "PAYMENT_CONFIRMED",
      details: `Pago USDT confirmado: $${payment.amount_usdt.toFixed(2)} - TxID: ${payment.tx_id.slice(0, 16)}...`,
      client_id: targetClientId,
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed and client activated",
    });
  } catch (error) {
    console.error("[v0] Error confirming payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Assign a payment to a client manually
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { paymentId, clientId } = await request.json();

    if (!paymentId || !clientId) {
      return NextResponse.json(
        { error: "Payment ID and Client ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("detected_payments")
      .update({ client_id: clientId })
      .eq("id", paymentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Payment assigned to client",
    });
  } catch (error) {
    console.error("[v0] Error assigning payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
