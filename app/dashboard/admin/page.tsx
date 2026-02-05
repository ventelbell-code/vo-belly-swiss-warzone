"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { 
  Shield, 
  Users, 
  Link2, 
  Check,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  name: string | null
  email: string
  mt5_account: string | null
  mt5_server: string | null
  mt5_password_encrypted: string | null
  mt5_connection_status: "disconnected" | "pending" | "connected" | "error" | null
  mt5_submitted_at: string | null
  created_at: string
}

const MT5_STATUSES = [
  { value: "pending", label: "En Revision", color: "oklch(0.65_0.14_60)" },
  { value: "connected", label: "Conectado", color: "oklch(0.55_0.14_145)" },
  { value: "error", label: "Error de Conexion", color: "oklch(0.55_0.14_25)" },
]

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [savingClientId, setSavingClientId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const supabase = createClient()

  // Load clients
  async function loadClients() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, mt5_account, mt5_server, mt5_password_encrypted, mt5_connection_status, mt5_submitted_at, created_at")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  // Update client MT5 status
  async function updateMt5Status(clientId: string, newStatus: string) {
    setSavingClientId(clientId)
    
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          mt5_connection_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientId)
      
      if (error) throw error
      
      // Update local state
      setClients(prev => prev.map(c => 
        c.id === clientId ? { ...c, mt5_connection_status: newStatus as Client["mt5_connection_status"] } : c
      ))
      
      setSuccessMessage("Estado actualizado")
      setTimeout(() => setSuccessMessage(""), 2000)
      
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setSavingClientId(null)
    }
  }

  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "connected": return "oklch(0.55_0.14_145)"
      case "pending": return "oklch(0.65_0.14_60)"
      case "error": return "oklch(0.55_0.14_25)"
      default: return "oklch(0.40_0.00_0)"
    }
  }

  // Get status label
  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "connected": return "Conectado"
      case "pending": return "En Revision"
      case "error": return "Error"
      default: return "Sin configurar"
    }
  }

  // Toggle password visibility
  const togglePasswordVisibility = (clientId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(clientId)) {
        newSet.delete(clientId)
      } else {
        newSet.add(clientId)
      }
      return newSet
    })
  }

  // Decode password (base64)
  const decodePassword = (encrypted: string | null) => {
    if (!encrypted) return ""
    try {
      return atob(encrypted)
    } catch {
      return encrypted
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, clientId: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(clientId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Clients with MT5 configured
  const clientsWithMt5 = clients.filter(c => c.mt5_account)

  return (
    <div className="flex flex-col">
      <Header 
        title="Panel de Administracion" 
        subtitle="Gestion de clientes y conexiones MT5"
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 pb-20 lg:pb-6">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-[oklch(0.18_0.04_145)] border border-[oklch(0.28_0.06_145)] rounded-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-[oklch(0.60_0.14_145)]" />
            <span className="text-sm font-medium text-[oklch(0.70_0.10_145)]">
              {successMessage}
            </span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border/40 rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Total Clientes</p>
            <p className="text-xl font-bold text-foreground mt-1">{clients.length}</p>
          </div>
          <div className="bg-card border border-border/40 rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Con MT5</p>
            <p className="text-xl font-bold text-foreground mt-1">{clientsWithMt5.length}</p>
          </div>
          <div className="bg-card border border-border/40 rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Conectados</p>
            <p className="text-xl font-bold text-[oklch(0.60_0.14_145)] mt-1">
              {clients.filter(c => c.mt5_connection_status === "connected").length}
            </p>
          </div>
          <div className="bg-card border border-border/40 rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Pendientes</p>
            <p className="text-xl font-bold text-[oklch(0.70_0.12_60)] mt-1">
              {clients.filter(c => c.mt5_connection_status === "pending").length}
            </p>
          </div>
        </div>

        {/* MT5 Connection Management */}
        <MetricCard 
          title="Gestion de Conexiones MT5"
          icon={Link2}
          animationDelay={0}
        >
          <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/20">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Clientes con cuenta MT5 configurada
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadClients}
                disabled={isLoading}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Clients List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : clientsWithMt5.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground/60">
                  No hay clientes con cuenta MT5 configurada
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsWithMt5.map((client) => (
                  <div 
                    key={client.id}
                    className={`p-4 rounded-md border-l-4 ${
                      client.mt5_connection_status === "connected"
                        ? "bg-[oklch(0.12_0.02_145)] border-l-[oklch(0.55_0.14_145)] border border-[oklch(0.20_0.04_145)]"
                        : client.mt5_connection_status === "error"
                          ? "bg-[oklch(0.12_0.02_25)] border-l-[oklch(0.55_0.14_25)] border border-[oklch(0.20_0.04_25)]"
                          : "bg-[oklch(0.12_0.02_60)] border-l-[oklch(0.65_0.14_60)] border border-[oklch(0.20_0.04_60)]"
                    }`}
                  >
                    {/* Header with status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            client.mt5_connection_status === "pending" ? "animate-pulse" : ""
                          }`}
                          style={{ backgroundColor: getStatusColor(client.mt5_connection_status) }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {client.name || client.email.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">{client.email}</p>
                        </div>
                      </div>
                      <span 
                        className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wide"
                        style={{ 
                          backgroundColor: `color-mix(in oklch, ${getStatusColor(client.mt5_connection_status)} 15%, transparent)`,
                          color: getStatusColor(client.mt5_connection_status)
                        }}
                      >
                        {getStatusLabel(client.mt5_connection_status)}
                      </span>
                    </div>

                    {/* MT5 Credentials Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 p-3 bg-background/30 rounded border border-border/20">
                      {/* Account ID */}
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Account ID</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-mono font-medium text-foreground">{client.mt5_account}</p>
                          <button
                            onClick={() => copyToClipboard(client.mt5_account || "", `acc-${client.id}`)}
                            className="p-0.5 hover:bg-muted/30 rounded"
                          >
                            {copiedId === `acc-${client.id}` ? (
                              <Check className="w-3 h-3 text-[oklch(0.55_0.14_145)]" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground/50" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Server */}
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Servidor</p>
                        <p className="text-xs font-medium text-foreground">{client.mt5_server}</p>
                      </div>

                      {/* Password (Admin visible) */}
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Password</p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-mono font-medium text-foreground">
                            {visiblePasswords.has(client.id) 
                              ? decodePassword(client.mt5_password_encrypted)
                              : "••••••••"
                            }
                          </p>
                          <button
                            onClick={() => togglePasswordVisibility(client.id)}
                            className="p-0.5 hover:bg-muted/30 rounded"
                          >
                            {visiblePasswords.has(client.id) ? (
                              <EyeOff className="w-3 h-3 text-muted-foreground/50" />
                            ) : (
                              <Eye className="w-3 h-3 text-muted-foreground/50" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(decodePassword(client.mt5_password_encrypted), `pwd-${client.id}`)}
                            className="p-0.5 hover:bg-muted/30 rounded"
                          >
                            {copiedId === `pwd-${client.id}` ? (
                              <Check className="w-3 h-3 text-[oklch(0.55_0.14_145)]" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground/50" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Submission Date */}
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">Enviado</p>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground/40" />
                          <p className="text-[10px] text-muted-foreground/70">{formatDate(client.mt5_submitted_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => updateMt5Status(client.id, "connected")}
                        disabled={savingClientId === client.id || client.mt5_connection_status === "connected"}
                        size="sm"
                        className="h-8 px-3 bg-[oklch(0.45_0.12_145)] hover:bg-[oklch(0.50_0.14_145)] text-white text-[10px] font-semibold uppercase tracking-wide disabled:opacity-40"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Marcar Conexion OK
                      </Button>
                      
                      <Button
                        onClick={() => updateMt5Status(client.id, "error")}
                        disabled={savingClientId === client.id || client.mt5_connection_status === "error"}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 border-[oklch(0.40_0.10_25)] text-[oklch(0.65_0.12_25)] hover:bg-[oklch(0.15_0.03_25)] text-[10px] font-semibold uppercase tracking-wide disabled:opacity-40 bg-transparent"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Marcar Error
                      </Button>

                      <Button
                        onClick={() => updateMt5Status(client.id, "pending")}
                        disabled={savingClientId === client.id || client.mt5_connection_status === "pending"}
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 text-muted-foreground hover:text-foreground text-[10px] font-semibold uppercase tracking-wide disabled:opacity-40"
                      >
                        Volver a Pendiente
                      </Button>

                      {savingClientId === client.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MetricCard>

        {/* All Clients List */}
        <MetricCard 
          title="Todos los Clientes"
          icon={Users}
          animationDelay={100}
        >
          <div className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground/60">
                  No hay clientes registrados
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left text-[9px] uppercase tracking-wider text-muted-foreground/60 pb-2 pr-4">
                        Cliente
                      </th>
                      <th className="text-left text-[9px] uppercase tracking-wider text-muted-foreground/60 pb-2 pr-4 hidden sm:table-cell">
                        Email
                      </th>
                      <th className="text-left text-[9px] uppercase tracking-wider text-muted-foreground/60 pb-2 pr-4">
                        MT5
                      </th>
                      <th className="text-left text-[9px] uppercase tracking-wider text-muted-foreground/60 pb-2">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-border/10 last:border-0">
                        <td className="py-2.5 pr-4">
                          <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                            {client.name || client.email.split("@")[0]}
                          </p>
                        </td>
                        <td className="py-2.5 pr-4 hidden sm:table-cell">
                          <p className="text-[11px] text-muted-foreground/70 truncate max-w-[180px]">
                            {client.email}
                          </p>
                        </td>
                        <td className="py-2.5 pr-4">
                          <p className="text-[11px] text-muted-foreground/70">
                            {client.mt5_account || "—"}
                          </p>
                        </td>
                        <td className="py-2.5">
                          <span 
                            className="inline-flex items-center gap-1.5 text-[10px] font-medium"
                            style={{ color: getStatusColor(client.mt5_connection_status) }}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getStatusColor(client.mt5_connection_status) }}
                            />
                            {getStatusLabel(client.mt5_connection_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </MetricCard>
      </div>
    </div>
  )
}
