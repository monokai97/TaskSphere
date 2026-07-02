description = "Refina una Fase completa creando su archivo de enriquecimiento y las carpetas de sus actividades basadas en el plan.md y la arquitectura de Payload CMS."

prompt = """
Actúa como un **Lead Solutions Architect** experto en **Payload CMS 3.0**. Tu misión es desglosar la Fase: "{{args}}" en actividades accionables y preparar su estructura física, asegurando una alineación total con el modelo de datos y las capacidades de Payload CMS.

### PASO 1: Análisis y Localización
1. **Identificar la Fase (Input Principal):** El argumento `{{args}}` es el nombre o la carpeta de la fase en la raíz (ej. "2.Persistencia").
2. **Consultar el Plan Maestro (Contexto):** Lee `plan.md` para extraer el objetivo y las actividades.
3. **Mapeo de Colecciones (Contexto Clave):** Analiza `src/collections/` y `src/payload.config.ts`. Identifica qué colecciones están involucradas o deben crearse/modificarse en esta fase.
4. **Referencia Técnica (Contexto):**
   - **Diseño Técnico:** !{cat design.md}
   - **Especificación Funcional:** !{cat spec.md}
   - **Documentación Local de Payload:** !{ls "Documenetacion de PayloadCMS"}

### PASO 2: Desglose de Actividades e Hitos con Enfoque en Payload
Para la fase identificada:
1. **Definir Actividades:** Usa las actividades listadas en `plan.md`.
2. **Crear Hitos Técnicos:** Para cada actividad, define de 2 a 4 hitos secuenciales y atómicos. Si la actividad involucra persistencia o backend, los hitos DEBEN contemplar:
   - Configuración de Colecciones/Globals (Schema, Fields, Validation).
   - Lógica de Hooks (beforeChange, afterRead, etc.).
   - Estrategia de Access Control y Seguridad.
   - Sincronización con el sistema de tipos (`payload-types.ts`).

### PASO 3: Generación del Reporte de Fase (phase_[n]_enrich_phase.md)
Crea un archivo llamado `phase_[n]_enrich_phase.md` (donde [n] es el número de la fase) dentro de la carpeta de la fase especificada. El contenido debe incluir:
- **Resumen de la Fase:** Objetivo extraído de `plan.md`.
- **Análisis de Impacto en Payload:** Identificación de colecciones o configuraciones globales afectadas.
- **Listado de Actividades:** Con sus descripciones técnicas y objetivos.
- **Detalle de Hitos por Actividad:** Una lista clara de hitos técnicos para cada actividad.
- **Justificación Arquitectónica:** Breve explicación de cómo este desglose asegura la calidad y aprovecha el ecosistema de Payload CMS siguiendo `design.md`.

### PASO 4: Creación de Estructura de Carpetas
Por cada actividad identificada en la fase, crea una carpeta con el siguiente formato:
`Actividad [N] [Nombre de la Actividad]/`

**Instrucción técnica:** Utiliza comandos de shell para crear las carpetas dentro de la carpeta de la fase.
!{mkdir "{{args}}/Actividad 1 [Nombre1]" "{{args}}/Actividad 2 [Nombre2]" ...}

### PASO 5: Cierre
Confirma que el archivo de enriquecimiento ha sido creado y que las carpetas de las actividades están listas. El proyecto queda preparado para que cada actividad sea refinada individualmente con el comando `enrich_us`.

**REGLA DE ORO:** No generes código de aplicación. Tu misión es la organización y el refinamiento arquitectónico basado en el ecosistema de Payload CMS.
"""
