import { useState, useEffect, useCallback } from 'react'
import SettingsModal from '../components/SettingsModal'
import PhoneModal from '../components/PhoneModal'
import DashboardNav from '../components/dashboard/DashboardNav'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsGrid from '../components/dashboard/StatsGrid'
import AvailableBalanceBanner from '../components/dashboard/AvailableBalanceBanner'
import DailyLimits from '../components/dashboard/DailyLimits'
import ActivityLog from '../components/dashboard/ActivityLog'
import { API_URL } from '../apiBase'

export default function Dashboard({ user, onLogout }) {
  const [activity, setActivity] = useState([])
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [bskyHandle, setBskyHandle] = useState(user.profile?.bskyHandle || null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState('')

  const [stats, setStats] = useState({
    totalEarned: 0,
    earnedToday: 0,
    availableCoins: 0,
    claimedCoins: 0,
  })
  const [limits, setLimits] = useState({ posts: 0, replies: 0, likes: 0 })

  const logoutIfUnauthorized = useCallback((res) => {
    if (res.status === 401 || res.status === 403) {
      onLogout()
      return true
    }
    return false
  }, [onLogout])

  const loadActivity = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/activity/getActivity`, { credentials: 'include' })
      if (logoutIfUnauthorized(res)) return
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')

      setStats({
        totalEarned: data.stats.totalEarned,
        earnedToday: data.stats.earnedToday,
        availableCoins: data.stats.availableCoins,
        claimedCoins: data.stats.claimedCoins,
      })
      setLimits(data.limits)
      setActivity(data.activityLog)
    } catch (err) {
      console.error('loadActivity error:', err)
      setError('Failed to load dashboard data.')
    }
  }, [logoutIfUnauthorized])

  useEffect(() => {
    let active = true
    loadActivity().finally(() => {
      if (active) setLoadingInitial(false)
    })
    return () => {
      active = false
    }
  }, [loadActivity])

  async function handleRefresh() {
    setRefreshing(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/activity/refreshActivity`, { credentials: 'include' })
      if (logoutIfUnauthorized(res)) return
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refresh failed')

      await loadActivity()

      if (data.newCoins > 0) {
        alert(`✅ You earned ${data.newCoins} new DOPA!`)
      } else {
        alert('Activity synced — no new earnings since last refresh.')
      }
    } catch (err) {
      console.error('Refresh error:', err)
      setError(err.message || 'Failed to sync activity.')
    } finally {
      setRefreshing(false)
    }
  }

  async function executeWithdrawal() {
    setWithdrawing(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/wallet/sendFundsToWallet`, {
        method: 'POST',
        credentials: 'include',
      })
      if (logoutIfUnauthorized(res)) return
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed')

      await loadActivity()
      alert(`🎉 ${data.claimedAmount} DOPA sent to your wallet!\nTx: ${data.txHash}`)
    } catch (err) {
      console.error('Withdrawal error:', err)
      setError(err.message || 'Withdrawal failed. Please try again.')
    } finally {
      setWithdrawing(false)
    }
  }

  function handleSendFunds() {
    if (!user.profile?.phoneNumber) {
      setShowPhone(true)
    } else {
      executeWithdrawal()
    }
  }

  function handlePhoneVerified() {
    setShowPhone(false)
    executeWithdrawal()
  }

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-[#6b7390] font-mono">
        Loading Dashboard…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e8eaf0]">
      <DashboardNav
        bskyHandle={bskyHandle}
        walletAddress={user.walletAddress}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={onLogout}
      />

      <main className="max-w-5xl mx-auto px-6 py-7">
        <DashboardHeader onRefresh={handleRefresh} refreshing={refreshing} />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        <StatsGrid stats={stats} />

        <AvailableBalanceBanner
          availableCoins={stats.availableCoins}
          withdrawing={withdrawing}
          onSendFunds={handleSendFunds}
        />

        <DailyLimits limits={limits} />

        <ActivityLog activity={activity} filter={filter} onFilterChange={setFilter} />
      </main>

      {showSettings && (
        <SettingsModal
          user={{ ...user.profile, address: user.walletAddress }}
          onClose={() => setShowSettings(false)}
          bskyHandle={bskyHandle}
          setBskyHandle={setBskyHandle}
        />
      )}

      {showPhone && (
        <PhoneModal onVerified={handlePhoneVerified} onClose={() => setShowPhone(false)} />
      )}
    </div>
  )
}
