'use client'

export default function IntegrationsPage() {
  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-on-surface-variant mb-4">
          <span className="hover:text-primary transition-colors text-sm cursor-default">
            Settings
          </span>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
          <span className="text-primary font-medium text-sm">
            Integrations
          </span>
        </div>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-4">
          Integrations
        </h1>
        <p className="text-on-surface-variant font-body-lg max-w-2xl leading-relaxed">
          Connect your favorite tools and services to enhance your workflow.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: 'Slack',
            description: 'Receive task notifications and updates directly in your Slack workspace.',
            icon: 'forum',
            connected: false,
          },
          {
            name: 'Google Calendar',
            description: 'Sync your tasks and deadlines with Google Calendar.',
            icon: 'calendar_today',
            connected: true,
          },
          {
            name: 'Notion',
            description: 'Import and export tasks between Task Sphere and Notion.',
            icon: 'description',
            connected: false,
          },
          {
            name: 'Discord',
            description: 'Get real-time task alerts and summaries in your Discord server.',
            icon: 'headphones',
            connected: false,
          },
        ].map((integration) => (
          <div
            key={integration.name}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle-light hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  {integration.icon}
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  {integration.name}
                </h3>
              </div>
            </div>
            <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
              {integration.description}
            </p>
            <button
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
                integration.connected
                  ? 'bg-surface-variant/50 text-on-surface border border-border-subtle-light'
                  : 'bg-primary text-white hover:shadow-md'
              }`}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
