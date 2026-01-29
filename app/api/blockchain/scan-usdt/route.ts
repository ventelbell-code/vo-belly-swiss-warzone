import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// USDT TRC20 Contract Address on TRON
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
// Our wallet address to monitor
const WALLET_ADDRESS = "TQhRqwKtmwWGoSwZLZazPBRWD4sVFsnRsV";
// TronGrid API endpoint
const TRONGRID_API = "https://api.trongrid.io";

interface TRC20Transfer {
  transaction_id: string;
  token_info: {
    symbol: string;
    address: string;
    decimals: number;
  };
  from: string;
  to: string;
  value: string;
  block_timestamp: number;
}

// Convert TRON address to hex format for comparison
function toHex(address: string): string {
  return address;
}

export async function POST() {
  try {
    const supabase = await createClient();

    // Get the last scanned timestamp
    const { data: scanState } = await supabase
      .from("blockchain_scan_state")
      .select("*")
      .eq("wallet_address", WALLET_ADDRESS)
      .single();

    const lastScannedTimestamp = scanState?.last_scanned_timestamp || 0;

    // Fetch TRC20 transfers to our wallet from TronGrid
    const response = await fetch(
      `${TRONGRID_API}/v1/accounts/${WALLET_ADDRESS}/transactions/trc20?only_to=true&limit=50&contract_address=${USDT_CONTRACT}&min_timestamp=${lastScannedTimestamp}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("[v0] TronGrid API error:", response.status);
      return NextResponse.json(
        { error: "Failed to fetch from TronGrid" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const transfers: TRC20Transfer[] = data.data || [];

    if (transfers.length === 0) {
      return NextResponse.json({
        message: "No new transactions found",
        scanned: 0,
      });
    }

    // Get all clients with pending payments
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, email, service_debt, service_status")
      .gt("service_debt", 0);

    const clientsMap = new Map(clients?.map((c) => [c.id, c]) || []);

    let newPaymentsDetected = 0;
    let latestTimestamp = lastScannedTimestamp;

    for (const transfer of transfers) {
      // Skip if already processed
      const { data: existing } = await supabase
        .from("detected_payments")
        .select("id")
        .eq("tx_id", transfer.transaction_id)
        .single();

      if (existing) continue;

      // Calculate amount (USDT has 6 decimals)
      const amount = Number(transfer.value) / 1_000_000;

      // Update latest timestamp
      if (transfer.block_timestamp > latestTimestamp) {
        latestTimestamp = transfer.block_timestamp;
      }

      // Try to match with a client based on amount
      let matchedClientId: string | null = null;
      let matchedClient: (typeof clients)[0] | null = null;

      for (const client of clients || []) {
        // Match if amount is within 1% of debt or greater
        if (amount >= client.service_debt * 0.99) {
          matchedClientId = client.id;
          matchedClient = client;
          break;
        }
      }

      // Insert detected payment
      const { error: insertError } = await supabase
        .from("detected_payments")
        .insert({
          tx_id: transfer.transaction_id,
          from_address: transfer.from,
          to_address: transfer.to,
          amount_usdt: amount,
          block_timestamp: transfer.block_timestamp,
          client_id: matchedClientId,
          status: "DETECTADO",
          raw_data: transfer,
        });

      if (!insertError) {
        newPaymentsDetected++;

        // Log activity if matched to a client
        if (matchedClient) {
          await supabase.from("activity_log").insert({
            action: "PAYMENT_DETECTED",
            details: `Pago USDT detectado: $${amount.toFixed(2)} - TxID: ${transfer.transaction_id.slice(0, 16)}...`,
            client_id: matchedClientId,
          });
        }
      }
    }

    // Update scan state
    if (latestTimestamp > lastScannedTimestamp) {
      await supabase
        .from("blockchain_scan_state")
        .upsert({
          wallet_address: WALLET_ADDRESS,
          last_scanned_timestamp: latestTimestamp + 1,
          last_scanned_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      message: "Scan completed",
      scanned: transfers.length,
      newPaymentsDetected,
    });
  } catch (error) {
    console.error("[v0] Blockchain scan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check scan status
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: scanState } = await supabase
      .from("blockchain_scan_state")
      .select("*")
      .eq("wallet_address", WALLET_ADDRESS)
      .single();

    return NextResponse.json({
      walletAddress: WALLET_ADDRESS,
      lastScannedAt: scanState?.last_scanned_at || null,
      lastScannedTimestamp: scanState?.last_scanned_timestamp || 0,
    });
  } catch (error) {
    console.error("[v0] Error fetching scan status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
