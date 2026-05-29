export default function StatsGrid({ stats }) {
  const todayPct = Math.min((stats.earnedToday / 100) * 100, 100)

  return (
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
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc]"
            style={{ width: `${todayPct}%` }}
          />
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
  )
}
