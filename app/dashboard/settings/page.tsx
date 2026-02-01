"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { 
  Settings, 
  User, 
  Bell, 
  Shield,
  Globe,
  Palette,
  Check,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

// Available languages
const LANGUAGES = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
  { value: "pt", label: "Portugues" },
]

// Available timezones
const TIMEZONES = [
  { value: "America/New_York", label: "UTC-5 (Nueva York)" },
  { value: "America/Chicago", label: "UTC-6 (Chicago)" },
  { value: "America/Denver", label: "UTC-7 (Denver)" },
  { value: "America/Los_Angeles", label: "UTC-8 (Los Angeles)" },
  { value: "America/Bogota", label: "UTC-5 (Bogota)" },
  { value: "America/Mexico_City", label: "UTC-6 (Mexico)" },
  { value: "America/Sao_Paulo", label: "UTC-3 (Sao Paulo)" },
  { value: "Europe/Madrid", label: "UTC+1 (Madrid)" },
  { value: "Europe/London", label: "UTC+0 (Londres)" },
]

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [clientId, setClientId] = useState<string | null>(null)
  
  // Editable fields
  const [alias, setAlias] = useState("")
  const [language, setLanguage] = useState("es")
  const [timezone, setTimezone] = useState("America/Bogota")
  
  // Original values to detect changes
  const [originalValues, setOriginalValues] = useState({ alias: "", language: "es", timezone: "America/Bogota" })

  const supabase = createClient()

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUserEmail(user.email || "")
          
          // Get client data from clients table
          const { data: clientData } = await supabase
            .from("clients")
            .select("id, name, alias, language, timezone")
            .eq("email", user.email)
            .single()
          
          if (clientData) {
            setClientId(clientData.id)
            setAlias(clientData.alias || clientData.name || "")
            setLanguage(clientData.language || "es")
            setTimezone(clientData.timezone || "America/Bogota")
            setOriginalValues({
              alias: clientData.alias || clientData.name || "",
              language: clientData.language || "es",
              timezone: clientData.timezone || "America/Bogota"
            })
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserData()
  }, [supabase])

  // Check if there are changes
  const hasChanges = alias !== originalValues.alias || 
                     language !== originalValues.language || 
                     timezone !== originalValues.timezone

  // Save user preferences
  async function handleSave() {
    if (!clientId || !hasChanges) return
    
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          alias: alias.trim() || null,
          language,
          timezone,
          updated_at: new Date().toISOString()
        })
        .eq("id", clientId)
      
      if (error) throw error
      
      // Update original values
      setOriginalValues({ alias, language, timezone })
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Get initials for avatar
  const getInitials = () => {
    if (alias) {
      return alias.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    if (userEmail) {
      return userEmail.slice(0, 2).toUpperCase()
    }
    return "US"
  }

  // Get language label
  const getLanguageLabel = (value: string) => {
    return LANGUAGES.find(l => l.value === value)?.label || value
  }

  // Get timezone label
  const getTimezoneLabel = (value: string) => {
    return TIMEZONES.find(t => t.value === value)?.label || value
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Configuracion" 
        subtitle="Preferencias del sistema"
      />

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 pb-20 lg:pb-6">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-[oklch(0.18_0.04_145)] border border-[oklch(0.28_0.06_145)] rounded-md shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <Check className="w-4 h-4 text-[oklch(0.60_0.14_145)]" />
            <span className="text-sm font-medium text-[oklch(0.70_0.10_145)]">
              Configuracion actualizada correctamente
            </span>
          </div>
        )}

        {/* Profile Section */}
        <MetricCard 
          title="Configuracion del Cliente"
          icon={User}
          animationDelay={0}
        >
          <div className="w-full space-y-4">
            {/* Avatar and basic info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted/30 flex items-center justify-center border border-border/40">
                <span className="text-lg sm:text-xl font-semibold text-foreground/70">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-foreground truncate">{alias || "Sin alias"}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
            
            {/* Editable fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Alias/Name */}
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                  Nombre / Alias
                </Label>
                <Input 
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Tu nombre o alias"
                  disabled={isLoading}
                  className="h-10 sm:h-11 bg-muted/20 border-border/40 text-foreground text-sm placeholder:text-muted-foreground/40"
                />
              </div>
              
              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                  Correo Electronico
                </Label>
                <Input 
                  value={userEmail}
                  disabled
                  className="h-10 sm:h-11 bg-muted/10 border-border/30 text-muted-foreground/60 text-sm cursor-not-allowed"
                />
              </div>
              
              {/* Language */}
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                  Idioma
                </Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 sm:h-11 px-3 bg-muted/20 border border-border/40 rounded-md text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-border"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-card text-foreground">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Timezone */}
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                  Zona Horaria
                </Label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-10 sm:h-11 px-3 bg-muted/20 border border-border/40 rounded-md text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-border"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value} className="bg-card text-foreground">
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={isLoading || isSaving || !hasChanges}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 bg-foreground/90 hover:bg-foreground text-background font-medium text-xs sm:text-sm uppercase tracking-wider disabled:opacity-40"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Actualizar Informacion"
                )}
              </Button>
              {!hasChanges && !isLoading && (
                <p className="text-[10px] text-muted-foreground/50 mt-2">
                  No hay cambios pendientes
                </p>
              )}
            </div>
          </div>
        </MetricCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Notifications */}
          <MetricCard 
            title="Notificaciones"
            icon={Bell}
            animationDelay={100}
          >
            <div className="w-full space-y-2">
              <SettingRow 
                label="Alertas de rendimiento" 
                description="Alertas de cambios significativos"
              />
              <SettingRow 
                label="Resumen diario" 
                description="Resumen de actividad"
              />
              <SettingRow 
                label="Alertas del sistema" 
                description="Estado del sistema"
              />
            </div>
          </MetricCard>

          {/* Security */}
          <MetricCard 
            title="Seguridad"
            icon={Shield}
            animationDelay={200}
          >
            <div className="w-full space-y-2">
              <SettingRow 
                label="2FA" 
                description="Autenticacion de dos factores"
                status="Activo"
                statusColor="success"
              />
              <SettingRow 
                label="Sesiones activas" 
                description="Dispositivos conectados"
              />
            </div>
          </MetricCard>

          {/* Display */}
          <MetricCard 
            title="Visualizacion"
            icon={Palette}
            animationDelay={300}
          >
            <div className="w-full space-y-2">
              <SettingRow 
                label="Modo oscuro" 
                description="Tema oscuro permanente"
                status="Siempre"
                statusColor="steel"
              />
              <SettingRow 
                label="Animaciones" 
                description="Efectos visuales"
                status="Activo"
                statusColor="success"
              />
            </div>
          </MetricCard>

          {/* Current Preferences Summary */}
          <MetricCard 
            title="Preferencias Actuales"
            icon={Globe}
            animationDelay={400}
          >
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Idioma</span>
                <span className="text-xs font-medium text-foreground">{getLanguageLabel(language)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Zona horaria</span>
                <span className="text-xs font-medium text-foreground truncate ml-2 max-w-[140px]">{getTimezoneLabel(timezone)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-muted-foreground">Alias</span>
                <span className="text-xs font-medium text-foreground">{alias || "No definido"}</span>
              </div>
            </div>
          </MetricCard>
        </div>

        {/* System Info */}
        <MetricCard 
          title="Informacion del Sistema"
          icon={Settings}
          animationDelay={500}
        >
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SystemInfo label="Version" value="1.0.0" />
              <SystemInfo label="Actualizacion" value="--/--/----" />
              <SystemInfo label="Estado" value="Operativo" valueColor="success" />
              <SystemInfo label="Latencia" value="-- ms" />
            </div>
          </div>
        </MetricCard>
      </div>
    </div>
  )
}

function SettingRow({ 
  label, 
  description, 
  status, 
  statusColor = "steel" 
}: { 
  label: string
  description: string
  status?: string
  statusColor?: "success" | "warning" | "error" | "steel"
}) {
  const colorClasses = {
    success: "text-[oklch(0.60_0.14_145)]",
    warning: "text-amber-400",
    error: "text-red-400",
    steel: "text-foreground/60",
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-foreground truncate">{label}</p>
        <p className="text-[10px] text-muted-foreground/50 truncate">{description}</p>
      </div>
      {status && (
        <span className={`text-[10px] uppercase tracking-wider ml-2 flex-shrink-0 ${colorClasses[statusColor]}`}>
          {status}
        </span>
      )}
    </div>
  )
}

function SystemInfo({ 
  label, 
  value, 
  valueColor 
}: { 
  label: string
  value: string
  valueColor?: "success" | "warning" | "error"
}) {
  const colorClasses = {
    success: "text-[oklch(0.60_0.14_145)]",
    warning: "text-amber-400",
    error: "text-red-400",
  }

  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">{label}</p>
      <p className={`text-xs font-medium ${valueColor ? colorClasses[valueColor] : "text-foreground/80"}`}>
        {value}
      </p>
    </div>
  )
}
