import { useEffect } from 'react'

const BACKEND_URL = import.meta.env.VITE_API_URL || ''

/**
 * Pings the backend every 10 minutes to prevent Render free tier from sleeping.
 * Only runs when VITE_API_URL is set (i.e., in production deployment).
 */
export default function KeepAlive() {
  useEffect(() => {
    if (!BACKEND_URL) return // skip in local dev (nginx handles routing)

    const ping = () => {
      fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ping@keep.alive', password: 'ping' }),
      }).catch(() => {}) // silently ignore errors — this is just a wake-up call
    }

    // Ping immediately on app load to wake backend
    ping()

    // Then ping every 10 minutes to keep it awake
    const interval = setInterval(ping, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return null // renders nothing
}
