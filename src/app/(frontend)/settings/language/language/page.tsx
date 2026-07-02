'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguagePrefs, useUpdateLanguage } from '@/hooks/useLanguagePreferences'

const LANGUAGES = [
  { value: 'en', label: 'English', example: 'Example: October 25, 2023' },
  { value: 'es', label: 'Español', example: 'Ejemplo: 25 de octubre de 2023' },
  { value: 'fr', label: 'Français', example: 'Exemple : 25 octobre 2023' },
  { value: 'de', label: 'Deutsch', example: 'Beispiel: 25. Oktober 2023' },
  { value: 'pt', label: 'Português', example: 'Exemplo: 25 de outubro de 2023' },
  { value: 'it', label: 'Italiano', example: 'Esempio: 25 ottobre 2023' },
] as const

const DATE_FORMATS = [
  { value: 'ddmmyyyy', label: 'DD/MM/YYYY', example: '25/10/2023' },
  { value: 'mmddyyyy', label: 'MM/DD/YYYY', example: '10/25/2023' },
  { value: 'yyyymmdd', label: 'YYYY-MM-DD', example: '2023-10-25 (ISO 8601)' },
  { value: 'long', label: 'Long Format', example: 'Wednesday, October 25, 2023' },
] as const

const PREVIEWS: Record<string, string> = {
  en: 'Due Oct 25, 2023',
  es: 'Vence el 25/10/2023',
  fr: 'Échéance le 25/10/2023',
  de: 'Fällig am 25.10.2023',
  pt: 'Vence em 25/10/2023',
  it: 'Scade il 25/10/2023',
}

const MONTH_NAMES: Record<string, string> = {
  en: 'October 2023',
  es: 'Octubre 2023',
  fr: 'Octobre 2023',
  de: 'Oktober 2023',
  pt: 'Outubro 2023',
  it: 'Ottobre 2023',
}

const WEEKDAY_LABELS: Record<string, string[]> = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  fr: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  de: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  pt: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  it: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
}

export default function AppLanguagePage() {
  const { locale, dateTimePreferences, isFetched: _isFetched } = useLanguagePrefs()
  const updateLanguage = useUpdateLanguage()

  const [selectedLang, setSelectedLang] = useState(() => locale)
  const [selectedFormat, setSelectedFormat] = useState(() => dateTimePreferences.dateFormat)
  const [firstDay, setFirstDay] = useState(() => dateTimePreferences.firstDayOfWeek)
  const previewRef = useRef<HTMLSpanElement>(null)
  const monthLabel = MONTH_NAMES[selectedLang] ?? 'October 2023'
  const weekdays = WEEKDAY_LABELS[selectedLang] ?? WEEKDAY_LABELS.en

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.style.opacity = '0'
      const timer = setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.style.opacity = '1'
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [selectedLang, selectedFormat])

  return (
    <div className="max-w-4xl mx-auto p-12 py-16">
      <header className="mb-12 max-w-2xl">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-4">
          <span>Settings</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Language &amp; Region</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">App Language</span>
        </nav>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-3">
          App Language
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Choose your preferred language for the entire interface. Your tasks,
          labels, and menus will adapt automatically.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <section className="space-y-4">
            <h3 className="font-headline-md text-sm uppercase tracking-widest text-on-surface-variant">
              Language Options
            </h3>
            <div className="grid gap-3">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang.value}
                  className={`flex items-center justify-between p-4 bg-surface-container-lowest border rounded-xl hover:border-primary/30 cursor-pointer transition-all duration-300 ${
                    selectedLang === lang.value
                      ? 'border-primary shadow-sm'
                      : 'border-border-subtle-light'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-body-md font-semibold">{lang.label}</span>
                    <span className="font-label-sm text-on-surface-variant">{lang.example}</span>
                  </div>
                  <input
                    type="radio"
                    name="app-language"
                    value={lang.value}
                    checked={selectedLang === lang.value}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-5 h-5 text-primary border-outline focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="pt-8 border-t border-border-subtle-light space-y-4">
            <h3 className="font-headline-md text-sm uppercase tracking-widest text-on-surface-variant">
              Date Format
            </h3>
            <div className="grid gap-3">
              {DATE_FORMATS.map((fmt) => (
                <label
                  key={fmt.value}
                  className={`flex items-center justify-between p-4 bg-surface-container-lowest border rounded-xl hover:border-primary/30 cursor-pointer transition-all duration-300 ${
                    selectedFormat === fmt.value
                      ? 'border-primary shadow-sm'
                      : 'border-border-subtle-light'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-body-md font-semibold">{fmt.label}</span>
                    <span className="font-label-sm text-on-surface-variant">{fmt.example}</span>
                  </div>
                  <input
                    type="radio"
                    name="date-format"
                    value={fmt.value}
                    checked={selectedFormat === fmt.value}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-5 h-5 text-primary border-outline focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-border-subtle-light space-y-4">
            <h3 className="font-headline-md text-sm uppercase tracking-widest text-on-surface-variant">
              First Day of the Week
            </h3>
            <div className="relative max-w-xs">
              <select
                value={firstDay}
                onChange={(e) => setFirstDay(e.target.value)}
                className="block w-full pl-4 pr-10 py-3 text-base border-border-subtle-light focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-xl appearance-none bg-surface-container-lowest"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
                <option value="saturday">Saturday</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
            <p className="font-label-sm text-on-surface-variant">
              This will affect how the weekly calendar view is rendered.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              className="px-8 h-12 bg-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => updateLanguage.mutate({
                locale: selectedLang,
                dateTimePreferences: {
                  ...dateTimePreferences,
                  dateFormat: selectedFormat as 'ddmmyyyy' | 'mmddyyyy' | 'yyyymmdd' | 'long',
                  firstDayOfWeek: firstDay as 'monday' | 'sunday' | 'saturday',
                },
              })}
              disabled={updateLanguage.isPending}
            >
              {updateLanguage.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="px-8 h-12 text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high rounded-xl transition-all"
              onClick={() => {
                setSelectedLang(locale)
                setSelectedFormat(dateTimePreferences.dateFormat)
                setFirstDay(dateTimePreferences.firstDayOfWeek)
              }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="font-headline-md text-xs uppercase tracking-widest text-on-surface-variant mb-6">
              Live Preview
            </h3>
            <div className="space-y-6">
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-border-subtle-light shadow-sm">
                <div className="flex items-start gap-4 mb-3">
                  <div className="mt-1 w-5 h-5 rounded-full border-2 border-primary/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-body-md font-semibold text-on-surface">
                      Finalizar reporte trimestral
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 text-primary">
                      <span className="material-symbols-outlined text-[18px]">event</span>
                      <span
                        ref={previewRef}
                        className="font-label-sm"
                        style={{ transition: 'opacity 0.2s ease-in-out' }}
                      >
                        {PREVIEWS[selectedLang]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border-subtle-light">
                  <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] rounded uppercase font-bold tracking-tight">
                    Finanzas
                  </span>
                  <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] rounded uppercase font-bold tracking-tight">
                    Q4
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-border-subtle-light shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-body-md font-bold">{monthLabel}</span>
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer">
                      chevron_left
                    </span>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer">
                      chevron_right
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekdays.map((d) => (
                    <div key={d} className="text-[10px] font-bold text-on-surface-variant">
                      {d}
                    </div>
                  ))}
                  {[23, 24, 25, 26, 27, 28, 29].map((day) => (
                    <div
                      key={day}
                      className={`text-xs p-1 ${
                        day === 25
                          ? 'bg-primary text-on-primary rounded-full'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-container/5 rounded-2xl p-6 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <span className="font-body-md font-bold text-primary">Zen Tip</span>
            </div>
            <p className="font-label-sm text-on-surface-variant leading-relaxed">
              Using the interface in your native language reduces cognitive load
              and helps you stay in flow. You can always switch back anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
