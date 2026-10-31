# Manuela Bermúdez Realtor

Aplicación de una sola página (SPA) para la gestión inmobiliaria de Manuela
Bermúdez. Está construida con React 19, Vite 7, Bootstrap 5 y Firebase 10. La
interfaz pública, la autenticación y los paneles de Comprador, Vendedor y
Administrador viven en `src/`.

## Requisitos

- Node.js 20 o superior y npm.
- Un proyecto de Firebase con Authentication, Firestore y Storage.
- Firebase CLI para desplegar reglas, Functions y Hosting.
- Java 11 o superior si se ejecutan los emuladores.

## Configuración local

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

Completa `.env.local` con la configuración pública de la app web de Firebase:

| Variable | Uso |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Clave pública del cliente |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de Authentication |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FUNCTIONS_REGION` | Región de las Cloud Functions |
| `VITE_ALLOW_BASE64_FALLBACK` | `true` solo en desarrollo; en producción `false` |
| `VITE_CONTACT_FALLBACK_URL` | Endpoint PHP opcional de contingencia |

El proyecto usa `registrologininmobiliaria` por defecto (`.firebaserc`).

## Comandos

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción en dist/
npm run preview   # revisar el build
npm run test:rules
```

`npm run test:rules` requiere Firebase CLI y el emulador de Firestore. Las
pruebas cubren accesos públicos, roles, cierres, testimonios y auditoría.

## Rutas principales

| Ruta | Acceso |
| --- | --- |
| `/`, `/home`, `/nosotros`, `/servicios`, `/contacto` | Público |
| `/propiedad/:id` | Público si la propiedad está disponible |
| `/login`, `/registro`, `/recuperar-contrasena` | Público, solo sin sesión |
| `/cuenta` | Cualquier usuario autenticado |
| `/comprador` | Comprador |
| `/vendedor` | Vendedor |
| `/admin`, `/admin/reportes-ventas` | Admin / Administrador |

Las URL antiguas `.html` se redirigen con el cliente y, en Hosting, con
redirecciones 301 configuradas en `firebase.json`.

## Firebase

### Authentication

Correo y contraseña. Al registrarse se crea el perfil en `usuarios/{uid}` con
rol `Comprador` o `Vendedor`. El rol `Admin` se asigna desde la consola de
Firebase o con una cuenta administrativa existente.

### Firestore

| Colección | Contenido |
| --- | --- |
| `usuarios` | Perfil, rol, estado y preferencias. Lectura privada |
| `propiedades` | Inventario. Lectura pública solo con `status == "disponible"` |
| `ventas` | Cierres registrados por administración. Lectura solo Admin |
| `testimonios` | Reseñas. Lectura pública de `activo` o `aprobado` |
| `auditLog` | Registro de acciones sensibles. Lectura solo Admin |
| `contactRateLimits` | Control de frecuencia del formulario. Solo Admin SDK |

Reglas: `firestore.rules`. Índices: `firestore.indexes.json`.

### Storage

- `propiedades/{ownerId}/{propertyId}/{archivo}`: imágenes de inmuebles.
- `avatares/{uid}/avatar.webp`: foto de perfil.

Reglas: `storage.rules`. Las imágenes son públicas para lectura y solo el
propietario puede escribir o borrar las suyas.

### Cloud Functions

```bash
cd functions
npm install
cp .env.example .env
# completa SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO
firebase deploy --only functions
```

Funciones incluidas:

- `sendContactEmail`: formulario de contacto con validación, honeypot y límite
  de frecuencia. Requiere un proveedor SMTP (Gmail necesita contraseña de
  aplicación).
- `deletePropertyPermanently`: borrado definitivo reservado a administración,
  con inicio de sesión reciente, propiedad oculta y sin cierre vigente.
- `backfillLegacyData`: completa `status`/`estado` y retira `ownerEmail` de los
  documentos heredados.

Si el proyecto está en el plan Spark, las Functions no se pueden desplegar. El
panel administrativo incluye un respaldo para la migración de datos que usa las
reglas de Firestore, pero el contacto por correo y el borrado definitivo sí
requieren Functions y el plan Blaze.

### Hosting

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` incluye reescrituras a `index.html`, redirecciones 301 desde las
URL `.html`, caché larga para assets y `no-cache` para el documento principal.
El despliegue de reglas e índices es independiente:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Migración de datos heredados

Los documentos antiguos de `propiedades` no tienen `status` y los de
`testimonios` no tienen `estado`. Con las reglas nuevas no serán visibles hasta
completarlos.

1. Despliega `firestore.rules` y `storage.rules`.
2. Inicia sesión con una cuenta Admin.
3. En `/admin`, abre **Resumen → Datos heredados → Completar datos**.
4. El panel usa la Cloud Function si está disponible; si no, actualiza desde el
   cliente con permisos de administración.

La acción agrega el estado faltante, retira `ownerEmail` de las fichas públicas
y deja un registro en `auditLog`. No modifica precios, imágenes, cuentas ni
cierres. Después de la migración, el catálogo público vuelve a mostrar los
inmuebles con la consulta segura `where("status", "==", "disponible")`.

## Seguridad antes de publicar

- Revisa en Firebase Console que las reglas desplegadas sean las de este repo.
- Mantén `VITE_ALLOW_BASE64_FALLBACK=false` en producción.
- Confirma que `usuarios` no sea legible públicamente.
- No publiques `ownerEmail` en `propiedades`; la migración lo retira de los
  documentos antiguos.
- Considera activar App Check y `ENFORCE_APP_CHECK=true` en Functions.
- El borrado definitivo no se ejecuta desde el cliente: usa la Function
  protegida y exige reautenticación.
- Revisa los avisos de `npm audit` antes del lanzamiento.
- `npm audit` reporta 12 vulnerabilidades transitivas de Firebase 10.8.1
  (`undici` y `@grpc/grpc-js`). Actualizar a Firebase 10.14.x las corrige, pero
  cambia la versión exigida del SDK; requiere aprobación antes de hacerlo.

## Estado y pendientes

- Credenciales definitivas, plan Blaze, proveedor SMTP, dominio y datos
  oficiales de marca/contacto están pendientes de confirmación.
- El logo definitivo y los datos de contacto deben reemplazar los provisionales
  en `src/config/site.js`.
- Los archivos estáticos antiguos (`css/`, `lib/`, `scss/`, `mail/`) se
  conservan como referencia o contingencia; la aplicación activa es `src/`.
- El formulario PHP de `mail/` solo debe usarse como respaldo si se configura
  `VITE_CONTACT_FALLBACK_URL`.
