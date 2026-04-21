import { useState } from 'react'
import { Settings, Bell, Zap, Moon, RotateCcw } from 'lucide-react'
import { REMINDER_COPY } from '../data/progression'

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-subtle last:border-0">
      <div className="flex-1">
        <p className="font-dm text-sm text-white font-medium">{label}</p>
        {sub && <p className="font-dm text-xs text-text-secondary mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6.5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-amber-accent' : 'bg-border-mid'
        }`}
        style={{ height: 26 }}
      >
        <div
          className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm`}
          style={{
            width: 18,
            height: 18,
            top: 4,
            left: value ? 'calc(100% - 22px)' : 4,
          }}
        />
      </button>
    </div>
  )
}

function TimeInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-subtle last:border-0">
      <div className="flex-1">
        <p className="font-dm text-sm text-white font-medium">{label}</p>
      </div>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-obsidian-mid border border-border-mid text-white font-dm text-sm
                   rounded-xl px-3 py-2 outline-none focus:border-amber-accent/50 transition-colors"
        style={{ colorScheme: 'dark' }}
      />
    </div>
  )
}

export default function SettingsScreen({ user, onUpdateUser }) {
  const [reminders, setReminders] = useState(user.reminderTimes || ['07:00', '13:00', '20:00'])
  const [vacation, setVacation] = useState(user.vacationMode || false)
  const [notificationsOn, setNotificationsOn] = useState(true)

  const updateReminder = (index, value) => {
    const updated = [...reminders]
    updated[index] = value
    setReminders(updated)
    onUpdateUser({ ...user, reminderTimes: updated })
  }

  const toggleVacation = (val) => {
    setVacation(val)
    onUpdateUser({ ...user, vacationMode: val })
  }

  const reminderLabels = ['Morning reminder', 'Afternoon reminder', 'Evening reminder']

  return (
    <div className="min-h-screen bg-obsidian pb-24 overflow-y-auto scrollbar-hide">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={20} className="text-amber-accent" />
          <h1 className="font-syne font-bold text-2xl text-white">Settings</h1>
        </div>
        <p className="font-dm text-text-secondary text-sm">Preferences & reminders</p>
      </div>

      {/* Profile */}
      <div className="mx-5 card p-4 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-accent/15 border border-amber-accent/25
                        flex items-center justify-center flex-shrink-0">
          <span className="font-syne font-bold text-lg text-amber-accent">
            {user.name?.[0] ?? 'A'}
          </span>
        </div>
        <div>
          <p className="font-syne font-semibold text-white">{user.name || 'Athlete'}</p>
          <p className="font-dm text-xs text-text-secondary">
            Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Reminders */}
      <div className="mx-5 card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-amber-accent" />
          <p className="font-syne font-semibold text-sm text-white">Reminders</p>
        </div>
        <ToggleRow
          label="Push notifications"
          sub="Rotating motivational copy"
          value={notificationsOn}
          onChange={setNotificationsOn}
        />
        {notificationsOn && reminderLabels.map((label, i) => (
          <TimeInput
            key={i}
            label={label}
            value={reminders[i]}
            onChange={val => updateReminder(i, val)}
          />
        ))}
        {notificationsOn && (
          <div className="mt-3 bg-obsidian rounded-xl p-3 border border-border-subtle">
            <p className="font-dm text-xs text-text-secondary italic">
              "{REMINDER_COPY[new Date().getDate() % REMINDER_COPY.length]}"
            </p>
          </div>
        )}
      </div>

      {/* Vacation mode */}
      <div className="mx-5 card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Moon size={16} className="text-teal-success" />
          <p className="font-syne font-semibold text-sm text-white">Vacation Mode</p>
        </div>
        <ToggleRow
          label="Freeze streak"
          sub={`${user.vacationDaysUsed ?? 0} / 14 days used this year`}
          value={vacation}
          onChange={toggleVacation}
        />
        {vacation && (
          <div className="mt-3 bg-teal-success/10 border border-teal-success/20 rounded-xl p-3">
            <p className="font-dm text-xs text-teal-success">
              Streak is frozen. Enjoy the break — you've earned it.
            </p>
          </div>
        )}
      </div>

      {/* App info */}
      <div className="mx-5 card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-amber-accent" />
          <p className="font-syne font-semibold text-sm text-white">About</p>
        </div>
        {[
          ['App version', '1.0.0'],
          ['Program', `Week ${user.currentWeek} of 8`],
          ['Total XP', `${user.totalXP.toLocaleString()} XP`],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
            <span className="font-dm text-sm text-text-muted">{label}</span>
            <span className="font-dm text-sm text-white">{val}</span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="mx-5">
        <button className="w-full card py-4 flex items-center justify-center gap-2
                           text-red-400 border-red-900/30 hover:bg-red-900/10 transition-colors">
          <RotateCcw size={15} />
          <span className="font-dm text-sm font-medium">Reset progress</span>
        </button>
      </div>
    </div>
  )
}
