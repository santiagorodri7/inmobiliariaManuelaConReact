2. Mapa de Rutas Permitidas
Solo migrar las siguientes rutas:
/ e /home (Público)
/nosotros (Público)
/servicios (Público)
/contacto (Público)
/propiedad/:id (Público)
/registro (Público - reemplaza el antiguo login.html)
/login (Público - reemplaza el antiguo profiles.html)
/comprador (Protegido: rol Comprador)
/vendedor (Protegido: rol Vendedor)
/admin y /admin/reportes-ventas (Protegido: rol Admin)
⛔ NO MIGRAR: blog.html, guide.html, single.html, testimonial.html, vandedorr.html, setup.html ni createAdmin.js. Son código legado o duplicado.
3. Arquitectura de Carpetas (src/)
code
Text
src/
  components/
    layout/        Navbar, Footer, Topbar, BackToTop, PageHeader
    property/      PropertyCard, PropertyGrid, PropertySearchForm, PropertyDetail, PropertyForm
    testimonials/  TestimonialGrid, TestimonialForm, StarRating
    admin/         StatCard, UsersTable, DateFilter, SalesFilters, SalesTable
    account/       ProfileSidebar, PersonalInfoForm, PasswordForm, DangerZone
    ui/            Toast, DragDropImage, Preloader, ErrorBoundary
  pages/
  hooks/           useAuth, useProperties, useTestimonials
  services/        firebase.js, authService.js, usersService.js, propertiesService.js, testimonialsService.js
  routes/          ProtectedRoute.jsx
  config/          site.js (teléfono, correos, redes, dirección oficial)
4. Reglas Críticas de Firebase y Seguridad
A. Inicialización
services/firebase.js inicializa Firebase una sola vez usando variables de entorno VITE_FIREBASE_*.
Prohibido llamar getAuth() o initializeApp() en otros archivos.
B. Colección usuarios (Doc ID = uid)
Campos: nombre, cedula, fechaNacimiento (YYYY-MM-DD), email, rol ('Comprador' | 'Vendedor' | 'Admin'), activo (boolean), fechaRegistro (YYYY-MM-DD o Timestamp), telefono, direccion, avatar.
El registro público solo permite roles Comprador y Vendedor. Admin solo se asigna manualmente.
fechaRegistro es obligatoria al registrar.
C. Colección propiedades (Doc ID = prop_<timestamp>_<random>)
Nombres de campos solo en inglés: id, ownerId, title, location, price (number), type, description, imageUrl, imageBase64, createdAt, updatedAt, fechaRegistro.
Prohibido alternar entre español e inglés (p.title || p.titulo queda eliminado).
Operación normalizada: 'venta' | 'renta'.
Validar coherencia: precio positivo y razonable, terrenos sin habitaciones.
D. Colección testimonios (Esquema único)
Esquema: { nombre, profesion, texto, rating (1-5), estado: 'activo', fechaCreacion, userId }.
E. Autenticación y Flujos
Login: Primero signInWithEmailAndPassword(), luego consultar documento del usuario en Firestore. Si activo === false, ejecutar signOut() y bloquear acceso. Nunca consultar por email antes de autenticar.
Eliminar Cuenta: Reautenticar primero -> deleteUser(auth.currentUser) -> borrar documento en Firestore.
Contraseñas: Longitud mínima de 8 caracteres tanto en registro como en cambio de contraseña.
Estado global: Todo se maneja a través de un único AuthContext y hook useAuth().
5. Prevención de Defectos Críticos (Lista Negra)
El agente NUNCA debe reintroducir los siguientes errores del código legado:
❌ Nada de credenciales en código: Cero emails o contraseñas hardcodeadas.
❌ Sin XSS: Prohibido usar dangerouslySetInnerHTML o manipular el DOM con innerHTML.
❌ Sin jQuery ni plugins viejos: No usar $, owl carousel ni tempusdominus.
❌ Sin doble submit: Un único onSubmit en formularios de publicación o contacto con e.preventDefault().
❌ No usar placeholder como valor: Nunca copiar el texto del placeholder al campo si queda vacío.
❌ No usar localStorage para seguridad simulada: Prohibido simular 2FA, passkeys o sesiones activas con arrays falsos en localStorage. Preferencias siempre vinculadas al uid o Firestore.
❌ No duplicar módulos: Un solo componente Navbar, un solo Footer, un solo Toast, un solo StarRating.
❌ Bootstrap 5 moderno: Usar ms-*, me-*, fw-bold, text-end, data-bs-toggle.
code
Code
---

### Paso 3: ¿Cómo probarlo en OpenCode?

1. En OpenCode Desktop, asegúrate de estar dentro del proyecto `inmobiliariaManuelaConReact`.
2. En el chat, escribe `/` y verás que en la lista de comandos sugeridos ya aparece **`/manuela-realtor`**.
3. Ahora puedes pedirle cualquier tarea de migración y la IA sabrá exactamente qué archivos crear, qué nombres de campos usar y qué errores evitar.

#### Ejemplos de prompts listos para usar:

* **Para el servicio de autenticación:**
  > `/manuela-realtor Crea services/authService.js y el AuthContext. Recuerda la regla crítica de verificar primero signInWithEmailAndPassword, validar activo === false y la contraseña mínima de 8 caracteres.`

* **Para el Navbar unificado:**
  > `/manuela-realtor Crea src/components/layout/Navbar.jsx reemplazando los navbars viejos. Debe tener el botón de cuenta dinámico según el rol (Comprador -> /comprador, Vendedor -> /vendedor, Admin -> /admin) usando Bootstrap 5.`

* **Para la tarjeta y grid de propiedades:**
  > `/manuela-realtor Crea PropertyCard.jsx usando el modelo en inglés (price, title, location, type) y el formateador formatCOP en moneda colombiana.`