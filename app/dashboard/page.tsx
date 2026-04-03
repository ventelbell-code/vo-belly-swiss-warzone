"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, Bot, CreditCard, KeyRound, LineChart, LogOut, Radio, ShieldCheck, Sparkles, Wallet, type LucideIcon } from "lucide-react"

import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type PortalState = {
  name: string
  license: any | null
  binding: any | null
  heartbeat: any | null
  snapshot: any | null
  trades: any[]
  payments: any[]
}

function money(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value ?? 0)
}

function when(value: string | null | undefined) {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-CH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

function ago(value: string | null | undefined) {
  if (!value) return "Sin senal"
  const diff = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (diff < 1) return "Hace segundos"
  if (diff < 60) return `Hace ${diff} min`
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`
  return `Hace ${Math.floor(diff / 1440)} d`
}

function pillTone(status: string | null | undefined) {
  if (status === "active") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
  if (status === "pending") return "border-amber-400/30 bg-amber-400/10 text-amber-200"
  return "border-white/12 bg-white/[0.04] text-muted-foreground"
}

function computeMetrics(trades: any[], snapshot: any | null) {
  const closed = trades.filter((trade) => trade.event_type === "closed")
  const day = closed.filter((trade) => Date.now() - new Date(trade.event_time).getTime() <= 86400000)
  const month = closed.filter((trade) => Date.now() - new Date(trade.event_time).getTime() <= 30 * 86400000)
  const wins = closed.filter((trade) => (trade.profit ?? 0) > 0).length

  return {
    todayProfit: day.reduce((sum, trade) => sum + (trade.profit ?? 0), 0),
    monthlyProfit: month.reduce((sum, trade) => sum + (trade.profit ?? 0), 0),
    winRate: closed.length > 0 ? (wins / closed.length) * 100 : 0,
    closedTrades: closed.length,
    openPositions: snapshot?.open_positions ?? 0,
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [portal, setPortal] = useState<PortalState | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPortal() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return
      if (!user) {
        router.replace("/login?next=/dashboard")
        return
      }

      const { data: clientRow, error: clientError } = await supabase.from("clients").select("full_name, email").eq("id", user.id).maybeSingle()
      if (clientError) {
        setError(clientError.message)
        setLoading(false)
        return
      }

      const { data: license, error: licenseError } = await supabase
        .from("licenses")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (licenseError) {
        setError(licenseError.message)
        setLoading(false)
        return
      }

      let binding = null
      let heartbeat = null
      let snapshot = null
      let trades: any[] = []
      let payments: any[] = []

      if (license) {
        const [bindingResult, heartbeatResult, snapshotResult, tradesResult, paymentsResult] = await Promise.all([
          supabase.from("license_bindings").select("account_login, account_server, broker").eq("license_id", license.id).maybeSingle(),
          supabase.from("bot_heartbeats").select("connection_status, received_at").eq("license_id", license.id).order("received_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("bot_snapshots").select("balance, equity, floating_profit, open_positions, received_at").eq("license_id", license.id).order("received_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("bot_trade_events").select("id, event_type, external_ticket, symbol, direction, volume, profit, event_time").eq("license_id", license.id).order("event_time", { ascending: false }).limit(6),
          supabase.from("billing_payments").select("id, provider, amount, status, plan_name, plan_code, paid_at, created_at").eq("client_id", user.id).order("created_at", { ascending: false }).limit(4),
        ])

        if (bindingResult.error || heartbeatResult.error || snapshotResult.error || tradesResult.error || paymentsResult.error) {
          setError(bindingResult.error?.message || heartbeatResult.error?.message || snapshotResult.error?.message || tradesResult.error?.message || paymentsResult.error?.message || "No se pudo cargar el portal.")
        } else {
          binding = bindingResult.data ?? null
          heartbeat = heartbeatResult.data ?? null
          snapshot = snapshotResult.data ?? null
          trades = tradesResult.data ?? []
          payments = paymentsResult.data ?? []
        }
      }

      if (!active) return
      setPortal({
        name: clientRow?.full_name || clientRow?.email || user.email || "Cliente",
        license,
        binding,
        heartbeat,
        snapshot,
        trades,
        payments,
      })
      setLoading(false)
    }

    loadPortal()
    return () => {
      active = false
    }
  }, [router, supabase])

  async function signOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const metrics = computeMetrics(portal?.trades ?? [], portal?.snapshot ?? null)
  const botOnline = portal?.heartbeat?.received_at ? Date.now() - new Date(portal.heartbeat.received_at).getTime() < 120000 : false

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-[linear-gradient(140deg,rgba(15,18,28,0.97),rgba(15,18,28,0.82)),radial-gradient(circle_at_top_right,rgba(86,120,210,0.18),transparent_30%)] p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_26%)]" />
        <div className="relative space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <AnimatedLogo size="md" className="w-40 sm:w-52" />
            <Button onClick={signOut} variant="outline" className="border-white/10 bg-white/[0.04]">
              <LogOut className="mr-2 size-4" />
              {signingOut ? "Saliendo..." : "Cerrar sesion"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${pillTone(portal?.license?.status)}`}>
              <ShieldCheck className="size-3.5" />
              {portal?.license ? portal.license.status : "Sin licencia"}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${botOnline ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/12 bg-white/[0.04] text-muted-foreground"}`}>
              <Radio className="size-3.5" />
              {botOnline ? "Bot online" : "Esperando sync"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3.5" />
              {portal?.license?.expires_at ? when(portal.license.expires_at) : "Sin vencimiento"}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-4xl text-foreground sm:text-5xl">Dashboard SaaS de licencias, actividad del bot y resultados</h1>
            <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
              Aqui es donde el cliente ve el sistema nuevo de verdad: licencia activa, estado del bot, telemetria recibida y pagos visibles en una sola experiencia.
            </p>
          </div>

          {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Chip label="Cliente" value={portal?.name || (loading ? "Cargando..." : "Cliente")} />
            <Chip label="Cuenta vinculada" value={portal?.binding ? `${portal.binding.account_login} | ${portal.binding.account_server}` : "Pendiente"} />
            <Chip label="Licencia" value={portal?.license ? `${portal.license.plan_name} | ${portal.license.plan_code}` : "Sin plan"} />
            <Chip label="Heartbeat" value={loading ? "Sincronizando..." : ago(portal?.heartbeat?.received_at)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Balance" value={loading ? "..." : money(portal?.snapshot?.balance)} detail={`Equity ${money(portal?.snapshot?.equity)}`} />
        <StatCard icon={LineChart} label="Profit diario" value={loading ? "..." : money(metrics.todayProfit)} detail={`Profit 30d ${money(metrics.monthlyProfit)}`} />
        <StatCard icon={Sparkles} label="Win rate" value={loading ? "..." : `${metrics.winRate.toFixed(1)}%`} detail={`${metrics.closedTrades} trades cerrados`} />
        <StatCard icon={Activity} label="Posiciones abiertas" value={loading ? "..." : String(metrics.openPositions)} detail={`Snapshot ${ago(portal?.snapshot?.received_at)}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-card/85">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Actividad reciente del bot</CardTitle>
            <CardDescription>Eventos que el EA va enviando al portal del cliente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {portal?.trades?.length ? portal.trades.map((trade) => (
              <div key={trade.id} className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{trade.symbol} <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{trade.event_type}</span></p>
                  <p className="text-sm text-muted-foreground">{trade.direction || "Direccion"} | Lote {trade.volume ?? 0} | Ticket {trade.external_ticket}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-lg font-semibold ${(trade.profit ?? 0) >= 0 ? "text-chart-1" : "text-chart-5"}`}>{money(trade.profit)}</p>
                  <p className="text-sm text-muted-foreground">{when(trade.event_time)}</p>
                </div>
              </div>
            )) : <EmptyState>{loading ? "Cargando actividad..." : "Aun no hay trade_event visibles en el portal."}</EmptyState>}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/60 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Licencia y conexion</CardTitle>
              <CardDescription>Acceso comercial y estado operativo de la cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Plan" value={portal?.license?.plan_name || "Sin licencia"} />
              <Row label="Codigo" value={portal?.license?.plan_code || "Sin codigo"} />
              <Row label="Activada" value={when(portal?.license?.activated_at)} />
              <Row label="Vence" value={when(portal?.license?.expires_at)} />
              <Row label="Conexion" value={portal?.heartbeat?.connection_status || "Sin heartbeat"} />
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Pagos y renovaciones</CardTitle>
              <CardDescription>Ventana visible de billing para el modelo por membresia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {portal?.payments?.length ? portal.payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-border/50 bg-black/10 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{payment.provider}</p>
                      <p className="text-sm text-muted-foreground">{payment.plan_name || payment.plan_code || "Pago de membresia"}</p>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{money(payment.amount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>{when(payment.paid_at || payment.created_at)}</span>
                    <span className="uppercase tracking-[0.16em]">{payment.status}</span>
                  </div>
                </div>
              )) : <EmptyState>{loading ? "Cargando billing..." : "Aun no hay pagos visibles."}</EmptyState>}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Navegacion SaaS</CardTitle>
              <CardDescription>Accesos del area cliente del sistema nuevo.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild><Link href="/dashboard/history">Historial</Link></Button>
              <Button asChild variant="outline" className="border-white/10 bg-white/[0.04]"><Link href="/dashboard/settings">Cuenta y licencia</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border/50 bg-black/20 px-4 py-3"><p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">{label}</p><p className="mt-1 font-medium text-foreground">{value}</p></div>
}

function StatCard({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return <Card className="border-border/60 bg-card/85"><CardHeader className="space-y-3"><CardDescription className="flex items-center gap-2"><Icon className="size-4" />{label}</CardDescription><CardTitle className="font-display text-3xl">{value}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{detail}</CardContent></Card>
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-black/10 px-4 py-3"><span className="text-sm text-muted-foreground">{label}</span><span className="text-right font-medium text-foreground">{value}</span></div>
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">{children}</div>
}
