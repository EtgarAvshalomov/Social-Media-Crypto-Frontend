import { TYPE_ICONS, TYPE_LABELS, BADGE, BADGE_LABEL, ICON_BG } from './activityConstants'

export default function ActivityRow({ item, isLast }) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 hover:bg-[#1e2336] transition-colors ${isLast ? '' : 'border-b border-white/[0.07]'}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${ICON_BG[item.type]}`}>
        {TYPE_ICONS[item.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">{TYPE_LABELS[item.type]}</div>
        <div className="text-[11px] text-[#6b7390] mt-0.5 truncate">
          {item.text} · {item.time}
        </div>
      </div>
      <div className={`font-mono text-xs font-bold shrink-0 ${item.coins === 0 ? 'text-[#6b7390]' : 'text-yellow-400'}`}>
        🪙 +{item.coins}
      </div>
      <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${BADGE[item.status]}`}>
        {BADGE_LABEL[item.status]}
      </div>
    </div>
  )
}
