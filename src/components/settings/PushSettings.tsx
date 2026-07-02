'use client'

import { useState } from 'react'
import { z } from 'zod'
import { usePushNotificationPreferences, useUpdatePushNotifications } from '@/hooks/usePushNotifications'
import { PushNotificationPreferences } from '@/lib/schemas'

const ALERT_TYPES = [
  {
    key: 'taskReminders' as const,
    label: 'Task Reminders (High Priority)',
    desc: 'Notifications for tasks marked as critical.',
    icon: 'priority_high',
    iconColor: 'text-error',
    defaultOn: true,
  },
  {
    key: 'dueDateAlerts' as const,
    label: 'Due Date Alerts',
    desc: 'Reminders when tasks are approaching their deadlines.',
    icon: 'event_upcoming',
    iconColor: 'text-primary',
    defaultOn: true,
  },
  {
    key: 'sharedListActivity' as const,
    label: 'Shared List Activity',
    desc: 'Alerts when collaborators add or complete shared tasks.',
    icon: 'groups',
    iconColor: 'text-secondary',
    defaultOn: false,
  },
  {
    key: 'focusSession' as const,
    label: 'Focus Session Completion',
    desc: 'Daily summary after your scheduled deep work blocks.',
    icon: 'timer',
    iconColor: 'text-tertiary',
    defaultOn: true,
  },
] as const

type AlertTypeKey = (typeof ALERT_TYPES)[number]['key']

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export function PushSettings() {
  const { preferences, isFetched } = usePushNotificationPreferences()
  const updatePushNotifications = useUpdatePushNotifications()

  const [deviceEnabled, setDeviceEnabled] = useState(() => ({ ...preferences.deviceEnabled }))
  const [alertTypes, setAlertTypes] = useState<Record<AlertTypeKey, boolean>>(
    () => preferences.alertTypes as unknown as Record<AlertTypeKey, boolean>,
  )
  const [dndFrom, setDndFrom] = useState(() => preferences.dndFrom)
  const [dndTo, setDndTo] = useState(() => preferences.dndTo)
  const [quietDays, setQuietDays] = useState<Set<number>>(() => new Set(preferences.quietDays))

  if (!isFetched) return null

  const toggleAlertType = (key: AlertTypeKey) => {
    setAlertTypes((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleQuietDay = (idx: number) => {
    setQuietDays((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleSave = () => {
    const input: z.infer<typeof PushNotificationPreferences> = {
      deviceEnabled: { ...deviceEnabled },
      alertTypes: {
        taskReminders: alertTypes.taskReminders,
        dueDateAlerts: alertTypes.dueDateAlerts,
        sharedListActivity: alertTypes.sharedListActivity,
        focusSession: alertTypes.focusSession,
      },
      dndFrom,
      dndTo,
      quietDays: Array.from(quietDays),
    }
    updatePushNotifications.mutate(input)
  }

  const handleDiscard = () => {
    setDeviceEnabled({ ...preferences.deviceEnabled })
    setAlertTypes(preferences.alertTypes as unknown as Record<AlertTypeKey, boolean>)
    setDndFrom(preferences.dndFrom)
    setDndTo(preferences.dndTo)
    setQuietDays(new Set(preferences.quietDays))
  }

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      {/* Breadcrumb */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-on-surface-variant mb-4">
          <span className="hover:text-primary transition-colors text-sm cursor-default">
            Settings
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="hover:text-primary transition-colors text-sm cursor-default">
            Notifications
          </span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium text-sm">
            Push Settings
          </span>
        </div>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">
          Push Notifications
        </h1>
        <p className="text-on-surface-variant font-body-lg max-w-2xl leading-relaxed">
          Manage how you receive real-time alerts on your mobile and desktop
          devices.
        </p>
      </header>

      <div className="space-y-12 pb-24">
        {/* Device Status */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">devices</span>
            <h3 className="font-headline-md text-headline-md">Device Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* iPhone */}
            <div className="p-6 bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">iPhone 15 Pro</h4>
                  <p className="text-[13px] text-on-surface-variant">Last active 2m ago</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={deviceEnabled.iphone}
                  onChange={(e) => setDeviceEnabled((prev) => ({ ...prev, iphone: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
            {/* MacBook */}
            <div className="p-6 bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">laptop_mac</span>
                </div>
                <div>
                  <h4 className="font-semibold text-on-surface">MacBook Pro</h4>
                  <p className="text-[13px] text-on-surface-variant">Current device</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={deviceEnabled.macbook}
                  onChange={(e) => setDeviceEnabled((prev) => ({ ...prev, macbook: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          </div>
        </section>

        {/* Alert Types */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">notifications_active</span>
            <h3 className="font-headline-md text-headline-md">Alert Types</h3>
          </div>
          <div className="bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm overflow-hidden divide-y divide-border-subtle-light">
            {ALERT_TYPES.map((alert) => (
              <div
                key={alert.key}
                className="p-5 flex items-center justify-between group hover:bg-surface-container-low/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`material-symbols-outlined ${alert.iconColor}`}
                  >
                    {alert.icon}
                  </span>
                  <div>
                    <h4 className="font-semibold text-on-surface">{alert.label}</h4>
                    <p className="text-sm text-on-surface-variant">{alert.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={alertTypes[alert.key]}
                    onChange={() => toggleAlertType(alert.key)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Do Not Disturb */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
            <h3 className="font-headline-md text-headline-md">Do Not Disturb</h3>
          </div>
          <div className="p-8 bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <h4 className="font-semibold text-on-surface mb-2">
                  Scheduled Silence
                </h4>
                <p className="text-sm text-on-surface-variant">
                  Specify a time range when you won&apos;t receive any push
                  notifications.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                    From
                  </span>
                  <input
                    type="time"
                    value={dndFrom}
                    onChange={(e) => setDndFrom(e.target.value)}
                    className="bg-surface-container-low border-none rounded-lg font-semibold p-3 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <span className="material-symbols-outlined text-outline mt-5">
                  arrow_forward
                </span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-outline mb-1">
                    To
                  </span>
                  <input
                    type="time"
                    value={dndTo}
                    onChange={(e) => setDndTo(e.target.value)}
                    className="bg-surface-container-low border-none rounded-lg font-semibold p-3 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quiet Days */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <h3 className="font-headline-md text-headline-md">Quiet Days</h3>
          </div>
          <div className="p-8 bg-surface-container-lowest border border-border-subtle-light rounded-2xl shadow-sm">
            <h4 className="font-semibold text-on-surface mb-2">Weekly Rest Days</h4>
            <p className="text-sm text-on-surface-variant mb-8">
              Disable all non-critical alerts on selected days to fully
              disconnect.
            </p>
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day, idx) => {
                const isActive = quietDays.has(idx)
                return (
                  <button
                    key={`${day}-${idx}`}
                    type="button"
                    onClick={() => toggleQuietDay(idx)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      isActive
                        ? 'border-2 border-primary bg-primary-fixed text-primary shadow-sm'
                        : 'border border-border-subtle-light text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-border-subtle-light">
          <button
            type="button"
            className="px-8 py-3 text-on-surface font-medium hover:bg-surface-variant/30 rounded-xl transition-all"
            onClick={handleDiscard}
          >
            Discard Changes
          </button>
          <button
            type="button"
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={updatePushNotifications.isPending}
          >
            {updatePushNotifications.isPending ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
