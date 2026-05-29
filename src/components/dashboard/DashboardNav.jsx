function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
}

export default function DashboardNav({ bskyHandle, walletAddress, onOpenSettings, onLogout }) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-3.5 bg-[#0f1117] border-b border-white/[0.07]">
      <div className="flex items-center gap-2.5 font-mono font-bold text-base text-[#e8eaf0]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-xs">
          🪙
        </div>
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
          🦊 {shortAddress(walletAddress)}
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-sm flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer"
          title="Settings"
        >
          ⚙️
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-8 h-8 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-sm flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer"
          title="Disconnect"
        >
          ↩
        </button>
      </div>
    </nav>
  )
}
