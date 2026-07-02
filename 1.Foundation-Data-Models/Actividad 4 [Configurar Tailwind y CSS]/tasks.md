# Tasks: Configurar Tailwind con Ethereal Focus

## Dependencias
- Node.js y pnpm disponibles

---

## Hito 4.1: Crear tailwind.config.ts

- [ ] Ejecutar `pnpm add tailwindcss @tailwindcss/postcss postcss` para instalar Tailwind
- [ ] Crear `tailwind.config.ts` en la raíz del proyecto
- [ ] Configurar `darkMode: 'class'`
- [ ] Configurar `content: ['./src/**/*.{ts,tsx}']`
- [ ] Agregar colores light: surface, surface-dim, surface-bright, surface-container-lowest/low/container/high/highest, on-surface, on-surface-variant
- [ ] Agregar colores primary: primary, on-primary, primary-container, on-primary-container, inverse-primary
- [ ] Agregar colores secondary: secondary, on-secondary, secondary-container, on-secondary-container
- [ ] Agregar colores error: error, on-error, error-container, on-error-container
- [ ] Agregar colores outline: outline, outline-variant
- [ ] Agregar colores utilitarios: border-subtle-light, text-secondary-light
- [ ] Agregar colores dark: canvas-dark, surface-dark, surface-elevated-dark, text-secondary-dark, border-subtle-dark
- [ ] Agregar colores fixed: primary-fixed, primary-fixed-dim, secondary-fixed, secondary-fixed-dim, tertiary-fixed, tertiary-fixed-dim
- [ ] Agregar borderRadius: DEFAULT (0.25rem), lg (0.5rem), xl (0.75rem), full (9999px)
- [ ] Agregar spacing: sidebar-width (288px), detail-panel-width (384px), container-padding (3rem), container-padding-mobile (1rem), gutter-md (1rem), stack-gap (0.25rem)
- [ ] Agregar fontFamily: display-xl, display-xl-mobile, headline-md, label-sm (Geist), body-lg, body-md, task-item (Inter)
- [ ] Agregar fontSize: display-xl (36px), display-xl-mobile (24px), headline-md (20px), body-lg (18px), body-md (16px), label-sm (12px), task-item (15px)
- [ ] Agregar keyframes: slide-in (0% → -20px opacity 0, 100% → 0px opacity 1)
- [ ] Agregar animation: slide-in (0.4s cubic-bezier(0.16,1,0.3,1) forwards)

## Hito 4.2: Actualizar styles.css

- [ ] Abrir `src/app/(frontend)/styles.css`
- [ ] Reemplazar todo el contenido con los nuevos estilos
- [ ] Agregar `@import` de Google Fonts: Geist (400-800), Inter (400-600), Material Symbols (wght 100-700, FILL 0-1)
- [ ] Agregar `@import 'tailwindcss'`
- [ ] Agregar clase `.glass-panel`: background rgba branco 0.7 + backdrop-blur(12px). Versión dark: rgba(24,24,27,0.8)
- [ ] Agregar clase `.material-symbols-outlined`: font-variation-settings
- [ ] Agregar clase `.custom-scrollbar`: scrollbar 4px, thumb #e1e3e4 (dark: #27272A)

## Hito 4.3: Verificar compilación

- [ ] Ejecutar `pnpm dev`
- [ ] Verificar que no hay errores de Tailwind en la consola
- [ ] Probar que clases como `bg-surface`, `text-primary`, `font-display-xl` son reconocidas (inspeccionar en DevTools que los estilos se aplican)
- [ ] Probar que las animaciones funcionan: `animate-slide-in`

## Verificación

- [ ] `tailwind.config.ts` existe y tiene todos los tokens
- [ ] `styles.css` tiene los 3 @import y las 3 clases globales
- [ ] `pnpm dev` no muestra errores relacionados con Tailwind
- [ ] En DevTools, un div con `className="bg-surface text-primary font-display-xl"` renderiza con los colores y tipografía correctos
