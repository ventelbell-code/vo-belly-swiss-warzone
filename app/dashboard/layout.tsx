import React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(51,87,168,0.18),transparent_24%),linear-gradient(180deg,rgba(7,10,18,0.96),rgba(7,10,18,1))] text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
