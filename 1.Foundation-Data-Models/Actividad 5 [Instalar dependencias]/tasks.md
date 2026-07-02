# Tasks: Instalar dependencias

## Dependencias
- Node.js y pnpm funcionando
- `package.json` accesible en la raíz

---

## Hito 5.1: Instalar TanStack Query

- [ ] Ejecutar `pnpm add @tanstack/react-query`
- [ ] Verificar que el comando termina con código 0

## Hito 5.2: Instalar Iron-Session

- [ ] Ejecutar `pnpm add iron-session`
- [ ] Verificar que el comando termina con código 0

## Hito 5.3: Instalar Zod

- [ ] Ejecutar `pnpm add zod`
- [ ] Verificar que el comando termina con código 0

## Hito 5.4: Verificar instalación

- [ ] Ejecutar `pnpm ls --depth 0` y confirmar que `@tanstack/react-query`, `iron-session`, `zod` aparecen en la lista
- [ ] Abrir `package.json` y verificar que los 3 paquetes están en `dependencies`
- [ ] Ejecutar `pnpm install` para regenerar lockfile (no debe mostrar errores)
- [ ] Ejecutar `npx tsc --noEmit` para verificar que los tipos de los 3 paquetes se resuelven

## Verificación

- [ ] `package.json` contiene:
  ```json
  "dependencies": {
    ...
    "@tanstack/react-query": "^5.x.x",
    "iron-session": "^8.x.x",
    "zod": "^3.x.x"
  }
  ```
- [ ] `pnpm ls --depth 0` muestra los 3 paquetes sin warnings
- [ ] `npx tsc --noEmit` pasa sin errores (los tipos de las librerías se resuelven)
