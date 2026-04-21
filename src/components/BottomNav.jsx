import { Home, BarChart2, Zap, Settings } from 'lucide-react'

const TABS = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'progress', label: 'Progress', Icon: BarChart2 },
  { id: 'quests',   label: 'Quests',   Icon: Zap },
  { id: 'settings', label: 'Settings', Icon: Settings },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]
                    bg-obsidian/95 backdrop-blur-md border-t border-border-subtle
                    flex items-center pb-safe z-50">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200"
          >
            <Icon
              size={22}
              className={`transition-colors duration-200 ${
                isActive ? 'text-amber-accent' : 'text-text-secondary'
              }`}
              strokeWidth={isActive ? 2.5 : 1.75}
            />
            <span
              className={`text-[10px] font-dm font-medium tracking-wide transition-colors duration-200 ${
                isActive ? 'text-amber-accent' : 'text-text-secondary'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
