"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Bot, CreditCard, ShieldCheck } from "lucide-react"

import { AnimatedLogo } from "@/components/animated-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const portalBullets = [
  {
    icon: ShieldCheck,
    title: "Licencia visible",
    text: "Estado, expiracion y plan contratados en un solo lugar.",
  },
  {
    icon: Bot,
    title: "Bot conectado",
    text: "Heartbeat, actividad y telemetria recibidos desde MT5.",
  },
  {
    icon: CreditCard,
    title: "Membresia lista",
    text: "Renovaciones, historial y billing preparados para crecer.",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(51,87,168,0.22),transparent_24%),linear-gradient(180deg,rgba(7,10,18,0.9),rgba(7,10,18,1))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-8">
          <div className="space-y-5">
            <AnimatedLogo size="lg" className="w-52 sm:w-72" />
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/70">Acceso SaaS</p>
              <h1 className="font-display max-w-xl text-4xl leading-tight text-foreground sm:text-5xl">
                Entra al portal donde vive la licencia, el bot y el rendimiento
              </h1>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Este acceso ya no es solo una pantalla de login. Es la entrada al sistema nuevo: membresia,
                telemetria del EA y experiencia cliente real.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {portalBullets.map((item) => (
              <Card key={item.title} className="border-white/8 bg-white/[0.045] backdrop-blur-xl">
                <CardContent className="space-y-3 p-5">
                  <item.icon className="size-5 text-chart-2" />
                  <div className="space-y-1.5">
                    <p className="font-display text-base text-foreground">{item.title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border-white/[0.08] bg-card/75 shadow-[0_32px_90px_-32px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70">Portal del cliente</p>
              <h2 className="font-display text-3xl text-foreground">Inicia sesion</h2>
              <p className="text-sm text-muted-foreground">
                Accede a tu licencia, a la conexion MT5 y al panel operativo desde la cuenta principal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  Correo electronico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cliente@bellyswiss.com"
                  autoComplete="email"
                  className="h-12 border-white/[0.08] bg-white/[0.03]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  Contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contrasena"
                  autoComplete="current-password"
                  className="h-12 border-white/[0.08] bg-white/[0.03]"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-md border border-[oklch(0.35_0.08_25)] bg-[oklch(0.14_0.03_25)] px-3 py-2 text-sm text-[oklch(0.78_0.08_25)]">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="h-12 w-full uppercase tracking-[0.18em]" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar al portal"}
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Aun no tienes acceso?</span>
              <Button asChild variant="link" className="px-0">
                <Link href="/register">Crear cuenta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
