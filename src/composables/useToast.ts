import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

// Estado global reactivo para los Toasts
const toasts = ref<Toast[]>([])

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)

    toasts.value.push({
      id,
      message,
      type,
    })

    // Auto-eliminar después del tiempo definido
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    show,
    remove,
    success: (message: string, duration?: number) => show(message, 'success', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration),
    info: (message: string, duration?: number) => show(message, 'info', duration),
  }
}
