import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export type ClientRecord = {
  id: string
  email: string | null
  full_name: string | null
  role: "client" | "admin"
  is_active: boolean
}

export type LicenseRecord = {
  id: string
  client_id: string
  license_key: string
  plan_code: string
  plan_name: string
  duration_days: number
  status: "pending" | "active" | "expired" | "suspended" | "cancelled"
  starts_at: string | null
  activated_at: string | null
  expires_at: string | null
  last_validated_at: string | null
  auto_renew: boolean
  metadata: Record<string, unknown> | null
}

export type LicenseBindingRecord = {
  id: string
  client_id: string
  license_id: string
  account_login: string
  account_server: string
  broker: string | null
  bot_version: string | null
  terminal_name: string | null
  terminal_id: string | null
  machine_id: string | null
  status: "active" | "blocked" | "revoked"
  first_bound_at: string
  last_seen_at: string | null
}

export type BotHeartbeatRecord = {
  id: string
  client_id: string
  license_id: string
  binding_id: string | null
  account_login: string
  account_server: string
  broker: string | null
  bot_version: string | null
  terminal_name: string | null
  terminal_id: string | null
  machine_id: string | null
  connection_status: string
  received_at: string
}

export type BotSnapshotRecord = {
  id: string
  client_id: string
  license_id: string
  binding_id: string | null
  account_login: string
  account_server: string
  balance: number | null
  equity: number | null
  floating_profit: number | null
  realized_profit: number | null
  open_positions: number | null
  currency: string | null
  received_at: string
}

export type BotTradeEventRecord = {
  id: string
  client_id: string
  license_id: string
  binding_id: string | null
  event_type: "opened" | "modified" | "closed"
  external_ticket: string
  symbol: string
  direction: string | null
  volume: number | null
  entry_price: number | null
  close_price: number | null
  profit: number | null
  swap: number | null
  commission: number | null
  event_time: string
  received_at: string
}

export type BillingPaymentRecord = {
  id: string
  client_id: string
  license_id: string | null
  provider: string
  provider_reference: string | null
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled" | "expired"
  amount: number
  currency: string
  plan_code: string | null
  plan_name: string | null
  duration_days: number | null
  paid_at: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
}

export type ClientPortalSnapshot = {
  client: ClientRecord
  license: LicenseRecord | null
  binding: LicenseBindingRecord | null
  latestHeartbeat: BotHeartbeatRecord | null
  latestSnapshot: BotSnapshotRecord | null
  recentTradeEvents: BotTradeEventRecord[]
  recentPayments: BillingPaymentRecord[]
  metrics: {
    todayProfit: number
    weeklyProfit: number
    monthlyProfit: number
    closedTrades: number
    winRate: number
    openPositions: number
  }
}

function calculateMetrics(
  recentTradeEvents: BotTradeEventRecord[],
  latestSnapshot: BotSnapshotRecord | null,
) {
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  const closedEvents = recentTradeEvents.filter((event) => event.event_type === "closed")

  const profitSince = (days: number) =>
    closedEvents
      .filter((event) => now - new Date(event.event_time).getTime() <= days * oneDayMs)
      .reduce((sum, event) => sum + (event.profit ?? 0), 0)

  const winningTrades = closedEvents.filter((event) => (event.profit ?? 0) > 0).length
  const winRate = closedEvents.length > 0 ? (winningTrades / closedEvents.length) * 100 : 0

  return {
    todayProfit: profitSince(1),
    weeklyProfit: profitSince(7),
    monthlyProfit: profitSince(30),
    closedTrades: closedEvents.length,
    winRate,
    openPositions: latestSnapshot?.open_positions ?? 0,
  }
}

export async function getClientPortalSnapshot(clientId: string): Promise<ClientPortalSnapshot> {
  const admin = createAdminClient()

  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id, email, full_name, role, is_active")
    .eq("id", clientId)
    .single()

  if (clientError) {
    throw new Error(`Failed to load client: ${clientError.message}`)
  }

  const { data: license, error: licenseError } = await admin
    .from("licenses")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (licenseError) {
    throw new Error(`Failed to load license: ${licenseError.message}`)
  }

  if (!license) {
    return {
      client: client as ClientRecord,
      license: null,
      binding: null,
      latestHeartbeat: null,
      latestSnapshot: null,
      recentTradeEvents: [],
      recentPayments: [],
      metrics: {
        todayProfit: 0,
        weeklyProfit: 0,
        monthlyProfit: 0,
        closedTrades: 0,
        winRate: 0,
        openPositions: 0,
      },
    }
  }

  const [bindingResult, heartbeatResult, snapshotResult, tradeEventsResult, paymentsResult] =
    await Promise.all([
      admin.from("license_bindings").select("*").eq("license_id", license.id).maybeSingle(),
      admin
        .from("bot_heartbeats")
        .select("*")
        .eq("license_id", license.id)
        .order("received_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("bot_snapshots")
        .select("*")
        .eq("license_id", license.id)
        .order("received_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("bot_trade_events")
        .select("*")
        .eq("license_id", license.id)
        .order("event_time", { ascending: false })
        .limit(100),
      admin
        .from("billing_payments")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

  if (bindingResult.error) {
    throw new Error(`Failed to load license binding: ${bindingResult.error.message}`)
  }

  if (heartbeatResult.error) {
    throw new Error(`Failed to load latest heartbeat: ${heartbeatResult.error.message}`)
  }

  if (snapshotResult.error) {
    throw new Error(`Failed to load latest snapshot: ${snapshotResult.error.message}`)
  }

  if (tradeEventsResult.error) {
    throw new Error(`Failed to load trade events: ${tradeEventsResult.error.message}`)
  }

  if (paymentsResult.error) {
    throw new Error(`Failed to load billing payments: ${paymentsResult.error.message}`)
  }

  const recentTradeEvents = (tradeEventsResult.data ?? []) as BotTradeEventRecord[]
  const latestSnapshot = (snapshotResult.data ?? null) as BotSnapshotRecord | null

  return {
    client: client as ClientRecord,
    license: license as LicenseRecord,
    binding: (bindingResult.data ?? null) as LicenseBindingRecord | null,
    latestHeartbeat: (heartbeatResult.data ?? null) as BotHeartbeatRecord | null,
    latestSnapshot,
    recentTradeEvents,
    recentPayments: (paymentsResult.data ?? []) as BillingPaymentRecord[],
    metrics: calculateMetrics(recentTradeEvents, latestSnapshot),
  }
}
