'use client'

import { useState } from 'react'
import { useDesktopAlerts, useUpdateSession } from '@/hooks/useDesktopAlerts'

const TRIGGERS = [
  {
    key: 'taskReminders',
    label: 'Task Reminders',
    desc: 'Alerts for task start times and reminders',
    icon: 'notifications_active',
    defaultOn: true,
  },
  {
    key: 'sharedList',
    label: 'New Shared List',
    desc: 'Notify when someone invites you to a list',
    icon: 'group_add',
    defaultOn: true,
  },
  {
    key: 'dueDate',
    label: 'Due Date Alerts',
    desc: 'High-priority alerts for approaching deadlines',
    icon: 'event_busy',
    defaultOn: true,
  },
  {
    key: 'systemUpdates',
    label: 'System Updates',
    desc: 'Important maintenance and feature announcements',
    icon: 'update',
    defaultOn: false,
  },
] as const

type TriggerKey = (typeof TRIGGERS)[number]['key']

export function DesktopAlerts() {
  const { preferences, isFetched } = useDesktopAlerts()
  const updateSession = useUpdateSession()

  const [masterOn, setMasterOn] = useState(() => preferences.masterOn)
  const [triggers, setTriggers] = useState<Record<TriggerKey, boolean>>(
    () => Object.fromEntries(
      TRIGGERS.map((t) => [t.key, preferences.triggers[t.key]]),
    ) as Record<TriggerKey, boolean>,
  )
  const [sound, setSound] = useState(() => preferences.sound)
  const [alertStyle, setAlertStyle] = useState<'banner' | 'alert'>(
    () => preferences.alertStyle,
  )

  if (!isFetched) return null

  const toggleTrigger = (key: TriggerKey) => {
    setTriggers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    updateSession.mutate({
      desktopAlertPreferences: {
        masterOn,
        triggers: {
          taskReminders: triggers.taskReminders,
          sharedList: triggers.sharedList,
          dueDate: triggers.dueDate,
          systemUpdates: triggers.systemUpdates,
        },
        sound,
        alertStyle,
      },
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-12 py-16">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-primary font-label-sm mb-2">
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          <span className="text-on-surface-variant text-sm">Notifications</span>
        </div>
        <h2 className="font-display-xl text-display-xl text-on-surface mb-2">
          Desktop Alerts
        </h2>
        <p className="font-body-md text-on-surface-variant">
          Manage how and when you receive notifications on your computer to stay
          focused without missing what matters.
        </p>
      </header>

      <div className="space-y-8">
        {/* Master Toggle */}
        <section className="bg-surface-container-lowest rounded-xl p-6 border border-border-subtle-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  desktop_windows
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-on-surface">
                  Enable Desktop Notifications
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Allow Task Sphere to send alerts to your desktop
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={masterOn}
                onChange={(e) => setMasterOn(e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
            </label>
          </div>
        </section>

        {/* Notification Triggers */}
        <section className="space-y-4">
          <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest px-1">
            Notification Triggers
          </h3>
          <div className="bg-surface-container-lowest rounded-xl border border-border-subtle-light divide-y divide-border-subtle-light overflow-hidden">
            {TRIGGERS.map((trigger) => (
              <div
                key={trigger.key}
                className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    {trigger.icon}
                  </span>
                  <div>
                    <p className="font-body-md font-medium">{trigger.label}</p>
                    <p className="text-[13px] text-on-surface-variant">
                      {trigger.desc}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={triggers[trigger.key]}
                    onChange={() => toggleTrigger(trigger.key)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Appearance & Sound */}
        <section className="space-y-4">
          <h3 className="font-label-sm text-on-surface-variant uppercase tracking-widest px-1">
            Appearance & Sound
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sound Selection */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-border-subtle-light flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  volume_up
                </span>
                <label className="font-medium text-on-surface" htmlFor="sound-select">
                  Notification Sound
                </label>
              </div>
              <div className="relative">
                <select
                  id="sound-select"
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                  className="w-full bg-surface-container-low border-border-subtle-light rounded-lg py-2.5 px-4 font-body-md focus:ring-primary focus:border-primary transition-all appearance-none"
                >
                  <option>Zen Bell (Default)</option>
                  <option>Minimal Chirp</option>
                  <option>Soft Pulse</option>
                  <option>Mechanical Click</option>
                  <option>None</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
              <button
                className="text-primary font-label-sm flex items-center gap-2 hover:underline w-fit"
                onClick={(e) => {
                  const icon = e.currentTarget.querySelector('.material-symbols-outlined:last-child') as HTMLElement
                  if (icon) {
                    icon.style.fontVariationSettings = "'FILL' 1"
                    icon.textContent = 'graphic_eq'
                    setTimeout(() => {
                      icon.style.fontVariationSettings = "'FILL' 0"
                      icon.textContent = 'play_circle'
                    }, 1000)
                  }
                }}
              >
                <span className="material-symbols-outlined text-[16px]">
                  play_circle
                </span>
                Preview Sound
              </button>
            </div>

            {/* Alert Style */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-border-subtle-light">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">
                  branding_watermark
                </span>
                <span className="font-medium text-on-surface">Alert Style</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAlertStyle('banner')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    alertStyle === 'banner'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-surface-container-low hover:border-border-subtle-light'
                  }`}
                >
                  <div className="w-full h-12 bg-white rounded border border-border-subtle-light relative overflow-hidden">
                    <div className="absolute right-1 top-1 w-8 h-4 bg-primary/20 rounded-sm" />
                  </div>
                  <span
                    className={`text-[12px] font-medium ${
                      alertStyle === 'banner' ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    Banner
                  </span>
                </button>
                <button
                  onClick={() => setAlertStyle('alert')}
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    alertStyle === 'alert'
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-surface-container-low hover:border-border-subtle-light'
                  }`}
                >
                  <div className="w-full h-12 bg-white rounded border border-border-subtle-light flex items-center justify-center">
                    <div className="w-8 h-8 bg-on-surface/5 rounded-full" />
                  </div>
                  <span
                    className={`text-[12px] font-medium ${
                      alertStyle === 'alert' ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    Alert
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Test Button */}
        <section className="flex justify-center pt-4">
          <button className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/5 transition-all active:scale-95">
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
              send
            </span>
            Test Notification
          </button>
        </section>

        {/* Footer */}
        <footer className="pt-10 mt-10 border-t border-border-subtle-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-on-surface-variant">
            Last updated: 2 hours ago
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container transition-all"
              onClick={() => {
                setMasterOn(preferences.masterOn)
                setTriggers(Object.fromEntries(
                  TRIGGERS.map((t) => [t.key, preferences.triggers[t.key]]),
                ) as Record<TriggerKey, boolean>)
                setSound(preferences.sound)
                setAlertStyle(preferences.alertStyle)
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-medium shadow-md shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={updateSession.isPending}
            >
              {updateSession.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
