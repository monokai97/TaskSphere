description = "Transforma la arquitectura de design.md, la especificación técnica y los recursos de Stitch/PayloadCMS en un plan.md estratégico y crea la estructura física de carpetas."

prompt = """
Actúa como un **Principal Technical Strategist**. Tu objetivo es desglosar la implementación técnica fullstack y preparar el entorno de trabajo físico.

### PASO 1: Ingesta de Contexto
Analiza profundamente los documentos de referencia:
- **Diseño Técnico:** !{cat design.md}
- **Especificación Funcional:** !{cat spec.md}
- **Requisitos:** !{cat *-args.md}
- **Interfaz (Stitch):** Explora `@ui-resources/**` (Stitch UI structure) para mapear componentes.
- **Persistencia (PayloadCMS):** Analiza las colecciones y esquemas definidos en el diseño técnico.

### PASO 2: Definición de la Hoja de Ruta (plan.md)
Crea el archivo **plan.md** en la raíz. DEBES seguir estrictamente esta estructura:

# Strategic Roadmap: [Nombre del Sistema]

## 1. Modelo de Datos (Colecciones PayloadCMS)
- Lista de colecciones de PayloadCMS necesarias y su propósito.

## 2. Fases de Implementación (Fullstack: Stitch + PayloadCMS)
## Fase [N]: [Nombre de la Fase]
- **Objetivo:** [Descripción técnica].
- **Mapeo:** [UI Componentes (Stitch) <-> Colecciones/Endpoints (PayloadCMS)].
- **Actividades Detalladas:**
    1. **[Actividad 1]**: [Descripción técnica].
    2. **[Actividad 2]**: [Descripción técnica].
- **Entregables:** [Items].

... (Repetir para todas las fases)

### PASO 3: Creación de Estructura Física
Crea una carpeta en la raíz por cada fase planificada siguiendo la nomenclatura: `[N].[NombreFase]/`.
!{mkdir "1.[NombreFase1]" "2.[NombreFase2]" ...}

### REGLAS DE ORO:
1. **Fullstack Alignment:** Todo componente de UI (Stitch) DEBE estar planificado junto con su contraparte de datos (Colección PayloadCMS).
2. **Atomic Phases:** Divide el trabajo en fases lógicas (ej. Backend & Models, UI Shell, Integración de Colecciones, UX Avanzada).
3. **Persistencia del Diseño:** El archivo `design.md` es la referencia de arquitectura; el plan es su ejecución física.
4. **No Generes Código:** Solo estrategia y estructura de directorios.

### PASO 4: Conclusión
Confirma la creación del archivo **plan.md** y de la estructura de carpetas. El proyecto está listo para iniciar la implementación de colecciones y componentes.
"""
