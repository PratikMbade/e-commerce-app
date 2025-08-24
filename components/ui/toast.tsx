"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Button } from "./button"
import { useToast } from "@/lib/toast-context"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastProps {
  toast: {
    id: string
    message: string
    type: "success" | "error" | "info"
  }
  onRemove: (id: string) => void
}

function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div
      className={`${getBgColor()} border rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-right-full duration-300`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{toast.message}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(toast.id)} className="h-6 w-6 p-0 hover:bg-gray-200">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
