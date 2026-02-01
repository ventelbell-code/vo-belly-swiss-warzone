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
  RefreshCw
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
  mt5_connection_status: "disconnected" | "pending" | "connected" | "error" | null
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

  const supabase = createClient()

  // Load clients
  async function loadClients() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, email, mt5_account, mt5_server, mt5_connection_status, created_at")
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
              <div className="space-y-2">
                {clientsWithMt5.map((client) => (
                  <div 
                    key={client.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted/10 border border-border/20 rounded-md"
                  >
                    {/* Client Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(client.mt5_connection_status) }}
                        />
                        <p className="text-sm font-medium text-foreground truncate">
                          {client.name || client.email.split("@")[0]}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-muted-foreground/60 truncate">
                          {client.email}
                        </p>
                        <span className="text-[10px] text-muted-foreground/40">|</span>
                        <p className="text-[10px] text-muted-foreground/60">
                          MT5: {client.mt5_account}
                        </p>
                        <span className="text-[10px] text-muted-foreground/40">|</span>
                        <p className="text-[10px] text-muted-foreground/60">
                          {client.mt5_server}
                        </p>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-[9px] uppercase tracking-wider text-muted-foreground/60 sm:hidden">
                        Estado:
                      </Label>
                      <select
                        value={client.mt5_connection_status || "pending"}
                        onChange={(e) => updateMt5Status(client.id, e.target.value)}
                        disabled={savingClientId === client.id}
                        className="h-9 px-3 bg-muted/20 border border-border/40 rounded text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-border min-w-[140px]"
                        style={{
                          borderColor: getStatusColor(client.mt5_connection_status),
                          borderWidth: "1.5px"
                        }}
                      >
                        {MT5_STATUSES.map((status) => (
                          <option key={status.value} value={status.value} className="bg-card text-foreground">
                            {status.label}
                          </option>
                        ))}
                      </select>
                      {savingClientId === client.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
