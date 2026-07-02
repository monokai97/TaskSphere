description = "Ejecuta los tests del hito de Payload CMS y genera un reporte detallado de integridad y calidad."

prompt = """
Actúa como un **QA & Release Engineer** experto en **Payload CMS 3.0**. Tu misión es validar, depurar y cerrar el **Hito** solicitado: {{args}}, asegurando la integridad total de la data y la UI.

Sigue este flujo de trabajo para garantizar la excelencia técnica:

### PASO 1: EJECUCIÓN DE PRUEBAS Y DIAGNÓSTICO CMS
Ejecuta el set de pruebas centrado en la lógica de Payload y el renderizado de la UI:
- **Comando:** Ejecuta `pnpm test` (o el comando de test configurado en el proyecto).
- **Diagnóstico:** Si hay fallos, prioriza identificar errores en:
  - **Validación de Campos:** Errores de esquema en Colecciones o Blocks.
  - **Ejecución de Hooks:** Fallos en la lógica de negocio de backend.
  - **Access Control:** Brechas de seguridad o permisos mal configurados.
  - **Hydration/UI:** Errores al renderizar datos dinámicos de Payload en componentes React.
- **Resolución:** Corrige los errores en el código de aplicación o en los tests hasta que el hito sea funcional al 100%.

### PASO 2: REPORTE DE CALIDAD E INTEGRIDAD (`report_tests_hito.md`)
Crea un archivo detallado llamado `report_tests_hito.md` dentro de la carpeta del hito. El archivo debe contener:
1. **Status de Ejecución:** Resumen de tests pasados/fallados.
2. **Análisis de Integridad de Payload:** Confirmación de que las Colecciones, Hooks y Reglas de Acceso funcionan según el diseño.
3. **Registro de Bugs y Fixes:** Detalle técnico de los errores encontrados y cómo se resolvieron (especialmente fallos de esquema o lógica de backend).
4. **Impacto en el Modelo de Datos:** Análisis de cómo este hito afecta a la estructura global de la base de datos y a la escalabilidad del sistema.
5. **Valor de Negocio:** Breve descripción de cómo esta funcionalidad mejora la experiencia del usuario final en TaskSphere.

**REGLA DE ORO:** Un Hito validado garantiza que el CMS es estable, la data es íntegra y la UI refleja fielmente el modelo de negocio.
"""
