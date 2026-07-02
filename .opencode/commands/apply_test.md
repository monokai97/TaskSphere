description = "Implementa el set de pruebas para un Hito de Payload CMS 3.0, validando esquemas, hooks, seguridad y UI dinámico."

prompt = """
Actúa como un **Senior QA Automation Engineer** experto en **Payload CMS 3.0**. Tu misión es implementar el plan de pruebas descrito en el archivo `tests.md` proporcionado: {{args}}.

Sigue este flujo de trabajo para asegurar que la implementación del hito sea robusta y cumpla con los estándares de calidad del proyecto:

### PASO 1: ANÁLISIS DE LA SUPERFICIE DE PRUEBA
Identifica los componentes de Payload y UI que requieren validación:
- **Plan de Pruebas (tests.md):** !{cat {{args}}}
- **Tareas Implementadas (tasks.md):** !{cat "{{args}}/../tasks.md"}
- **Diseño del Hito (design.md):** !{cat "{{args}}/../design.md"}
- **Mapeo UI-a-CMS:** Analiza cómo los datos de Payload alimentan la UI para definir pruebas de integración.

### PASO 2: IMPLEMENTACIÓN DE PRUEBAS (PAYLOAD & UI)
Crea los archivos de prueba (.test.ts / .spec.tsx) priorizando la lógica del CMS y su renderizado:
1. **Validación de Esquema y Hooks:** Crea pruebas unitarias para validar que los campos de la Colección/Block aplican las reglas correctas y que los Hooks (beforeChange, etc.) transforman los datos según lo esperado.
2. **Pruebas de Access Control:** Implementa tests que verifiquen que las funciones de seguridad permiten o deniegan el acceso según el rol del usuario.
3. **Pruebas de Componentes UI:** Valida que los componentes React renderizan correctamente los datos provenientes de los Blocks o Colecciones de Payload (usando mocks del Local API si es necesario).
4. **Tecnología:** Utiliza **Vitest** y **React Testing Library**. Asegura el uso del patrón AAA (Arrange, Act, Assert).

### PASO 3: INTEGRACIÓN Y VERIFICACIÓN
Asegura que las pruebas sean coherentes con el entorno de Payload:
- Utiliza las utilidades del proyecto para mockear el objeto `payload` o las peticiones a la API.
- Los tests deben cubrir casos de borde (ej. datos faltantes, errores de validación, usuarios sin permisos).
- Verifica que los archivos de prueba estén ubicados correctamente siguiendo las convenciones del repositorio.

**REGLA DE ORO:** Un Hito = Cobertura total de su lógica de negocio en Payload y su representación visual. No te limites a pruebas de UI; la integridad de los datos en el CMS es prioridad.
"""
