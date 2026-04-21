import { useState } from 'react'
import { ChevronRight, Zap } from 'lucide-react'

const STEPS = [
  {
    emoji: '🎯',
    title: 'Find the Muscle',
    body: 'Imagine you\'re stopping the flow of urine mid-stream. That\'s your pelvic floor. Try it now — squeeze, hold 2 seconds, release.',
    warning: 'Keep your abs, glutes, and thighs completely relaxed. Only the floor.',
    cta: 'Got it',
  },
  {
    emoji: '⚡',
    title: 'Three Sessions a Day, Under 3 Minutes Each',
    body: 'Morning, afternoon, and evening sessions — each targeting different muscle qualities. Short enough that skipping is never justified.',
    sub: 'The app automatically serves the right session based on your time of day.',
    cta: 'Understood',
  },
  {
    emoji: '🏆',
    title: 'Your First Session Starts Now',
    body: 'Week 1 begins with Slow Holds — 10 reps at 3 seconds each. Build the foundation before intensity comes.',
    sub: 'Track your streak, earn XP, level up. No ceiling.',
    cta: 'Begin Training',
  },
]

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen bg-obsidian flex flex-col px-6 py-10 animate-fade-in">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-auto">
        <Zap size={20} className="text-amber-accent" fill="#e8a04a" />
        <span className="font-syne font-bold text-lg tracking-wide text-white">FloorForce</span>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 justify-center mt-8 mb-12">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step ? 'w-6 h-2 bg-amber-accent' : 'w-2 h-2 bg-border-mid'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div key={step} className="flex-1 flex flex-col animate-fade-in">
        <div className="text-6xl mb-6 text-center">{current.emoji}</div>

        <h1 className="font-syne font-bold text-3xl text-white mb-4 leading-tight text-center">
          {current.title}
        </h1>

        <p className="font-dm text-text-muted text-base leading-relaxed text-center mb-4">
          {current.body}
        </p>

        {current.warning && (
          <div className="bg-amber-accent/10 border border-amber-accent/25 rounded-xl p-4 mt-2 mb-4">
            <p className="font-dm text-amber-accent text-sm font-medium">
              ⚠ {current.warning}
            </p>
          </div>
        )}

        {current.sub && (
          <p className="font-dm text-text-secondary text-sm leading-relaxed text-center mt-2">
            {current.sub}
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-8"
      >
        {current.cta}
        <ChevronRight size={18} />
      </button>

      {!isLast && (
        <button
          onClick={onComplete}
          className="mt-4 text-text-secondary text-sm text-center font-dm w-full py-2"
        >
          Skip intro
        </button>
      )}
    </div>
  )
}
