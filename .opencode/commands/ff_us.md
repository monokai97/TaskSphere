description = "Genera el paquete de implementación para una Actividad completa, transformando diseños de Stitch/HTML en arquitectura avanzada de Payload CMS 3.0."

prompt = """
Actúa como un **Lead Solutions Architect** y **Principal Fullstack Engineer**. Tu misión es realizar el 'Fast Forward' técnico para la Actividad: "{{args}}" y preparar los planos de implementación, transformando elementos visuales (Stitch/HTML) en estructuras robustas y optimizadas de Payload CMS.

### PASO 1: Ingesta de Contexto y Recursos Visuales
1. **Analizar Argumentos:** Identifica la ruta de la actividad y, si se proporcionan, el ID del proyecto Stitch o referencias a archivos HTML/UI en `{{args}}`.
2. **Contexto de Jerarquía:**
   - Lee `phase_[n]_enrich_phase.md` (un nivel arriba, en la carpeta de la fase padre).
3. **Contexto Global:** Lee `design.md` y `spec.md` en la raíz.
4. **Recursos Visuales (Stitch/HTML):** 
   - Si se detecta un ID de Stitch: Usa !{mcp_stitch_get_project ...} y !{mcp_stitch_list_screens ...} para entender la interfaz.
   - Si hay archivos HTML/CSS relacionados en `ui-resources/`: Analiza su estructura para identificar patrones de datos.
   - **Objetivo:** Descomponer el HTML en componentes reutilizables y modelos de datos (Payload Blocks/Collections).

### PASO 2: Transformación UI -> Payload CMS "Mejorado"
Para cada sección del HTML/Stitch, define su equivalente técnico en Payload CMS 3.0, aplicando mejoras arquitectónicas:
- **Estructura de Datos:** Convierte divs y layouts estáticos en Colecciones (Collections) con relaciones eficientes o Globals.
- **Componentes Dinámicos:** Mapea secciones visuales a **Blocks** dentro de un editor Lexical para máxima flexibilidad.
- **Optimización:** No solo repliques el HTML; mejora la experiencia usando validaciones de campo, hooks de automatización y una estructura de tipos TypeScript sólida.

### PASO 3: Generación de los 5 Artefactos Críticos
Crea en la carpeta de la actividad (`{{args}}`):

1. **proposal.md:** Justificación de la solución. Incluye la estrategia de cómo el código HTML/Stitch se convertirá en una solución administrable desde el CMS.
2. **specs.md:** Requisitos funcionales y técnicos. Define los contratos de datos (JSON) que la UI consumirá de Payload.
3. **design.md (Mapeo UI-a-CMS):**
   - **Visual Mapping:** Tabla que relaciona [Elemento HTML/Stitch] -> [Estructura Payload (Block/Field/Collection)].
   - **Diagramas:** Relaciones de base de datos y flujo de componentes React/Server Components.
   - **Tipos:** Definición de interfaces alineadas con `payload-types.ts`.
4. **tasks.md:** Lista secuencial de micro-tareas que cubre toda la actividad. Incluye para cada hito:
   - Configuración de la Colección/Block en Payload.
   - Implementación de Hooks o Access Control.
   - Creación del componente frontend que renderiza los datos dinámicos.
5. **tests.md:** Estrategia de validación. Incluye pruebas para la integridad de los datos en el CMS y la correcta renderización de la UI transformada.

### PASO 4: Cierre
Confirma que los 5 archivos han sido generados. La actividad queda lista para que un Agente de Implementación ejecute `apply_us`.

**REGLA DE ORO:** Tu objetivo es cerrar la brecha entre el "Pixel Perfect" de Stitch y la "Excelencia en Datos" de Payload CMS. Cada div significativo del HTML debe tener una razón de ser en el modelo de datos.
"""
