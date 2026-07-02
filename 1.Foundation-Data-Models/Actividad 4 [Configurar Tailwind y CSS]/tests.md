# Tests: Configurar Tailwind con Ethereal Focus

## Estrategia

Actividad de configuración de estilos — tests visuales y de compilación principalmente.

## Test Suite

### 1. Instalación de dependencias

```bash
pnpm ls tailwindcss
```
- **Criterio:** `tailwindcss`, `@tailwindcss/postcss`, `postcss` aparecen en la lista
- **Verifica:** Paquetes instalados correctamente

### 2. Compilación del servidor

```bash
pnpm dev
```
- **Criterio:** Servidor inicia sin errores relacionados con Tailwind o CSS
- **Verifica:** El `@import 'tailwindcss'` en styles.css es procesado correctamente

### 3. Test visual de tokens (manual)

Crear un componente temporal para verificar tokens:

```tsx
// src/app/(frontend)/test-tokens/page.tsx (temporal)
export default function TestTokens() {
  return (
    <div className="bg-surface dark:bg-surface-dark p-8 min-h-screen">
      <h1 className="font-display-xl text-on-surface">
        Display XL Title
      </h1>
      <p className="font-body-md text-on-surface-variant">
        Body medium text with variant color
      </p>
      <button className="bg-primary text-on-primary px-4 py-2 rounded-xl">
        Primary Button
      </button>
      <div className="glass-panel p-4 rounded-lg mt-4">
        Glass panel content
      </div>
      <span className="material-symbols-outlined text-primary">star</span>
      <div className="custom-scrollbar overflow-auto h-20 mt-4 border border-subtle-light dark:border-subtle-dark">
        <div className="h-40">Scrollable content</div>
      </div>
    </div>
  )
}
```

| Verificación | Clase/Token | Resultado esperado |
|---|---|---|
| Fondo light | `bg-surface` | #f8f9fa |
| Fondo dark | `dark:bg-surface-dark` | #18181B |
| Título | `font-display-xl` | Geist 36px bold |
| Botón primario | `bg-primary text-on-primary` | #004ac6 / #fff |
| Glass panel light | `glass-panel` | backdrop-blur visible |
| Glass panel dark | `.dark .glass-panel` | fondo rgba(24,24,27,0.8) |
| Icono | `material-symbols-outlined` | icono renderizado |
| Scrollbar | `custom-scrollbar` | scrollbar 4px |

Eliminar `src/app/(frontend)/test-tokens/` después de verificar.

### 4. Dark mode toggle test

- [ ] Agregar clase `dark` a `<html>` en DevTools
- [ ] Verificar que `dark:bg-surface-dark` y otras variantes oscuras se activan
- [ ] Quitar clase `dark` — volver a colores light

### 5. Animación test

- [ ] Agregar `animate-slide-in` a un div temporal
- [ ] Verificar en DevTools > Animations que la animación se ejecuta (0.4s ease)
