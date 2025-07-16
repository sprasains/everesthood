"use client"

import * as React from "react"

import { Toast, ToastProvider, ToastViewport } from "./toast"

type ToastProps = Omit<React.ComponentPropsWithoutRef<typeof Toast>, "id"> & {
  id?: string
}

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: ToastProps) => void
} | null

const ToastContext = React.createContext<ToastContextType>(null)

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || Date.now().toString()
    setToasts((prev) => [...prev, { ...props, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProviderWrapper")
  }
  return context
}
