"use client"

import { useState, useEffect, useCallback } from "react"

export type ServiceStatus = "active" | "pending" | "paused" | "detected"

interface ServiceState {
  status: ServiceStatus
  pendingAmount: number
  lastPaymentDate: string | null
  pendingSince: string | null // When the pending status started
}

const STORAGE_KEY = "bellyswiss_service_status"
const GRACE_PERIOD_DAYS = 3 // Days before pending becomes paused

const defaultState: ServiceState = {
  status: "pending",
  pendingAmount: 8.00,
  lastPaymentDate: null,
  pendingSince: new Date().toISOString(),
}

export function useServiceStatus() {
  const [state, setState] = useState<ServiceState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setState(JSON.parse(stored))
      } catch {
        setState(defaultState)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent("serviceStatusChange", { detail: state }))
    }
  }, [state, isLoaded])

  // Listen for changes from other components/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue))
        } catch {
          // ignore parse errors
        }
      }
    }

    const handleCustomEvent = (e: CustomEvent<ServiceState>) => {
      setState(e.detail)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("serviceStatusChange", handleCustomEvent as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("serviceStatusChange", handleCustomEvent as EventListener)
    }
  }, [])

  // Auto-calculate status based on amount and grace period
  const calculateStatus = useCallback((pendingAmount: number, pendingSince: string | null): ServiceStatus => {
    if (pendingAmount <= 0) {
      return "active"
    }
    
    if (pendingSince) {
      const pendingDate = new Date(pendingSince)
      const now = new Date()
      const daysPending = Math.floor((now.getTime() - pendingDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysPending >= GRACE_PERIOD_DAYS) {
        return "paused"
      }
    }
    
    return "pending"
  }, [])

  // Check and update status periodically
  useEffect(() => {
    if (!isLoaded) return
    
    const newStatus = calculateStatus(state.pendingAmount, state.pendingSince)
    if (newStatus !== state.status) {
      setState(prev => ({ ...prev, status: newStatus }))
    }
  }, [isLoaded, state.pendingAmount, state.pendingSince, state.status, calculateStatus])

  const confirmPayment = useCallback(() => {
    setState({
      status: "active",
      pendingAmount: 0,
      lastPaymentDate: new Date().toISOString(),
      pendingSince: null,
    })
  }, [])

  const setPending = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      status: amount > 0 ? "pending" : "active",
      pendingAmount: amount,
      pendingSince: amount > 0 ? (prev.pendingSince || new Date().toISOString()) : null,
    }))
  }, [])

  // Simulate pause for testing (set pending since to past date)
  const simulatePause = useCallback(() => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - (GRACE_PERIOD_DAYS + 1))
    setState(prev => ({
      ...prev,
      status: "paused",
      pendingSince: pastDate.toISOString(),
    }))
  }, [])

  // Get status message
  const getStatusMessage = useCallback(() => {
    switch (state.status) {
      case "active":
        return "Servicio al dia. Operacion habilitada."
      case "pending":
        return "Pendiente de regularizacion del servicio."
      case "detected":
        return "Pago detectado. Pendiente de confirmacion."
      case "paused":
        return "Sistema en pausa por estado del servicio."
      default:
        return ""
    }
  }, [state.status])

  return {
    ...state,
    isLoaded,
    confirmPayment,
    setPending,
    simulatePause,
    getStatusMessage,
    isActive: state.status === "active",
    isPending: state.status === "pending",
    isDetected: state.status === "detected",
    isPaused: state.status === "paused",
  }
}
