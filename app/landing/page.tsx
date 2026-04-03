import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CreditCard,
  LineChart,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const plans = [
  { name: "15 dias", price: "$149", detail: "Entrada rapida para pruebas controladas, onboarding y activacion inicial." },
  { name: "1 mes", price: "$249", detail: "Licencia mensual con portal cliente, metricas y renovacion estructurada." },
  { name: "3 meses", price: "$599", detail: "Formato premium para continuidad operativa y experiencia SaaS completa." },
]

const pillars = [
  {
    icon: LockKeyhole,
    title: "Licencia online",
    text: "Cada cuenta opera con licencia vinculada, expiracion clara y validacion automatica desde la web.",
  },
  {
    icon: Bot,
    title: "Bot sincronizado",
    text: "Heartbeat, snapshots y actividad llegan al portal sin tocar la logica interna del EA.",
  },
  {
    icon: CreditCard,
    title: "Billing preparado",
    text: "Planes, renovaciones, historial y base lista para PayPal, cripto y automatizacion comercial.",
  },
]

const workflow = [
  "El cliente crea su cuenta y recibe acceso al portal.",
  "La licencia se activa y se vincula con su cuenta MT5.",
  "El bot valida, sincroniza y envia metricas operativas.",
  "El dashboard muestra estado, rendimiento y renovaciones.",
]

const portalHighlights = [
  { label: "Licencia", value: "Activa", detail: "Expira el 2 may 2026" },
  { label: "Heartbeat", value: "Online", detail: "Sincronizacion cada 30s" },
  { label: "Equity", value: "$10,318.87", detail: "Flotante +$73.53" },
  { label: "Profit 30d", value: "$845.22", detail: "Win rate 75.0%" },
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,87,168,0.26),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.07),transparent_24%),linear-gradient(180deg,rgba(7,10,18,0.92),rgba(7,10,18,1))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:76px_76px]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <AnimatedLogo size="md" className="w-40 sm:w-52" />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="#producto" className="rounded-full px-4 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground">
              Producto
            </Link>
            <Link href="#portal" className="rounded-full px-4 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground">
              Portal
            </Link>
            <Link href="#planes" className="rounded-full px-4 py-2 text-muted-foreground transition hover:bg-white/5 hover:text-foreground">
              Planes
            </Link>
            <Button asChild variant="ghost" className="text-foreground/80 hover:text-foreground">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="btn-glass-institutional">
              <Link href="/register">Crear cuenta</Link>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-18">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">
              <Radio className="size-3.5 text-chart-2" /> Nuevo SaaS operativo
            </div>

            <div className="space-y-4">
              <h1 className="font-display max-w-5xl text-4xl leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
                La parte comercial, la licencia y la telemetria del bot ahora viven en un solo portal
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                BellySwiss Portal convierte el bot en un producto visible: acceso del cliente, licencia online,
                sincronizacion del EA, dashboard con actividad real y base profesional para pagos y renovacion.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-w-44">
                <Link href="/register">
                  Abrir cuenta <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5">
                <Link href="/login">Entrar al portal</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <Card key={pillar.title} className="border-white/8 bg-white/[0.045] backdrop-blur-xl">
                  <CardContent className="space-y-4 p-5">
                    <pillar.icon className="size-5 text-chart-2" />
                    <div className="space-y-2">
                      <h2 className="font-display text-lg text-foreground">{pillar.title}</h2>
                      <p className="text-sm leading-6 text-muted-foreground">{pillar.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div id="portal" className="space-y-4">
            <Card className="overflow-hidden border-white/8 bg-black/30 shadow-[0_36px_120px_-50px_rgba(0,0,0,0.9)]">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Portal del cliente</p>
                    <h2 className="font-display text-2xl text-foreground">Visibilidad completa del sistema</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Estado de licencia, conexion MT5, snapshots, eventos operativos y renovaciones desde una sola vista.
                    </p>
                  </div>
                  <div className="rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-chart-1">
                    Live
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {portalHighlights.map((item) => (
                    <PanelStat key={item.label} label={item.label} value={item.value} detail={item.detail} />
                  ))}
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-display text-lg text-foreground">Que ve el cliente</p>
                      <p className="text-sm text-muted-foreground">Una experiencia SaaS clara, sin depender del bot por dentro.</p>
                    </div>
                    <BadgeCheck className="size-4 text-chart-1" />
                  </div>

                  <div className="space-y-3">
                    <FeatureRow icon={ShieldCheck} text="Licencia activa, plan contratado y fecha de expiracion visible." />
                    <FeatureRow icon={LineChart} text="Balance, equity, profit diario, semanal y mensual en el dashboard." />
                    <FeatureRow icon={Sparkles} text="Actividad reciente del bot y estado de sincronizacion en tiempo real." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section id="producto" className="grid gap-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-white/8 bg-white/[0.035] backdrop-blur-xl">
            <CardContent className="space-y-5 p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">Flujo del producto</p>
              <h2 className="font-display text-3xl text-foreground">De compra a ejecucion sin zonas grises</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                El nuevo modelo separa claramente negocio, acceso, bot y reporting para que el cliente entienda lo que compro y tu conserves control operativo.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <Card key={step} className="border-white/8 bg-black/25">
                <CardContent className="space-y-3 p-5">
                  <div className="inline-flex size-9 items-center justify-center rounded-full border border-chart-2/30 bg-chart-2/10 text-sm font-semibold text-chart-2">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="planes" className="space-y-6 py-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">Planes</p>
            <h2 className="font-display text-3xl text-foreground sm:text-4xl">Acceso por licencia, no por improvisacion</h2>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              La estructura comercial ya esta enfocada al sistema nuevo: activacion, vencimiento, renovacion y control desde el portal.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className="border-white/8 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="space-y-5 p-6">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">{plan.name}</p>
                    <p className="font-display text-4xl text-foreground">{plan.price}</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{plan.detail}</p>
                  <Button asChild variant="outline" className="w-full border-white/10 bg-white/5">
                    <Link href="/register">Empezar con {plan.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-10">
          <Card className="border-white/8 bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-white/[0.06]">
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="max-w-2xl space-y-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">Portal listo para crecer</p>
                <h2 className="font-display text-3xl text-foreground">La parte visible del producto ya puede venderse como SaaS</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  El siguiente paso natural es conectar el EA en produccion y validar el ciclo completo de licencia, heartbeat, snapshots y trade events.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">Crear cuenta</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5">
                  <Link href="/login">Entrar al portal</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  )
}

function PanelStat({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">{label}</p>
      <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function FeatureRow({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck
  text: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/6 bg-black/20 px-4 py-3">
      <Icon className="mt-0.5 size-4 text-chart-2" />
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
