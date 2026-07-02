description = "Transforma un diseño HTML (de ui-resources/) en una página funcional de PayloadCMS/Next.js siguiendo los patrones existentes del proyecto, creando el plan.md estratégico y la estructura física de carpetas."

prompt = """
Actúa como un **Principal Technical Strategist**. Tu objetivo es desglosar la implementación técnica fullstack de una página de UI y preparar el entorno de trabajo físico.

### PASO 1: Ingesta de Contexto
Analiza profundamente los documentos de referencia:
- **Diseño UI (HTML):** !{cat "@ui-resources/[ID]/code.html"} (reemplazar [ID] con la carpeta del recurso)
- **Página existente similar (referencia de patrón):** Escoge una página existente del mismo módulo (settings, stacks, etc.) para entender el patrón de componentes, tokens de diseño y estructura.
- **Configuración de layout:** !{cat "src/app/(frontend)/[modulo]/layout.tsx"} (si aplica)
- **Sidebar/Navegación:** !{cat "src/components/[sidebar-component].tsx"} (para mapear rutas)
- **AGENTS.md:** !{cat "AGENTS.md"}

### PASO 2: Definición de la Hoja de Ruta (plan.md)
Crea el archivo **plan.md** en la raíz. DEBES seguir estrictamente esta estructura:

# Plan: [Nombre de la Página]

## 1. Diseño UI (Mapeo de Componentes)
- Header (breadcrumb, título, descripción)
- Secciones principales del formulario/configuración
- Componentes interactivos (toggles, selects, radios, botones)
- Panel lateral/detalle (si aplica)
- Micro-interacciones (efectos hover, transiciones, live preview)

## 2. Actividades Detalladas
1. **Crear directorio:** `src/app/(frontend)/[ruta-completa]/`
2. **Crear page.tsx** con 'use client' cuando tenga estado, o estático si es solo presentacional
3. **Mapeo exacto del HTML:**
   - Traducir cada sección del HTML a JSX usando los tokens de diseño del proyecto (font-display-xl, surface-container-lowest, on-surface-variant, border-border-subtle-light, etc.)
   - Reemplazar los estilos inline del HTML por clases Tailwind del proyecto
   - Los toggles deben usar `sr-only peer` + `peer-checked:bg-primary`
   - Los selects deben usar `appearance-none` + ícono `expand_more`
   - Las tarjetas seleccionables deben usar `border-primary bg-primary/5` con `check_circle` relleno

### PASO 3: Creación de Estructura Física
!{mkdir "src/app/(frontend)/[ruta-completa]"}

### REGLAS DE ORO:
1. **Tokens del proyecto:** Usa SIEMPRE los tokens de diseño del proyecto, nunca valores hardcodeados del HTML
2. **Grid pattern:** Sigue el patrón `lg:grid-cols-12` con `lg:col-span-7` + `lg:col-span-5` para páginas con panel lateral
3. **Layout aware:** El componente se renderiza dentro del layout existente (Sidebar + SettingsSidebar), no incluyas esos elementos
4. **Micro-interacciones:** Implementa efectos hover, transiciones y live preview con useState/useEffect/useRef cuando el HTML los incluya
5. **Sin comentarios:** No añadas comentarios en el código JSX
6. **Agnóstico:** Este comando funciona para cualquier página, solo cambia la ruta y el recurso HTML de entrada

### PASO 4: Conclusión
Confirma la creación del archivo **plan.md** y de la estructura de carpetas. El proyecto está listo para iniciar la implementación de componentes.
"""
