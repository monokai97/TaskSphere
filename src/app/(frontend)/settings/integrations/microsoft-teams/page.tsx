'use client'

import { useEffect, useState } from 'react'
import { useMicrosoftTeamsIntegration, useUpdateMicrosoftTeams } from '@/hooks/useMicrosoftTeams'

export default function MicrosoftTeamsPage() {
  const { preferences, isFetched: _isFetched } = useMicrosoftTeamsIntegration()
  const updateTeams = useUpdateMicrosoftTeams()

  const [presenceSync, setPresenceSync] = useState(() => preferences.presenceSync)
  const [activityFeed, setActivityFeed] = useState(() => preferences.activityFeed)
  const [channel, setChannel] = useState(() => preferences.channel)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`p-12 py-16 transition-opacity duration-600 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-[#6264A7] rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-white text-[32px]">groups</span>
        </div>
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight">
            Microsoft Teams Integration
          </h1>
          <p className="text-on-surface-variant text-body-lg">
            Sincroniza tu flujo de trabajo de FocusFlow con el ecosistema de Teams.
          </p>
        </div>
      </div>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-12">
          <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Conectado a Workspace: Ethereal Corp
                </h3>
                <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Última sincronización: Hoy, 10:45 AM
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 rounded-lg border border-error text-error font-semibold hover:bg-error/5 transition-all active:scale-[0.98] shrink-0">
              Desconectar
            </button>
          </section>

          <section className="space-y-6">
            <h4 className="font-headline-md text-headline-md text-on-surface px-1">Preferencias de Sincronización</h4>
            <div className="grid gap-4">
              <div
                className={`p-6 bg-surface-container-lowest border rounded-xl flex items-center justify-between transition-all ${
                  presenceSync
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border-subtle-light hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-primary/5 rounded-lg">
                    <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Sincronización de Presencia</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      Actualiza automáticamente tu estado en Teams a &apos;En Foco&apos; y activa &apos;No molestar&apos; durante tus sesiones.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={presenceSync}
                    onChange={(e) => setPresenceSync(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              <div
                className={`p-6 bg-surface-container-lowest border rounded-xl flex items-center justify-between transition-all ${
                  activityFeed
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border-subtle-light hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-primary/5 rounded-lg">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Notificaciones del Feed de Actividad</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      Publica un mensaje en un canal específico de Teams cuando completes una tarea importante.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={activityFeed}
                    onChange={(e) => setActivityFeed(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-headline-md text-headline-md text-on-surface px-1">Mapeo de Canales</h4>
            <div className="p-6 bg-surface-container-lowest border border-border-subtle-light rounded-xl">
              <label className="block text-sm font-medium text-on-surface-variant mb-3">
                Canal de destino para actualizaciones
              </label>
              <div className="relative">
                <select
                  className="block w-full rounded-lg border-outline-variant bg-surface-container-lowest py-3 pl-4 pr-10 text-on-surface focus:border-primary focus:ring-primary appearance-none transition-colors cursor-pointer"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option>#general</option>
                  <option>#product-updates</option>
                  <option>#marketing-announcements</option>
                  <option>#engineering-sync</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant/60 mt-3 italic">
                Las actualizaciones de tareas marcadas como &apos;Prioridad Alta&apos; se enviarán aquí.
              </p>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/10 rounded-2xl p-8 flex gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h4 className="font-headline-md text-headline-md text-primary font-bold">
                Pestaña de FocusFlow en Teams
              </h4>
              <p className="text-on-surface-variant leading-relaxed text-sm">
                Añade FocusFlow como una pestaña dentro de cualquier canal de Teams para gestionar proyectos compartidos
                y tableros de tareas sin salir de tu entorno de colaboración.
              </p>
              <button className="flex items-center gap-2 text-primary font-bold group">
                <span>Ver guía de instalación</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </button>
            </div>
            <div className="w-48 h-32 bg-surface-container-lowest rounded-lg shadow-inner border border-primary/10 relative overflow-hidden flex items-center justify-center p-4 shrink-0">
              <div className="w-full h-full bg-surface-container rounded border-2 border-dashed border-outline-variant flex items-center justify-center text-outline-variant">
                <span className="material-symbols-outlined text-[40px]">add</span>
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateTeams.mutate({
                presenceSync,
                activityFeed,
                channel,
              })}
              disabled={updateTeams.isPending}
            >
              {updateTeams.isPending ? 'Saving...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setPresenceSync(preferences.presenceSync)
                setActivityFeed(preferences.activityFeed)
                setChannel(preferences.channel)
              }}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <h3 className="text-label-sm uppercase tracking-widest text-on-surface-variant/60">
                Vista Previa en Vivo
              </h3>
            </div>

            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  Presencia en Teams
                </p>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-[2px] bg-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">Alex Rivera</p>
                    <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="text-red-500 font-medium">En Foco</span>
                      <span className="text-on-surface-variant/40">&bull;</span>
                      🔕 No molestar
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                  Notificación de Canal
                </p>
                <div className="bg-[#F3F2F1] p-4 rounded-lg border border-[#E1DFDD] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-white">filter_center_focus</span>
                    </div>
                    <span className="text-[12px] font-bold text-[#605E5C]">FocusFlow</span>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-on-surface text-sm">✅ Tarea Completada</p>
                      <span className="text-[10px] text-on-surface-variant">Ahora mismo</span>
                    </div>
                    <p className="text-[13px] text-on-surface">Finalize Q4 Roadmap</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-on-surface-variant">
                        <span>Progreso del Proyecto</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[85%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-highest/50 rounded-2xl p-6 border border-outline-variant/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <span className="material-symbols-outlined text-[80px]">lightbulb</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                    <span className="font-bold text-on-surface">Tip de FocusFlow</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Usa el comando <span className="bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant text-primary font-mono text-xs">@FocusFlow</span> dentro de cualquier chat de Teams para añadir tareas directamente a tu lista sin cambiar de aplicación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
