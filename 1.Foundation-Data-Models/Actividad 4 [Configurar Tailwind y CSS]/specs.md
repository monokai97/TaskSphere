# Specs: Configurar Tailwind con Ethereal Focus

## Funcionales

1. El sistema debe tener un sistema de diseño consistente con ~60 tokens de color de Ethereal Focus.
2. Las tipografías Geist (títulos) e Inter (cuerpo) deben estar disponibles globalmente.
3. El modo oscuro debe activarse/desactivarse mediante la clase `dark` en `<html>`.
4. Las clases utilitarias de Tailwind deben reconocer todos los tokens: `bg-surface`, `text-primary`, `font-display-xl`, `w-sidebar-width`, etc.
5. Los componentes deben tener acceso a clases globales: `.glass-panel`, `.material-symbols-outlined`, `.custom-scrollbar`.

## Técnicos

| # | Requisito | Especificación |
|---|---|---|
| R1 | Instalar Tailwind | `pnpm add tailwindcss @tailwindcss/postcss postcss` |
| R2 | Config darkMode | `darkMode: 'class'` en tailwind.config.ts |
| R3 | Colors surface | surface (#f8f9fa), surface-dim (#d9dadb), surface-bright (#f8f9fa), surface-container-* (5 niveles) |
| R4 | Colors surface dark | canvas-dark (#09090B), surface-dark (#18181B), surface-elevated-dark (#27272A) |
| R5 | Colors primary | primary (#004ac6), on-primary (#fff), primary-container (#2563eb), on-primary-container (#eeefff), inverse-primary (#b4c5ff) |
| R6 | Colors secondary | secondary (#735c00), on-secondary (#fff), secondary-container (#fed01b), on-secondary-container (#6f5900) |
| R7 | Colors error | error (#ba1a1a), on-error (#fff), error-container (#ffdad6), on-error-container (#93000a) |
| R8 | Colors outline | outline (#737686), outline-variant (#c3c6d7) |
| R9 | Tokens utilitarios | border-subtle-light, text-secondary-light, border-subtle-dark, text-secondary-dark |
| R10 | Fixed colors | primary-fixed (#dbe1ff), primary-fixed-dim (#b4c5ff), secondary-fixed (#ffe083), secondary-fixed-dim (#eec200), tertiary-fixed (#dce2f7), tertiary-fixed-dim (#c0c6db) |
| R11 | Font family | display-xl, display-xl-mobile, headline-md, label-sm: Geist. body-lg, body-md, task-item: Inter |
| R12 | Font size | display-xl (36px), display-xl-mobile (24px), headline-md (20px), body-lg (18px), body-md (16px), label-sm (12px), task-item (15px) |
| R13 | Spacing tokens | sidebar-width (288px), detail-panel-width (384px), container-padding (3rem), container-padding-mobile (1rem), gutter-md (1rem), stack-gap (0.25rem) |
| R14 | Border radius | DEFAULT (0.25rem), lg (0.5rem), xl (0.75rem), full (9999px) |
| R15 | Animations | slide-in keyframe (0→-20px opacity 0 → 0px opacity 1, 0.4s cubic-bezier(0.16,1,0.3,1)) |
| R16 | Google Fonts import | Geist (weights 400-800), Inter (weights 400-600), Material Symbols (wght 100-700, FILL 0-1) |
| R17 | Clase glass-panel | background rgba(255,255,255,0.7), backdrop-blur(12px). Dark: background rgba(24,24,27,0.8) |
| R18 | Clase material-symbols-outlined | font-variation-settings: FILL 0, wght 400, GRAD 0, opsz 24 |
| R19 | Clase custom-scrollbar | scrollbar width 4px, track transparent, thumb #e1e3e4 (dark: #27272A) |

## Contratos

No aplica — esta actividad no expone endpoints ni modelos de datos. Los tokens se consumen como clases CSS en componentes React:

```tsx
// Ejemplos de uso esperado
<div className="bg-surface dark:bg-surface-dark">
  <h1 className="font-display-xl text-on-surface">Título</h1>
  <span className="material-symbols-outlined text-primary">star</span>
</div>
```
