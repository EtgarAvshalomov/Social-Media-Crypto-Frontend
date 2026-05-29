import { useState, useEffect, useCallback } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import { API_URL } from './apiBase'
import './index.css'

function parseUserFromProfilePayload(data) {
  const u = data?.user
  if (!u || typeof u !== 'object') return null
  const walletAddress = u.walletAddress ?? u.address ?? data.walletAddress
  if (!walletAddress) return null
  return { walletAddress, profile: u }
}

export default function App() {
  const [user, setUser] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const res = await fetch(`${API_URL}/auth/profile`, { credentials: 'include' })
        if (cancelled) return
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const next = parseUserFromProfilePayload(data)
        if (next) setUser(next)
      } catch {
        /* offline or server unreachable — stay logged out */
      } finally {
        if (!cancelled) setSessionChecked(true)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = useCallback((userData) => {
    setUser(userData)
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
  }, [])

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-[#6b7390] font-mono text-sm">
        Checking your session…
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
