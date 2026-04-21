import { useState, useEffect } from 'react'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import WorkoutPlayer from './screens/WorkoutPlayer'
import Results from './screens/Results'
import ProgressScreen from './screens/ProgressScreen'
import QuestsScreen from './screens/QuestsScreen'
import SettingsScreen from './screens/SettingsScreen'
import BottomNav from './components/BottomNav'
import {
  INITIAL_USER_STATE,
  getLevelInfo,
  getSession,
  getCurrentSessionType,
  computeSessionXP,
} from './data/progression'

function loadUser() {
  try {
    const s = localStorage.getItem('ff_user')
    return s ? JSON.parse(s) : INITIAL_USER_STATE
  } catch {
    return INITIAL_USER_STATE
  }
}

export default function App() {
  const [screen, setScreen] = useState(() =>
    localStorage.getItem('ff_onboarded') ? 'main' : 'onboarding'
  )
  const [navTab, setNavTab] = useState('home')
  const [user, setUser] = useState(loadUser)
  const [workoutSession, setWorkoutSession] = useState(null)
  const [lastResults, setLastResults] = useState(null)

  useEffect(() => {
    localStorage.setItem('ff_user', JSON.stringify(user))
  }, [user])

  // ── Navigation helpers ─────────────────────────────────────────────────────

  const goHome = () => {
    setScreen('main')
    setNavTab('home')
  }

  const completeOnboarding = () => {
    localStorage.setItem('ff_onboarded', '1')
    // Jump straight into Week 1, current session type
    const type = getCurrentSessionType()
    const session = getSession(1, type)
    setWorkoutSession(session)
    setScreen('workout')
  }

  const startSession = (session) => {
    setWorkoutSession(session)
    setScreen('workout')
  }

  const finishWorkout = (results) => {
    const today = new Date().toDateString()
    const lastDay = user.lastSessionDate

    // Streak logic
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    let newStreak = user.streak
    if (lastDay !== today) {
      newStreak = (lastDay === yesterday || user.vacationMode) ? user.streak + 1 : 1
    }

    // Sessions today
    const sessionsToday =
      lastDay === today
        ? [...(user.sessionsToday || []), results.sessionType]
        : [results.sessionType]

    const newTotalXP = user.totalXP + results.xpEarned

    const updatedUser = {
      ...user,
      totalXP: newTotalXP,
      streak: newStreak,
      totalSessions: user.totalSessions + 1,
      totalTime: user.totalTime + results.sessionTime,
      lastSessionDate: today,
      sessionsToday,
    }

    setUser(updatedUser)
    setLastResults({
      ...results,
      newTotalXP,
      streak: newStreak,
    })
    setScreen('results')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (screen === 'onboarding') {
    return <Onboarding onComplete={completeOnboarding} />
  }

  if (screen === 'workout') {
    return (
      <WorkoutPlayer
        session={workoutSession}
        onComplete={finishWorkout}
        onExit={goHome}
      />
    )
  }

  if (screen === 'results') {
    return (
      <Results
        results={lastResults}
        user={user}
        onHome={goHome}
        onRepeat={() => {
          setScreen('workout')
        }}
      />
    )
  }

  // Main app shell with bottom nav
  return (
    <div className="min-h-screen bg-obsidian font-dm">
      {navTab === 'home'     && <Home user={user} onStartSession={startSession} />}
      {navTab === 'progress' && <ProgressScreen user={user} />}
      {navTab === 'quests'   && <QuestsScreen user={user} />}
      {navTab === 'settings' && <SettingsScreen user={user} onUpdateUser={setUser} />}
      <BottomNav active={navTab} onChange={setNavTab} />
    </div>
  )
}
