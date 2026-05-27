import { useEffect } from 'react'

/**
 * Pings the backend every 10 minutes to prevent Render free tier from sleeping.
 * Uses relative /api path — Vercel proxies this to Render automatically.
 */
export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ping@keep.alive', password: 'ping' }),
      }).catch(() => {}) // silently ignore — just waking up the server
    }

    // Ping immediately on load to wake backend
    ping()

    // Then every 10 minutes to keep it alive
    const interval = setInterval(ping, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return null
}
