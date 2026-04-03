import "server-only"

import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type ClientSessionRow = {
  id: string
  email: string | null
  full_name: string | null
  role: "client" | "admin"
  is_active: boolean
}

export async function getCurrentSessionContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null, client: null as ClientSessionRow | null }
  }

  let { data: client } = await supabase
    .from("clients")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle()

  if (!client) {
    const admin = createAdminClient()

    const { error: upsertError } = await admin.from("clients").upsert({
      id: user.id,
      email: user.email ?? null,
      full_name:
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        (user.email ? user.email.split("@")[0] : "Cliente"),
      role: "client",
      is_active: true,
    })

    if (upsertError) {
      throw new Error(`Failed to ensure client row: ${upsertError.message}`)
    }

    const { data: refreshedClient, error: refreshedClientError } = await supabase
      .from("clients")
      .select("id, email, full_name, role, is_active")
      .eq("id", user.id)
      .single()

    if (refreshedClientError) {
      throw new Error(`Failed to refresh client row: ${refreshedClientError.message}`)
    }

    client = refreshedClient
  }

  return { supabase, user, client: client as ClientSessionRow | null }
}

export async function requireUser() {
  const context = await getCurrentSessionContext()

  if (!context.user) {
    redirect("/login")
  }

  return context as {
    supabase: Awaited<ReturnType<typeof createClient>>
    user: NonNullable<typeof context.user>
    client: ClientSessionRow | null
  }
}

export async function requireAdmin() {
  const context = await requireUser()

  if (context.client?.role !== "admin") {
    redirect("/dashboard")
  }

  return context
}
