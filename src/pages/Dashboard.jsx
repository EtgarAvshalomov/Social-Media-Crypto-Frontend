import { useState, useEffect } from 'react'
import SettingsModal from '../components/SettingsModal'
import PhoneModal from '../components/PhoneModal'

const API_URL = import.meta.env.VITE_API_URL // e.g. http://localhost:3000/api

const TYPE_ICONS  = { post: '✍️', sent: '↩️', like: '❤️' }
const TYPE_LABELS = { post: 'Created a Post', sent: 'Replied to a Post', like: 'Liked a Post' }

const BADGE = {
  available: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  claimed:   'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  capped:    'bg-red-400/10 text-red-400 border border-red-400/20',
}
const BADGE_LABEL = { available: 'AVAILABLE', claimed: 'CLAIMED', capped: 'CAP HIT' }

const ICON_BG = { post: 'bg-[#4f8ef7]/10', sent: 'bg-emerald-400/10', like: 'bg-pink-500/10' }

export default function Dashboard({ user, onLogout }) {
  const [activity, setActivity]           = useState([])
  const [filter, setFilter]               = useState('all')
  const [refreshing, setRefreshing]       = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [showSettings, setShowSettings]   = useState(false)
  const [showPhone, setShowPhone]         = useState(false)
  const [bskyHandle, setBskyHandle]       = useState(user.profile?.bskyHandle || null)
  const [withdrawing, setWithdrawing]     = useState(false)
  const [error, setError]                 = useState('')

  const [stats, setStats]   = useState({ totalEarned: 0, earnedToday: 0, availableCoins: 0, claimedCoins: 0 })
  const [limits, setLimits] = useState({ posts: 0, replies: 0, likes: 0 })

  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  const filteredActivity = activity.filter(a => filter === 'all' || a.type === filter)

  // ─── Load dashboard data from the real API ────────────────────────────────
  async function loadActivity() {
    try {
      const res  = await fetch(`${API_URL}/activity/getActivity`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')

      setStats({
        totalEarned:    data.stats.totalEarned,
        earnedToday:    data.stats.earnedToday,
        availableCoins: data.stats.availableCoins,
        claimedCoins:   data.stats.claimedCoins,
      })
      setLimits(data.limits)
      setActivity(data.activityLog)
    } catch (err) {
      console.error('loadActivity error:', err)
      setError('Failed to load dashboard data.')
    }
  }

  useEffect(() => {
    loadActivity()
    .finally(() => setLoadingInitial(false))
  }, [])

  // ─── Refresh: hit the Bluesky scraper then reload dashboard ──────────────
  async function handleRefresh() {
    setRefreshing(true)
    setError('')
    try {
      const res  = await fetch(`${API_URL}/activity/refreshActivity`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refresh failed')

      // Reload fresh stats after scrape
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

  // ─── Send funds flow ──────────────────────────────────────────────────────
  async function executeWithdrawal() {
    setWithdrawing(true)
    setError('')
    try {
      const res  = await fetch(`${API_URL}/wallet/sendFundsToWallet`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed')

      await loadActivity() // refresh balances
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
      setShowPhone(true)          // open phone verification first
    } else {
      executeWithdrawal()
    }
  }

  function handlePhoneVerified() {
    setShowPhone(false)
    executeWithdrawal()           // proceed straight to withdrawal after verify
  }

  const filters = [
    { key: 'all',  label: 'All' },
    { key: 'post', label: 'Posts' },
    { key: 'sent', label: 'Replies' },
    { key: 'like', label: 'Likes' },
  ]

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-[#6b7390] font-mono">
        Loading Dashboard…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e8eaf0]">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3.5 bg-[#0f1117] border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5 font-mono font-bold text-base text-[#e8eaf0]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-xs">🪙</div>
          DopaCoin
        </div>
        <div className="flex items-center gap-2">
          {bskyHandle && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono bg-[#181c26] border border-white/[0.07] text-[#7ec8e3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7ec8e3] animate-pulse" />
              {bskyHandle}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono bg-[#181c26] border border-[#4f8ef7]/30 text-[#4f8ef7]">
            🦊 {shortAddress(user.walletAddress)}
          </div>
          <button onClick={() => setShowSettings(true)} className="w-8 h-8 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-sm flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer" title="Settings">⚙️</button>
          <button onClick={onLogout} className="w-8 h-8 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-sm flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer" title="Disconnect">↩</button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-7">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-mono font-bold text-xl text-[#e8eaf0]">Activity Dashboard</h1>
            <p className="text-xs text-[#6b7390] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`w-9 h-9 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-lg flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer disabled:opacity-50 ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Activity"
          >↻</button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
          <div className="bg-[#181c26] border border-white/[0.07] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#6b7390] mb-2">Total Earned</div>
            <div className="font-mono font-bold text-2xl text-[#4f8ef7]">{stats.totalEarned.toLocaleString()}</div>
            <div className="text-[11px] text-[#6b7390] mt-1">DOPA all time</div>
          </div>
          <div className="bg-[#181c26] border border-white/[0.07] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#6b7390] mb-2">Earned Today</div>
            <div className="font-mono font-bold text-2xl text-yellow-400">{stats.earnedToday}</div>
            <div className="text-[11px] text-[#6b7390] mt-1">of 100 max today</div>
            <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc]" style={{ width: `${Math.min((stats.earnedToday / 100) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="bg-[#181c26] border border-white/[0.07] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#6b7390] mb-2">Available</div>
            <div className="font-mono font-bold text-2xl text-emerald-400">{stats.availableCoins}</div>
            <div className="text-[11px] text-[#6b7390] mt-1">ready to withdraw</div>
          </div>
          <div className="bg-[#181c26] border border-white/[0.07] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#6b7390] mb-2">Claimed to Wallet</div>
            <div className="font-mono font-bold text-2xl text-[#6b7390]">{stats.claimedCoins.toLocaleString()}</div>
            <div className="text-[11px] text-[#6b7390] mt-1">lifetime withdrawn</div>
          </div>
        </div>

        {/* Available balance box */}
        {stats.availableCoins > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-4 px-5 py-4 mb-5 bg-[#4f8ef7]/[0.05] border border-[#4f8ef7]/[0.18] rounded-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-lg shrink-0">🪙</div>
              <div>
                <div className="font-mono font-bold text-[15px]">{stats.availableCoins} DOPA available</div>
                <div className="text-[11px] text-[#6b7390] mt-0.5">Coins sit in your platform balance. Send to wallet whenever you're ready.</div>
              </div>
            </div>
            <button
              onClick={handleSendFunds}
              disabled={withdrawing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/12 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-bold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {withdrawing ? '⏳ Sending…' : '↑ Send Funds to My Wallet'}
            </button>
          </div>
        )}

        {/* Daily limits */}
        <div className="bg-[#181c26] border border-white/[0.07] rounded-xl overflow-hidden mb-5">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.07]">
            <span className="font-mono font-bold text-[13px]">Daily Limits</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#4f8ef7]/10 text-[#4f8ef7] border border-[#4f8ef7]/18 font-mono">Resets Midnight IL</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/[0.07]">

            <div className="px-5 py-4">
              <div className="text-[11px] text-[#6b7390] mb-2">✍️ Posts Created</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-sm">{limits.posts}</span>
                <span className="text-[10px] text-[#6b7390]">/ 5 posts · 50 coins max</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc]" style={{ width: `${Math.min((limits.posts / 5) * 100, 100)}%` }} />
              </div>
              {limits.posts >= 5 && <div className="text-[10px] text-red-400 mt-1.5">Daily cap reached</div>}
            </div>

            <div className="px-5 py-4">
              <div className="text-[11px] text-[#6b7390] mb-2">↩️ Replies</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-sm">{limits.replies}</span>
                <span className="text-[10px] text-[#6b7390]">/ 25 coins max</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7c5cfc] to-purple-400" style={{ width: `${Math.min((limits.replies / 25) * 100, 100)}%` }} />
              </div>
              {limits.replies >= 25 && <div className="text-[10px] text-red-400 mt-1.5">Daily cap reached</div>}
            </div>

            <div className="px-5 py-4">
              <div className="text-[11px] text-[#6b7390] mb-2">❤️ Likes</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-sm">{limits.likes}</span>
                <span className="text-[10px] text-[#6b7390]">/ 25 coins max</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400" style={{ width: `${Math.min((limits.likes / 25) * 100, 100)}%` }} />
              </div>
              {limits.likes >= 25 && <div className="text-[10px] text-red-400 mt-1.5">Daily cap reached</div>}
            </div>

          </div>
        </div>

        {/* Activity log */}
        <div className="bg-[#181c26] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] flex-wrap gap-3">
            <span className="font-mono font-bold text-[13px]">Activity Log</span>
            <div className="flex gap-1.5 flex-wrap">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors cursor-pointer ${
                    filter === f.key ? 'text-[#4f8ef7] border-[#4f8ef7]/40' : 'text-[#6b7390] border-white/[0.07] hover:text-[#e8eaf0]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredActivity.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-[#6b7390]">
              No activity found. Make a post on Bluesky and click refresh!
            </div>
          ) : (
            filteredActivity.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-5 py-3.5 hover:bg-[#1e2336] transition-colors ${i < filteredActivity.length - 1 ? 'border-b border-white/[0.07]' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${ICON_BG[item.type]}`}>
                  {TYPE_ICONS[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{TYPE_LABELS[item.type]}</div>
                  <div className="text-[11px] text-[#6b7390] mt-0.5 truncate">{item.text} · {item.time}</div>
                </div>
                <div className={`font-mono text-xs font-bold shrink-0 ${item.coins === 0 ? 'text-[#6b7390]' : 'text-yellow-400'}`}>
                  🪙 +{item.coins}
                </div>
                <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${BADGE[item.status]}`}>
                  {BADGE_LABEL[item.status]}
                </div>
              </div>
            ))
          )}
        </div>

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
