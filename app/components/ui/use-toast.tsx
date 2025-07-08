"use client"

import * as React from "react"

import { ToastProvider, Toast, ToastViewport } from "./toast"

type ToastContextType = {
  toast: (props: Record<string, any>) => void;
} | null;

const ToastContext = React.createContext<ToastContextType>(null);

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<any[]>([])
  const addToast = React.useCallback((props: Record<string, any>) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...props }])
  }, [])

  const removeToast = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, ...props }) => (
          <Toast key={id} onOpenChange={() => removeToast(id)} {...props} />
        ))}
        <ToastViewport />
      </ToastProvider>
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
