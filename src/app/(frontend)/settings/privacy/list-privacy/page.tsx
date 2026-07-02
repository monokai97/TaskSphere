'use client'

import { useState } from 'react'
import { useProfile, useUpsertProfile } from '@/hooks/useProfile'
import { useLists, useUpdateList } from '@/hooks/useLists'

export default function ListPrivacyPage() {
  const { data: profile } = useProfile()
  const { data: listsData } = useLists()
  const { mutate: saveProfile } = useUpsertProfile()
  const { mutate: updateList, isPending: isUpdatingList } = useUpdateList()

  const [defaultVisibility, setDefaultVisibility] = useState<string | undefined>(undefined)
  const [allowRequests, setAllowRequests] = useState<boolean | undefined>(undefined)
  const [showActivity, setShowActivity] = useState<boolean | undefined>(undefined)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')

  const lists = listsData?.docs ?? []

  const currentDefaultVisibility = defaultVisibility ?? profile?.defaultListVisibility ?? 'private'
  const currentAllowRequests = allowRequests ?? profile?.allowAccessRequests ?? true
  const currentShowActivity = showActivity ?? profile?.showActivityInSharedLists ?? true

  const handlePrivacyToggle = (listId: number, privacy: 'private' | 'shared') => {
    updateList({ id: listId, privacy })
  }

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">
          List Privacy &amp; Sharing
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Manage who can view and edit your personal and shared lists.
        </p>
      </header>

      <div className="space-y-12">
        <section className="max-w-3xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-2 bg-primary/5 rounded-lg">
              <span className="material-symbols-outlined text-primary">visibility</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md mb-1">Default List Visibility</h3>
              <p className="text-sm text-on-surface-variant">
                Choose the initial privacy state for all newly created lists.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer hover:shadow-sm transition-all group ${
                currentDefaultVisibility === 'private'
                  ? 'border-primary bg-surface-container-lowest'
                  : 'border-border-subtle-light bg-surface-container-lowest hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="default_visibility"
                value="private"
                checked={currentDefaultVisibility === 'private'}
                onChange={() => {
                  setDefaultVisibility('private')
                  setSaving('saving')
                  saveProfile(
                    { defaultListVisibility: 'private' },
                    {
                      onSuccess: () => {
                        setSaving('saved')
                        setTimeout(() => setSaving('idle'), 2000)
                      },
                      onError: () => setSaving('idle'),
                    },
                  )
                }}
                className="absolute right-4 top-4 w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="material-symbols-outlined text-primary mb-3">lock</span>
              <span className="font-bold text-on-surface mb-1">Private (Only Me)</span>
              <span className="text-xs text-on-surface-variant">
                Only you can access and modify tasks in this list by default.
              </span>
            </label>
            <label
              className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer hover:shadow-sm transition-all group ${
                currentDefaultVisibility === 'shared'
                  ? 'border-primary bg-surface-container-lowest'
                  : 'border-border-subtle-light bg-surface-container-lowest hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="default_visibility"
                value="shared"
                checked={currentDefaultVisibility === 'shared'}
                onChange={() => {
                  setDefaultVisibility('shared')
                  setSaving('saving')
                  saveProfile(
                    { defaultListVisibility: 'shared' },
                    {
                      onSuccess: () => {
                        setSaving('saved')
                        setTimeout(() => setSaving('idle'), 2000)
                      },
                      onError: () => setSaving('idle'),
                    },
                  )
                }}
                className="absolute right-4 top-4 w-4 h-4 text-primary focus:ring-primary"
              />
              <span
                className={`material-symbols-outlined mb-3 ${
                  currentDefaultVisibility === 'shared' ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                }`}
              >
                groups
              </span>
              <span className="font-bold text-on-surface mb-1">Shared</span>
              <span className="text-xs text-on-surface-variant">
                Lists are created with workspace-level viewing permissions.
              </span>
            </label>
          </div>
          {saving === 'saved' && (
            <p className="text-xs text-emerald-600 font-medium mt-2">Setting saved</p>
          )}
        </section>

        <section className="max-w-3xl border-t border-border-subtle-light pt-12">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-2 bg-primary/5 rounded-lg">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md mb-1">Global Sharing Settings</h3>
              <p className="text-sm text-on-surface-variant">
                Universal controls that apply across all your FocusFlow lists.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-transparent hover:border-border-subtle-light transition-all">
              <div className="flex-1">
                <h4 className="font-semibold text-on-surface">Allow access requests</h4>
                <p className="text-xs text-on-surface-variant">
                  Let others in your workspace request access to private lists.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={currentAllowRequests}
                  onChange={() => {
                    const next = !currentAllowRequests
                    setAllowRequests(next)
                    saveProfile({ allowAccessRequests: next })
                  }}
                />
                <div className="w-11 h-6 bg-surface-dim rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-transparent hover:border-border-subtle-light transition-all">
              <div className="flex-1">
                <h4 className="font-semibold text-on-surface">Show activity in shared lists</h4>
                <p className="text-xs text-on-surface-variant">
                  Members of shared lists can see when you edit or complete tasks.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={currentShowActivity}
                  onChange={() => {
                    const next = !currentShowActivity
                    setShowActivity(next)
                    saveProfile({ showActivityInSharedLists: next })
                  }}
                />
                <div className="w-11 h-6 bg-surface-dim rounded-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          </div>
        </section>

        <section className="max-w-4xl border-t border-border-subtle-light pt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/5 rounded-lg">
                <span className="material-symbols-outlined text-primary">list_alt</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md mb-1">Individual List Controls</h3>
                <p className="text-sm text-on-surface-variant">
                  Modify specific permissions for your active task lists.
                </p>
              </div>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                className="pl-9 pr-4 py-1.5 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-48"
                placeholder="Filter lists..."
                type="text"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border-subtle-light bg-surface-container-lowest">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-border-subtle-light">
                <tr>
                  <th className="px-6 py-4 text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                    List Name
                  </th>
                  <th className="px-6 py-4 text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                    Privacy State
                  </th>
                  <th className="px-6 py-4 text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle-light">
                {lists.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                      No lists yet. Create a list to manage its privacy settings.
                    </td>
                  </tr>
                )}
                {lists.map((list) => (
                  <tr key={list.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: list.color || '#888' }} />
                        <span className="font-medium text-on-surface">{list.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          list.privacy === 'shared'
                            ? 'bg-primary-container/10 text-primary-container hover:bg-primary-container/20'
                            : 'bg-surface-dim text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                        onClick={() =>
                          handlePrivacyToggle(
                            list.id,
                            list.privacy === 'shared' ? 'private' : 'shared',
                          )
                        }
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {list.privacy === 'shared' ? 'groups' : 'lock'}
                        </span>
                        {list.privacy === 'shared' ? 'Shared' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs italic text-on-surface-variant">Only me</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline text-sm font-semibold">Edit Permissions</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-3xl border-t border-border-subtle-light pt-12 pb-24">
          <div className="p-6 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-red-600">report_problem</span>
              <h4 className="font-bold text-red-900">Revoke Shared Access</h4>
            </div>
            <p className="text-sm text-red-800 mb-6 leading-relaxed">
              Instantly make all your shared lists private. This will remove all existing collaborators
              and revoke all invitation links. This action cannot be undone.
            </p>
            <button
              onClick={() => {
                lists
                  .filter((l) => l.privacy === 'shared')
                  .forEach((l) => handlePrivacyToggle(l.id, 'private'))
              }}
              disabled={isUpdatingList}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Revoke Global Access
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
