'use client'

import { useMemo, useState } from 'react'
import { useChangePassword } from '@/hooks/useChangePassword'

function checkStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const strength = Object.values(checks).filter(Boolean).length
  return { checks, strength }
}

const LABELS = ['Not set', 'Weak', 'Fair', 'Good', 'Strong']
const BAR_COLORS = ['bg-surface-container-highest', 'bg-error', 'bg-secondary-container', 'bg-primary-container', 'bg-primary-container']

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  const { mutate: changePassword, isPending } = useChangePassword()

  const { checks, strength } = useMemo(() => checkStrength(newPassword), [newPassword])

  const handleSave = () => {
    setError('')
    setSaving('saving')
    changePassword(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setSaving('saved')
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setTimeout(() => setSaving('idle'), 3000)
        },
        onError: (err) => {
          setError(err.message)
          setSaving('idle')
        },
      },
    )
  }

  return (
    <div className="p-12 py-16">
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Privacy &amp; Security</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Change Password</span>
        </nav>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">
          Password &amp; Security
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Manage your password and keep your account secure.
        </p>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <section className="space-y-6">
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="current_password">
                Current Password
              </label>
              <div className="relative group">
                <input
                  id="current_password"
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl transition-all focus:shadow-sm"
                  placeholder="Enter your current password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  <span className="material-symbols-outlined">
                    {showCurrent ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="new_password">
                New Password
              </label>
              <div className="relative group">
                <input
                  id="new_password"
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl transition-all focus:shadow-sm"
                  placeholder="At least 8 characters"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowNew(!showNew)}
                >
                  <span className="material-symbols-outlined">
                    {showNew ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex gap-1 mt-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                      i < strength ? BAR_COLORS[strength] : 'bg-surface-container-highest'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-label-sm font-label-sm mt-1 ${strength === 1 ? 'text-error' : 'text-on-surface-variant'}`}>
                Password strength:{' '}
                <span className="font-bold">{LABELS[strength]}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="confirm_password">
                Confirm New Password
              </label>
              <div className="relative group">
                <input
                  id="confirm_password"
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-xl transition-all focus:shadow-sm"
                  placeholder="Re-type your new password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <span className="material-symbols-outlined">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-label-sm text-error font-medium">
              {error}
            </div>
          )}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={isPending || saving === 'saving'}
              className={`px-8 h-12 rounded-xl font-label-sm text-label-sm transition-all ${
                saving === 'saved'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-primary text-on-primary hover:shadow-lg active:scale-95'
              }`}
            >
              {saving === 'saving' ? 'Saving...' : saving === 'saved' ? 'Password Changed' : 'Save Changes'}
            </button>
            <button className="px-8 h-12 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high rounded-xl transition-all">
              Cancel
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0 space-y-6">
          <div className="p-6 bg-surface-container-low border border-border-subtle-light rounded-2xl">
            <h3 className="text-label-sm font-bold text-on-surface mb-4">Password Requirements</h3>
            <ul className="space-y-3">
              {[
                { key: 'length', label: 'Minimum 8 characters' },
                { key: 'upper', label: 'One uppercase letter' },
                { key: 'number', label: 'One number (0-9)' },
                { key: 'special', label: 'One special character (!@#$)' },
              ].map(({ key, label }) => (
                <li key={key} className="flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      checks[key as keyof typeof checks]
                        ? 'text-primary'
                        : 'text-outline-variant'
                    }`}
                    style={
                      checks[key as keyof typeof checks]
                        ? { fontVariationSettings: "'FILL' 1" }
                        : undefined
                    }
                  >
                    check_circle
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-primary-container/5 border border-primary/10 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-4xl">shield</span>
            </div>
            <h3 className="text-label-sm font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Security Recommendation
            </h3>
            <p className="text-label-sm text-on-surface-variant leading-relaxed mb-4">
              Enhance your account&apos;s security further by enabling Two-Factor Authentication (2FA).
              We&apos;ll require a code from your phone whenever you sign in from a new device.
            </p>
            <a className="text-label-sm font-bold text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all" href="#">
              Enable 2FA Now
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>

          <div className="p-6 bg-surface-variant/30 rounded-2xl border border-dashed border-outline-variant flex flex-col items-center text-center">
            <img
              className="w-24 h-24 mb-4 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjpgpIk5yhGsDdGzreWDgMxPVHWuxWTl8PDheO61v-KwbE9MHrZhJ9si_ucLaFFbTe-owrmxcPx2rvmBod_ou3-6M9R-sCDddH6PvKSW_bDfA6E3suLihKxykfxljNpP2a74nPBHWyqDTTRvdOrftDIdJy2T5uINv-4noWjuv0vC4GvsbyVct3WhpaCh_mntneW8fbyaqvoRdNGVfO7tUseMQFNFEr8E5ccIOaRUoLPxhWD0JNCEVhpB_CvJjTjHodT6GiZvF5H8cg"
              alt="Security padlock illustration"
            />
            <p className="text-[11px] font-label-sm text-on-surface-variant max-w-[200px]">
              Your security is our priority. FocusFlow uses industry-standard encryption for all your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
