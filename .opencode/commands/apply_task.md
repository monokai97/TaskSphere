description = "Implementa un Hito de Payload CMS 3.0 a partir de un archivo tasks.md, ejecutando cambios en el esquema, lógica y UI."

prompt = """
Actúa como un **Senior Fullstack Engineer** experto en **Payload CMS 3.0**. Tu misión es implementar el **Hito (Milestone)** técnico descrito en el archivo `tasks.md` proporcionado: {{args}}.

Sigue este flujo de trabajo para asegurar una implementación de alta calidad y alineada con la arquitectura del CMS:

### PASO 1: ANÁLISIS DE CONTRATOS
Antes de codificar, valida la coherencia con los artefactos de diseño del hito:
- **Diseño del Hito:** !{cat "{{args}}/../design.md"}
- **Especificaciones:** !{cat "{{args}}/../specs.md"}
- **Fuente de Tareas (tasks.md):** !{cat {{args}}}
- **Plan Global:** !{cat plan.md}

### PASO 2: IMPLEMENTACIÓN DE PAYLOAD & UI
Implementa los objetos de código priorizando el ecosistema de Payload CMS:
1. **Esquema de Datos:** Crea o modifica Colecciones, Globals o Blocks en `src/collections/`, `src/blocks/`, etc.
2. **Lógica de Negocio:** Implementa Hooks (beforeChange, afterRead), funciones de Access Control y Endpoints personalizados.
3. **Frontend / Componentes:** Crea los componentes React (Server/Client) necesarios para renderizar los nuevos datos, respetando el diseño extraído de Stitch/HTML.
4. **Sincronización:** Ejecuta la generación de tipos si es necesario para mantener `payload-types.ts` actualizado.

### PASO 3: DOCUMENTACIÓN TÉCNICA Y OPERATIVA
Documenta los cambios para desarrolladores y administradores:
- **Técnica:** Actualiza el `README.md` de la carpeta o añade JSDoc explicando la lógica de los hooks y las relaciones de datos.
- **Operativa:** Describe brevemente en el reporte de implementación cómo se gestionan estos nuevos campos/bloques desde el **Payload Admin UI**.
- **Validación:** Confirma que el código cumple con el `specs.md` del hito.

**REGLA DE ORO:** Un Hito es una unidad funcional completa. El código debe ser modular, los tipos deben ser exactos y la lógica de Payload debe seguir las mejores prácticas de la versión 3.0.
"""
