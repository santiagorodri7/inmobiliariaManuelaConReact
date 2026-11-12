# Diseño: pruebas para testimonios, formularios, búsqueda, inicio de sesión y filtros

- **Objetivo:** agregar cinco pruebas automatizadas fáciles de entender y coherentes con `src/tests/ImageUploader.test.jsx`.
- **Alcance:** probar el formulario de testimonios, el formulario de contacto, la búsqueda por ubicación, el inicio de sesión y los filtros de propiedades. La búsqueda y los filtros pertenecen al mismo componente, pero tendrán pruebas separadas.
- **Fuera de alcance:** cambiar el funcionamiento o el diseño de la aplicación, probar servicios reales o configurar nuevas herramientas.
- **Enfoque elegido:** pruebas directas de cada componente con React Testing Library y Vitest, simulando acciones de usuario y verificando resultados visibles o llamadas esperadas. Se elige porque coincide con el ejemplo existente y es más sencillo de presentar en clase que los recorridos completos de varias páginas.
- **Decisiones para implementar:** guardar los cinco archivos en `src/tests`; simular servicios y contexto cuando haga falta para que las pruebas no dependan de Firebase, traducciones ni datos externos.
- **Pendiente para quien implemente:** determinar los casos concretos a partir de las funciones que ya ofrecen los componentes y ejecutar las cinco pruebas con Vitest.
