'use client'

import { useSessions, useSignOutSession, useSignOutAllSessions } from '@/hooks/useSessions'

const DEVICE_ICONS: Record<string, string> = {
  smartphone: 'smartphone',
  tablet: 'tablet_mac',
  laptop: 'laptop_mac',
  desktop: 'desktop_windows',
}

export default function SessionsPage() {
  const { data: sessionsData } = useSessions()
  const { mutate: signOutSession, isPending: isSigningOut } = useSignOutSession()
  const { mutate: signOutAll, isPending: isSigningOutAll } = useSignOutAllSessions()

  const sessions = sessionsData?.docs ?? []
  const currentSession = sessions.find((s) => s.isCurrent)
  const otherSessions = sessions.filter((s) => !s.isCurrent)

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">
          Active Sessions
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Manage and sign out of your active sessions across different devices and browsers to keep
          your account secure.
        </p>
      </header>

      <section className="mb-10">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-primary">
                Your account is currently active on {sessions.length} device{sessions.length !== 1 ? 's' : ''}.
              </h3>
              <p className="text-sm text-primary/70">
                Review the sessions below to ensure you recognize all activity.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary uppercase tracking-tighter">Security Score</p>
            <p className="text-2xl font-bold text-primary">Excellent</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
          Current Session
        </h2>
        <div className="bg-white border border-primary rounded-2xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Current Session
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center border border-border-subtle-light">
              <span className="material-symbols-outlined text-primary text-3xl">
                {currentSession ? DEVICE_ICONS[currentSession.deviceType] || 'devices' : 'laptop_mac'}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-lg">
                {currentSession
                  ? [currentSession.deviceName, currentSession.browser].filter(Boolean).join(' - ')
                  : 'Current device'}
              </h4>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  <span>{currentSession?.location || 'Unknown location'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>Active Now</span>
                </div>
              </div>
              {currentSession?.ip && (
                <p className="text-xs text-on-surface-variant/60 mt-2">
                  IP Address: {currentSession.ip}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
          Other Active Sessions
        </h2>
        <div className="space-y-4">
          {otherSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-border-subtle-light rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:border-primary hover:bg-primary/[0.02]"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center border border-border-subtle-light">
                  <span className="material-symbols-outlined text-on-surface-variant text-3xl">
                    {DEVICE_ICONS[session.deviceType] || 'devices'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-lg">
                    {[session.deviceName, session.browser].filter(Boolean).join(' - ')}
                  </h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{session.location || 'Unknown location'}</span>
                    </div>
                    <div className="text-on-surface-variant/60 text-sm">
                      {session.lastActiveAt
                        ? `Last active ${new Date(session.lastActiveAt).toLocaleString()}`
                        : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOutSession(session.id)}
                disabled={isSigningOut}
                className="px-6 py-2.5 border border-error text-error font-semibold rounded-xl text-sm hover:bg-error/5 transition-all disabled:opacity-50"
              >
                Sign Out
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-border-subtle-light flex justify-between items-center">
        <div>
          <h5 className="font-bold text-on-surface">Need to secure everything?</h5>
          <p className="text-sm text-on-surface-variant">
            We&apos;ll sign you out of all devices except this one.
          </p>
        </div>
        <button
          onClick={() => signOutAll()}
          disabled={isSigningOutAll || otherSessions.length === 0}
          className="px-8 py-3 bg-on-surface text-white font-bold rounded-xl hover:bg-on-surface-variant transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          Sign out of all other sessions
        </button>
      </footer>
    </div>
  )
}
