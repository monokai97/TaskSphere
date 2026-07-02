description = "Transforma la intención de spec.md, *-args.md, las especificaciones de interfaz de Stitch y la persistencia de PayloadCMS en un diseño técnico y arquitectura detallada en design.md."

prompt = """
Actúa como un **Senior Fullstack Solutions Architect**. Tu objetivo es definir las "reglas del juego" técnicas y la arquitectura detallada para un proyecto fullstack, asegurando la integración perfecta entre frontend (Stitch) y backend/datos (PayloadCMS).

### INMERSIÓN EN EL CONTEXTO
Para generar este diseño, debes analizar y sintetizar la información de las siguientes fuentes de verdad:
1. **Especificación Técnica (spec.md):** !{cat spec.md}
2. **Argumentos y Requisitos del Proyecto (*-args.md):** !{cat *-args.md}
3. **Proyecto Stitch (UI/Diseño) (@ui-resources/**):** Analiza `DESIGN.md` y `code.html`.
4. **Infraestructura de Datos (PayloadCMS):** Todo recurso de UI debe tener su contraparte en PayloadCMS.

### PASO 1: Análisis de Contexto y Fullstack Stack
Identifica el stack técnico. Este diseño debe ser **Fullstack**, donde PayloadCMS actúa como la fuente de verdad para el modelo de datos.

### PASO 2: Crítica y Clarificación Estratégica
Realiza una crítica técnica enfocada en la integración:
- ¿Cómo se mapean los componentes de Stitch a las colecciones de PayloadCMS?
- ¿Qué endpoints personalizados o hooks son necesarios?
- ¿Existen cuellos de botella en la sincronización de datos?
- Haz **3 a 5 preguntas clave** sobre compensaciones (trade-offs) de esta arquitectura fullstack.

### PASO 3: Generación del Diseño Técnico (design.md)
Genera **design.md** en la raíz. DEBES seguir esta estructura:

## 1. Decisiones de Arquitectura Fullstack
### A. Patrón de Flujo de Datos y Capas
- Diagrama **Mermaid**: UI (Stitch) <-> API (PayloadCMS) <-> DB.
- Justifica patrones (Repository, Clean Architecture, etc.).

### B. Diseño de Persistencia (PayloadCMS)
- Define las colecciones de PayloadCMS (campos, relaciones, tipos).
- Define endpoints personalizados y hooks de servidor.
- Define políticas de acceso (Access Control) para cada colección.

### C. Sistema de Ordenamiento y Gestión de Datos
- Cómo se integran las colecciones de PayloadCMS con el ordenamiento dinámico de la UI (ej. LexoRank).

## 2. Stack Tecnológico Definido
- Tabla: Tecnología, Versión, Justificación.

## 3. Esquema de Datos y Contratos (Fullstack)
- Define los contratos de datos (interfaces TypeScript generadas por PayloadCMS) que alimentan la estructura de Stitch.

## 4. Estructura de Directorios (Scalable Path)
- Árbol de directorios (Frontend + PayloadCMS backend).

## 5. Sistema de Estilos / Configuración Técnica
- Tokens de Stitch y configuración de middleware/logs de PayloadCMS.

## 6. Guardias para la Implementación (Operational Guidance)
- Reglas para: Inmutabilidad, resolución de conflictos, seguridad en PayloadCMS, optimización de consultas.

### PASO 4: Conclusión
El diseño es el plano ejecutable que elimina la ambigüedad, unificando la lógica de frontend (Stitch) y backend (PayloadCMS).
"""
