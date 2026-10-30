---
description: Reglas de arquitectura, componentes y Firebase para la plataforma inmobiliaria en React (Manuela Bermudez Realtor), con defectos detectados y su corrección
---

# Plataforma Inmobiliaria — Manuela Bermudez Realtor

Migración del sitio multipágina (HTML/CSS/JS + Bootstrap + Firebase) a React. Este documento fija las reglas del proyecto y deja registrado cada defecto encontrado en los HTML y JS con su corrección.

**Archivos revisados:** todos los HTML, `auth.js`, `props.js`, `seller.js`, `buyer.js`, `buyer-auth.js`, `contact.js`, `service.js`, `testimonios.js`, `homeTestimonials.js`, `property-details.js`, `vandedorr.js`, `login.js`, `main.js`, `createAdmin.js`.
**Archivos que faltan** (no se pudo verificar su lógica): `home.js`, `heroFrames.js`, `admin.js`, `reporteVentas.js`, `profiles.js`, `about.js` y todos los `.css`. Lo que dependa de ellos queda marcado **(por confirmar)**m ademas que faltan otros archivos js por revisar.

## Equipo

- Product Owner: Andrés Felipe Orozco
- Full stack: Santiago Rodriguez
- FrontEnd:  Weimar Tuberquia

## Stack

- React + React Router, un archivo de página por ruta
- Bootstrap 5 (una sola versión) + Font Awesome 5 + Lucide
- Firebase 10.8.x con el paquete npm `firebase` (no imports por CDN): Authentication y Firestore
- Moneda COP, formato con `Intl.NumberFormat('es-CO')`; `lang="es"` en toda la app

## Mapa de páginas a rutas

| HTML actual | Ruta React | Acceso |
|---|---|---|
| index.html | `/` | Público |
| home.html | `/home` | Público |
| about.html | `/nosotros` | Público |
| service.html | `/servicios` | Público |
| contact.html | `/contacto` | Público |
| property-details.html?id=N | `/propiedad/:id` | Público |
| login.html (es el registro) | `/registro` | Público |
| profiles.html (es el login) | `/login` | Público |
| buyer.html | `/comprador` | Comprador |
| seller.html | `/vendedor` | Vendedor |
| admin.html | `/admin` | Admin |
| reporteVentas.html | `/admin/reportes-ventas` | Admin |

No migrar: `blog.html`, `guide.html`, `single.html`, `testimonial.html` (restos de la plantilla "TRAVELER" con lorem ipsum y enlaces rotos), `vandedorr.html`/`vandedorr.js` (duplica el flujo de `seller.html`), `setup.html` y `createAdmin.js`.

## Estructura de carpetas

```
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
  config/          site.js (teléfono, correos, redes, dirección)
  styles/
  assets/img/
```

## Reglas de componentes

- **Navbar único.** Logo + marca, Inicio / Servicios / Nosotros / Contacto y un solo botón de cuenta. Hoy `home.html` muestra a la vez "Inicia sesión" y "Panel Admin". El botón cambia según el estado: sin sesión → "Inicia sesión"; con sesión → "Mi cuenta" hacia el panel del rol (`Comprador` → `/comprador`, `Vendedor` → `/vendedor`, `Admin` → `/admin`). "Panel Admin" solo se renderiza para `Admin`.
- **Footer único.** Reemplaza las ~12 copias. Datos de contacto y redes desde `config/site.js`.
- **PropertyCard.** Precio, título, ubicación, especificaciones y enlace a `/propiedad/:id`. Los terrenos muestran "Lote" y m². Texto `alt` descriptivo (título de la propiedad), no "Propiedad".
- **PropertySearchForm.** Filtra en estado de React; sin jQuery ni `d-none` manual. Mensaje con el conteo de resultados.
- **Testimonios.** Un solo componente de lista y un solo formulario, usado en `/servicios` y en `/home`.
- **Toast.** Un componente único (reemplaza `window.mostrarToast`, `mostrarToast` de buyer.js y el `alert()` como respaldo).
- **Estados obligatorios** en toda lista o tabla: cargando, vacío y error.

## Reglas generales de React

1. Componentes funcionales con hooks, un componente por archivo, PascalCase.
2. Nada de `innerHTML` con datos del usuario. React escapa por defecto; no usar `dangerouslySetInnerHTML`.
3. Sin jQuery, owl carousel ni tempusdominus.
4. `ProtectedRoute` lee el rol desde Firestore y redirige si no corresponde.
5. Un solo estado de sesión (`AuthContext`), no un `onAuthStateChanged` por página.

## Firebase

### Inicialización

- `services/firebase.js` inicializa la app **una vez** y exporta `auth` y `db`. `testimonios.js` llama a `getAuth()` sin app y `createAdmin.js` re-inicializa con otra configuración: eliminar ambos patrones.
- La configuración va en variables de entorno (`VITE_FIREBASE_*`). La `apiKey` de Firebase web no es secreta, pero solo es segura si las reglas de Firestore están bien escritas.
- Hoy no hay Storage activado: las imágenes van en Base64 dentro del documento (límite 1 MB). Regla: activar Storage, subir allí la imagen y guardar solo `imageUrl`. Hasta entonces, comprimir (ya se hace a 800 px, calidad 0.7) y rechazar lo que supere ~700 KB.

### Colección `usuarios` (ID = uid de Auth)

| Campo | Tipo | Nota |
|---|---|---|
| nombre, cedula | string | |
| fechaNacimiento | string `YYYY-MM-DD` | |
| email | string | |
| rol | `Comprador` \| `Vendedor` \| `Admin` | el registro público solo permite los dos primeros |
| activo | boolean | `true` al registrar |
| fechaRegistro | string `YYYY-MM-DD` | **faltaba al registrar** (ver defectos) |
| telefono, direccion, avatar | string | opcionales; avatar en Base64 hoy |

### Colección `propiedades` (ID `prop_<timestamp>_<random>`)

`id, ownerId, title, location, price (number), type, description, imageUrl, imageBase64, createdAt, updatedAt, fechaRegistro`. Los campos del HTML están en español (`titulo`, `ubicacion`) pero el modelo guardado está en inglés; en React usar **solo** los nombres en inglés del modelo y eliminar los `p.title || p.titulo`.

### Colección `testimonios` (dos esquemas distintos hoy)

- `service.js`/`testimonios.js` guarda `{ nombre, texto, rating, fecha, userId, email }`.
- `homeTestimonials.js` guarda `{ nombre, profesion, calificacion, texto, estado, fecha_creacion, fecha_actualizacion }`.

Regla: un único esquema. Propuesto: `{ nombre, profesion?, texto, rating (1–5), estado: 'activo', fechaCreacion: serverTimestamp(), userId|null }`. Migrar o normalizar lo existente, porque `orderBy('fecha')` omite los documentos que no tienen ese campo y `where('estado','==','activo') + orderBy('fecha_creacion')` exige un índice compuesto.

### Reglas de Firestore (base obligatoria)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function rol() { return get(/databases/$(db)/documents/usuarios/$(request.auth.uid)).data.rol; }
    function isAdmin() { return signedIn() && rol() == 'Admin'; }

    match /usuarios/{uid} {
      allow create: if signedIn() && request.auth.uid == uid
        && request.resource.data.rol in ['Comprador','Vendedor']
        && request.resource.data.activo == true;
      allow read: if signedIn() && (request.auth.uid == uid || isAdmin());
      allow update: if signedIn() && (isAdmin() ||
        (request.auth.uid == uid &&
         !request.resource.data.diff(resource.data).affectedKeys().hasAny(['rol','activo','email'])));
      allow delete: if signedIn() && (isAdmin() || request.auth.uid == uid);
    }

    match /propiedades/{id} {
      allow read: if true;
      allow create: if signedIn() && rol() == 'Vendedor'
        && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if signedIn() && (resource.data.ownerId == request.auth.uid || isAdmin());
    }

    match /testimonios/{id} {
      allow read: if true;
      allow create: if request.resource.data.nombre.size() >= 2
        && request.resource.data.texto.size() >= 20
        && request.resource.data.rating is int
        && request.resource.data.rating >= 1 && request.resource.data.rating <= 5;
      allow update, delete: if isAdmin();
    }
  }
}
```

### Autenticación

- Registro: `createUserWithEmailAndPassword` + `setDoc` del documento en `usuarios`. Contraseña mínima: **8 caracteres** en registro y en cambio de contraseña (hoy el registro dice 6 y `buyer.js` exige 8).
- Login: primero `signInWithEmailAndPassword`, después leer el propio documento; si `activo === false`, `signOut` y mostrar "Cuenta desactivada". No consultar `usuarios` por email antes de autenticar (ver defectos).
- Cambio de contraseña: reautenticar (`reauthenticateWithCredential`) y luego `updatePassword`.
- Eliminar cuenta: reautenticar, **primero** `deleteUser` y **después** borrar el documento (ver defectos).
- Un usuario desactivado no debe poder seguir operando: las reglas deben comprobar `activo` además del rol.
- El rol `Admin` se crea solo desde la consola de Firebase o un script local fuera del repo.

## Defectos detectados y corrección

### Críticos (rompen funcionalidad o seguridad)

| # | Archivo | Defecto | Corrección |
|---|---|---|---|
| 1 | `createAdmin.js`, `setup.html` | Correo y contraseña del administrador escritos en el código. Aunque estén comentados, quedan en el repositorio y en su historial. | Cambiar esa contraseña ya, borrar ambos archivos, limpiar el historial de git y crear el admin desde la consola de Firebase. |
| 2 | `homeTestimonials.js` | Todo el archivo está escrito dos veces. Las `const` repetidas (`formatDate`, `renderTestimonials`, etc.) provocan un `SyntaxError` y el módulo no carga. La segunda mitad además usa variables nunca declaradas (`stars`, `testimonialList`, ...). | Quedarse con una sola versión; en React se reemplaza por `TestimonialGrid` + `useTestimonials`. |
| 3 | `main.js` | Termina en `})(jQuery);` después de `$(document).ready(function(){...})`, lo que intenta invocar el resultado de `ready` y lanza error. Además `index.html` lo carga sin cargar jQuery. | En React no aplica; el scroll suave y el cambio de navbar al hacer scroll pasan a un hook `useScrolled` y `scroll-behavior: smooth`. |
| 4 | `buyer.js` | En el evento `blur`, si un campo queda vacío se rellena con su `placeholder` y luego se guarda como valor real. | Eliminar ese comportamiento; usar `placeholder` solo como placeholder y validar con campos controlados. |
| 5 | `seller.js` | `publicarPropiedad()` se dispara dos veces: el botón de envío tiene un `click` y el formulario un `submit`, y el `click` no hace `preventDefault`, por lo que se publica la propiedad duplicada. | Un único `onSubmit` en el formulario. |
| 6 | `auth.js` (`iniciarSesion`) | Consulta `usuarios` por correo antes de autenticar. Eso obliga a dejar la lectura pública de toda la colección (nombres, cédulas, correos). | Autenticar primero y leer el propio documento. |
| 7 | `auth.js` (`eliminarCuentaUsuario`) | Borra el documento y después `deleteUser`; si Firebase pide reautenticación, el documento ya se perdió y la cuenta sigue viva. | Reautenticar, borrar el usuario de Auth y luego el documento. |
| 8 | `auth.js` (`eliminarUsuario`, usado por admin) | Borra solo el documento de Firestore, el usuario sigue existiendo en Auth. | Desactivar (`activo: false`) en lugar de borrar, o usar una Cloud Function con Admin SDK para borrar de Auth. |
| 9 | `auth.js` (`registrarUsuarioCompleto`) | No guarda `fechaRegistro`, pero el filtro por fechas del admin depende de ese campo. | Guardar `fechaRegistro` al registrar (`serverTimestamp()` o `YYYY-MM-DD`). |
| 10 | `buyer-auth.js` | Para usuarios con sesión, `onclick` solo hace `preventDefault`: el botón "Administrar Cuenta" no lleva a ninguna parte. `contact.js`/`service.js` redirigen, pero el `Admin` cae en `profiles.html`. | Un solo helper `rutaPorRol(rol)` que incluya `Admin`. |
| 11 | `buyer.js` + `buyer.html` / `seller.html` | El menú se enlaza a los `.form-card` **por posición**. `buyer.html` tiene 5 ítems de menú y 3 tarjetas, así que "Mis Propiedades Listadas" oculta todo. Además `buyer.js` también se carga en `seller.html` y compite con `seller.js`. | Navegación por ruta o por pestañas con estado (`activeTab`), no por índice. Un script por página. |
| 12 | `buyer.js` | Los datos de los formularios, toggles, rango de presupuesto y avatar se guardan en `localStorage` con claves globales (`formData-0`, `toggle-0`, `rangeValues`). En un computador compartido, un usuario ve los datos de otro. | Guardar preferencias en Firestore dentro del documento del usuario (`preferencias`), o prefijar siempre con el `uid` y limpiar al cerrar sesión. |
| 13 | `buyer.js` (seguridad) | 2FA, biometría, passkeys, cuentas vinculadas y sesiones activas son **simulaciones** con `localStorage` (por ejemplo "Chrome en Windows / Safari en iPhone" inventados). Muestran "Activado" sin proteger nada. | No publicarlas. Quitar de la UI hasta tener implementación real (Firebase MFA, `signInWithPopup`, etc.). Mantener solo cambio de contraseña, descarga de datos y eliminar cuenta. |
| 14 | `props.js` / `seller.js` | "Mis propiedades" se lee de `localStorage`: un vendedor en otro navegador o dispositivo no ve sus propiedades. Las escrituras a Firestore que fallan solo hacen `console.warn` y el usuario ve "éxito". | Fuente única de verdad: Firestore (`where('ownerId','==',uid)`). Propagar los errores al usuario. |
| 15 | `property-details.js` / `home.html` | `home.html` enlaza `?id=1..9` a un arreglo estático dentro del JS, y las propiedades reales tienen id `prop_...`. Los 9 inmuebles no existen en Firestore, así que no se pueden editar ni borrar. | Cargar el catálogo completo desde Firestore; si se necesitan datos iniciales, sembrarlos una vez con un script. |
| 16 | `property-details.js`, `homeTestimonials.js` | Datos del usuario (título, descripción, nombre, texto) se insertan con `innerHTML` sin escapar: XSS almacenado. `seller.js` sí escapa; estos no. | React escapa por defecto. |

### Datos inconsistentes del catálogo

- Precios absurdos: `899,999,990,000`, `999,999,999,999`, `17,999,999,999,999` COP, y un terreno en "Renta" a ese valor "/ mes".
- En home los precios son de venta (`$950,000,000`) pero los filtros usan `data-precio` de renta (`4500000`); el filtro "Hasta $10M" se compara contra un dato distinto al que ve el usuario.
- Nombres distintos entre home y detalle (home: "Terraza del Sol", detalle: "Apartamento Lujo El Poblado"; "Rancho Los Girasoles" vs "Ranchito De Girasoles").
- Tipos que contradicen la descripción: id 3 "Casa Finca" descrita como apartamento; id 6 "Casa Finca" descrita como lote comercial; id 9 "Terreno" con 5 habitaciones; id 4 "Apartamento Residencial" con tipo "Casa".
- Áreas y habitaciones que no coinciden con las características: id 1 `area: 300` vs ficha; id 3 `area: 90` vs "100 m²"; id 5 `bedrooms: 3` vs "Habitaciones: 4"; id 7 `area: 75` vs "125 m²".
- Estado: home muestra "Renta" en 5 de 9 tarjetas y las demás vacías, el detalle dice siempre "En Venta", y el código compara `status === 'Venta'` (el valor real es `'En Venta'`), así que el badge siempre sale azul.
- Moneda con espacio sobrante (`"COP "`).

Regla: un solo modelo `Property` con `operacion: 'venta' | 'renta'`, `tipo`, `habitaciones`, `banos`, `parqueaderos`, `area`, y validación al guardar (precio positivo y razonable, tipo permitido, terrenos sin habitaciones).

### Diseño y accesibilidad

| Defecto | Dónde | Corrección |
|---|---|---|
| `lang="en"` en páginas en español | about, contact, service | `lang="es"` en toda la app (`index.html` de React). |
| Footer con HTML roto (`</i>Inm. Manuela</h3>` sin apertura) | casi todas las páginas | Un componente `Footer` con marcado válido. |
| Navbar `fixed-top` sin compensar la altura | buyer, seller, vandedorr | `padding-top` del `main` igual a la altura del navbar (variable CSS). |
| `buyer.html`: el navbar no cierra `</div></nav>` y hay un `<div class="container py-5">` sin balancear | buyer.html | Se resuelve al componentizar. |
| URL de Google Fonts mal formada (`wght=300;400` en vez de `wght@300;400`) | admin.html, reporteVentas.html | Cargar una sola vez, con `family=Inter:wght@300;400;600;700`. |
| Tres tipografías distintas (Poppins, Inter, Outfit) | páginas públicas, admin, login | Poppins en toda la app (títulos y cuerpo). |
| Dos versiones de Bootstrap | público (4.4.1) y admin (5.3.2) | Bootstrap 5 en todo; reemplazar `ml-*`→`ms-*`, `mr-*`→`me-*`, `data-toggle`→`data-bs-toggle`, `font-weight-bold`→`fw-bold`, `text-right`→`text-end`. |
| Estilos en línea masivos y repetidos | todos | Clases en CSS, variables de color (`--color-primary`, `--color-verde-corporativo`). |
| Hero sin titular (bloque vacío) y badge de estado vacío en tarjetas | home | Titular visible y badge siempre con "Venta" o "Renta". |
| Imágenes con `alt="Propiedad"` o vacío; archivos con espacios (`copacabana  (1).png`) | home, blog | `alt` descriptivo; renombrar a `copacabana.png`. |
| Textos provisionales visibles: "Sabaneta..? / casa de manuela?", "+57 (4) XXX-XXXX", "info@manuela.com" | contact, property-details | Datos reales desde `config/site.js`. |
| Teléfonos y correos distintos entre páginas (+57 300 123 4567 / +57 304 2548683; tres correos) | varias | Un único dato oficial. |
| Formulario "¿Interesado en esta propiedad?" no envía nada | property-details | Guardar en Firestore (`consultas`) con el `propiedadId`, o enlace a WhatsApp con el mensaje prellenado. |
| Formularios de contacto y comprador sin validación visible ni feedback | contact, buyer | Validación con mensajes bajo cada campo y estado de envío. |
| Compartir: botón de WhatsApp en rojo, `gap-2` de Bootstrap 5 en layout de Bootstrap 4 (sin efecto) | property-details | Colores de marca por red; `gap` consistente tras unificar Bootstrap. |
| Enlace de "propiedad no encontrada" a `index.html` | property-details | Volver a `/home#destacadas`. |
| Estadísticas del admin fijas (24, 142, 3,840) y filtros de vendedor/cliente con nombres de ejemplo | admin, reporteVentas | Datos reales; si no existen aún, mostrar "Sin datos" en lugar de cifras inventadas. |
| Tabla admin sin clases (`<table>` sin `table`) y `<script type="module">` vacío en el `<head>` | admin, reporteVentas | Tabla con clases de Bootstrap, sin script vacío. |
| `about.html` enlaza dos veces `css/about.css` | about | Una sola vez. |
| Precios sin formato consistente (`$950,000,000` vs `toLocaleString`) | home, seller, detalle | `formatCOP(n)` único con `es-CO`. |
| Sin estados de carga ni de error (salvo en admin y testimonios de service) | seller, home | Skeleton y mensaje de error reutilizables. |

### Lógica duplicada que se elimina

- `loginBtn` + `verificarEstadoSesion` repetido en `contact.js`, `service.js`, `buyer-auth.js`, `vandedorr.js` → `Navbar` + `useAuth`.
- Escape de HTML y toasts reimplementados en cada archivo.
- Rating de estrellas en `service.js` y `homeTestimonials.js` → `StarRating`.

## Reglas de seguridad

- Ninguna credencial en el código ni en el repositorio.
- Toda restricción de rol, propiedad y estado de cuenta se aplica en las reglas de Firestore; ocultar botones no es seguridad.
- Nunca guardar contraseñas, ni datos de otros usuarios, en `localStorage`.
- Acciones destructivas (eliminar cuenta, eliminar propiedad) con confirmación y, en cuenta, reautenticación.