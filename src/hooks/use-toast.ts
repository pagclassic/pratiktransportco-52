
import * as React from "react";
import {
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToastState = {
  toasts: ToasterToast[]
}

let toastState: ToasterToastState = {
  toasts: [],
}

let listeners: ((state: ToasterToastState) => void)[] = []

const toaster = {
  subscribe(listener: (state: ToasterToastState) => void) {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getToasts() {
    return toastState.toasts
  },
  addToast(toast: ToasterToast) {
    toastState = {
      toasts: [toast, ...toastState.toasts].slice(0, TOAST_LIMIT),
    }

    listeners.forEach((listener) => {
      listener(toastState)
    })

    return toast
  },
  dismissToast(toastId: string) {
    // Find the toast to dismiss
    const { toasts } = toastState
    const toast = toasts.find((toast) => toast.id === toastId)

    if (toast) {
      // Update the toast state to mark it as closed
      toastState = {
        toasts: toasts.map((t) =>
          t.id === toastId
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }

      // Notify listeners of the state change
      listeners.forEach((listener) => {
        listener(toastState)
      })
    }

    // Remove the toast after a delay
    setTimeout(() => {
      toastState = {
        toasts: toasts.filter((t) => t.id !== toastId),
      }

      listeners.forEach((listener) => {
        listener(toastState)
      })
    }, TOAST_REMOVE_DELAY)
  },
  updateToast(
    toastId: string,
    toast: Partial<ToasterToast> & { id: string }
  ) {
    toastState = {
      toasts: toastState.toasts.map((t) =>
        t.id === toastId ? { ...t, ...toast } : t
      ),
    }

    listeners.forEach((listener) => {
      listener(toastState)
    })
  },
}

export function useToast() {
  const [state, setState] = React.useState<ToasterToastState>({
    toasts: [],
  })

  React.useEffect(() => {
    const unsubscribe = toaster.subscribe(setState)
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => toaster.dismissToast(toastId),
    update: (toastId: string, toast: Partial<ToasterToast>) =>
      toaster.updateToast(toastId, { ...toast, id: toastId }),
  }
}

type ToastOptions = Partial<
  Pick<ToasterToast, "action" | "description" | "title" | "variant">
>

export const toast = ({ ...props }: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9)

  return toaster.addToast({
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) {
        toaster.dismissToast(id)
      }
    },
  })
}
