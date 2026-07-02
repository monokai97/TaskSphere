# Design: Configurar Tailwind con Ethereal Focus

## Visual Mapping

| Elemento Stitch/HTML | Token Tailwind | Valor |
|---|---|---|
| Fondo panel lateral | `bg-surface-container-low` | #f3f4f5 |
| Fondo canvas principal | `bg-surface` | #f8f9fa |
| Texto principal | `text-on-surface` | #191c1d |
| Texto secundario | `text-on-surface-variant` | #434655 |
| Botón primario | `bg-primary text-on-primary` | #004ac6 / #fff |
| Acento hover | `bg-primary-container` | #2563eb |
| Borde sutil | `border border-subtle-light` | #F3F4F6 |
| Título de stack | `font-display-xl` | Geist 36px |
| Cuerpo de tarea | `font-task-item` | Inter 15px |
| Etiqueta | `font-label-sm` | Geist 12px uppercase |
| Sidebar | `w-sidebar-width` | 288px |
| Panel detalle | `w-detail-panel-width` | 384px |
| Separación entre items | `gap-stack-gap` | 0.25rem |
| Borde redondeado card | `rounded-xl` | 0.75rem |
| Animación panel | `animate-slide-in` | slide-in 0.4s |
| Glass panel | `glass-panel` | backdrop-blur(12px) |
| Icono | `material-symbols-outlined` | variable font |
| Scrollbar | `custom-scrollbar` | 4px thumb |

## Flujo de Uso en Componentes

```mermaid
graph LR
    A[tailwind.config.ts] -->|define tokens| B[Clases utilitarias]
    C[styles.css] -->|@import Google Fonts| D[Geist + Inter + Material Symbols]
    C -->|.glass-panel| B
    C -->|.custom-scrollbar| B
    B -->|bg-surface, text-primary, etc.| E[Componentes React]
    D -->|font-family| E
```

## Código Esperado

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9fa',
        'surface-dim': '#d9dadb',
        'surface-bright': '#f8f9fa',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f5',
        'surface-container': '#edeeef',
        'surface-container-high': '#e7e8e9',
        'surface-container-highest': '#e1e3e4',
        'on-surface': '#191c1d',
        'on-surface-variant': '#434655',
        'inverse-surface': '#2e3132',
        'inverse-on-surface': '#f0f1f2',
        primary: '#004ac6',
        'on-primary': '#ffffff',
        'primary-container': '#2563eb',
        'on-primary-container': '#eeefff',
        'inverse-primary': '#b4c5ff',
        secondary: '#735c00',
        'on-secondary': '#ffffff',
        'secondary-container': '#fed01b',
        'on-secondary-container': '#6f5900',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        outline: '#737686',
        'outline-variant': '#c3c6d7',
        'border-subtle-light': '#F3F4F6',
        'text-secondary-light': '#6B7280',
        'canvas-dark': '#09090B',
        'surface-dark': '#18181B',
        'surface-elevated-dark': '#27272A',
        'text-secondary-dark': '#A1A1AA',
        'border-subtle-dark': 'rgba(39, 39, 42, 0.5)',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5ff',
        'secondary-fixed': '#ffe083',
        'secondary-fixed-dim': '#eec200',
        'tertiary-fixed': '#dce2f7',
        'tertiary-fixed-dim': '#c0c6db',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        'sidebar-width': '288px',
        'detail-panel-width': '384px',
        'container-padding': '3rem',
        'container-padding-mobile': '1rem',
        'gutter-md': '1rem',
        'stack-gap': '0.25rem',
      },
      fontFamily: {
        'display-xl': ['Geist', 'sans-serif'],
        'display-xl-mobile': ['Geist', 'sans-serif'],
        'headline-md': ['Geist', 'sans-serif'],
        'label-sm': ['Geist', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'task-item': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl-mobile': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'task-item': ['15px', { lineHeight: '20px', fontWeight: '400' }],
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

export default config
```

```css
/* src/app/(frontend)/styles.css */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

@import 'tailwindcss';

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dark .glass-panel {
  background: rgba(24, 24, 27, 0.8);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e1e3e4;
  border-radius: 10px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #27272A;
}
```
