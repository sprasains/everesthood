"use client"

import * as React from "react"

import { ToastProvider } from "./toast"

const ToastContext = React.createContext<{
  toast: ({ ...props }: any) => void
} | null>(null)

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<any[]>([])
  const addToast = React.useCallback((props: any) => {
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

// Re-exporting shadcn/ui toast components (assuming they are in the same directory)
export { Toast, ToastViewport } from "./toast"
