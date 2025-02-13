"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast className="grid gap-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x border-none text-white" key={id} {...props}>
            <div>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose/>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
