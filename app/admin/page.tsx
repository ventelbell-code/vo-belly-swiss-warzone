"use client"

import React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Shield,
  Users,
  LogOut,
  Check,
  Plus,
  Key,
  Server,
  Activity,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react"
import { useServiceStatus } from "@/hooks/use-service-status"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface MT5Account {
  id: string
  account_id: number
  broker: string
  balance: number
  equity: number
  is_active: boolean
  last_sync: string | null
  api_key: string
}

interface Client {
  id: string
  name: string
  email: string
  plan: string
  initial_capital: number
  is_active: boolean
  created_at: string
  service_status: "ACTIVO" | "EN ESPERA DE PAGO" | "PAGO REPORTADO"
  service_debt: number
  mt5_accounts: MT5Account[]
  system_state: Array<{
    is_active: boolean
    is_pending: boolean
    pending_amount: number
  }>
  metrics?: {
    totalProfit: number
    totalOperations: number
    currentBalance: number
  }
}

interface DetectedPayment {
  id: string
  tx_id: string
  from_address: string
  to_address: string
  amount_usdt: number
  block_timestamp: number
  client_id: string | null
  status: "DETECTADO" | "CONFIRMADO" | "RECHAZADO"
  confirmed_at: string | null
  created_at: string
  clients: {
    id: string
    name: string
    email: string
    service_debt: number
    service_status: string
  } | null
}

export default function AdminPage() {
  const { confirmPayment: confirmGlobalPayment } = useServiceStatus()
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showNewAccountForm, setShowNewAccountForm] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Fetch clients data
  const { data: clientsData, error: clientsError, mutate: refreshClients } = useSWR(
    "/api/admin/clients",
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch detected payments
  const { data: paymentsData, mutate: refreshPayments } = useSWR<{ payments: DetectedPayment[] }>(
    "/api/admin/detected-payments",
    fetcher,
    { refreshInterval: 30000 }
  )

  const detectedPayments = paymentsData?.payments?.filter(p => p.status === "DETECTADO") || []
  const [isScanning, setIsScanning] = useState(false)
  const [isConfirming, setIsConfirming] = useState<string | null>(null)

  const clients: Client[] = clientsData?.data || []
  const isLoading = !clientsData && !clientsError

  // Form state for new MT5 account
  const [newAccountForm, setNewAccountForm] = useState({
    client_id: "",
    account_id: "",
    broker: "Deriv",
    balance: "",
  })

  const handleConfirmPayment = async (clientId: string) => {
    try {
      await fetch("/api/admin/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })
      refreshClients()
      // Also update global service status if it's the demo user
      const client = clients.find((c) => c.id === clientId)
      if (client?.name === "Usuario Demo") {
        confirmGlobalPayment()
      }
    } catch (error) {
      console.error("Error confirming payment:", error)
    }
  }

  // Scan blockchain for new payments
  const handleScanBlockchain = async () => {
    setIsScanning(true)
    try {
      await fetch("/api/blockchain/scan-usdt", { method: "POST" })
      refreshPayments()
    } catch (error) {
      console.error("Error scanning blockchain:", error)
    } finally {
      setIsScanning(false)
    }
  }

  // Confirm a detected payment
  const handleConfirmDetectedPayment = async (paymentId: string, clientId: string | null) => {
    if (!clientId) return
    setIsConfirming(paymentId)
    try {
      await fetch("/api/admin/detected-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, clientId }),
      })
      refreshPayments()
      refreshClients()
    } catch (error) {
      console.error("Error confirming detected payment:", error)
    } finally {
      setIsConfirming(null)
    }
  }

  const handleCreateMT5Account = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch("/api/admin/mt5-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: newAccountForm.client_id,
          account_id: parseInt(newAccountForm.account_id),
          broker: newAccountForm.broker,
          balance: parseFloat(newAccountForm.balance) || 0,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setNewApiKey(data.data.api_key)
        setShowNewAccountForm(false)
        setNewAccountForm({ client_id: "", account_id: "", broker: "Deriv", balance: "" })
        refreshClients()
      } else {
        alert(data.error || "Error creating account")
      }
    } catch (error) {
      console.error("Error creating MT5 account:", error)
      alert("Error creating account")
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const totalProfit = clients.reduce((acc, c) => acc + (c.metrics?.totalProfit || 0), 0)
  const totalOperations = clients.reduce((acc, c) => acc + (c.metrics?.totalOperations || 0), 0)
  const totalMT5Accounts = clients.reduce((acc, c) => acc + (c.mt5_accounts?.length || 0), 0)
  const activeClients = clients.filter(
    (c) => c.service_status === "ACTIVO"
  ).length
  const pendingPaymentClients = clients.filter(
    (c) =>
      c.service_status === "EN ESPERA DE PAGO" ||
      c.service_status === "PAGO REPORTADO"
  ).length

  // Format relative time
  const formatLastSync = (date: string | null) => {
    if (!date) return "Nunca"
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Ahora"
    if (minutes < 60) return `Hace ${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${Math.floor(hours / 24)}d`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-50">
        <Image
          src="/logo-transparent.png"
          alt="BELLYSWISS WARZONE"
          width={120}
          height={50}
          className="w-24 h-auto object-contain"
          priority
        />
        <div className="flex items-center gap-2 px-2 py-1 bg-[oklch(0.25_0.05_250)] rounded border border-[oklch(0.35_0.08_250)]">
          <Shield className="w-3.5 h-3.5 text-[oklch(0.65_0.12_250)]" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.75_0.08_250)]">
            Admin
          </span>
        </div>
      </header>

      {/* Sidebar Admin - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <Image
            src="/logo-transparent.png"
            alt="BELLYSWISS WARZONE"
            width={180}
            height={80}
            className="w-36 h-auto object-contain"
            priority
          />
        </div>

        {/* Admin Badge */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 bg-[oklch(0.25_0.05_250)] rounded border border-[oklch(0.35_0.08_250)]">
            <Shield className="w-4 h-4 text-[oklch(0.65_0.12_250)]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[oklch(0.75_0.08_250)]">
              Panel Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-md text-[11px] font-medium uppercase tracking-[0.1em] bg-sidebar-accent text-sidebar-foreground"
              >
                <Users className="w-4 h-4" />
                Clientes
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-md text-[11px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Volver al Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider text-sidebar-foreground/40">
              Sesion Admin
            </p>
            <p className="text-[10px] font-medium text-sidebar-foreground/70 mt-1">
              admin@bellyswiss.com
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-64">
        {/* Header - Desktop only */}
        <header className="hidden lg:flex h-16 border-b border-border items-center justify-between px-8">
          <div>
            <h1 className="text-sm font-semibold text-foreground">Panel de Administracion</h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
              Gestion de clientes y cuentas MT5
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshClients()}
              className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[oklch(0.20_0.03_250)] rounded border border-[oklch(0.30_0.05_250)]">
              <Shield className="w-3.5 h-3.5 text-[oklch(0.60_0.10_250)]" />
              <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.70_0.08_250)]">
                Acceso Restringido
              </span>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 space-y-5 sm:space-y-6 lg:space-y-8 overflow-auto">
          {/* API Key Modal */}
          {newApiKey && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full space-y-4">
                <div className="flex items-center gap-2 text-[oklch(0.65_0.12_145)]">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-semibold">Cuenta MT5 Creada</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Guarda esta API key. No se mostrara de nuevo.
                </p>
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded border border-border font-mono text-xs break-all">
                    {showApiKey ? newApiKey : "•".repeat(40)}
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 hover:bg-muted rounded"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(newApiKey)}
                      className="p-1.5 hover:bg-muted rounded"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-[oklch(0.65_0.12_145)]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setNewApiKey(null)
                    setShowApiKey(false)
                  }}
                  className="w-full py-2 bg-muted hover:bg-muted/80 rounded text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/60 mb-2">
                Total Clientes
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground">{clients.length}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-1">{activeClients} activos</p>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/60 mb-2">
                Profit Total
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-[oklch(0.65_0.15_145)]">
                ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/60 mb-2">
                Operaciones
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground">{totalOperations}</p>
            </div>
            <div className="bg-card border border-border/50 rounded-lg p-4 sm:p-5">
              <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] sm:tracking-[0.15em] text-muted-foreground/60 mb-2">
                Cuentas MT5
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground">{totalMT5Accounts}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-1">conectadas</p>
            </div>
          </div>

          {/* Detected Payments Section */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h2 className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Pagos USDT Detectados
                </h2>
                {detectedPayments.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-medium rounded-full">
                    {detectedPayments.length} pendiente{detectedPayments.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={handleScanBlockchain}
                disabled={isScanning}
                className="flex items-center gap-2 px-3 py-1.5 bg-[oklch(0.20_0.03_250)] border border-[oklch(0.30_0.05_250)] rounded text-[9px] font-medium uppercase tracking-wider text-[oklch(0.70_0.08_250)] hover:bg-[oklch(0.25_0.04_250)] transition-colors disabled:opacity-50"
              >
                {isScanning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {isScanning ? "Escaneando..." : "Escanear Blockchain"}
              </button>
            </div>

            {detectedPayments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-muted-foreground">No hay pagos pendientes de confirmar</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {detectedPayments.map((payment) => (
                  <div key={payment.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-amber-400">
                          ${payment.amount_usdt.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                          USDT
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mb-1">
                        TxID: {payment.tx_id.slice(0, 20)}...
                      </p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {new Date(payment.block_timestamp).toLocaleString()}
                      </p>
                      {payment.clients ? (
                        <p className="text-xs text-foreground mt-1">
                          Cliente: <span className="font-medium">{payment.clients.name}</span>
                          <span className="text-muted-foreground ml-2">
                            (Deuda: ${payment.clients.service_debt.toFixed(2)})
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs text-amber-400 mt-1">Cliente no identificado</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleConfirmDetectedPayment(payment.id, payment.client_id)}
                      disabled={!payment.client_id || isConfirming === payment.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-[oklch(0.25_0.08_145)] border border-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.30_0.10_145)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirming === payment.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[oklch(0.65_0.15_145)]" />
                      ) : (
                        <Check className="w-3 h-3 text-[oklch(0.65_0.15_145)]" />
                      )}
                      <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.70_0.12_145)]">
                        Confirmar Pago
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New MT5 Account Form */}
          {showNewAccountForm && (
            <div className="bg-card border border-[oklch(0.30_0.06_250)] rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[oklch(0.65_0.12_250)]" />
                  <h3 className="text-sm font-semibold">Nueva Cuenta MT5</h3>
                </div>
                <button
                  onClick={() => setShowNewAccountForm(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
              <form onSubmit={handleCreateMT5Account} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Cliente
                  </label>
                  <select
                    required
                    value={newAccountForm.client_id}
                    onChange={(e) => setNewAccountForm(prev => ({ ...prev, client_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.50_0.10_250)]"
                  >
                    <option value="">Seleccionar...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Account ID (MT5)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="12345678"
                    value={newAccountForm.account_id}
                    onChange={(e) => setNewAccountForm(prev => ({ ...prev, account_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.50_0.10_250)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Broker
                  </label>
                  <input
                    type="text"
                    placeholder="Deriv"
                    value={newAccountForm.broker}
                    onChange={(e) => setNewAccountForm(prev => ({ ...prev, broker: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.50_0.10_250)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Balance Inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50000"
                    value={newAccountForm.balance}
                    onChange={(e) => setNewAccountForm(prev => ({ ...prev, balance: e.target.value }))}
                    className="w-full px-3 py-2 bg-muted/30 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[oklch(0.50_0.10_250)]"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.25_0.05_250)] hover:bg-[oklch(0.30_0.06_250)] border border-[oklch(0.35_0.08_250)] rounded text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Crear y Generar API Key
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clients Table */}
          <div className="bg-card border border-border/50 rounded-lg">
            <div className="p-4 sm:p-6 border-b border-border/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Clientes y Cuentas MT5
                </h2>
                <button
                  onClick={() => setShowNewAccountForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[oklch(0.20_0.03_250)] hover:bg-[oklch(0.25_0.04_250)] border border-[oklch(0.30_0.06_250)] rounded text-[10px] font-medium uppercase tracking-wider transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Cuenta MT5
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {clients.map((client) => {
                  const status = client.service_status || "ACTIVO"

                  return (
                    <div key={client.id} className="p-4 sm:p-6">
                      {/* Client Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-bold text-foreground/80">
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {client.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                              {client.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status Badge */}
                          {status === "ACTIVO" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[oklch(0.25_0.05_145)] border border-[oklch(0.35_0.08_145)]">
                              <CheckCircle2 className="w-3 h-3 text-[oklch(0.55_0.15_145)]" />
                              <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.65_0.12_145)]">
                                Activo
                              </span>
                            </span>
                          )}
                          {status === "EN ESPERA DE PAGO" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[oklch(0.25_0.05_85)] border border-[oklch(0.40_0.08_85)]">
                              <AlertCircle className="w-3 h-3 text-[oklch(0.70_0.12_85)]" />
                              <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.70_0.10_85)]">
                                En Espera de Pago
                              </span>
                            </span>
                          )}
                          {status === "PAGO REPORTADO" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[oklch(0.25_0.05_250)] border border-[oklch(0.40_0.08_250)]">
                              <Clock className="w-3 h-3 text-[oklch(0.65_0.12_250)]" />
                              <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.65_0.10_250)]">
                                Pago Reportado
                              </span>
                            </span>
                          )}

                          {/* Debt Amount */}
                          {client.service_debt > 0 &&
                            status !== "ACTIVO" && (
                              <span className="text-[10px] font-medium text-[oklch(0.70_0.10_85)]">
                                Deuda: ${client.service_debt?.toFixed(2)} USDT
                              </span>
                            )}

                          {/* Confirm Payment Button - Only for PAGO REPORTADO */}
                          {status === "PAGO REPORTADO" && (
                            <button
                              onClick={() => handleConfirmPayment(client.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[oklch(0.25_0.08_145)] border border-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.30_0.10_145)] transition-colors"
                            >
                              <Check className="w-3 h-3 text-[oklch(0.65_0.15_145)]" />
                              <span className="text-[9px] font-medium uppercase tracking-wider text-[oklch(0.70_0.12_145)]">
                                Confirmar Pago
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Client Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-muted/20 rounded border border-border/30">
                          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">
                            Capital
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            ${(client.initial_capital || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded border border-border/30">
                          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">
                            Profit
                          </p>
                          <p className={`text-sm font-semibold ${(client.metrics?.totalProfit || 0) >= 0 ? 'text-[oklch(0.65_0.12_145)]' : 'text-[oklch(0.65_0.12_25)]'}`}>
                            {(client.metrics?.totalProfit || 0) >= 0 ? '+' : ''}${(client.metrics?.totalProfit || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded border border-border/30">
                          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">
                            Operaciones
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {client.metrics?.totalOperations || 0}
                          </p>
                        </div>
                      </div>

                      {/* MT5 Accounts */}
                      {client.mt5_accounts && client.mt5_accounts.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60">
                            Cuentas MT5 ({client.mt5_accounts.length})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {client.mt5_accounts.map(account => (
                              <div
                                key={account.id}
                                className={`flex items-center justify-between p-3 rounded border ${
                                  account.is_active
                                    ? 'bg-[oklch(0.12_0.01_145)] border-[oklch(0.22_0.04_145)]'
                                    : 'bg-muted/10 border-border/30'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Server className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs font-medium text-foreground">
                                      #{account.account_id}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/60">
                                      {account.broker}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-semibold text-foreground">
                                    ${(account.balance || 0).toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground/50 flex items-center gap-1 justify-end">
                                    <Clock className="w-3 h-3" />
                                    {formatLastSync(account.last_sync)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-muted/10 rounded border border-border/30">
                          <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
                          <span className="text-[10px] text-muted-foreground/50">
                            Sin cuentas MT5 conectadas
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="flex items-center justify-center py-4 px-6 bg-card/30 border border-border/20 rounded-lg">
            <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">
              Panel de administracion privado — Solo acceso autorizado
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50">
        <div className="flex items-center justify-around py-2 px-2 safe-area-pb">
          <Link
            href="/admin"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px] text-sidebar-foreground bg-sidebar-accent"
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-medium uppercase tracking-wide">Clientes</span>
          </Link>
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[60px] text-sidebar-foreground/50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-medium uppercase tracking-wide">Salir</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
