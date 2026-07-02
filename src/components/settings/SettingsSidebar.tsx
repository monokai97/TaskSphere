'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type SettingsSection = 'profile' | 'privacy' | 'appearance' | 'notifications' | 'language' | 'integrations'

type SubItem = {
  page: string
  label: string
  href: string
}

type SubGroup = {
  groupLabel: string
  items: SubItem[]
}

type SettingsItem = {
  section: SettingsSection
  label: string
  icon: string
  href: string
  subItems?: SubItem[]
  subGroups?: SubGroup[]
}

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    section: 'profile',
    label: 'Profile',
    icon: 'person',
    href: '/settings/profile',
    subItems: [
      { page: 'basic-info', label: 'Basic Info', href: '/settings/profile/basic-info' },
      { page: 'photo', label: 'Profile Photo', href: '/settings/profile/photo' },
      { page: 'role', label: 'Role & Plan', href: '/settings/profile/role' },
      { page: 'delete', label: 'Delete Account', href: '/settings/profile/delete' },
    ],
  },
  {
    section: 'privacy',
    label: 'Privacy & Security',
    icon: 'security',
    href: '/settings/privacy',
    subItems: [
      { page: 'password', label: 'Password', href: '/settings/privacy/password' },
      { page: '2fa', label: 'Two-Factor Auth', href: '/settings/privacy/2fa' },
      { page: 'sessions', label: 'Active Sessions', href: '/settings/privacy/sessions' },
      { page: 'list-privacy', label: 'List Privacy', href: '/settings/privacy/list-privacy' },
    ],
  },
  {
    section: 'appearance',
    label: 'Appearance',
    icon: 'palette',
    href: '/settings/appearance',
    subItems: [
      { page: 'theme', label: 'Theme', href: '/settings/appearance/theme' },
      { page: 'accent', label: 'Accent Color', href: '/settings/appearance/accent' },
      { page: 'density', label: 'List Density', href: '/settings/appearance/density' },
      { page: 'background', label: 'My Day Background', href: '/settings/appearance/background' },
    ],
  },
  {
    section: 'notifications',
    label: 'Notifications',
    icon: 'notifications',
    href: '/settings/notifications',
    subItems: [
      { page: 'alerts', label: 'App Alerts', href: '/settings/notifications/alerts' },
      { page: 'email-summary', label: 'Email Summary', href: '/settings/notifications/email' },
      { page: 'push', label: 'Push Settings', href: '/settings/notifications/push' },
    ],
  },
  {
    section: 'language',
    label: 'Language & Region',
    icon: 'language',
    href: '/settings/language',
    subItems: [
      { page: 'language', label: 'App Language', href: '/settings/language/language' },
      { page: 'date-format', label: 'Date & Time Format', href: '/settings/language/date-format' },
      { page: 'timezone', label: 'Timezone', href: '/settings/language/timezone' },
      { page: 'first-day', label: 'First Day of Week', href: '/settings/language/first-day' },
    ],
  },
  {
    section: 'integrations',
    label: 'Integrations',
    icon: 'integration_instructions',
    href: '/settings/integrations',
    subGroups: [
      {
        groupLabel: 'Calendarios',
        items: [
          { page: 'google-calendar', label: 'Google Calendar', href: '/settings/integrations/google-calendar' },
          { page: 'outlook-calendar', label: 'Outlook Calendar', href: '/settings/integrations/outlook-calendar' },
          { page: 'ical', label: 'iCal / URL Externa', href: '/settings/integrations/ical' },
        ],
      },
      {
        groupLabel: 'Comunicación y Enfoque',
        items: [
          { page: 'slack', label: 'Slack', href: '/settings/integrations/slack' },
          { page: 'microsoft-teams', label: 'Microsoft Teams', href: '/settings/integrations/microsoft-teams' },
        ],
      },
      {
        groupLabel: 'Productividad y Automatización',
        items: [
          { page: 'zapier', label: 'Zapier / Make', href: '/settings/integrations/zapier' },
          { page: 'github', label: 'GitHub / GitLab', href: '/settings/integrations/github' },
        ],
      },
    ],
  },
]

export function SettingsSidebar() {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<Set<SettingsSection>>(
    () => {
      const active = SETTINGS_ITEMS.find((item) =>
        pathname.startsWith(`/settings/${item.section}`),
      )
      return new Set(active ? [active.section] : [])
    },
  )

  const toggleSection = (section: SettingsSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  return (
    <aside className="w-sidebar-width h-full bg-surface-container-lowest border-r border-border-subtle-light overflow-y-auto flex flex-col py-10 shrink-0">
      <div className="px-8 mb-8 flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-surface">Settings</h2>
      </div>
      <nav className="space-y-1">
        <div className="px-8 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Account
        </div>
        {SETTINGS_ITEMS.slice(0, 2).map((item) => (
          <MenuItem
            key={item.section}
            item={item}
            pathname={pathname}
            isExpanded={expandedSections.has(item.section)}
            onToggle={() => toggleSection(item.section)}
          />
        ))}

        <div className="px-8 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          Preferences
        </div>
        {SETTINGS_ITEMS.slice(2).map((item) => (
          <MenuItem
            key={item.section}
            item={item}
            pathname={pathname}
            isExpanded={expandedSections.has(item.section)}
            onToggle={() => toggleSection(item.section)}
          />
        ))}
      </nav>
    </aside>
  )
}

function MenuItem({
  item,
  pathname,
  isExpanded,
  onToggle,
}: {
  item: SettingsItem
  pathname: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const sectionPath = `/settings/${item.section}`
  const isSectionActive = pathname.startsWith(sectionPath)

  const allSubItems = item.subGroups
    ? item.subGroups.flatMap((g) => g.items)
    : item.subItems ?? []

  const activeSubPage =
    allSubItems.find((sub) => pathname === sub.href)?.page ?? null

  const hasSubItems = allSubItems.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-8 py-3 transition-colors ${
          isSectionActive
            ? 'bg-surface-variant/50 text-primary font-semibold'
            : 'text-on-surface-variant hover:bg-surface-variant/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-sm">{item.icon}</span>
          <span className="font-body-md">{item.label}</span>
        </div>
        {hasSubItems && (
          <span
            className={`material-symbols-outlined text-sm transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
        )}
      </button>
      {hasSubItems && isExpanded && (
        <div className="pl-14 pb-2">
          {item.subGroups
            ? item.subGroups.map((group) => (
                <div key={group.groupLabel} className="pb-3">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider py-1.5">
                    {group.groupLabel}
                  </div>
                  {group.items.map((sub) => (
                    <Link
                      key={sub.page}
                      href={sub.href}
                      className={`block w-full text-left py-1.5 text-sm transition-colors ${
                        activeSubPage === sub.page
                          ? 'text-primary font-medium'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))
            : item.subItems?.map((sub) => (
                <Link
                  key={sub.page}
                  href={sub.href}
                  className={`block w-full text-left py-2 text-sm transition-colors ${
                    activeSubPage === sub.page
                      ? 'text-primary font-medium'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {sub.label}
                </Link>
              ))}
        </div>
      )}
    </div>
  )
}
