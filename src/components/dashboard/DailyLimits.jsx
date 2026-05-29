const ROWS = [
  {
    key: 'posts',
    label: '✍️ Posts Created',
    max: 5,
    suffix: '/ 5 posts · 50 coins max',
    barClass: 'bg-gradient-to-r from-[#4f8ef7] to-[#7c5cfc]',
  },
  {
    key: 'replies',
    label: '↩️ Replies',
    max: 25,
    suffix: '/ 25 coins max',
    barClass: 'bg-gradient-to-r from-[#7c5cfc] to-purple-400',
  },
  {
    key: 'likes',
    label: '❤️ Likes',
    max: 25,
    suffix: '/ 25 coins max',
    barClass: 'bg-gradient-to-r from-pink-400 to-rose-400',
  },
]

export default function DailyLimits({ limits }) {
  return (
    <div className="bg-[#181c26] border border-white/[0.07] rounded-xl overflow-hidden mb-5">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.07]">
        <span className="font-mono font-bold text-[13px]">Daily Limits</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#4f8ef7]/10 text-[#4f8ef7] border border-[#4f8ef7]/18 font-mono">
          Resets Midnight IL
        </span>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/[0.07]">
        {ROWS.map((row) => {
          const value = limits[row.key]
          const pct = Math.min((value / row.max) * 100, 100)
          const capped = value >= row.max
          return (
            <div key={row.key} className="px-5 py-4">
              <div className="text-[11px] text-[#6b7390] mb-2">{row.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-bold text-sm">{value}</span>
                <span className="text-[10px] text-[#6b7390]">{row.suffix}</span>
              </div>
              <div className="mt-2 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${pct}%` }} />
              </div>
              {capped && <div className="text-[10px] text-red-400 mt-1.5">Daily cap reached</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
