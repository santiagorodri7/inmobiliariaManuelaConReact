# Backend FastAPI — reportes de simulación

API que expone los agregados de los CSV generados por el simulador Python
(`integrador_nt_Manuela_Bermudez_Reaktor`) para la pestaña **Simulación** del
panel de administración. También puede regenerar esos CSV ejecutando las
etapas de simulación, ensuciado y limpieza del simulador.

No escribe en Firestore. `GET /api/simulation/overview` solo lee los archivos;
`POST /api/simulation/rerun` reemplaza los CSV de forma controlada.

## Requisitos

- Python 3.11 o superior (probado con Python 3.13).
- Los CSV del simulador en `data/limpios` y `data/sucios`.
- Para regenerar: `pandas` y `Faker`, permisos de escritura en `SIMULATION_DIR`
  y el ejecutable de Python que corresponda.
- Opcional: Firebase Auth y Firestore para el modo con autenticación.

## Instalación

Desde la raíz del repositorio:

```powershell
python -m pip install -r backend/requirements-dev.txt
```

`requirements-dev.txt` incluye `requirements.txt`, las dependencias del
simulador y las de prueba (`pytest`, `httpx`, `openpyxl`).

Para producción solo con lectura:

```powershell
python -m pip install -r backend/requirements.txt
```

Para habilitar el botón **Actualizar datos** (regeneración):

```powershell
python -m pip install -r backend/requirements-simulation.txt
```

`requirements-simulation.txt` instala `pandas` y `Faker`, las dos dependencias
que usan las etapas 1–4 del simulador. Si el servidor usa un entorno virtual
distinto para el simulador, apunta `SIMULATION_PYTHON` a su intérprete.

## Variables de entorno

Copia `backend/.env.example` como `backend/.env` solo como referencia; Uvicorn
lee las variables del proceso, no carga el archivo automáticamente.

| Variable | Uso |
| --- | --- |
| `SIMULATION_DIR` | Carpeta raíz del proyecto Python. Si está vacía se usa `integrador_nt_Manuela_Bermudez_Reaktor` en la raíz del repositorio. Debe tener permisos de escritura para regenerar. |
| `SIMULATION_PYTHON` | Intérprete que ejecuta el simulador. Por defecto usa el mismo Python de FastAPI. |
| `SIMULATION_TIMEOUT_SECONDS` | Tiempo máximo de una regeneración completa. Por defecto `120`; se limita entre 10 y 900. |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma. Por defecto `http://localhost:5173,http://127.0.0.1:5173`. |
| `FIREBASE_PROJECT_ID` | Activa la autenticación con Firebase ID tokens. Si está vacío, el API funciona en modo local sin autenticación. |
| `FIREBASE_SERVICE_ACCOUNT` | Ruta al JSON de la cuenta de servicio. Si está vacía se usan las credenciales por defecto de la aplicación. |
| `FIREBASE_AUTH_EMULATOR_HOST` | Solo pruebas: host del emulador de Auth, por ejemplo `127.0.0.1:9099`. |
| `FIRESTORE_EMULATOR_HOST` | Solo pruebas: host del emulador de Firestore, por ejemplo `127.0.0.1:8080`. |

### Modo local sin autenticación

Si `FIREBASE_PROJECT_ID` está vacío, `/api/simulation/overview` y
`/api/simulation/rerun` responden sin token. Este modo es exclusivamente para
desarrollo local y **nunca debe exponerse a Internet**: permitiría ejecutar
Python en el servidor sin autenticación.

## Ejecutar el API

```powershell
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

El frontend usa el proxy de Vite (`/api` → `http://127.0.0.1:8000`) cuando
`VITE_SIMULATION_API_URL` está vacío. También se puede apuntar directamente:

```powershell
$env:VITE_SIMULATION_API_URL="http://127.0.0.1:8000"
npm run dev
```

## Autenticación y autorización

- Con `FIREBASE_PROJECT_ID` definido, el API exige
  `Authorization: Bearer <Firebase ID token>`.
- El token se verifica con Firebase Admin. En el emulador de Auth se aceptan los
  tokens sin firma generados por el SDK local.
- El perfil se busca primero en `users/{uid}` y, si no existe, en
  `usuarios/{uid}`. Se requiere `rol` igual a `Admin` o `Administrador` y que
  `activo` no sea `false`.
- Sin token o con token inválido responde `401`; con un usuario sin rol de
  administración responde `403`.

## Endpoints

### `GET /api/health`

Respuesta pública para sondas de disponibilidad:

```json
{ "status": "ok", "authMode": "local" }
```

`authMode` es `firebase` cuando `FIREBASE_PROJECT_ID` está definido.

### `GET /api/simulation/overview`

Devuelve los totales y los nueve conjuntos de datos de los gráficos:

```json
{
  "generatedAt": "2026-11-08T22:00:00+00:00",
  "totals": {
    "buyers": 300,
    "sellers": 300,
    "admins": 300,
    "rawAdminRows": 315
  },
  "charts": {
    "buyerBalances": { "total": 300, "excluded": 0, "bins": [] },
    "buyerStatus": [],
    "buyerInterests": [],
    "sellerBalances": { "total": 300, "excluded": 0, "bins": [] },
    "sellerStatus": [],
    "sellerSoldProperties": [],
    "adminTypes": [],
    "adminTypeShare": [],
    "adminQuality": []
  }
}
```

Si falta un CSV o no tiene las columnas requeridas responde `503` con el nombre
del archivo en `detail`. El panel muestra el estado de error y permite
reintentar.

### `POST /api/simulation/rerun`

Ejecuta el pipeline de datos del simulador y devuelve el mismo payload que
`GET /api/simulation/overview`, más un bloque `run`:

```json
{
  "generatedAt": "2026-11-08T22:10:00+00:00",
  "totals": { "buyers": 300, "sellers": 300, "admins": 300, "rawAdminRows": 315 },
  "charts": {},
  "run": { "durationMs": 9605, "steps": 3, "files": 9 }
}
```

Etapas ejecutadas (las que alimentan la web; no genera los PNG de reportes):

1. `src/simular_datos.py --project-dir <staging>`
2. `src/ensuciar_datos.py --project-dir <staging>`
3. `src/limpiar_datos.py --project-dir <staging>`

La corrida se hace en una carpeta temporal dentro de `SIMULATION_DIR`. Antes de
reemplazar los archivos reales se valida que existan los nueve CSV y que
`load_overview` pueda agregarlos. Los archivos se promueven con `os.replace`.
Si una etapa falla, los datos anteriores quedan intactos.

- Solo un administrador puede ejecutarlo.
- Solo se permite una corrida a la vez: si ya hay una en curso responde `409`.
- Si falta el simulador, falla una etapa, se agota el tiempo o los CSV no son
  válidos, responde `503` con el detalle en `detail`.
- `GET /api/simulation/overview` espera a que termine una corrida en curso para
  no servir datos a medio escribir.

El botón **Actualizar datos** del panel usa este endpoint y luego repinta los
gráficos con la respuesta.

## Pruebas

```powershell
python -m pytest backend/tests -v
```

Cubren las reglas de agregación (incluidos los CSV reales si están disponibles),
el modo local, la autenticación Firebase simulada, los errores de datos y la
regeneración: éxito, etapa fallida, CSV inválidos, corrida concurrente y
simulador ausente. Son 20 pruebas.

## Emuladores y datos demo

En una terminal:

```powershell
npm run emulators
```

En otra terminal, con las variables del emulador definidas:

```powershell
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
$env:GCLOUD_PROJECT="demo-manuela"
python backend/scripts/seed_demo.py
```

Credenciales demo: `admin.demo@manuela.local` / `Demo1234!`.

El script solo acepta proyectos cuyo id empiece por `demo-` y limpia los
documentos creados por pruebas anteriores en las colecciones sembradas.

La suite E2E completa se ejecuta con:

```powershell
npm run test:e2e
```

Ese comando inicia los emuladores, siembra los datos demo y corre las 10 pruebas
Playwright contra Vite y el API. La prueba de simulación pulsa **Actualizar
datos** y ejecuta el pipeline real, por lo que necesita `pandas` y `Faker`.

## Validar los Excel descargados

```powershell
$files = Get-ChildItem test-results/excel/*.xlsx | ForEach-Object { $_.FullName }
python backend/scripts/validate_xlsx.py @files --expected-users 14 --expected-properties 12 --expected-sales 13
```

El valor esperado de ventas es 13 después de la prueba E2E porque esa suite crea
un cierre y lo anula; el documento anulado sigue contando en la exportación.

## Producción

- Sirve el API detrás de HTTPS y un reverse proxy que enrute `/api` a Uvicorn.
- Define `FIREBASE_PROJECT_ID` y una cuenta de servicio con permisos mínimos
  (verificar tokens y leer los perfiles de `users`/`usuarios`). No publiques el
  JSON de la cuenta de servicio.
- Configura `CORS_ORIGINS` con el origen exacto del frontend; no uses `*`.
- Da a `SIMULATION_DIR` permisos de escritura solo si habilitas la
  regeneración; el resto del tiempo el API solo necesita lectura.
- Si `SIMULATION_PYTHON` apunta a otro entorno, instala allí
  `backend/requirements-simulation.txt` o el `requirements.txt` del simulador.
- Configura el timeout del reverse proxy por encima de
  `SIMULATION_TIMEOUT_SECONDS` (por defecto 120 s) para que la petición
  síncrona no se corte. Una corrida real tarda alrededor de 10 s.
- El bloqueo de concurrencia es en memoria y solo protege un proceso. Si ejecutas
  Uvicorn con varios workers, atiende la regeneración en un único worker o
  reemplaza `SIMULATION_LOCK` por un lock de archivo o una cola.
- No expongas el puerto de Uvicorn directamente ni el modo local sin
  autenticación.

## Limitaciones conocidas

- La carpeta `integrador_nt_Manuela_Bermudez_Reaktor` contiene un repositorio
  Git anidado y puede no estar versionada en este repositorio. Si no está
  disponible en el servidor, define `SIMULATION_DIR` con la ruta correcta.
- El API depende de los nombres y columnas de los CSV del simulador. Un cambio
  en el generador puede requerir ajustar `backend/app/simulation.py` y
  `backend/app/rerun.py`.
- La regeneración no produce los PNG de `data/reportes`: solo las etapas 1–4.
  Si se necesitan esos reportes, hay que ejecutar `python src/main.py` aparte.
- `generatedAt` es la hora de la consulta, no la hora en que se ejecutó el
  simulador. Cada corrida de **Actualizar datos** reemplaza los CSV y usa datos
  aleatorios nuevos; no hay semilla fija.
- La petición `POST /api/simulation/rerun` es síncrona y tarda unos 10 s. Si el
  hosting corta peticiones largas, habrá que moverla a una cola o a un job
  asíncrono.
