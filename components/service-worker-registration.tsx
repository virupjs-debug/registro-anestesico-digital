'use client'

import { useEffect, useState } from 'react'

export function ServiceWorkerRegistration() {
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registrado:', reg.scope)

        // Detectar cuando hay una nueva versión esperando
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateReady(true)
            }
          })
        })
      })
      .catch((err) => {
        console.warn('[SW] Error al registrar:', err)
      })

    // Recargar cuando el nuevo SW toma control
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }, [])

  if (!updateReady) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-blue-700 px-4 py-2.5 text-white shadow-lg text-sm">
      <span>Nueva versión disponible</span>
      <button
        onClick={() => {
          navigator.serviceWorker.ready.then((reg) => {
            reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
          })
        }}
        className="rounded bg-white px-2.5 py-0.5 text-blue-700 font-medium text-xs hover:bg-blue-50 transition-colors"
      >
        Actualizar
      </button>
    </div>
  )
}
