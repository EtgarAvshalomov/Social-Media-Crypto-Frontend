export default function DashboardHeader({ onRefresh, refreshing }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="font-mono font-bold text-xl text-[#e8eaf0]">Activity Dashboard</h1>
        <p className="text-xs text-[#6b7390] mt-1">{today}</p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className={`w-9 h-9 rounded-lg bg-[#181c26] border border-white/[0.07] text-[#6b7390] text-lg flex items-center justify-center hover:text-[#e8eaf0] transition-colors cursor-pointer disabled:opacity-50 ${refreshing ? 'animate-spin' : ''}`}
        title="Refresh Activity"
      >
        ↻
      </button>
    </div>
  )
}
