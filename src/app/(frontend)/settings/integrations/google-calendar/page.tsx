'use client'

import { useState } from 'react'
import { useGoogleCalendarIntegration, useUpdateGoogleCalendar } from '@/hooks/useGoogleCalendar'

export default function GoogleCalendarPage() {
  const { preferences, isFetched: _isFetched } = useGoogleCalendarIntegration()
  const updateGoogleCalendar = useUpdateGoogleCalendar()

  const [importEvents, setImportEvents] = useState(() => preferences.importEvents)
  const [syncCompleted, setSyncCompleted] = useState(() => preferences.syncCompleted)
  const [primaryCalendar, setPrimaryCalendar] = useState(() => preferences.primaryCalendar)
  const [syncFrequency, setSyncFrequency] = useState(() => preferences.syncFrequency)
  const [isPulsing, setIsPulsing] = useState(false)

  const handleCalendarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrimaryCalendar(e.target.value)
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 500)
  }

  return (
    <div className="p-12 py-16">
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Integrations</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Google Calendar</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-3xl">calendar_today</span>
          </div>
          <div>
            <h1 className="font-display-xl text-display-xl text-on-surface">Google Calendar</h1>
            <p className="text-on-surface-variant font-body-lg leading-relaxed mt-1">
              Sincroniza tus tareas con Google Calendar para mantener el control de tu agenda.
            </p>
          </div>
        </div>
      </header>

      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-4xl space-y-10">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-border-subtle-light flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary text-xs font-bold">
                  G
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="font-medium text-on-surface">Conectado como alex.rivera@gmail.com</p>
                <p className="text-xs text-text-secondary-light">Última sincronización: Hace 2 minutos</p>
              </div>
            </div>
            <button className="px-4 py-2 text-error font-medium hover:bg-error-container/20 rounded-lg transition-colors text-sm shrink-0">
              Desconectar
            </button>
          </div>

          <section>
            <h3 className="text-lg font-semibold text-on-surface mb-6 border-b border-border-subtle-light pb-2">
              Preferencias de Sincronización
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-on-surface">Importar eventos como tareas</p>
                  <p className="text-sm text-text-secondary-light mt-0.5">
                    Los eventos del calendario aparecerán automáticamente en tu lista &apos;My Day&apos;.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={importEvents}
                    onChange={(e) => setImportEvents(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-on-surface">Sincronizar tareas completadas</p>
                  <p className="text-sm text-text-secondary-light mt-0.5">
                    Marcar una tarea como completada en FocusFlow la marcará como tal en el calendario.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={syncCompleted}
                    onChange={(e) => setSyncCompleted(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-on-surface">Calendario Principal</p>
                  <p className="text-sm text-text-secondary-light mt-0.5">
                    Selecciona el calendario donde se crearán las nuevas tareas.
                  </p>
                </div>
                <div className="relative w-64 shrink-0">
                  <select
                    className="appearance-none w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface cursor-pointer"
                    value={primaryCalendar}
                    onChange={handleCalendarChange}
                  >
                    <option>Trabajo (alex.rivera@gmail.com)</option>
                    <option>Personal</option>
                    <option>FocusFlow Tasks</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-on-surface">Frecuencia de Sincronización</p>
                  <p className="text-sm text-text-secondary-light mt-0.5">
                    Con qué frecuencia FocusFlow buscará actualizaciones.
                  </p>
                </div>
                <div className="relative w-64 shrink-0">
                  <select
                    className="appearance-none w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-on-surface cursor-pointer"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                  >
                    <option>En tiempo real (Push)</option>
                    <option>Cada 15 minutos</option>
                    <option>Cada hora</option>
                    <option>Manualmente</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-4 pt-8 border-t border-border-subtle-light">
            <button
              type="button"
              className="px-8 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateGoogleCalendar.mutate({
                importEvents,
                syncCompleted,
                primaryCalendar,
                syncFrequency,
              })}
              disabled={updateGoogleCalendar.isPending}
            >
              {updateGoogleCalendar.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-surface-container text-on-surface-variant rounded-xl font-semibold hover:bg-surface-container-high transition-colors"
              onClick={() => {
                setImportEvents(preferences.importEvents)
                setSyncCompleted(preferences.syncCompleted)
                setPrimaryCalendar(preferences.primaryCalendar)
                setSyncFrequency(preferences.syncFrequency)
              }}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="w-detail-panel-width shrink-0">
          <div className="glass-panel rounded-2xl border border-border-subtle-light overflow-hidden sticky top-24">
            <div className="p-8 border-b border-border-subtle-light">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">visibility</span>
                Vista Previa
              </h3>
              <p className="text-sm text-text-secondary-light mt-1">
                Así es como verás tus eventos sincronizados.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">
                  Hoy - 14:00
                </p>
                <div
                  className={`group relative bg-surface-container-lowest border border-border-subtle-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${isPulsing ? 'animate-pulse' : ''}`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-2xl" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center hover:bg-primary/5 cursor-pointer">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                      </div>
                      <div>
                        <h4 className="text-[15px] font-semibold text-on-surface">
                          Reunión de Diseño Trimestral
                        </h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary-light">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            14:00 - 15:30
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-sm">event</span>
                            Google Calendar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-subtle-light">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-text-secondary-light">+3 asistentes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="opacity-40 select-none grayscale pointer-events-none">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">
                  Hoy - 16:30
                </p>
                <div className="bg-surface-container-lowest/50 border border-border-subtle-light rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full border-2 border-outline-variant" />
                    <div>
                      <h4 className="text-[15px] font-medium text-on-surface">
                        Revisión de métricas semanales
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary-light">
                        <span className="material-symbols-outlined text-sm">link</span>
                        meet.google.com/abc-defg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-8 mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-8xl text-primary">tips_and_updates</span>
              </div>
              <h5 className="text-primary font-bold text-sm mb-2">Consejo FocusFlow</h5>
              <p className="text-sm text-on-surface-variant leading-relaxed relative z-10">
                Puedes usar el comando <code className="bg-surface-container-lowest px-1 rounded border border-border-subtle-light">/cal</code> en cualquier tarea para vincularla rápidamente a un evento existente de tu calendario sincronizado.
              </p>
            </div>

            <div className="p-8 bg-surface-container-low/50 border-t border-border-subtle-light">
              <div className="flex items-center justify-between text-xs text-text-secondary-light">
                <span>Versión Pro</span>
                <span className="text-primary font-bold">ACTIVA</span>
              </div>
              <div className="mt-2 w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="w-full h-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
