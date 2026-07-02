'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useProfile } from '@/hooks/useProfile'
import { useUploadProfilePhoto, useRemoveProfilePhoto } from '@/hooks/useProfilePhoto'

export default function ProfilePhotoPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: profile } = useProfile()
  const { mutate: uploadPhoto, isPending: isUploading } = useUploadProfilePhoto()
  const { mutate: removePhoto, isPending: isRemoving } = useRemoveProfilePhoto()
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')

  const avatarUrl = profile?.avatar || null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving('saving')
    uploadPhoto(file, {
      onSuccess: () => {
        setSaving('saved')
        setTimeout(() => setSaving('idle'), 2000)
      },
      onError: () => {
        setSaving('idle')
      },
    })
  }

  const handleRemove = () => {
    if (isRemoving) return
    setSaving('saving')
    removePhoto(undefined, {
      onSuccess: () => {
        setSaving('saved')
        setTimeout(() => setSaving('idle'), 2000)
      },
      onError: () => {
        setSaving('idle')
      },
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-12 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-xs font-medium tracking-wide uppercase">Settings</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-xs font-medium tracking-wide uppercase">Account</span>
        </div>
        <h2 className="font-display-xl text-display-xl text-on-surface">Profile Picture</h2>
        <p className="font-body-md text-on-surface-variant mt-2 max-w-xl">
          Customize how you appear to your team and collaborators. Your photo will be visible
          across the workspace.
        </p>
      </header>

      <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-border-subtle-light">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden ring-4 ring-primary/5">
              {avatarUrl ? (
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={avatarUrl}
                  alt="Profile picture"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-high text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl">person</span>
                </div>
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-8 py-3 bg-primary text-white font-headline-md text-sm rounded-xl hover:shadow-lg hover:shadow-primary/20 active:opacity-90 transition-all disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <button
                onClick={handleRemove}
                disabled={isRemoving || !avatarUrl}
                className="px-8 py-3 border border-outline-variant text-on-surface-variant font-headline-md text-sm rounded-xl hover:bg-surface-container-high/30 active:opacity-80 transition-all disabled:opacity-50"
              >
                Remove
              </button>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <p className="text-xs font-body-md">We support PNGs, JPEGs and GIFs under 5MB.</p>
            </div>
          </div>

          <div className="w-full pt-8 mt-8 border-t border-border-subtle-light">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary">visibility</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface mb-1">Public Presence</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Changes to your profile picture are synced across all your devices and shared
                  with anyone who has access to your shared tasks or workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/settings/profile/basic-info"
          className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1 group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Back to Account
        </Link>
        <div className="flex items-center gap-3">
          {saving === 'saving' && (
            <span className="text-sm text-on-surface-variant">Saving changes...</span>
          )}
          {saving === 'saved' && (
            <span className="text-sm text-emerald-600 font-medium">Changes saved</span>
          )}
          <Link
            href="/settings/profile/basic-info"
            className="px-10 py-3 bg-primary text-white font-headline-md text-sm rounded-xl shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  )
}
