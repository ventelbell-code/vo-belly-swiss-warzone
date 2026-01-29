"use client"

import { Header } from "@/components/dashboard/header"
import { MetricCard } from "@/components/dashboard/metric-card"
import { 
  Settings, 
  User, 
  Bell, 
  Shield,
  Globe,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Header 
        title="Configuración" 
        subtitle="Preferencias del sistema"
      />

      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <MetricCard 
          title="Perfil de Usuario"
          icon={User}
          animationDelay={0}
        >
          <div className="w-full space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
                <span className="text-2xl font-semibold text-steel">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-foreground">John Doe</p>
                <p className="text-sm text-muted-foreground">john.doe@bellyswiss.com</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Cuenta Premium | Miembro desde 2024</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nombre
                </Label>
                <Input 
                  defaultValue="John Doe" 
                  disabled
                  className="bg-input border-border/50 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Correo Electrónico
                </Label>
                <Input 
                  defaultValue="john.doe@bellyswiss.com" 
                  disabled
                  className="bg-input border-border/50 text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </MetricCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <MetricCard 
            title="Notificaciones"
            icon={Bell}
            animationDelay={100}
          >
            <div className="w-full space-y-4">
              <SettingRow 
                label="Alertas de rendimiento" 
                description="Recibir alertas cuando el rendimiento cambie significativamente"
              />
              <SettingRow 
                label="Resumen diario" 
                description="Recibir un resumen diario de la actividad"
              />
              <SettingRow 
                label="Alertas del sistema" 
                description="Notificaciones sobre el estado del sistema"
              />
            </div>
          </MetricCard>

          {/* Security */}
          <MetricCard 
            title="Seguridad"
            icon={Shield}
            animationDelay={200}
          >
            <div className="w-full space-y-4">
              <SettingRow 
                label="Autenticación de dos factores" 
                description="Añade una capa extra de seguridad"
                status="Activo"
                statusColor="success"
              />
              <SettingRow 
                label="Sesiones activas" 
                description="Gestiona los dispositivos conectados"
              />
              <Button 
                variant="outline" 
                size="sm"
                className="w-full border-border/50 text-muted-foreground hover:text-foreground mt-2 bg-transparent"
              >
                <span className="text-xs uppercase tracking-wider">Cambiar Contraseña</span>
              </Button>
            </div>
          </MetricCard>

          {/* Display */}
          <MetricCard 
            title="Visualización"
            icon={Palette}
            animationDelay={300}
          >
            <div className="w-full space-y-4">
              <SettingRow 
                label="Modo oscuro" 
                description="Tema oscuro activado permanentemente"
                status="Siempre"
                statusColor="steel"
              />
              <SettingRow 
                label="Animaciones" 
                description="Efectos visuales y transiciones"
                status="Activo"
                statusColor="success"
              />
            </div>
          </MetricCard>

          {/* Language */}
          <MetricCard 
            title="Idioma y Región"
            icon={Globe}
            animationDelay={400}
          >
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Idioma
                </Label>
                <Input 
                  defaultValue="Español" 
                  disabled
                  className="bg-input border-border/50 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Zona Horaria
                </Label>
                <Input 
                  defaultValue="UTC-5 (America/Bogota)" 
                  disabled
                  className="bg-input border-border/50 text-muted-foreground"
                />
              </div>
            </div>
          </MetricCard>
        </div>

        {/* System Info */}
        <MetricCard 
          title="Información del Sistema"
          icon={Settings}
          animationDelay={500}
        >
          <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SystemInfo label="Versión" value="1.0.0" />
              <SystemInfo label="Última actualización" value="--/--/----" />
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
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    steel: "text-steel",
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground/60">{description}</p>
      </div>
      {status && (
        <span className={`text-xs uppercase tracking-wider ${colorClasses[statusColor]}`}>
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
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  }

  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm font-medium ${valueColor ? colorClasses[valueColor] : "text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}
