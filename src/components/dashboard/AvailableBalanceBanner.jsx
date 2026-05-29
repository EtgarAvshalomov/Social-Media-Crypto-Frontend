export default function AvailableBalanceBanner({ availableCoins, withdrawing, onSendFunds }) {
  if (availableCoins <= 0) return null

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-5 py-4 mb-5 bg-[#4f8ef7]/[0.05] border border-[#4f8ef7]/[0.18] rounded-xl">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-lg shrink-0">
          🪙
        </div>
        <div>
          <div className="font-mono font-bold text-[15px]">{availableCoins} DOPA available</div>
          <div className="text-[11px] text-[#6b7390] mt-0.5">
            Coins sit in your platform balance. Send to wallet whenever you&apos;re ready.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSendFunds}
        disabled={withdrawing}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400/12 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-bold hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap disabled:opacity-50"
      >
        {withdrawing ? '⏳ Sending…' : '↑ Send Funds to My Wallet'}
      </button>
    </div>
  )
}
