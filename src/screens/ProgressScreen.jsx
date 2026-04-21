import { TrendingUp, Zap, Flame, Clock, Dumbbell } from 'lucide-react'
import { getLevelInfo, LEVELS } from '../data/progression'

export default function ProgressScreen({ user }) {
  const levelInfo = getLevelInfo(user.totalXP)
  const totalTimeMin = Math.floor(user.totalTime / 60)

  return (
    <div className="min-h-screen bg-obsidian pb-24 overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={20} className="text-amber-accent" />
          <h1 className="font-syne font-bold text-2xl text-white">Progress</h1>
        </div>
        <p className="font-dm text-text-secondary text-sm">Your training history</p>
      </div>

      {/* Level card */}
      <div className="mx-5 card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-syne font-bold text-xl text-white">{levelInfo.name}</p>
            <p className="font-dm text-text-secondary text-xs">Level {levelInfo.levelIndex + 1} of {LEVELS.length}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-accent/15 border border-amber-accent/25 px-3 py-1.5 rounded-full">
            <Zap size={14} className="text-amber-accent" />
            <span className="font-syne font-bold text-amber-accent text-sm">{user.totalXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Level progression */}
        <div className="space-y-2">
          {LEVELS.map((level, i) => {
            const isUnlocked = levelInfo.levelIndex >= i
            const isCurrent = levelInfo.levelIndex === i
            return (
              <div key={level.name} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isUnlocked ? 'bg-teal-success' : 'bg-border-mid'
                } ${isCurrent ? 'ring-2 ring-teal-success/30 scale-125' : ''}`} />
                <span className={`font-dm text-sm flex-1 ${
                  isCurrent ? 'text-white font-medium' : isUnlocked ? 'text-text-muted' : 'text-text-secondary'
                }`}>
                  {level.name}
                </span>
                <span className="font-dm text-xs text-text-secondary">{level.threshold.toLocaleString()} XP</span>
              </div>
            )
          })}
        </div>

        {!levelInfo.isMaxLevel && (
          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span className="font-dm text-xs text-text-secondary">Progress to {LEVELS[levelInfo.levelIndex + 1]?.name}</span>
              <span className="font-dm text-xs text-amber-accent">{Math.round(levelInfo.progress)}%</span>
            </div>
            <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-accent rounded-full transition-all duration-700"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mx-5 mb-4">
        {[
          { label: 'Total Sessions', value: user.totalSessions, icon: Dumbbell, color: 'text-amber-accent' },
          { label: 'Best Streak', value: `${user.streak} days`, icon: Flame, color: 'text-amber-accent' },
          { label: 'Time Trained', value: `${totalTimeMin}m`, icon: Clock, color: 'text-teal-success' },
          { label: 'Current Week', value: `Week ${user.currentWeek}`, icon: TrendingUp, color: 'text-text-muted' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex flex-col gap-2">
            <Icon size={18} className={color} />
            <span className="font-syne font-bold text-2xl text-white">{value}</span>
            <span className="font-dm text-xs text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {/* Placeholder for chart */}
      <div className="mx-5 card p-5">
        <p className="font-syne font-semibold text-sm text-white mb-1">Weekly Activity</p>
        <p className="font-dm text-xs text-text-secondary mb-4">Sessions per day, last 7 days</p>
        <div className="flex items-end justify-between gap-1.5 h-20">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const height = [100, 100, 66, 100, 100, 33, 0][i]
            const isToday = i === new Date().getDay() - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ${
                    height === 100 ? 'bg-teal-success' :
                    height > 0 ? 'bg-teal-success/50' :
                    'bg-border-subtle'
                  }`}
                  style={{ height: `${Math.max(4, height)}%` }}
                />
                <span className={`font-dm text-[10px] ${isToday ? 'text-amber-accent font-semibold' : 'text-text-secondary'}`}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
