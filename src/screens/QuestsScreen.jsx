import { Zap, CheckCircle2 } from 'lucide-react'
import { getDailyQuests, QUESTS } from '../data/progression'

export default function QuestsScreen({ user }) {
  const todayStr = new Date().toDateString()
  const dailyQuests = getDailyQuests(todayStr)

  // Dummy: first daily quest is completed
  const completedQuestIds = new Set(['all-three'])

  return (
    <div className="min-h-screen bg-obsidian pb-24 overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-amber-accent" fill="#e8a04a" />
          <h1 className="font-syne font-bold text-2xl text-white">Quests</h1>
        </div>
        <p className="font-dm text-text-secondary text-sm">Daily challenges · Resets at midnight</p>
      </div>

      {/* Daily quests */}
      <div className="px-5 mb-6">
        <p className="font-syne font-semibold text-xs text-text-secondary uppercase tracking-widest mb-3">
          Today's Quests
        </p>
        <div className="flex flex-col gap-3">
          {dailyQuests.map(quest => {
            const isDone = completedQuestIds.has(quest.id)
            return (
              <div
                key={quest.id}
                className={`card p-4 flex items-center gap-4 transition-all ${
                  isDone ? 'border-teal-success/20 bg-teal-success/5' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isDone ? 'bg-teal-success/15' : 'bg-border-subtle'
                }`}>
                  <span>{quest.icon}</span>
                </div>
                <div className="flex-1">
                  <p className={`font-dm text-sm font-medium ${isDone ? 'line-through text-text-muted' : 'text-white'}`}>
                    {quest.label}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap size={11} className="text-amber-accent" />
                    <span className="font-dm text-xs text-amber-accent">+{quest.xp} XP</span>
                  </div>
                </div>
                {isDone && <CheckCircle2 size={20} className="text-teal-success flex-shrink-0" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* All quests */}
      <div className="px-5">
        <p className="font-syne font-semibold text-xs text-text-secondary uppercase tracking-widest mb-3">
          All Quests
        </p>
        <div className="flex flex-col gap-2">
          {QUESTS.map(quest => (
            <div key={quest.id} className="card p-3 flex items-center gap-3">
              <span className="text-lg w-8 text-center">{quest.icon}</span>
              <div className="flex-1">
                <p className="font-dm text-sm text-white">{quest.label}</p>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={11} className="text-amber-accent" />
                <span className="font-dm text-xs text-amber-accent font-medium">+{quest.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
