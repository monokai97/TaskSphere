# Tests: Instalar dependencias

## Estrategia

Actividad de instalación de paquetes — tests de verificación de dependencias y compilación.

## Test Suite

### 1. Verificar instalación

```bash
pnpm ls --depth 0
```
- **Criterio:** Los 3 paquetes aparecen en la lista
- **Verifica:** `@tanstack/react-query`, `iron-session`, `zod` están instalados

### 2. Verificar package.json

```bash
node -e "const pkg = require('./package.json'); ['@tanstack/react-query','iron-session','zod'].forEach(d => { if (!pkg.dependencies[d]) { console.error('Missing:', d); process.exit(1) } else { console.log('OK:', d, pkg.dependencies[d]) } })"
```
- **Criterio:** Los 3 paquetes están en `dependencies` con versiones

### 3. TypeScript compilation

```bash
npx tsc --noEmit
```
- **Criterio:** 0 errores
- **Verifica:** Los tipos de las 3 librerías se resuelven correctamente

### 4. Import test (resolución de módulos)

Crear `src/_import-test.ts`:
```typescript
import { QueryClient } from '@tanstack/react-query'
import { getIronSession } from 'iron-session'
import { z } from 'zod'

const qc = new QueryClient()
const schema = z.object({ ok: z.boolean() })
console.log('All imports resolve OK', qc, getIronSession, schema)
```

Ejecutar:
```bash
npx tsx src/_import-test.ts
```
- **Criterio:** Imprime "All imports resolve OK" sin errores
- Eliminar `src/_import-test.ts` después

### 5. Reinstalación limpia (opcional)

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm ls --depth 0 | Select-String -Pattern "@tanstack/react-query|iron-session|zod"
```
- **Criterio:** Los 3 paquetes se instalan desde cero sin errores (verifica lockfile integrity)
