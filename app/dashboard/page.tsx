import Link from "next/link"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  type LucideIcon,
  Radio,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireUser } from "@/lib/auth/server"
import { getClientPortalSnapshot } from "@/lib/saas/portal"

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not scheduled"
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function timeAgo(value: string | null | undefined) {
  if (!value) {
    return "No signal yet"
  }

  const diffMs = Date.now() - new Date(value).getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return "A few seconds ago"
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} h ago`

  return `${Math.floor(diffHours / 24)} d ago`
}

function maskLicenseKey(key: string | null | undefined) {
  if (!key) {
    return "Pending assignment"
  }

  return `${key.slice(0, 12)}...${key.slice(-4)}`
}

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "active":
      return "Active"
    case "pending":
      return "Pending"
    case "expired":
      return "Expired"
    case "suspended":
      return "Suspended"
    case "cancelled":
      return "Cancelled"
    case "blocked":
      return "Blocked"
    case "revoked":
      return "Revoked"
    default:
      return status || "Unknown"
  }
}

function statusTone(status: string | null | undefined) {
  switch (status) {
    case "active":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    case "pending":
      return "border-amber-400/30 bg-amber-400/10 text-amber-200"
    case "expired":
    case "suspended":
    case "cancelled":
    case "blocked":
    case "revoked":
      return "border-rose-400/30 bg-rose-400/10 text-rose-200"
    default:
      return "border-white/12 bg-white/[0.04] text-muted-foreground"
  }
}

function connectionTone(isOnline: boolean) {
  return isOnline
    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    : "border-amber-400/30 bg-amber-400/10 text-amber-200"
}

function daysRemainingLabel(value: string | null | undefined) {
  if (!value) {
    return "No expiry date yet"
  }

  const diffMs = new Date(value).getTime() - Date.now()
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays < 0) {
    return "Expired"
  }

  if (diffDays === 0) {
    return "Expires today"
  }

  if (diffDays === 1) {
    return "1 day left"
  }

  return `${diffDays} days left`
}

function latestEventLabel(eventTime: string | null | undefined) {
  if (!eventTime) {
    return "Waiting for the first trade event"
  }

  return `Last event ${timeAgo(eventTime)}`
}

export default async function DashboardPage() {
  const { user, client } = await requireUser()
  const snapshot = await getClientPortalSnapshot(user.id)
  const displayName = client?.full_name || client?.email || user.email || "Client"
  const isBotOnline = snapshot.latestHeartbeat?.received_at
    ? Date.now() - new Date(snapshot.latestHeartbeat.received_at).getTime() < 120000
    : false
  const latestClosedEvent = snapshot.recentTradeEvents.find((event) => event.event_type === "closed")

  if (!snapshot.license) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(140deg,rgba(15,18,28,0.96),rgba(15,18,28,0.84)),radial-gradient(circle_at_top_right,rgba(86,120,210,0.18),transparent_30%)] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill icon={Sparkles} label="New SaaS portal" tone="border-chart-2/30 bg-chart-2/10 text-chart-3" />
                <StatusPill icon={AlertCircle} label="License pending" tone="border-amber-400/30 bg-amber-400/10 text-amber-200" />
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-4xl text-foreground sm:text-5xl">
                  Your client portal is ready for the first license activation
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {displayName}, the visible SaaS layer is already prepared. As soon as the license is assigned and
                  the bot validates for the first time, this dashboard will start showing heartbeat, account
                  snapshots, trade events and billing activity.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <InlineLink href="/dashboard/settings" label="Review account status" />
                <GhostLink href="/dashboard/history" label="Open activity feed" />
              </div>
            </div>

            <div className="grid gap-3">
              <HighlightPanel
                eyebrow="Portal stack"
                title="Ready to receive live telemetry"
                detail="Licenses, heartbeat, snapshots and trade events are already wired to the new schema."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <HeroStat label="License" value="Pending" />
                <HeroStat label="Bot state" value="Awaiting sync" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            icon={KeyRound}
            title="License lifecycle"
            description="Sell access by plan, expiry and renewal instead of using a shared password."
          />
          <FeatureCard
            icon={Bot}
            title="Bot handshake"
            description="The EA will bind itself to the account login and server once validation succeeds."
          />
          <FeatureCard
            icon={Activity}
            title="Live telemetry"
            description="Balance, equity, floating profit and trade events will populate the portal automatically."
          />
          <FeatureCard
            icon={CreditCard}
            title="Billing layer"
            description="Renewals, payment status and membership windows will become visible here."
          />
        </section>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-2xl">What happens next</CardTitle>
            <CardDescription>The portal is already operating on the new SaaS architecture.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <StepCard
              step="1"
              title="Assign the license"
              detail="Create or attach the first active plan for this client."
            />
            <StepCard
              step="2"
              title="Validate the bot"
              detail="The EA calls /api/license/validate and binds the MT5 account."
            />
            <StepCard
              step="3"
              title="Start the data flow"
              detail="Heartbeat, snapshots and trade events begin filling this dashboard."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(140deg,rgba(15,18,28,0.97),rgba(15,18,28,0.82)),radial-gradient(circle_at_top_right,rgba(86,120,210,0.18),transparent_30%)] p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_26%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill icon={ShieldCheck} label={statusLabel(snapshot.license.status)} tone={statusTone(snapshot.license.status)} />
              <StatusPill icon={Radio} label={isBotOnline ? "Bot online" : "Waiting for sync"} tone={connectionTone(isBotOnline)} />
              <StatusPill icon={Clock3} label={daysRemainingLabel(snapshot.license.expires_at)} tone="border-white/12 bg-white/[0.04] text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-4xl text-foreground sm:text-5xl">
                License, bot status and operating results in one commercial portal
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                This is the visible face of the new model: the client sees the active membership, the live MT5
                connection and the latest account performance without touching the internal trading logic of the EA.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <InfoChip label="Client" value={displayName} />
              <InfoChip
                label="Bound account"
                value={
                  snapshot.binding
                    ? `${snapshot.binding.account_login} | ${snapshot.binding.account_server}`
                    : "Pending binding"
                }
              />
              <InfoChip label="License key" value={maskLicenseKey(snapshot.license.license_key)} />
            </div>

            <div className="flex flex-wrap gap-3">
              <InlineLink href="/dashboard/history" label="Open live activity" />
              <GhostLink href="/dashboard/settings" label="Review license and billing" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStat label="Current equity" value={formatMoney(snapshot.latestSnapshot?.equity)} />
              <HeroStat label="30 day profit" value={formatMoney(snapshot.metrics.monthlyProfit)} />
            </div>
            <HighlightPanel
              eyebrow="Portal health"
              title={isBotOnline ? "The bot is reporting normally" : "The license is active, but sync is waiting"}
              detail={`Heartbeat ${timeAgo(snapshot.latestHeartbeat?.received_at)}. ${latestEventLabel(latestClosedEvent?.event_time)}`}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="Account balance"
          value={formatMoney(snapshot.latestSnapshot?.balance)}
          detail={`Floating ${formatMoney(snapshot.latestSnapshot?.floating_profit)}`}
        />
        <MetricCard
          icon={BarChart3}
          label="Profit today"
          value={formatMoney(snapshot.metrics.todayProfit)}
          detail="Closed performance over the last 24 hours."
        />
        <MetricCard
          icon={Sparkles}
          label="Win rate"
          value={`${snapshot.metrics.winRate.toFixed(1)}%`}
          detail={`${snapshot.metrics.closedTrades} closed trades in the latest sample.`}
        />
        <MetricCard
          icon={Activity}
          label="Open positions"
          value={String(snapshot.metrics.openPositions)}
          detail={`Snapshot received ${timeAgo(snapshot.latestSnapshot?.received_at)}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-card/85">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">Activity feed</p>
                <CardTitle className="font-display text-2xl">Recent bot events</CardTitle>
              </div>
              <Link href="/dashboard/history" className="text-sm text-chart-3 transition hover:text-foreground">
                Full history
              </Link>
            </div>
            <CardDescription>Open, modify and close events received from the active license.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentTradeEvents.length > 0 ? (
              snapshot.recentTradeEvents.slice(0, 7).map((event) => {
                const isPositive = (event.profit ?? 0) >= 0

                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{event.symbol}</span>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${
                            event.event_type === "closed"
                              ? isPositive
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                : "border-rose-400/30 bg-rose-400/10 text-rose-200"
                              : "border-white/12 bg-white/[0.04] text-muted-foreground"
                          }`}
                        >
                          {event.event_type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.direction ? `${event.direction} | ` : ""}
                        Volume {event.volume ?? 0}
                        {event.external_ticket ? ` | Ticket ${event.external_ticket}` : ""}
                      </p>
                    </div>

                    <div className="space-y-1 text-left sm:text-right">
                      <p className={`text-lg font-semibold ${isPositive ? "text-chart-1" : "text-chart-5"}`}>
                        {formatMoney(event.profit)}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.event_time)}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <EmptyState>
                No events are visible yet. As soon as the EA sends `trade_event`, the feed will update here.
              </EmptyState>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/60 bg-card/85">
            <CardHeader className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">License cockpit</p>
              <CardTitle className="font-display text-2xl">Commercial and operational status</CardTitle>
              <CardDescription>The web handles access, visibility and billing while the EA remains autonomous.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusRow label="License plan" value={snapshot.license.plan_name} />
              <StatusRow label="Plan code" value={snapshot.license.plan_code} />
              <StatusRow label="Activated" value={formatDate(snapshot.license.activated_at)} />
              <StatusRow label="Expires" value={formatDate(snapshot.license.expires_at)} />
              <StatusRow
                label="Connection"
                value={snapshot.latestHeartbeat?.connection_status || "No connection status"}
              />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/85">
            <CardHeader className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">Billing window</p>
              <CardTitle className="font-display text-2xl">Recent renewals and payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.recentPayments.length > 0 ? (
                snapshot.recentPayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-border/50 bg-black/10 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{payment.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.plan_name || payment.plan_code || "Membership payment"}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-foreground">{formatMoney(payment.amount)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(payment.paid_at || payment.created_at)}</span>
                      <span className="uppercase tracking-[0.16em]">{payment.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState>No billing activity has been recorded for this account yet.</EmptyState>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/85">
            <CardHeader className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">Portal policy</p>
              <CardTitle className="font-display text-2xl">What the web controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <PolicyLine text="License validation, account binding and membership visibility." />
              <PolicyLine text="Live telemetry for balance, equity, floating profit and trade events." />
              <PolicyLine text="Billing readiness for renewals, status tracking and payment history." />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function StatusPill({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon
  label: string
  tone: string
}) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${tone}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

function InlineLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      {label}
      <ArrowRight className="size-4" />
    </Link>
  )
}

function GhostLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground transition hover:border-white/16 hover:bg-white/[0.08]"
    >
      {label}
    </Link>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function HighlightPanel({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string
  title: string
  detail: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">{eyebrow}</p>
      <p className="mt-3 font-display text-2xl text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-3">
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="size-5 text-chart-3" />
        </div>
        <CardTitle className="font-display text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="border-border/60 bg-card/85">
      <CardHeader className="space-y-3">
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </CardDescription>
        <CardTitle className="font-display text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-black/10 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function PolicyLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-black/10 px-4 py-3">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-chart-1" />
      <p>{text}</p>
    </div>
  )
}

function StepCard({
  step,
  title,
  detail,
}: {
  step: string
  title: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-black/10 p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-chart-3">Step {step}</p>
      <p className="mt-3 font-display text-xl text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
      {children}
    </div>
  )
}
