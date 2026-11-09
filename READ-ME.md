# Manuela Bermúdez Realtor

Aplicación de una sola página (SPA) para la gestión inmobiliaria de Manuela
Bermúdez. Está construida con React 19, Vite 7, Bootstrap 5 y Firebase 10. La
interfaz pública, la autenticación y los paneles de Comprador, Vendedor y
Administrador viven en `src/`.

Incluye selector de idioma ES/EN persistido en `localStorage`, registro con
datos financieros, contador mensual de vistas, selección múltiple de inmuebles
para compartir y acciones de contacto por WhatsApp y correo.

## Requisitos

- Node.js 20 o superior y npm.
- Un proyecto de Firebase con Authentication y Firestore. Storage es
  opcional: si no está disponible, la app usa el respaldo Base64.
- Firebase CLI para desplegar reglas, Functions y Hosting.
- Java 11 o superior si se ejecutan los emuladores.
- Python 3.11 o superior si se ejecuta el backend FastAPI de simulación. Para el
  botón **Actualizar datos** también se necesitan `pandas` y `Faker` (ver
  `backend/requirements-simulation.txt`).

## Configuración local

```bash
npm install
npm run dev
```

El repositorio incluye la configuración pública del proyecto
`registrologininmobiliaria` en `src/config/firebasePublic.js`, así que un clon
nuevo conecta a Firestore sin crear `.env.local`. Esa configuración no contiene
secretos: Firebase entrega esos identificadores al navegador.

Para usar otro proyecto de Firebase o cambiar integraciones, crea `.env.local`
a partir de `.env.example`. Las variables definidas allí tienen prioridad:

| Variable | Uso |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Clave pública del cliente |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de Authentication |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FUNCTIONS_REGION` | Región de las Cloud Functions |
| `VITE_USE_FIREBASE_EMULATORS` | `true` conecta Auth, Firestore y Storage a los emuladores locales |
| `VITE_SIMULATION_API_URL` | URL del backend FastAPI; vacío usa el proxy `/api` de Vite |
| `VITE_ALLOW_BASE64_FALLBACK` | `true` por defecto; `false` desactiva el respaldo Base64 |
| `VITE_CONTACT_FALLBACK_URL` | Endpoint PHP opcional de contingencia |
| `VITE_WHATSAPP_NUMBER` | Sobrescribe el número de WhatsApp; si está vacío se usa el número confirmado en `src/config/contact.js` |

El proyecto usa `registrologininmobiliaria` por defecto (`.firebaserc`).

## Comandos

```bash
npm run dev         # servidor de desarrollo
npm run build       # build de producción en dist/
npm run preview     # revisar el build
npm run test:rules  # reglas de Firestore y Storage
npm run emulators   # Auth, Firestore y Storage locales
npm run seed:demo   # datos demo (requiere variables del emulador)
npm run test:e2e    # emuladores + siembra + Playwright
```

`npm run test:rules` requiere Firebase CLI, Java y los emuladores. Las pruebas
cubren lectura pública, perfiles `users`/`usuarios`, datos sensibles, roles,
propiedades, `propertyViews`, cierres, testimonios y auditoría; además validan
`storage.rules`. La suite actual suma 111 pruebas de Firestore y 8 de Storage.

`npm run test:e2e` inicia los emuladores, siembra los datos demo, levanta Vite y
el API FastAPI, y ejecuta 10 pruebas Playwright: 7 del panel administrativo
(datos, filtros, tablas, acciones, paginación y exportaciones Excel) y 3 de la
pestaña de simulación (nueve gráficos, totales, regeneración real del pipeline,
recuperación ante errores de carga y error controlado al regenerar).

## Panel de simulación y backend FastAPI

La pestaña **Simulación** (`/admin/simulacion`) muestra nueve gráficos
interactivos con Recharts: balances, estado e intereses de compradores;
balances, estado y propiedades vendidas de vendedores; y tipos, participación y
calidad de datos de administradores. Los datos provienen únicamente de los CSV
del simulador Python (`data/limpios` y `data/sucios`). No se escribe en
Firestore ni se usan datos de producción.

El backend vive en `backend/` y expone `GET /api/simulation/overview` y
`POST /api/simulation/rerun`. El botón **Actualizar datos** ejecuta las etapas
1–4 del simulador (simular, exportar, ensuciar y limpiar) en una carpeta
temporal, valida los CSV y solo entonces reemplaza los archivos reales. Si algo
falla, los datos anteriores quedan intactos. Para desarrollarlo:

```powershell
python -m pip install -r backend/requirements-dev.txt
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
npm run dev
```

Con `VITE_SIMULATION_API_URL` vacío, Vite enruta `/api` al backend local. El
botón **Actualizar datos** regenera los CSV con datos aleatorios nuevos, por lo
que los gráficos cambian en cada corrida. Solo se permite una simulación a la
vez y la petición tarda alrededor de 10 s. No se regeneran los PNG de
`data/reportes`; para eso hay que ejecutar `python src/main.py` aparte.

Con `FIREBASE_PROJECT_ID` definido, el API exige un Firebase ID token con rol
`Admin` o `Administrador`. Sin esa variable funciona en modo local sin
autenticación, válido solo para desarrollo. La configuración completa, las
variables, el modo con emuladores, las pruebas y las notas de despliegue están
en `backend/README.md`.

Para sembrar los datos demo manualmente:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
$env:GCLOUD_PROJECT="demo-manuela"
python backend/scripts/seed_demo.py
```

Credenciales demo: `admin.demo@manuela.local` / `Demo1234!`.

## Rutas principales

| Ruta | Acceso |
| --- | --- |
| `/`, `/home`, `/nosotros`, `/servicios`, `/contacto` | Público |
| `/privacidad` | Público |
| `/propiedad/:id` | Público si la propiedad está disponible |
| `/propiedades?ids=id1,id2` | Público; selección compartida de hasta 10 inmuebles |
| `/login`, `/registro`, `/recuperar-contrasena` | Público, solo sin sesión |
| `/cuenta` | Cualquier usuario autenticado |
| `/comprador` | Comprador |
| `/vendedor` | Vendedor |
| `/admin`, `/admin/reportes-ventas` | Admin / Administrador |
| `/admin/simulacion` | Admin / Administrador |

Las URL antiguas `.html` se redirigen con el cliente y, en Hosting, con
redirecciones 301 configuradas en `firebase.json`.

## Firebase

### Authentication

Correo y contraseña. Al registrarse se crea el perfil canónico en
`users/{uid}` con rol `Comprador` o `Vendedor`. La app sigue leyendo
`usuarios/{uid}` para las cuentas anteriores. El registro exige nombre completo,
cédula de 6 a 12 dígitos, fecha de nacimiento de una persona mayor de 18 años,
correo, estado civil, tipo de contrato, ingresos mensuales mayores que cero,
ingresos extras mayores o iguales que cero y consentimiento de tratamiento.

La cédula, los ingresos y el consentimiento son datos sensibles: solo los puede
leer el titular de la cuenta o un administrador.

### Firestore

| Colección | Contenido |
| --- | --- |
| `users` | Perfil canónico, rol, estado, datos financieros y consentimiento. Lectura solo del titular o Admin |
| `usuarios` | Perfil heredado. Se mantiene para compatibilidad; lectura solo del titular o Admin |
| `propiedades` | Inventario. Lectura pública solo con `status == "disponible"` |
| `propertyViews` | Contador mensual por inmueble. Lectura pública; crear con `views = 1` o sumar exactamente 1 |
| `ventas` | Cierres registrados por administración. Lectura solo Admin |
| `testimonios` | Reseñas. Lectura pública de `activo` o `aprobado` |
| `auditLog` | Registro de acciones sensibles. Lectura solo Admin |
| `contactRateLimits` | Control de frecuencia del formulario. Solo Admin SDK |

El rol Admin se busca primero en `users/{uid}` y, si ese documento no existe, en
`usuarios/{uid}`. Cuando existen ambos, el rol canónico tiene prioridad.

Reglas: `firestore.rules`. Índices: `firestore.indexes.json`; incluye el índice
compuesto de `propertyViews` por `month` y `views`.

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

## Idioma

La preferencia vive solo en `localStorage` (`manuela.idioma.visitante`). En la
primera visita se detecta el idioma del navegador y español es el respaldo si no
es compatible. Cambiar entre ES y EN no escribe en Firestore ni modifica el
perfil. Los formularios de registro y de perfil no incluyen un campo de idioma.

## Vistas mensuales

Cada apertura de `/propiedad/:id` registra una visita por sesión en
`propertyViews/{YYYY-MM}__{propertyId}` con `increment(1)`. `sessionStorage`
evita contar dos veces la misma propiedad en la misma pestaña durante el mes. La
portada hace una consulta del mes actual ordenada por `views` descendente con
límite 6, resuelve los inmuebles publicados y, si aún no hay datos, muestra los
más recientes. Las reglas permiten crear con `views = 1`, sumar exactamente 1 y
no permiten borrar ni asignar valores arbitrarios.

## Compartir propiedades

- En el detalle, **Compartir** usa la Web Share API cuando existe; si no, copia
  el enlace y confirma «Enlace copiado».
- En los listados se pueden marcar hasta 10 inmuebles y compartir
  `/propiedades?ids=id1,id2,...`.
- La página de selección valida y limita los IDs, y solo muestra inmuebles que
  siguen publicados.
- `usePageTitle` actualiza título, descripción y metadatos Open Graph/Twitter.
  Como la SPA los escribe en el cliente, los rastreadores que no ejecutan
  JavaScript pueden ver solo los valores estáticos de `index.html`; para una
  vista previa completa hace falta prerender o metadata del servidor.

## Contacto

`src/config/contact.js` es la única fuente de datos públicos: WhatsApp
`+57 304 254 8683`, correo `manuelabermudezrealestate@gmail.com` e Instagram
`@manubermu_realtor`. Los CTA arman `https://wa.me/...` con
`encodeURIComponent`; en el detalle incluyen el título y la URL del inmueble. El
correo aparece como enlace `mailto:`. Todos los enlaces externos abren con
`target="_blank"` y `rel="noopener noreferrer"`.

## Rol de administración

1. Registra la cuenta desde `/registro` con el rol Comprador o Vendedor. Así se
   crea `users/{uid}` con los datos financieros y el consentimiento que exigen
   las reglas.
2. Copia el UID de la cuenta desde Authentication o desde la URL del documento
   en Firestore.
3. En Firebase Console, abre `users/{uid}` y cambia `rol` a `"Admin"`. La consola
   escribe con privilegios de administrador, por eso puede modificar el rol.
4. Si la cuenta es anterior y solo existe en `usuarios/{uid}`, actualiza allí
   `rol` a `"Admin"`. La app consulta primero `users`; si ese documento no
   existe, usa `usuarios`.
5. Cierra sesión y vuelve a entrar para refrescar el perfil. Confirma el acceso a
   `/admin`.

No asignes `Admin` desde el formulario público: las reglas solo aceptan
`Comprador` o `Vendedor` en el registro.

## Seguridad antes de publicar

- Revisa en Firebase Console que las reglas desplegadas sean las de este repo.
- El respaldo Base64 está activo por defecto y solo se usa cuando Storage no
  está disponible. Para desactivarlo, define `VITE_ALLOW_BASE64_FALLBACK=false`.
  Guarda todas las fotos o falla con un error explícito; nunca omite imágenes en
  silencio. Los límites son 180 KB por imagen y 600 KB en total.
- Confirma que `users` y `usuarios` no sean legibles públicamente. Solo el
  titular o un Admin pueden leer la cédula, los ingresos y el consentimiento.
- La preferencia de idioma no se guarda en Firestore; si migras datos antiguos,
  elimina el campo `idioma` de los perfiles.
- No publiques `ownerEmail` en `propiedades`; la migración lo retira de los
  documentos antiguos.
- Los metadatos Open Graph de propiedades se escriben en el cliente. Para
  crawlers sin JavaScript, configura prerender o metadata del servidor.
- Considera activar App Check y `ENFORCE_APP_CHECK=true` en Functions.
- El borrado definitivo no se ejecuta desde el cliente: usa la Function
  protegida y exige reautenticación.
- El API FastAPI de simulación no debe exponerse en modo local sin
  autenticación. En producción define `FIREBASE_PROJECT_ID`, una cuenta de
  servicio con permisos mínimos, HTTPS y `CORS_ORIGINS` con el origen exacto.
  No publiques el JSON de la cuenta de servicio.
- Para regenerar, el servidor necesita `pandas` y `Faker`, permisos de escritura
  en `SIMULATION_DIR` y un reverse proxy con timeout superior a
  `SIMULATION_TIMEOUT_SECONDS` (120 s por defecto). La petición es síncrona y
  tarda unos 10 s; si el hosting corta peticiones largas, habrá que usar una
  cola o un job asíncrono. El lock de una corrida a la vez es en memoria: con
  varios workers de Uvicorn hay que usar un lock de archivo o una cola.
- Revisa los avisos de `npm audit` antes del lanzamiento.
- `npm audit --omit=dev` reporta 12 vulnerabilidades de producción, transitivas
  de Firebase 10.8.1 (`undici` y `@grpc/grpc-js`). Actualizar a Firebase 10.14.x
  las corrige, pero cambia la versión exigida del SDK; requiere aprobación antes
  de hacerlo. La auditoría completa suma 27 avisos porque incluye herramientas
  de desarrollo (`firebase-tools` y Playwright).

## Estado y pendientes

- El plan Blaze, el proveedor SMTP y el dominio siguen pendientes de
  confirmación. Storage no se puede habilitar sin pago, por eso el respaldo
  Base64 continúa siendo la ruta de producción.
- Los datos de contacto confirmados están centralizados en
  `src/config/contact.js`; el logo definitivo y la identidad de marca siguen
  pendientes.
- Antes de publicar, revisa que los textos de servicios y nosotros no incluyan
  afirmaciones no confirmadas sobre cobertura, número de showings, credenciales
  «Realtor» o autenticidad de testimonios.
- La política de privacidad debe revisarse con asesoría legal, especialmente el
  tratamiento de cédula, ingresos y consentimiento.
- La vista previa de enlaces de propiedades requiere prerender o metadata del
  servidor; la SPA solo actualiza Open Graph después de cargar.
- Los archivos estáticos antiguos (`css/`, `lib/`, `scss/`, `mail/`) se
  conservan como referencia o contingencia; la aplicación activa es `src/`.
- Las vistas React antiguas de `src/pages/` (home, blog, guide, etc.) no se
  importan desde `src/App.jsx`; se conservan solo como referencia y no forman
  parte del build.
- El formulario PHP de `mail/` solo debe usarse como respaldo si se configura
  `VITE_CONTACT_FALLBACK_URL`.
- `integrador_nt_Manuela_Bermudez_Reaktor` contiene un repositorio Git anidado y
  puede no estar versionado. El backend de simulación depende de sus CSV; si no
  está en el servidor, define `SIMULATION_DIR` con permisos de escritura. Si el
  simulador usa otro entorno virtual, define `SIMULATION_PYTHON`.
- El backend FastAPI no se despliega con Firebase Hosting. Necesita un servicio
  aparte (contenedor, VM o función serverless compatible) y un reverse proxy que
  enrute `/api`; revisa `backend/README.md` antes de publicarlo.
