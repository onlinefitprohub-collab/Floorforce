import { useReducer, useEffect, useRef, useCallback } from 'react'
import { X, Pause, Play, SkipForward } from 'lucide-react'
import { computeSessionXP, getSessionDuration } from '../data/progression'

// ─── Cue text helpers ─────────────────────────────────────────────────────────

function getPhaseLabel(exerciseType, phase) {
  if (exerciseType === 'reverseKegel') {
    return phase === 'contract' ? 'Release' : 'Rest'
  }
  return phase === 'contract' ? 'Contract' : 'Relax'
}

function getCueText(exerciseType, phase) {
  if (exerciseType === 'slowHold') {
    return phase === 'contract'
      ? 'Draw up and hold. Breathe normally.'
      : 'Fully let go. Rest completely.'
  }
  if (exerciseType === 'quickFlick') {
    return phase === 'contract' ? 'Contract!' : 'Release!'
  }
  if (exerciseType === 'reverseKegel') {
    return phase === 'contract'
      ? 'Imagine a gentle downward release — no pushing, just opening.'
      : 'Return to neutral. Rest.'
  }
  return ''
}

// ─── Workout state machine ────────────────────────────────────────────────────

function buildInitialState(session) {
  const ex = session.exercises[0]
  return {
    exercises: session.exercises,
    exerciseIndex: 0,
    repIndex: 0,
    phase: 'contract',
    timeRemaining: ex.holdTime,
    isPaused: false,
    isComplete: false,
    totalHoldTime: 0,
    sessionStartTime: Date.now(),
    sessionTime: 0,
    transitionLabel: null, // shown during 'transition' phase
  }
}

function advanceState(state) {
  const { exercises, exerciseIndex, repIndex, phase } = state
  const exercise = exercises[exerciseIndex]

  if (phase === 'contract') {
    return {
      ...state,
      phase: 'release',
      timeRemaining: exercise.restTime,
      totalHoldTime: state.totalHoldTime + exercise.holdTime,
    }
  }

  if (phase === 'release') {
    const nextRep = repIndex + 1
    if (nextRep < exercise.reps) {
      return {
        ...state,
        repIndex: nextRep,
        phase: 'contract',
        timeRemaining: exercise.holdTime,
      }
    }
    // This exercise is done
    const nextExIndex = exerciseIndex + 1
    if (nextExIndex < exercises.length) {
      const nextEx = exercises[nextExIndex]
      return {
        ...state,
        exerciseIndex: nextExIndex,
        repIndex: 0,
        phase: 'transition',
        timeRemaining: 4,
        transitionLabel: nextEx.label,
      }
    }
    // All done
    return {
      ...state,
      isComplete: true,
      sessionTime: Math.floor((Date.now() - state.sessionStartTime) / 1000),
    }
  }

  if (phase === 'transition') {
    const exercise = exercises[exerciseIndex]
    return {
      ...state,
      phase: 'contract',
      timeRemaining: exercise.holdTime,
      transitionLabel: null,
    }
  }

  return state
}

function workoutReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      if (state.isPaused || state.isComplete) return state
      const next = state.timeRemaining - 1
      if (next > 0) return { ...state, timeRemaining: next }
      return advanceState({ ...state, timeRemaining: 0 })
    }
    case 'PAUSE':
      return { ...state, isPaused: !state.isPaused }
    case 'SKIP_REP': {
      if (state.phase === 'transition') return advanceState({ ...state, timeRemaining: 0 })
      // Skip to next rep (skip the rest of this phase + the other phase)
      const exercise = state.exercises[state.exerciseIndex]
      const nextRep = state.repIndex + 1
      if (nextRep < exercise.reps) {
        const holdTime = state.phase === 'contract' ? exercise.holdTime : 0
        return {
          ...state,
          repIndex: nextRep,
          phase: 'contract',
          timeRemaining: exercise.holdTime,
          totalHoldTime: state.totalHoldTime + holdTime,
        }
      }
      return advanceState({ ...state, timeRemaining: 0, phase: 'release' })
    }
    default:
      return state
  }
}

// ─── WorkoutPlayer component ──────────────────────────────────────────────────

export default function WorkoutPlayer({ session, onComplete, onExit }) {
  const [state, dispatch] = useReducer(workoutReducer, session, buildInitialState)
  const completedRef = useRef(false)

  // Tick every second
  useEffect(() => {
    if (state.isPaused || state.isComplete) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.isPaused, state.isComplete])

  // Fire completion callback once
  useEffect(() => {
    if (state.isComplete && !completedRef.current) {
      completedRef.current = true
      const totalReps = state.exercises.reduce((s, ex) => s + ex.reps, 0)
      onComplete({
        totalHoldTime: state.totalHoldTime,
        sessionTime: state.sessionTime,
        sessionType: session.sessionType,
        sessionLabel: session.label,
        repsCompleted: totalReps,
        xpEarned: computeSessionXP(state.exercises),
      })
    }
  }, [state.isComplete])

  const exercise = state.exercises[state.exerciseIndex]
  const isTransition = state.phase === 'transition'
  const isContract = state.phase === 'contract'
  const totalReps = state.exercises.reduce((s, ex) => s + ex.reps, 0)
  const completedRepsAcrossSession =
    state.exercises.slice(0, state.exerciseIndex).reduce((s, ex) => s + ex.reps, 0) +
    state.repIndex

  const totalDuration = getSessionDuration(state.exercises)
  const elapsed = Math.floor((Date.now() - state.sessionStartTime) / 1000)
  const progressPct = Math.min(100, (completedRepsAcrossSession / totalReps) * 100)

  // Circle visual
  const phaseDuration = isContract ? exercise.holdTime : exercise.restTime
  const circleScale = isContract ? 1.28 : 0.82
  const phaseLabel = isTransition ? '' : getPhaseLabel(exercise.type, state.phase)
  const cueText = isTransition ? '' : getCueText(exercise.type, state.phase)

  const circleStyle = {
    transform: isTransition ? 'scale(1)' : `scale(${circleScale})`,
    transition: isTransition
      ? 'transform 0.5s ease-in-out'
      : `transform ${phaseDuration}s ease-in-out`,
    boxShadow: isContract
      ? '0 0 60px rgba(61,214,140,0.38), 0 0 120px rgba(61,214,140,0.15)'
      : isTransition
      ? '0 0 20px rgba(232,160,74,0.15)'
      : '0 0 50px rgba(232,160,74,0.3), 0 0 100px rgba(232,160,74,0.12)',
    borderColor: isContract
      ? 'rgba(61,214,140,0.7)'
      : isTransition
      ? 'rgba(232,160,74,0.25)'
      : 'rgba(232,160,74,0.65)',
    background: isContract
      ? 'radial-gradient(circle at 50% 50%, rgba(61,214,140,0.12) 0%, rgba(13,17,23,0.95) 70%)'
      : 'radial-gradient(circle at 50% 50%, rgba(232,160,74,0.1) 0%, rgba(13,17,23,0.95) 70%)',
  }

  const outerRingStyle = {
    borderColor: isContract ? 'rgba(61,214,140,0.2)' : 'rgba(232,160,74,0.15)',
  }

  const sessionName = `Week ${session.week} · ${session.label}`

  return (
    <div className="min-h-screen bg-obsidian flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <button
          onClick={onExit}
          className="w-9 h-9 rounded-xl bg-obsidian-light border border-border-subtle
                     flex items-center justify-center transition-all active:scale-90"
        >
          <X size={17} className="text-text-muted" />
        </button>
        <div className="text-center">
          <p className="font-syne font-semibold text-sm text-white">{sessionName}</p>
          <p className="font-dm text-xs text-text-secondary">{exercise.label}</p>
        </div>
        <div className="w-9" /> {/* spacer */}
      </div>

      {/* Session progress bar */}
      <div className="mx-5 h-1 bg-border-subtle rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full bg-amber-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Rep / time info */}
      <div className="flex items-center justify-between px-6 mt-5 flex-shrink-0">
        <div className="text-center">
          <p className="font-syne font-bold text-2xl text-white">
            {completedRepsAcrossSession + (isTransition ? 0 : 0)}<span className="text-text-muted text-sm font-dm"> / {totalReps}</span>
          </p>
          <p className="font-dm text-xs text-text-secondary">reps done</p>
        </div>

        <div className="w-px h-8 bg-border-subtle" />

        <div className="text-center">
          <p className="font-syne font-bold text-2xl text-white">
            {state.repIndex + 1}<span className="text-text-muted text-sm font-dm"> / {exercise.reps}</span>
          </p>
          <p className="font-dm text-xs text-text-secondary">rep</p>
        </div>

        <div className="w-px h-8 bg-border-subtle" />

        <div className="text-center">
          <p className="font-syne font-bold text-2xl text-white">
            {Math.max(0, totalDuration - elapsed)}<span className="text-text-muted text-sm font-dm">s</span>
          </p>
          <p className="font-dm text-xs text-text-secondary">remaining</p>
        </div>
      </div>

      {/* Pulsing circle */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-5">
        {/* Outer pulse ring */}
        <div
          className="absolute rounded-full border animate-pulse-ring pointer-events-none"
          style={{ width: 320, height: 320, ...outerRingStyle }}
        />

        {/* Main circle */}
        <div
          className="relative rounded-full border-2 flex flex-col items-center justify-center"
          style={{ width: 240, height: 240, ...circleStyle }}
        >
          {isTransition ? (
            <div className="flex flex-col items-center gap-2 px-6 text-center">
              <p className="font-syne font-bold text-xl text-amber-accent">Nice work!</p>
              <p className="font-dm text-text-muted text-sm">
                Next: <span className="text-white font-medium">{state.transitionLabel}</span>
              </p>
              <p className="font-syne font-bold text-4xl text-white mt-1">{state.timeRemaining}</p>
            </div>
          ) : (
            <>
              <span
                className="font-syne font-bold leading-none"
                style={{
                  fontSize: state.timeRemaining >= 10 ? 72 : 80,
                  color: isContract ? '#3dd68c' : '#e8a04a',
                }}
              >
                {state.timeRemaining}
              </span>
            </>
          )}
        </div>

        {/* Phase label */}
        {!isTransition && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <span
              className="font-syne font-bold text-xl tracking-wide"
              style={{ color: isContract ? '#3dd68c' : '#e8a04a' }}
            >
              {phaseLabel}
            </span>
            <p className="font-dm text-text-muted text-sm text-center max-w-xs leading-relaxed">
              {cueText}
            </p>
          </div>
        )}
      </div>

      {/* Rep dot track */}
      {!isTransition && (
        <div className="flex gap-2 justify-center px-5 mb-6 flex-shrink-0">
          {Array.from({ length: exercise.reps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i < state.repIndex
                  ? 'bg-teal-success w-2.5 h-2.5'
                  : i === state.repIndex
                  ? 'bg-teal-success w-3 h-3 shadow-[0_0_8px_rgba(61,214,140,0.6)]'
                  : 'bg-border-mid w-2.5 h-2.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 px-5 pb-12 flex-shrink-0">
        <button
          onClick={() => dispatch({ type: 'PAUSE' })}
          className="w-14 h-14 rounded-2xl bg-obsidian-light border border-border-mid
                     flex items-center justify-center transition-all active:scale-90"
        >
          {state.isPaused
            ? <Play size={22} className="text-white ml-0.5" />
            : <Pause size={22} className="text-white" />
          }
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'SKIP_REP' })}
            className="w-16 h-16 rounded-2xl bg-amber-accent
                       flex items-center justify-center transition-all active:scale-90
                       hover:brightness-110 shadow-lg"
          >
            <SkipForward size={24} fill="#0d1117" className="text-obsidian" />
          </button>
          <span className="font-dm text-[10px] text-text-secondary">Skip rep</span>
        </div>

        {/* Pause indicator */}
        <div className="w-14 h-14 rounded-2xl bg-obsidian-light border border-border-subtle
                        flex items-center justify-center">
          {state.isPaused ? (
            <span className="font-syne font-bold text-xs text-amber-accent">PAUSED</span>
          ) : (
            <div className="flex gap-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-teal-success animate-pulse"
                  style={{
                    height: [12, 18, 12][i],
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
