"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoCompact } from "@/components/logo-compact"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut,
  Activity,
  User
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Historial",
    href: "/dashboard/history",
    icon: History,
  },
  {
    label: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <LogoCompact className="mx-auto" />
      </div>

      {/* System Status */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-success" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
          </div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Sistema Activo
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                "animate-slide-in-left opacity-0",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-foreground" 
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors duration-300",
                isActive ? "text-accent" : "text-steel-dark group-hover:text-steel"
              )} />
              <span className="text-sm font-medium uppercase tracking-wider">
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-accent rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-xs font-semibold text-steel">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              John Doe
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Cuenta Premium
            </p>
          </div>
        </div>
        
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          <span className="text-xs uppercase tracking-wider">Cerrar Sesión</span>
        </Link>
      </div>
    </aside>
  )
}
