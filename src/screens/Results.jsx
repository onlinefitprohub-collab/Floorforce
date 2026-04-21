import { useEffect, useState } from 'react'
import { Home, RefreshCw, Zap } from 'lucide-react'
import { getLevelInfo } from '../data/progression'

const CELEBRATIONS = [
  { emoji: '🔥', text: 'Floor is yours.' },
  { emoji: '⚡', text: 'That just happened.' },
  { emoji: '💪', text: 'Consistency compounds.' },
  { emoji: '🏆', text: 'Another one done.' },
  { emoji: '🎯', text: 'Locked in.' },
]

function pickCelebration(sessionTime) {
  return CELEBRATIONS[sessionTime % CELEBRATIONS.length]
}

export default function Results({ results, user, onHome, onRepeat }) {
  const [xpAnimated, setXpAnimated] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const levelInfoBefore = getLevelInfo(results.newTotalXP - results.xpEarned)
  const levelInfoAfter = getLevelInfo(results.newTotalXP)
  const leveledUp = levelInfoAfter.levelIndex > levelInfoBefore.levelIndex

  const celebration = pickCelebration(results.sessionTime)

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 200)
    const t2 = setTimeout(() => setXpAnimated(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const mins = Math.floor(results.sessionTime / 60)
  const secs = results.sessionTime % 60
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  return (
    <div className="min-h-screen bg-obsidian flex flex-col px-5 pt-12 pb-10 overflow-y-auto">
      {/* Celebration header */}
      <div className="flex flex-col items-center mb-10 animate-celebration">
        <span className="text-7xl mb-4">{celebration.emoji}</span>
        <h1 className="font-syne font-bold text-3xl text-white text-center mb-1">
          Session Complete
        </h1>
        <p className="font-dm text-text-muted text-base">{celebration.text}</p>
        {leveledUp && (
          <div className="mt-4 bg-amber-accent/15 border border-amber-accent/30 rounded-2xl px-5 py-3
                          flex items-center gap-2 animate-scale-in">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-syne font-bold text-amber-accent text-sm">Level Up!</p>
              <p className="font-dm text-white text-xs">
                {levelInfoBefore.name} → <span className="font-semibold">{levelInfoAfter.name}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4-stat grid */}
      {showStats && (
        <div className="grid grid-cols-2 gap-3 mb-8 animate-fade-in">
          <StatBox label="Reps Completed" value={results.repsCompleted} unit="reps" color="text-teal-success" />
          <StatBox label="XP Earned" value={`+${results.xpEarned}`} unit="xp" color="text-amber-accent" />
          <StatBox label="Current Streak" value={results.streak} unit="days" color="text-amber-accent" />
          <StatBox label="Session Time" value={timeStr} color="text-text-muted" />
        </div>
      )}

      {/* XP progress bar */}
      {showStats && (
        <div className="card p-5 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-syne font-semibold text-white text-sm">{levelInfoAfter.name}</p>
              <p className="font-dm text-text-secondary text-xs">
                {levelInfoAfter.isMaxLevel
                  ? 'Maximum level reached'
                  : `${levelInfoAfter.xpToNext} XP to ${
                      levelInfoAfter.levelIndex + 1 < 6
                        ? ['Novice','Recruit','Contender','Specialist','Elite','Pelvic Master'][levelInfoAfter.levelIndex + 1]
                        : 'max'
                    }`
                }
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={15} className="text-amber-accent" />
              <span className="font-syne font-bold text-amber-accent text-sm">
                {results.newTotalXP.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-full bg-border-subtle rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-accent transition-all duration-1000 ease-out"
              style={{ width: xpAnimated ? `${levelInfoAfter.progress}%` : `${levelInfoBefore.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="font-dm text-[10px] text-text-secondary">
              {levelInfoAfter.currentThreshold.toLocaleString()} XP
            </span>
            <span className="font-dm text-[10px] text-text-secondary">
              {levelInfoAfter.nextThreshold.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={onRepeat}
          className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw size={16} />
          Do it again
        </button>
        <button
          onClick={onHome}
          className="btn-primary flex-1 py-4 flex items-center justify-center gap-2 text-sm"
        >
          <Home size={16} className="text-obsidian" />
          Back to Home
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value, unit, color }) {
  return (
    <div className="card p-4 flex flex-col items-center gap-1">
      <span className={`font-syne font-bold text-3xl ${color}`}>{value}</span>
      {unit && <span className="font-dm text-xs text-text-secondary">{unit}</span>}
      <span className="font-dm text-xs text-text-muted text-center">{label}</span>
    </div>
  )
}
