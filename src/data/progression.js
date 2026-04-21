// ─── Exercise builders ────────────────────────────────────────────────────────

const slowHold = (reps, holdTime, restTime) => ({
  type: 'slowHold',
  label: 'Slow Holds',
  reps,
  holdTime,
  restTime,
})

const quickFlick = (reps) => ({
  type: 'quickFlick',
  label: 'Quick Flicks',
  reps,
  holdTime: 1,
  restTime: 1,
})

const reverseKegel = (reps) => ({
  type: 'reverseKegel',
  label: 'Reverse Kegels',
  reps,
  holdTime: 4,
  restTime: 4,
})

// ─── 8-Week Program ───────────────────────────────────────────────────────────

export const PROGRAM = [
  null, // index 0 unused

  // Week 1 — Foundation
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 3, 3)] },
    afternoon: { type: 'afternoon', label: 'Afternoon Hold',  exercises: [slowHold(10, 3, 3)] },
    evening:   { type: 'evening',   label: 'Evening Wind-down', exercises: [slowHold(10, 3, 3)] },
  },

  // Week 2 — Build
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 5, 4)] },
    afternoon: { type: 'afternoon', label: 'Afternoon Hold',  exercises: [slowHold(10, 5, 4)] },
    evening:   { type: 'evening',   label: 'Evening Wind-down', exercises: [slowHold(10, 5, 4)] },
  },

  // Week 3 — Introduce Quick Flicks
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 7, 5), quickFlick(5)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 7, 5), quickFlick(5)] },
    evening:   { type: 'evening',   label: 'Evening Hold',    exercises: [slowHold(10, 7, 5), quickFlick(5)] },
  },

  // Week 4 — More Flicks
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 7, 7), quickFlick(8)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 7, 7), quickFlick(8)] },
    evening:   { type: 'evening',   label: 'Evening Hold',    exercises: [slowHold(10, 7, 7), quickFlick(8)] },
  },

  // Week 5 — Add Reverse Kegel (evening only)
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 8, 6), quickFlick(8)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 8, 6), quickFlick(8)] },
    evening:   { type: 'evening',   label: 'Reverse & Breathe', exercises: [slowHold(10, 8, 6), quickFlick(8), reverseKegel(8)] },
  },

  // Week 6 — Consolidate
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 8, 6), quickFlick(8)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 8, 6), quickFlick(8)] },
    evening:   { type: 'evening',   label: 'Reverse & Breathe', exercises: [slowHold(10, 8, 6), quickFlick(8), reverseKegel(8)] },
  },

  // Week 7 — Full stack
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 10, 8), quickFlick(10), reverseKegel(8)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 10, 8), quickFlick(10), reverseKegel(8)] },
    evening:   { type: 'evening',   label: 'Reverse & Breathe', exercises: [slowHold(10, 10, 8), quickFlick(10), reverseKegel(8)] },
  },

  // Week 8 — Peak
  {
    morning:   { type: 'morning',   label: 'Morning Flow',    exercises: [slowHold(10, 10, 8), quickFlick(12), reverseKegel(8)] },
    afternoon: { type: 'afternoon', label: 'Quick Flicks',    exercises: [slowHold(10, 10, 8), quickFlick(12), reverseKegel(8)] },
    evening:   { type: 'evening',   label: 'Reverse & Breathe', exercises: [slowHold(10, 10, 8), quickFlick(12), reverseKegel(8)] },
  },
]

// ─── Session helper ───────────────────────────────────────────────────────────

export function getSession(week, type) {
  const w = Math.min(Math.max(week, 1), 8)
  return { ...PROGRAM[w][type], week, sessionType: type }
}

export function getCurrentSessionType() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export function getSessionDuration(exercises) {
  return exercises.reduce((sum, ex) => sum + ex.reps * (ex.holdTime + ex.restTime), 0)
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

// ─── XP & Levels ─────────────────────────────────────────────────────────────

export const LEVELS = [
  { name: 'Novice',       threshold: 0 },
  { name: 'Recruit',      threshold: 200 },
  { name: 'Contender',    threshold: 500 },
  { name: 'Specialist',   threshold: 1200 },
  { name: 'Elite',        threshold: 2500 },
  { name: 'Pelvic Master', threshold: 5000 },
]

export function computeSessionXP(exercises) {
  const holdTime = exercises.reduce((sum, ex) => sum + ex.reps * ex.holdTime, 0)
  return 50 + 5 * holdTime
}

export function getLevelInfo(totalXP) {
  let levelIndex = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].threshold) {
      levelIndex = i
      break
    }
  }
  const current = LEVELS[levelIndex]
  const next = LEVELS[levelIndex + 1] || null
  const prevThreshold = current.threshold
  const nextThreshold = next ? next.threshold : prevThreshold + 5000
  const progress = next
    ? ((totalXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100
    : 100

  return {
    levelIndex,
    name: current.name,
    currentThreshold: prevThreshold,
    nextThreshold,
    xpIntoLevel: totalXP - prevThreshold,
    xpToNext: next ? nextThreshold - totalXP : 0,
    progress: Math.min(100, Math.max(0, progress)),
    isMaxLevel: !next,
  }
}

// ─── Quests ───────────────────────────────────────────────────────────────────

export const QUESTS = [
  { id: 'all-three',     label: 'Complete all 3 sessions today',        xp: 75,  icon: '🔥' },
  { id: 'no-pause',      label: 'Finish a session without pausing',     xp: 50,  icon: '⚡' },
  { id: 'standing',      label: 'Do a session standing up',             xp: 60,  icon: '🧍' },
  { id: 'early-bird',    label: 'Complete morning session before 8 AM', xp: 40,  icon: '🌅' },
  { id: 'night-owl',     label: 'Complete evening session after 9 PM',  xp: 40,  icon: '🌙' },
  { id: 'week-warrior',  label: 'Maintain a 7-day streak',              xp: 200, icon: '🏆' },
  { id: 'reverse-king',  label: 'Complete a Reverse Kegel session',     xp: 80,  icon: '🔄' },
  { id: 'speed-demon',   label: 'Complete a Quick Flicks session',      xp: 60,  icon: '💨' },
]

export function getDailyQuests(dateStr) {
  const seed = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const idx1 = seed % QUESTS.length
  const idx2 = (seed * 7 + 3) % QUESTS.length
  const idx3 = (seed * 13 + 7) % QUESTS.length
  const indices = [...new Set([idx1, idx2, idx3])]
  while (indices.length < 3) indices.push((indices[indices.length - 1] + 1) % QUESTS.length)
  return indices.slice(0, 3).map(i => QUESTS[i])
}

// ─── Reminder copy ────────────────────────────────────────────────────────────

export const REMINDER_COPY = [
  "Your floor doesn't train itself.",
  "10 reps. 3 minutes. That's it.",
  "Streak at risk — quick session before bed?",
  "Time to check in. Your body is waiting.",
  "Short session. Big results. Let's go.",
]

// ─── Initial user state (dummy data) ─────────────────────────────────────────

const today = new Date().toDateString()
const yesterday = new Date(Date.now() - 86400000).toDateString()

export const INITIAL_USER_STATE = {
  name: 'Alex',
  currentWeek: 3,
  totalSessions: 28,
  totalXP: 1650,
  streak: 12,
  totalTime: 3840, // seconds (~64 minutes)
  lastSessionDate: yesterday,
  sessionsToday: [],
  vacationMode: false,
  vacationDaysUsed: 0,
  reminderTimes: ['07:00', '13:00', '20:00'],
  joinDate: new Date(Date.now() - 12 * 86400000).toISOString(),
}
