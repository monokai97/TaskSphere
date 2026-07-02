'use client'

import { useState } from 'react'
import { useDeleteAccount } from '@/hooks/useDeleteAccount'

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState('')
  const isConfirmed = confirmText === 'DELETE'
  const { mutate: deleteAccount, isPending } = useDeleteAccount()

  const handleDelete = () => {
    if (!isConfirmed || isPending) return
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be reversed.')) {
      deleteAccount()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-12">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Delete Account</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </header>

      <section className="bg-white rounded-xl border border-error-container overflow-hidden shadow-sm">
        <div className="p-8 border-b border-error-container bg-error-container/10">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-error/10 text-error rounded-lg">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-error mb-1">
                Warning: Irreversible Action
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Deleting your account is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">
              What happens next:
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[20px]">close</span>
                All your tasks, lists, and workflow history will be permanently removed.
              </li>
              <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[20px]">close</span>
                Your Pro subscription will be canceled immediately without refund for the remaining term.
              </li>
              <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[20px]">close</span>
                Your profile data, settings, and team preferences will be deleted from our servers.
              </li>
              <li className="flex items-center gap-3 font-body-md text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-error text-[20px]">close</span>
                You will lose access to all collaborative workspaces and shared team data.
              </li>
            </ul>
          </div>

          <div className="p-6 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <label className="block font-body-md text-body-md font-semibold text-on-surface mb-3" htmlFor="confirm_delete">
              To confirm, type <span className="text-error select-all px-1 font-mono">DELETE</span> below:
            </label>
            <input
              id="confirm_delete"
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-error/20 focus:border-error transition-all outline-none font-body-md text-body-md"
              type="text"
              placeholder="Type DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
        </div>

        <div className="p-8 flex items-center justify-between bg-surface-container-lowest">
          <button
            className="px-6 py-2.5 rounded-lg font-body-md text-body-md font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all"
            onClick={() => window.history.back()}
          >
            Keep My Account
          </button>
          <button
            disabled={!isConfirmed || isPending}
            onClick={handleDelete}
            className={`px-8 py-2.5 rounded-lg font-body-md text-body-md font-bold bg-error text-white shadow-sm transition-all ${
              isConfirmed
                ? 'hover:bg-on-error-container active:scale-[0.98] hover:shadow-lg'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Delete My Account
          </button>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t border-border-subtle-light flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
          <p className="font-body-md text-body-md">
            Having trouble?{' '}
            <a className="text-primary hover:underline" href="#">
              Talk to our support team
            </a>{' '}
            before you go.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface" href="#">
            Terms of Service
          </a>
          <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface" href="#">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  )
}
