import crypto from "crypto"

import { createAdminClient } from "@/lib/supabase/admin"

export const DEFAULT_HEARTBEAT_INTERVAL_SECONDS = 30
export const DEFAULT_SNAPSHOT_INTERVAL_SECONDS = 60

type NullableString = string | null | undefined

export type BotIdentityPayload = {
  license_key?: NullableString
  account_login?: NullableString
  account_server?: NullableString
  broker?: NullableString
  bot_version?: NullableString
  terminal_name?: NullableString
  terminal_id?: NullableString
  machine_id?: NullableString
}

type LicenseRow = {
  id: string
  client_id: string
  license_key: string
  plan_code: string
  plan_name: string
  duration_days: number
  status: string
  starts_at: string | null
  activated_at: string | null
  expires_at: string | null
  last_validated_at: string | null
  auto_renew: boolean
  metadata: Record<string, unknown>
}

type BindingRow = {
  id: string
  client_id: string
  license_id: string
  account_login: string
  account_server: string
  broker: string | null
  bot_version: string | null
  terminal_name: string | null
  terminal_id: string | null
  machine_id: string | null
  status: string
  first_bound_at: string
  last_seen_at: string | null
}

export type BotLicenseContext = {
  clientId: string
  licenseId: string
  bindingId: string | null
  license: LicenseRow
  binding: BindingRow | null
}

export type BotValidationResult = {
  valid: boolean
  canTrade: boolean
  message: string
  status: string
  response: Record<string, unknown>
  context: BotLicenseContext | null
}

function clean(value: NullableString) {
  return (value || "").trim()
}

function nowIso() {
  return new Date().toISOString()
}

function buildResponse(
  partial: Partial<Record<string, unknown>> & {
    valid: boolean
    can_trade: boolean
    message: string
    status: string
  },
) {
  const { valid, can_trade, message, status, ...rest } = partial

  return {
    valid,
    can_trade,
    message,
    status,
    server_time: nowIso(),
    heartbeat_interval_seconds: DEFAULT_HEARTBEAT_INTERVAL_SECONDS,
    snapshot_interval_seconds: DEFAULT_SNAPSHOT_INTERVAL_SECONDS,
    ...rest,
  }
}

function licenseResponse(license: LicenseRow | null, partial: Partial<Record<string, unknown>> & {
  valid: boolean
  can_trade: boolean
  message: string
  status: string
}) {
  return buildResponse({
    plan_code: license?.plan_code ?? null,
    plan_name: license?.plan_name ?? null,
    expires_at: license?.expires_at ?? null,
    license_id: license?.id ?? null,
    client_id: license?.client_id ?? null,
    ...partial,
  })
}

export function buildEventHash(input: Record<string, unknown>) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex")
}

export async function validateBotLicense(payload: BotIdentityPayload, options?: { allowBind?: boolean }) {
  const allowBind = options?.allowBind ?? true
  const licenseKey = clean(payload.license_key)
  const accountLogin = clean(payload.account_login)
  const accountServer = clean(payload.account_server)
  const broker = clean(payload.broker) || null
  const botVersion = clean(payload.bot_version) || null
  const terminalName = clean(payload.terminal_name) || null
  const terminalId = clean(payload.terminal_id) || null
  const machineId = clean(payload.machine_id) || null

  if (!licenseKey || !accountLogin || !accountServer) {
    return {
      valid: false,
      canTrade: false,
      message: "Missing license_key, account_login or account_server.",
      status: "invalid_request",
      response: buildResponse({
        valid: false,
        can_trade: false,
        message: "Missing license_key, account_login or account_server.",
        status: "invalid_request",
      }),
      context: null,
    } satisfies BotValidationResult
  }

  const supabase = createAdminClient()
  const validatedAt = nowIso()

  const { data: license, error: licenseError } = await supabase
    .from("licenses")
    .select("id, client_id, license_key, plan_code, plan_name, duration_days, status, starts_at, activated_at, expires_at, last_validated_at, auto_renew, metadata")
    .eq("license_key", licenseKey)
    .maybeSingle<LicenseRow>()

  if (licenseError) {
    throw new Error(licenseError.message)
  }

  if (!license) {
    const response = buildResponse({
      valid: false,
      can_trade: false,
      message: "License not found.",
      status: "not_found",
    })

    return {
      valid: false,
      canTrade: false,
      message: "License not found.",
      status: "not_found",
      response,
      context: null,
    } satisfies BotValidationResult
  }

  const licenseExpired = Boolean(license.expires_at && new Date(license.expires_at).getTime() <= Date.now())
  if (licenseExpired && license.status !== "expired") {
    await supabase.from("licenses").update({ status: "expired", last_validated_at: validatedAt }).eq("id", license.id)
    license.status = "expired"
  }

  if (license.status === "expired") {
    const response = licenseResponse(license, {
      valid: false,
      can_trade: false,
      message: "License expired.",
      status: "expired",
    })

    return {
      valid: false,
      canTrade: false,
      message: "License expired.",
      status: "expired",
      response,
      context: null,
    } satisfies BotValidationResult
  }

  if (license.status === "suspended" || license.status === "cancelled") {
    const response = licenseResponse(license, {
      valid: false,
      can_trade: false,
      message: `License ${license.status}.`,
      status: license.status,
    })

    return {
      valid: false,
      canTrade: false,
      message: `License ${license.status}.`,
      status: license.status,
      response,
      context: null,
    } satisfies BotValidationResult
  }

  const { data: currentBinding, error: bindingError } = await supabase
    .from("license_bindings")
    .select("id, client_id, license_id, account_login, account_server, broker, bot_version, terminal_name, terminal_id, machine_id, status, first_bound_at, last_seen_at")
    .eq("license_id", license.id)
    .maybeSingle<BindingRow>()

  if (bindingError) {
    throw new Error(bindingError.message)
  }

  let binding: BindingRow | null = currentBinding ?? null

  if (binding) {
    const accountMismatch = binding.account_login !== accountLogin || binding.account_server !== accountServer
    if (accountMismatch) {
      const response = licenseResponse(license, {
        valid: false,
        can_trade: false,
        message: "License is already bound to another MT5 account.",
        status: "bound_to_other_account",
      })

      return {
        valid: false,
        canTrade: false,
        message: "License is already bound to another MT5 account.",
        status: "bound_to_other_account",
        response,
        context: null,
      } satisfies BotValidationResult
    }

    if (binding.status !== "active") {
      const response = licenseResponse(license, {
        valid: false,
        can_trade: false,
        message: `Binding ${binding.status}.`,
        status: binding.status,
      })

      return {
        valid: false,
        canTrade: false,
        message: `Binding ${binding.status}.`,
        status: binding.status,
        response,
        context: null,
      } satisfies BotValidationResult
    }

    const { data: updatedBinding, error: updateBindingError } = await supabase
      .from("license_bindings")
      .update({
        broker,
        bot_version: botVersion,
        terminal_name: terminalName,
        terminal_id: terminalId,
        machine_id: machineId,
        last_seen_at: validatedAt,
      })
      .eq("id", binding.id)
      .select("id, client_id, license_id, account_login, account_server, broker, bot_version, terminal_name, terminal_id, machine_id, status, first_bound_at, last_seen_at")
      .maybeSingle<BindingRow>()

    if (updateBindingError) {
      throw new Error(updateBindingError.message)
    }

    binding = updatedBinding ?? binding
  } else {
    if (!allowBind) {
      const response = licenseResponse(license, {
        valid: false,
        can_trade: false,
        message: "License has not been bound yet.",
        status: "unbound",
      })

      return {
        valid: false,
        canTrade: false,
        message: "License has not been bound yet.",
        status: "unbound",
        response,
        context: null,
      } satisfies BotValidationResult
    }

    const { data: existingAccountBinding, error: accountBindingError } = await supabase
      .from("license_bindings")
      .select("id, license_id")
      .eq("account_login", accountLogin)
      .eq("account_server", accountServer)
      .maybeSingle<{ id: string; license_id: string }>()

    if (accountBindingError) {
      throw new Error(accountBindingError.message)
    }

    if (existingAccountBinding && existingAccountBinding.license_id !== license.id) {
      const response = licenseResponse(license, {
        valid: false,
        can_trade: false,
        message: "This MT5 account is already linked to another license.",
        status: "account_already_bound",
      })

      return {
        valid: false,
        canTrade: false,
        message: "This MT5 account is already linked to another license.",
        status: "account_already_bound",
        response,
        context: null,
      } satisfies BotValidationResult
    }

    const { data: insertedBinding, error: insertBindingError } = await supabase
      .from("license_bindings")
      .insert({
        client_id: license.client_id,
        license_id: license.id,
        account_login: accountLogin,
        account_server: accountServer,
        broker,
        bot_version: botVersion,
        terminal_name: terminalName,
        terminal_id: terminalId,
        machine_id: machineId,
        status: "active",
        first_bound_at: validatedAt,
        last_seen_at: validatedAt,
      })
      .select("id, client_id, license_id, account_login, account_server, broker, bot_version, terminal_name, terminal_id, machine_id, status, first_bound_at, last_seen_at")
      .maybeSingle<BindingRow>()

    if (insertBindingError) {
      throw new Error(insertBindingError.message)
    }

    binding = insertedBinding ?? null
  }

  const licensePatch: Record<string, unknown> = {
    last_validated_at: validatedAt,
  }

  if (license.status === "pending") {
    licensePatch.status = "active"
    licensePatch.activated_at = license.activated_at || validatedAt
    licensePatch.starts_at = license.starts_at || validatedAt
  }

  const { data: updatedLicense, error: updateLicenseError } = await supabase
    .from("licenses")
    .update(licensePatch)
    .eq("id", license.id)
    .select("id, client_id, license_key, plan_code, plan_name, duration_days, status, starts_at, activated_at, expires_at, last_validated_at, auto_renew, metadata")
    .maybeSingle<LicenseRow>()

  if (updateLicenseError) {
    throw new Error(updateLicenseError.message)
  }

  const finalLicense = updatedLicense ?? license
  const response = licenseResponse(finalLicense, {
    valid: true,
    can_trade: true,
    message: "License validated.",
    status: finalLicense.status,
    account_login: binding?.account_login ?? accountLogin,
    account_server: binding?.account_server ?? accountServer,
    binding_id: binding?.id ?? null,
  })

  return {
    valid: true,
    canTrade: true,
    message: "License validated.",
    status: finalLicense.status,
    response,
    context: {
      clientId: finalLicense.client_id,
      licenseId: finalLicense.id,
      bindingId: binding?.id ?? null,
      license: finalLicense,
      binding,
    },
  } satisfies BotValidationResult
}
