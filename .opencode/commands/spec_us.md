description = "Genera una especificación técnica (spec.md) fusionando los requisitos funcionales (*-args.md) con el sistema de diseño de Stitch y la infraestructura de PayloadCMS."

prompt = """
Actúa como un **Senior Fullstack Software Architect y UX Strategist**. Tu objetivo es transformar los requisitos del proyecto, el diseño visual de Stitch y la arquitectura de datos de PayloadCMS en una especificación técnica formal (spec.md) de alta fidelidad.

### INMERSIÓN EN EL CONTEXTO
Para generar esta especificación, utilizarás tres fuentes principales de verdad:
1. **Requisitos Funcionales:** !{cat *-args.md}
2. **Contexto de Diseño (Stitch):**
   - **Project ID:** $1
   - **Recursos Locales:** Analiza `@ui-resources/**` (`DESIGN.md` para tokens, `code.html` para estructura).
3. **Persistencia (PayloadCMS):** Toda entidad de UI o funcionalidad debe estar mapeada a una **Colección de PayloadCMS**.

### ANÁLISIS ESTRATÉGICO OBLIGATORIO:
Antes de redactar, debes:
- **Mapeo Fullstack:** Para cada funcionalidad, define:
    - La colección de PayloadCMS que servirá de persistencia.
    - Los campos necesarios en dicha colección.
    - Los endpoints personalizados (si aplican) para satisfacer las necesidades de la UI.
- **Análisis de Diseño:** Extrae tokens (colores, tipografía) de `@ui-resources/**` y asígnalos a la especificación de componentes.
- **Validación:** Si hay discrepancias entre los requisitos, la UI o la viabilidad en PayloadCMS, levanta una bandera con una nota técnica.

### ESTRUCTURA REFORZADA DEL DOCUMENTO (spec.md):
Genera o actualiza **spec.md** siguiendo estrictamente esta estructura:

1. **Visión, Objetivos y Atributos de Marca:**
   - Define métricas de éxito e identidad visual basada en Stitch.

2. **Modelo de Datos (PayloadCMS):**
   - Define las colecciones de PayloadCMS necesarias.
   - Detalla campos, tipos (text, relationship, select, etc.) y validaciones (hooks, access control).

3. **Mapeo Funcional (Historias de Usuario + Payload):**
   - Módulo: [Nombre]
   - Historia de Usuario: [Descripción]
   - Pantalla (Stitch): [Referencia]
   - Colección Payload: [Nombre de la colección]
   - Endpoints/Hooks: [Acciones necesarias en PayloadCMS]

4. **Arquitectura y Flujos:**
   - Diagrama Mermaid mostrando: UI -> API (PayloadCMS) -> DB.

5. **Criterios de Aceptación (Gherkin):**
   - Escenarios que incluyan validación de datos en PayloadCMS (ej. "Cuando el usuario guarda la tarea, se actualiza el campo 'status' en la colección 'Tasks'").

6. **Sistema de Estilos y Contratos:**
   - Mapeo de tokens de diseño a variables CSS.
   - Contratos de datos (interfaces TypeScript generadas por Payload).

### REGLAS DE COMPORTAMIENTO:
- **Payload-First:** Ninguna funcionalidad debe especificarse sin identificar primero su fuente de datos en PayloadCMS.
- **Clarificación Proactiva:** Si un requisito no puede mapearse claramente a una colección o es ambiguo, detén la generación y lanza 3-5 preguntas al usuario.

**Salida:** Sobreescribe el archivo **spec.md** en la raíz. Debe ser un plano ejecutable, fusionando frontend y backend de manera cohesiva.
"""
