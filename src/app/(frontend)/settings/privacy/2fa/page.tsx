'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useTwoFactorStatus,
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
} from '@/hooks/useTwoFactorAuth'

export default function TwoFactorAuthPage() {
  const { data: status, isLoading: statusLoading } = useTwoFactorStatus()
  const { mutate: setup, isPending: isSettingUp, data: setupData } = useSetupTwoFactor()
  const { mutate: verify, isPending: isVerifying } = useVerifyTwoFactor()
  const { mutate: disable, isPending: isDisabling } = useDisableTwoFactor()

  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'done'>('idle')
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const isEnabled = status?.enabled ?? false

  const handleEnable = () => {
    setError('')
    setup(undefined, {
      onSuccess: (data) => {
        setBackupCodes(data.backupCodes)
        setStep('verify')
      },
      onError: (err) => setError(err.message),
    })
  }

  const handleVerify = () => {
    setError('')
    verify(
      { token: verifyCode },
      {
        onSuccess: () => {
          setStep('done')
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  const handleDisable = () => {
    setError('')
    disable(undefined, {
      onError: (err) => setError(err.message),
    })
  }

  if (statusLoading) {
    return (
      <div className="p-12">
        <p className="text-on-surface-variant">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-12">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[32px]">verified_user</span>
          </div>
          <h2 className="font-display-xl text-display-xl tracking-tight">
            Two-Factor Authentication (2FA)
          </h2>
        </div>
        <p className="text-body-lg text-on-surface-variant leading-relaxed">
          Add an extra layer of security to your account. In addition to your password, you will
          need to enter a code from your mobile device to sign in.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-border-subtle-light rounded-xl p-6 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-outline">shield</span>
          </div>
          <div>
            <p className="font-bold text-on-surface">Current Status</p>
            <p className="text-label-sm text-on-surface-variant">
              {isEnabled
                ? 'Your account is protected by two-factor authentication.'
                : 'Your account is currently protected by password only.'}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 font-label-sm text-label-sm rounded-full ${
            isEnabled
              ? 'bg-primary-container/20 text-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant'
          }`}
        >
          {isEnabled ? 'Enabled' : 'Currently Disabled'}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-label-sm text-error font-medium">
          {error}
        </div>
      )}

      {step === 'verify' && setupData && (
        <div className="mb-8 p-6 bg-surface-container-lowest border border-border-subtle-light rounded-xl space-y-4">
          <h3 className="font-bold text-on-surface">Set up Authenticator App</h3>
          <p className="text-sm text-on-surface-variant">
            Scan the QR code with your authenticator app, or manually enter the secret key below.
          </p>
          <div className="p-4 bg-surface-dim rounded-lg text-center">
            <p className="text-xs text-on-surface-variant mb-2">Manual setup key</p>
            <p className="font-mono font-bold text-lg tracking-wider select-all">{setupData.secret}</p>
          </div>
          <p className="text-xs text-on-surface-variant">
            Or use this URI in your app:{' '}
            <span className="font-mono text-[11px] break-all select-all">{setupData.uri}</span>
          </p>
          <div className="space-y-2">
            <label className="text-label-sm font-bold text-on-surface-variant">
              Enter the 6-digit code from your app
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="w-full max-w-xs px-4 py-3 bg-white border border-border-subtle-light rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:border-primary"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={isVerifying || verifyCode.length !== 6}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={() => setStep('idle')}
              className="px-6 py-2 text-on-surface-variant font-bold text-label-sm hover:bg-surface-container-high rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="mb-8 p-6 bg-primary-container/10 border border-primary/20 rounded-xl space-y-4">
          <h3 className="font-bold text-primary">2FA Enabled Successfully</h3>
          <p className="text-sm text-on-surface-variant">
            Save these backup codes in a secure place. Each code can be used once if you lose access
            to your authenticator app.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {backupCodes.map((code, i) => (
              <div key={i} className="p-2 bg-surface-dim rounded font-mono text-xs text-center select-all">
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep('idle')}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-sm"
          >
            Done
          </button>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="font-headline-md text-headline-md font-bold mb-4">Verification Methods</h3>

        <div className="bg-surface-container-lowest border border-border-subtle-light rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">phonelink_lock</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  Authenticator App (Recommended)
                  <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                    Best Security
                  </span>
                </h4>
                <p className="text-body-md text-on-surface-variant mt-1 max-w-md">
                  Use an app like Google Authenticator or Authy to generate secure verification
                  codes on your mobile device.
                </p>
              </div>
            </div>
            {isEnabled ? (
              <button
                onClick={handleDisable}
                disabled={isDisabling}
                className="px-6 py-2 border border-error text-error rounded-lg font-bold text-label-sm hover:bg-error/5 transition-all disabled:opacity-50"
              >
                {isDisabling ? 'Disabling...' : 'Disable'}
              </button>
            ) : (
              <button
                onClick={handleEnable}
                disabled={isSettingUp || step === 'verify'}
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSettingUp ? 'Setting up...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        <div
          className={`bg-surface-container-lowest border border-border-subtle-light rounded-xl p-6 ${
            !isEnabled ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">vpn_key</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Backup Codes</h4>
                <p className="text-body-md text-on-surface-variant mt-1 max-w-md">
                  Generate a set of single-use recovery codes to use if you lose access to your
                  primary mobile device.
                </p>
              </div>
            </div>
            <button
              disabled={!isEnabled}
              className="px-6 py-2 bg-surface-container-highest text-outline rounded-lg font-bold text-label-sm cursor-not-allowed"
            >
              Generate
            </button>
          </div>
          {!isEnabled && (
            <div className="mt-4 flex items-center gap-2 text-[13px] text-on-surface-variant italic px-16">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Enable an authenticator app first to generate backup codes.
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 bg-surface-container-low rounded-xl border-l-4 border-primary/40">
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary">tips_and_updates</span>
          <div>
            <p className="font-bold text-on-surface text-label-sm">Security Best Practices</p>
            <p className="text-body-md text-on-surface-variant mt-1">
              2FA significantly reduces the risk of unauthorized access to your workspace. Always
              store your backup codes in a secure, physical location or a password manager that is
              separate from your FocusFlow account.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-border-subtle-light flex justify-between items-center">
        <Link
          href="/settings/privacy"
          className="text-on-surface-variant font-medium hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Privacy
        </Link>
        <p className="text-label-sm text-on-surface-variant">Last security check: 2 days ago</p>
      </div>
    </div>
  )
}
