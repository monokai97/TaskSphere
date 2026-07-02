description = "Refina una Actividad específica dividiéndola en Hitos técnicos basados en la arquitectura de Payload CMS y creando sus carpetas de trabajo."

prompt = """
Actúa como un **Lead Solutions Architect** experto en **Payload CMS 3.0**. Tu misión es refinar la Actividad: "{{args}}" desglosándola en Hitos técnicos atómicos y preparando su estructura física, asegurando la coherencia con el modelo de datos del proyecto.

### PASO 1: Análisis de Contexto Técnico
1. **Identificar la Ruta:** El argumento `{{args}}` es la ruta a la carpeta de la actividad (ej. "2.Persistencia/Actividad 1 Modelado/").
2. **Consultar el Plan Maestro:** Lee `plan.md` en la raíz para validar los objetivos globales.
3. **Mapeo de Payload (Contexto Clave):** Analiza `src/collections/`, `src/payload.config.ts` y archivos en `src/fields/` o `src/hooks/` relacionados con esta actividad.
4. **Localizar el Contexto de Fase:** Lee el archivo `phase_[n]_enrich_phase.md` en la carpeta superior de la fase para entender las dependencias y el impacto en colecciones.
5. **Referencia Técnica:**
   - **Diseño Técnico:** !{cat design.md}
   - **Documentación de Payload:** !{ls "Documenetacion de PayloadCMS"}

### PASO 2: Definición de Hitos (Milestones) con Enfoque en Payload
Basándote en el análisis técnico, identifica de 2 a 4 **Hitos** secuenciales. Cada hito debe representar una unidad mínima de implementación en Payload CMS:
- **Hito de Estructura:** Definición de campos (Fields), grupos, bloques o validaciones en la Colección.
- **Hito de Lógica:** Implementación de Hooks (beforeChange, afterDelete) o Endpoints personalizados.
- **Hito de Seguridad:** Configuración de funciones de Access Control.
- **Hito de Integración:** Sincronización con el frontend o servicios externos.

### PASO 3: Generación del Reporte de Actividad (activity_[n]_enrich.md)
Crea un archivo llamado `activity_[n]_enrich.md` dentro de la carpeta de la actividad (`{{args}}`). El contenido debe incluir:
- **Resumen Técnico:** Objetivo de la actividad y colecciones/archivos de Payload afectados.
- **Desglose de Hitos:** Detalle técnico de cada hito, especificando qué campos, hooks o reglas de acceso se tocarán.
- **Definición de Hecho (DoD):** Cómo verificar que cada hito es correcto (ej. "Campo X aparece en el Admin UI", "Hook Y bloquea la acción Z").
- **Justificación Arquitectónica:** Por qué este desglose minimiza la deuda técnica en el ecosistema de Payload.

### PASO 4: Creación de Estructura de Hitos
Por cada hito identificado, crea una carpeta en la ruta de la actividad siguiendo este formato:
`Hito [N] [Nombre del Hito]/`

**Instrucción técnica:** Utiliza comandos de shell para crear las carpetas dentro de la ruta especificada.
!{mkdir "{{args}}/Hito 1 [Nombre1]" "{{args}}/Hito 2 [Nombre2]" ...}

### PASO 5: Cierre
Confirma que el archivo `activity_[n]_enrich.md` y las carpetas de los hitos están listos. El proyecto queda preparado para que cada hito sea procesado individualmente con el comando `ff_us`.

**REGLA DE ORO:** Un Hito es la unidad mínima de implementación técnica. No generes código; enfócate en la especificación de campos, hooks y lógica de Payload.
"""
