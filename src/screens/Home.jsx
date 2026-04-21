import { Flame, Zap, Play, CheckCircle2, Lock, Clock, Dumbbell, CalendarDays, ChevronRight } from 'lucide-react'
import CircularRing from '../components/CircularRing'
import {
  getLevelInfo,
  getSession,
  getCurrentSessionType,
  getSessionDuration,
  formatDuration,
  PROGRAM,
} from '../data/progression'

const SESSION_CONFIG = {
  morning:   { label: 'Morning',   sub: 'Endurance Holds',  time: 'Before noon',  icon: '🌅' },
  afternoon: { label: 'Afternoon', sub: 'Quick Flicks',     time: 'Noon – 6 PM',  icon: '⚡' },
  evening:   { label: 'Evening',   sub: 'Reverse & Breathe',time: 'After 6 PM',   icon: '🌙' },
}

const SESSION_ORDER = ['morning', 'afternoon', 'evening']

function SessionCard({ type, week, state, onStart }) {
  const cfg = SESSION_CONFIG[type]
  const session = getSession(week, type)
  const duration = getSessionDuration(session.exercises)
  const isDone = state === 'done'
  const isActive = state === 'active'
  const isLocked = state === 'locked'

  return (
    <div
      className={`card p-4 flex items-center gap-4 transition-all duration-200 ${
        isActive ? 'border-amber-accent/40 bg-obsidian-mid' : ''
      } ${isLocked ? 'opacity-50' : ''}`}
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
          isDone ? 'bg-teal-success/15' :
          isActive ? 'bg-amber-accent/15' :
          'bg-border-subtle'
        }`}
      >
        {isDone ? (
          <CheckCircle2 size={22} className="text-teal-success" />
        ) : (
          <span>{cfg.icon}</span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-syne font-semibold text-sm ${isDone ? 'text-text-muted' : 'text-white'}`}>
            {cfg.label}
          </span>
          {isActive && (
            <span className="text-[10px] font-dm font-medium bg-amber-accent text-obsidian px-2 py-0.5 rounded-full">
              Up next
            </span>
          )}
        </div>
        <span className="font-dm text-text-secondary text-xs">{cfg.sub}</span>
        <div className="flex items-center gap-1 mt-1">
          <Clock size={11} className="text-text-secondary" />
          <span className="font-dm text-text-secondary text-xs">{formatDuration(duration)}</span>
          <span className="text-text-secondary mx-1">·</span>
          <span className="font-dm text-text-secondary text-xs">
            {session.exercises.map(e => `${e.reps} ${e.label}`).join(' + ')}
          </span>
        </div>
      </div>

      {/* Action */}
      {isActive && (
        <button
          onClick={() => onStart(session)}
          className="w-10 h-10 rounded-xl bg-amber-accent flex items-center justify-center flex-shrink-0
                     transition-all duration-200 active:scale-90 hover:brightness-110"
        >
          <Play size={16} fill="#0d1117" className="text-obsidian ml-0.5" />
        </button>
      )}
      {isDone && (
        <CheckCircle2 size={20} className="text-teal-success flex-shrink-0" />
      )}
      {isLocked && (
        <Lock size={16} className="text-text-secondary flex-shrink-0" />
      )}
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, iconColor }) {
  return (
    <div className="stat-card gap-1">
      <Icon size={16} className={`mb-1 ${iconColor}`} />
      <span className="font-syne font-bold text-xl text-white">{value}</span>
      {sub && <span className="font-dm text-[9px] text-text-secondary">{sub}</span>}
      <span className="font-dm text-[10px] text-text-muted">{label}</span>
    </div>
  )
}

export default function Home({ user, onStartSession }) {
  const levelInfo = getLevelInfo(user.totalXP)
  const currentType = getCurrentSessionType()

  // Determine session card states
  const today = new Date().toDateString()
  const sessionsToday = user.lastSessionDate === today ? (user.sessionsToday || []) : []

  const getSessionState = (type) => {
    if (sessionsToday.includes(type)) return 'done'
    const typeIndex = SESSION_ORDER.indexOf(type)
    const firstIncompleteIndex = SESSION_ORDER.findIndex(t => !sessionsToday.includes(t))
    if (typeIndex === firstIncompleteIndex) return 'active'
    // Only lock sessions that haven't been served yet by time of day
    // but always unlock if a previous session was skipped
    return typeIndex <= SESSION_ORDER.indexOf(currentType) || typeIndex === firstIncompleteIndex
      ? 'active'
      : 'locked'
  }

  // Compute locked properly: sessions are locked only if ALL previous are not yet active time
  const currentHour = new Date().getHours()
  const getSessionStateByTime = (type) => {
    if (sessionsToday.includes(type)) return 'done'
    const firstIncomplete = SESSION_ORDER.find(t => !sessionsToday.includes(t))
    if (type === firstIncomplete) return 'active'
    return 'locked'
  }

  // Weekly completion: 3 sessions/day, 7 days = 21 sessions per week
  const sessionsThisWeek = Math.min(user.totalSessions % 21, 21)
  const weeklyPct = Math.round((sessionsThisWeek / 21) * 100)

  const totalTimeMin = Math.floor(user.totalTime / 60)

  return (
    <div className="min-h-screen bg-obsidian pb-24 overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <Zap size={22} className="text-amber-accent" fill="#e8a04a" />
          <span className="font-syne font-bold text-xl tracking-wide">FloorForce</span>
        </div>
        <div className="flex items-center gap-1.5 bg-obsidian-light border border-border-subtle
                        px-3 py-1.5 rounded-full">
          <Flame size={16} className="text-amber-accent" fill="#e8a04a" />
          <span className="font-syne font-bold text-sm text-amber-accent">{user.streak}</span>
          <span className="font-dm text-xs text-text-muted">day streak</span>
        </div>
      </div>

      {/* Hero: Circular progress ring */}
      <div className="flex flex-col items-center pt-4 pb-6 px-5">
        <CircularRing percentage={weeklyPct} size={200} strokeWidth={11}>
          <div className="flex flex-col items-center">
            <span className="font-syne font-bold text-4xl text-gradient-amber">{weeklyPct}%</span>
            <span className="font-dm text-xs text-text-muted mt-0.5">this week</span>
          </div>
        </CircularRing>

        {/* Level & XP */}
        <div className="mt-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-syne font-bold text-lg text-white">{levelInfo.name}</span>
            <span className="text-[11px] font-dm bg-amber-accent/15 text-amber-accent px-2 py-0.5 rounded-full border border-amber-accent/25">
              Level {levelInfo.levelIndex + 1}
            </span>
          </div>
          {/* XP bar */}
          <div className="w-48 bg-border-subtle rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-accent transition-all duration-700"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
          <div className="flex justify-between w-48 mt-1.5 mx-auto">
            <span className="font-dm text-[10px] text-text-secondary">
              {user.totalXP.toLocaleString()} XP
            </span>
            {!levelInfo.isMaxLevel && (
              <span className="font-dm text-[10px] text-text-secondary">
                {levelInfo.nextThreshold.toLocaleString()} XP
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        <StatCard
          label="Today"
          value={sessionsToday.length + '/3'}
          icon={CalendarDays}
          iconColor="text-teal-success"
        />
        <StatCard
          label="Total"
          value={user.totalSessions}
          sub="sessions"
          icon={Dumbbell}
          iconColor="text-amber-accent"
        />
        <StatCard
          label="Trained"
          value={totalTimeMin + 'm'}
          icon={Clock}
          iconColor="text-text-muted"
        />
      </div>

      {/* CTA */}
      {sessionsToday.length < 3 && (() => {
        const nextSession = SESSION_ORDER.find(t => !sessionsToday.includes(t))
        const session = getSession(user.currentWeek, nextSession)
        return (
          <div className="px-5 mb-6">
            <button
              onClick={() => onStartSession(session)}
              className="btn-primary w-full py-4 text-base font-syne flex items-center justify-center gap-3"
            >
              <Play size={18} fill="#0d1117" />
              Start {SESSION_CONFIG[nextSession].label} Session
            </button>
          </div>
        )
      })()}

      {sessionsToday.length === 3 && (
        <div className="px-5 mb-6">
          <div className="bg-teal-success/10 border border-teal-success/25 rounded-2xl py-4 px-5 flex items-center gap-3">
            <CheckCircle2 size={22} className="text-teal-success flex-shrink-0" />
            <div>
              <p className="font-syne font-semibold text-teal-success text-sm">All done for today</p>
              <p className="font-dm text-text-muted text-xs mt-0.5">Excellent work. Come back tomorrow.</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's plan */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-syne font-semibold text-sm text-white">
            Week {user.currentWeek} · Today's Plan
          </span>
          <span className="font-dm text-xs text-text-secondary">3 sessions</span>
        </div>
        <div className="flex flex-col gap-3">
          {SESSION_ORDER.map(type => (
            <SessionCard
              key={type}
              type={type}
              week={user.currentWeek}
              state={getSessionStateByTime(type)}
              onStart={onStartSession}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
