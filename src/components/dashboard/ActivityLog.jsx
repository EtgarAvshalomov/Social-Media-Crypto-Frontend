import ActivityRow from './ActivityRow'
import { ACTIVITY_FILTERS } from './activityConstants'

export default function ActivityLog({ activity, filter, onFilterChange }) {
  const filtered = activity.filter((a) => filter === 'all' || a.type === filter)

  return (
    <div className="bg-[#181c26] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] flex-wrap gap-3">
        <span className="font-mono font-bold text-[13px]">Activity Log</span>
        <div className="flex gap-1.5 flex-wrap">
          {ACTIVITY_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors cursor-pointer ${
                filter === f.key
                  ? 'text-[#4f8ef7] border-[#4f8ef7]/40'
                  : 'text-[#6b7390] border-white/[0.07] hover:text-[#e8eaf0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-[#6b7390]">
          No activity found. Make a post, reply, or like on Bluesky and click refresh!
        </div>
      ) : (
        filtered.map((item, i) => (
          <ActivityRow key={item.id} item={item} isLast={i === filtered.length - 1} />
        ))
      )}
    </div>
  )
}
