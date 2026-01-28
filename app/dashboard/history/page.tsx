"use client"

import { Header } from "@/components/dashboard/header"
import { HistoryAudit } from "@/components/dashboard/history-audit"

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        title="Historial y Auditoria" 
        subtitle="Registro completo de operaciones"
      />

      <div className="flex-1 p-6 lg:p-8">
        <HistoryAudit />
      </div>
    </div>
  )
}
