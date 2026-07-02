'use client'

import { useState } from 'react'

export default function BasicInfoPage() {
  const [fullName, setFullName] = useState('Alex Rivera')
  const [email, setEmail] = useState('j.doe@etherealfocus.com')
  const [bio, setBio] = useState('Product Designer focused on deep work and flow states.')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')

  const handleSave = () => {
    if (saving === 'saving') return
    setSaving('saving')
    setTimeout(() => {
      setSaving('saved')
      setTimeout(() => setSaving('idle'), 2000)
    }, 800)
  }

  return (
    <div className="max-w-4xl mx-auto p-12 h-full flex flex-col">
      <header className="mb-12">
        <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight mb-2">
          Basic Information
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Update your personal details and how others see you on FocusFlow.
        </p>
      </header>

      <section className="space-y-12 flex-1">
        <div className="flex items-start gap-12 pb-12 border-b border-border-subtle-light">
          <div className="relative group">
            <img
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn9Owej-sfgxZIxCkq4O0mxGJMWpzA0aFUOPVjtWdZuOyyCFeEmhqizAIDPGaefWKacAy8rS_X8u5Jhir6YJfzSb9LEAW8O6JzwQj1QkfG76d-iZSf5IJtqNA9cruRu_4uYprfVdhSmcJLhipFDHR5o_DzbHWIfGy9uuEyqKBgAm_z4nbuPxGBuclu7cmNnyUu9l3yRBXKWWJKjIFzZsulsVKSCXQnkzzE9abF-T13-aYJDy8gUwEJyFuWWMZcSJODpu9TskFUy7_-"
              alt="Profile picture"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="font-headline-md text-[16px] text-on-surface">Profile Picture</h3>
            <p className="text-label-sm text-on-surface-variant max-w-xs">
              We support PNGs, JPEGs and GIFs under 5MB.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2 bg-primary text-white font-medium rounded-lg text-[14px] transition-all duration-200 hover:bg-primary-container shadow-sm">
                Change Photo
              </button>
              <button className="px-5 py-2 bg-surface text-on-surface-variant font-medium rounded-lg text-[14px] border border-border-subtle-light transition-all duration-200 hover:bg-surface-variant">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h3 className="font-headline-md text-[16px] text-on-surface">Personal Details</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">
              These details will be visible to your teammates.
            </p>
          </div>
          <div className="col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-label-sm font-semibold text-on-surface-variant">
                Full Name
              </label>
              <input
                className="w-full px-4 py-3 bg-white border border-border-subtle-light rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-label-sm font-semibold text-on-surface-variant flex items-center justify-between">
                Email Address
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-primary-container/10 text-primary font-bold rounded-full">
                  Primary
                </span>
              </label>
              <div className="relative">
                <input
                  className="w-full pl-11 pr-4 py-3 bg-white border border-border-subtle-light rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)]"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-label-sm font-semibold text-on-surface-variant">
                Short Bio
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-border-subtle-light rounded-lg text-body-md transition-all duration-200 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] resize-none"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-[12px] text-right text-on-surface-variant">
                {bio.length} / 160 characters
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-12 py-8 border-t border-border-subtle-light flex items-center justify-end gap-4">
        <button className="px-8 py-3 text-on-surface-variant font-medium rounded-lg text-[15px] transition-all duration-200 hover:bg-surface-variant">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving === 'saving'}
          className={`px-10 py-3 font-semibold rounded-lg text-[15px] shadow-lg transition-all duration-200 ${
            saving === 'saved'
              ? 'bg-green-600 text-white shadow-green-600/20'
              : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {saving === 'saving' ? 'Saving...' : saving === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
      </footer>
    </div>
  )
}
