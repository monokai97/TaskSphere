import Link from 'next/link'

const categories = [
  {
    title: 'App Alerts',
    description: 'Configure in-app notifications, pop-ups, and sound alerts.',
    href: '/settings/notifications/alerts',
    icon: 'notifications_active',
  },
  {
    title: 'Email Summary',
    description: 'Manage how and when you receive productivity reports in your inbox.',
    href: '/settings/notifications/email',
    icon: 'mail',
  },
  {
    title: 'Push Settings',
    description: 'Configure browser and mobile push notification preferences.',
    href: '/settings/notifications/push',
    icon: 'push_pin',
  },
]

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-12">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-4">
          Notifications
        </h1>
        <p className="text-on-surface-variant font-body-lg max-w-2xl leading-relaxed">
          Choose how you want to stay informed — from in-app alerts to email
          digests and push notifications.
        </p>
      </header>

      <div className="grid gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group flex items-center gap-6 p-6 rounded-2xl border border-border-subtle-light bg-surface-container-lowest hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-3xl text-primary">
              {cat.icon}
            </span>
            <div className="flex-1">
              <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="text-on-surface-variant text-sm mt-1">
                {cat.description}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
