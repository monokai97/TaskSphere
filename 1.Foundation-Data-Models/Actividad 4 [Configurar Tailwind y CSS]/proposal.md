# Proposal: Configurar Tailwind con Ethereal Focus

## Problema

El proyecto no tiene Tailwind CSS configurado. `tailwind.config.ts` no existe, `styles.css` contiene estilos genéricos del template PayloadCMS (fondo negro, tipografía system-ui, colores rgb(1000)). Los prototipos HTML en `ui-resources/` usan ~60 tokens de color, tipografías Geist + Inter, glassmorphism, y animaciones que no tienen equivalente en el código actual.

## Solución

1. Crear `tailwind.config.ts` con todos los tokens de Ethereal Focus definidos en `design.md` (Sección 5.A)
2. Reemplazar `styles.css` con las clases globales necesarias: imports de Google Fonts, `.glass-panel`, `.material-symbols-outlined`, `.custom-scrollbar`
3. Los tokens de Tailwind permiten usar clases como `bg-surface`, `text-primary`, `font-display-xl` en todos los componentes

## Estrategia

- **Design tokens como contrato**: la paleta de ~60 colores se define en `tailwind.config.ts` y se usa en componentes mediante clases utilitarias — no hay variables CSS duplicadas
- **Dark mode por clase**: `darkMode: 'class'` permite alternar tema agregando/quitando la clase `dark` en `<html>`
- **Fonts via Google Fonts CDN**: Geist (display) e Inter (body) se importan en `styles.css` con `@import`

## Impacto

- 1 archivo nuevo: `tailwind.config.ts`
- 1 archivo modificado: `src/app/(frontend)/styles.css` (reemplazo completo)
- Tailwind debe instalarse como dependencia (`pnpm add tailwindcss @tailwindcss/postcss postcss`)
- Sin cambios en componentes existentes (aún no hay componentes de UI propios)
