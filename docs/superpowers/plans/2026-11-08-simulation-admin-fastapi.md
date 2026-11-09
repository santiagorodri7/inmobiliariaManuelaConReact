# Simulation Admin + FastAPI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the existing admin panel against Firebase emulators and add a FastAPI-backed admin tab with interactive charts from the Python simulation CSVs.

**Architecture:** A new `backend/` FastAPI service reads the generated CSVs, mirrors the aggregations in `reporte_datos.py`, and exposes one admin-protected overview endpoint. A lazy React admin page consumes it with Recharts and existing dashboard patterns.

**Tech Stack:** React 19, Vite 7, Firebase 10, Recharts 3, FastAPI, Uvicorn, firebase-admin, Playwright, Firebase Emulator Suite.

**Spec:** `docs/superpowers/specs/2026-11-08-admin-simulation-fastapi-design.md`

## Global Constraints

- Respond to the user in Spanish; code identifiers and comments in English.
- Do not write to the production Firebase project. Use `demo-manuela` emulators for all verification.
- Do not add a dependency unless the task needs it; report every installed dependency.
- Preserve the existing `users/{uid}` canonical + `usuarios/{uid}` legacy behavior.
- Preserve the Base64 image fallback.
- Keep language preference only in `localStorage`.
- Do not delete the nested `.git` inside `integrador_nt_Manuela_Bermudez_Reaktor`.
- After each task run the listed tests/build and fix errors before continuing.

## Review Focus

- Missing or renamed CSV columns must return a clear 503, not an internal error.
- Balance-bin boundaries must match `reporte_datos.py` exactly, including the 50-million step floor.
- Admin API access must reject a valid non-admin token when Firebase auth is enabled.
- The new tab must show a usable error with a retry button when the API is offline.
- Excel downloads must contain the filtered rows, not the full unfiltered tables.

---

### Task 1: Emulator-enabled Firebase client + deterministic demo seed

**Files:**
- Modify: `src/services/firebase.js`
- Modify: `.env.example`
- Create: `backend/scripts/seed_demo.py`
- Create: `backend/requirements.txt`
- Create: `backend/requirements-dev.txt`
- Modify: `package.json`

**Interfaces:**
- Produces: `VITE_USE_FIREBASE_EMULATORS=true` connects Auth, Firestore, and Storage to `127.0.0.1`.
- Produces: demo credentials `admin.demo@manuela.local` / `Demo1234!`.
- Produces: seeded collections `users`, `usuarios`, `propiedades`, `ventas`, `testimonios`.

- [ ] **Step 1: Add the guarded emulator connection**

In `src/services/firebase.js`, import `connectAuthEmulator`, `connectFirestoreEmulator`, and `connectStorageEmulator`. After creating `auth`, `db`, and `storage`, add:

```js
if (import.meta.env.DEV && env.VITE_USE_FIREBASE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}
```

- [ ] **Step 2: Document the switch and API URL**

Add to `.env.example`:

```dotenv
# Solo desarrollo: conecta Auth, Firestore y Storage al emulador local.
VITE_USE_FIREBASE_EMULATORS=false

# URL del backend FastAPI. Vacío usa el proxy de Vite /api en desarrollo.
VITE_SIMULATION_API_URL=
```

- [ ] **Step 3: Install Python dependencies**

Create `backend/requirements.txt`:

```text
fastapi==0.162.2
uvicorn[standard]==0.40.0
firebase-admin==7.7.0
PyJWT==2.10.1
```

Create `backend/requirements-dev.txt`:

```text
-r requirements.txt
pytest==9.0.2
httpx==0.28.1
openpyxl==3.1.5
```

Run: `python -m pip install -r backend/requirements-dev.txt`

Expected: installation succeeds; report versions.

- [ ] **Step 4: Create the demo seed script**

`backend/scripts/seed_demo.py` must:

1. Abort unless `FIRESTORE_EMULATOR_HOST` is set and the project id starts with `demo-`.
2. Set `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` if absent.
3. Initialize `firebase_admin` with `options={"projectId": "demo-manuela"}`.
4. Create or update the auth user `admin.demo@manuela.local` with password `Demo1234!`.
5. Write `users/{uid}` with `rol: "Admin"`, `activo: true`, and valid registration fields.
6. Seed 12 canonical `users`, 12 `propiedades`, 12 `ventas`, and 12 `testimonios` with deterministic ids and mixed statuses/dates.
7. Seed 2 legacy-only `usuarios` docs to exercise the canonical/legacy merge.
8. Print the demo credentials and seeded counts.

Use dates spread across 2026-06 through 2026-11 so the sales report has at least six monthly groups.

- [ ] **Step 5: Add npm scripts and dev dependencies**

Run:

```powershell
npm install -D @playwright/test firebase-tools
npx playwright install chromium
```

Add scripts:

```json
"emulators": "firebase emulators:start --only auth,firestore,storage --project demo-manuela",
"seed:demo": "python backend/scripts/seed_demo.py",
"test:e2e": "playwright test"
```

- [ ] **Step 6: Verify seeding**

Run emulators in one terminal:

```powershell
npm run emulators
```

In another:

```powershell
npm run seed:demo
```

Expected: credentials printed and no production project touched.

---

### Task 2: Baseline Playwright verification of the current admin panel

**Files:**
- Create: `playwright.config.js`
- Create: `tests/e2e/admin.spec.js`
- Create: `backend/scripts/validate_xlsx.py`

**Interfaces:**
- Consumes: Task 1 demo credentials and seed data.
- Produces: repeatable admin regression suite and Excel validator.

- [ ] **Step 1: Configure Playwright**

`playwright.config.js` must use `testDir: "./tests/e2e"`, `baseURL: "http://127.0.0.1:5173"`, Chromium, trace on first retry, and a `webServer` that runs `npm run dev -- --host 127.0.0.1 --port 5173` with:

```js
env: {
  ...process.env,
  VITE_USE_FIREBASE_EMULATORS: "true",
  VITE_FIREBASE_API_KEY: "demo-key",
  VITE_FIREBASE_AUTH_DOMAIN: "demo-manuela.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID: "demo-manuela",
  VITE_FIREBASE_STORAGE_BUCKET: "demo-manuela.appspot.com",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  VITE_FIREBASE_APP_ID: "1:1234567890:web:demo",
  VITE_SIMULATION_API_URL: "http://127.0.0.1:8000",
}
```

- [ ] **Step 2: Write the login helper and baseline tests**

In `tests/e2e/admin.spec.js`, add a helper that navigates to `/login`, fills `#login-email` and `#login-password`, clicks the submit button, and waits for `/admin`.

Cover:

- Summary cards and recent sales load.
- Users: search, role filter, status filter, next-page pagination, deactivate/reactivate a non-self user.
- Properties: search, operation/status filters, page pagination, hide/publish action.
- Testimonials: pending filter, approve action, reject action.
- Sales: date range, operation/status filters, page pagination, register a sale, annul a sale with confirmation.
- Sales report: filtered table and monthly bars.
- All four exports: summary export-all, properties, users, sales.
- Save each download under `test-results/excel/` and assert a non-zero file size.

- [ ] **Step 3: Create the Excel validator**

`backend/scripts/validate_xlsx.py` must accept one or more `.xlsx` paths, open them with `openpyxl`, and assert:

- The complete workbook has sheets `Usuarios`, `Propiedades`, `Ventas`.
- Single-sheet workbooks have the expected header row.
- Data row count matches the expected count passed via `--expected-users`, `--expected-properties`, or `--expected-sales`.

- [ ] **Step 4: Run the baseline suite**

Start emulators and seed the demo data, then run:

```powershell
npx playwright test tests/e2e/admin.spec.js
```

Expected: baseline failures identify real defects. Fix only failures that block the requested flows; record the rest.

---

### Task 3: Backend simulation aggregation module

**Files:**
- Create: `backend/__init__.py`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/simulation.py`
- Create: `backend/tests/test_simulation.py`

**Interfaces:**
- Produces: `load_overview(root: Path) -> dict`
- Produces: `SimulationDataError`
- Produces: `get_simulation_dir() -> Path`

- [ ] **Step 1: Write failing aggregation tests**

Create fixtures with temporary CSV files and assert:

```python
def test_balance_bins_follow_python_step_rule(tmp_path):
    # balances 10M, 60M, 120M, 260M -> step 50, edges 0..300
    assert bins == [
        {"from": 0, "to": 50, "count": 1},
        {"from": 50, "to": 100, "count": 1},
        {"from": 100, "to": 150, "count": 1},
        {"from": 150, "to": 200, "count": 0},
        {"from": 200, "to": 250, "count": 0},
        {"from": 250, "to": 300, "count": 1},
    ]
```

Add tests for status normalization (`true/si/1`, `false/no/0`, blank, garbage), admin type mapping, interest counts, sold-property ordering, quality counts, and missing-file errors.

- [ ] **Step 2: Run tests to verify failure**

Run: `python -m pytest backend/tests/test_simulation.py -v`

Expected: FAIL because `backend.app.simulation` does not exist.

- [ ] **Step 3: Implement config**

`backend/app/config.py` must expose:

- `REPO_ROOT = Path(__file__).resolve().parents[2]`
- `DEFAULT_SIMULATION_DIR = REPO_ROOT / "integrador_nt_Manuela_Bermudez_Reaktor"`
- `get_simulation_dir() -> Path` reading `SIMULATION_DIR`.
- `get_cors_origins() -> list[str]` reading `CORS_ORIGINS`.
- `get_firebase_project_id() -> str`.
- `get_firebase_service_account() -> str`.

Read environment variables at call time so tests can monkeypatch them.

- [ ] **Step 4: Implement simulation aggregation**

Use `csv.DictReader` with `encoding="utf-8-sig"`. Return exactly:

```python
{
  "generatedAt": "...",
  "totals": {"buyers": 300, "sellers": 300, "admins": 300, "rawAdminRows": 315},
  "charts": {
    "buyerBalances": {"total": 300, "excluded": 0, "bins": [...]},
    "buyerStatus": [{"key": "active", "value": 0}],
    "buyerInterests": [{"key": "casa", "value": 0}],
    "sellerBalances": {"total": 300, "excluded": 0, "bins": [...]},
    "sellerStatus": [{"key": "active", "value": 0}],
    "sellerSoldProperties": [{"key": "0", "value": 0}],
    "adminTypes": [{"key": "admin", "value": 0}],
    "adminTypeShare": [{"key": "admin", "value": 0}],
    "adminQuality": [
      {"key": "rawRows", "value": 0},
      {"key": "rawUniqueIds", "value": 0},
      {"key": "cleanAdmins", "value": 0},
    ],
  },
}
```

- [ ] **Step 5: Run aggregation tests**

Run: `python -m pytest backend/tests/test_simulation.py -v`

Expected: PASS.

- [ ] **Step 6: Validate against the real CSVs**

Run a short Python snippet calling `load_overview(get_simulation_dir())` and assert buyer/seller/admin totals are 300 and raw admin rows are 315. If the real files differ, report it rather than hard-code.

---

### Task 4: FastAPI app, auth, and API tests

**Files:**
- Create: `backend/app/auth.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/test_api.py`
- Create: `backend/.env.example`

**Interfaces:**
- Consumes: `load_overview`, `SimulationDataError`, config getters.
- Produces: `app` FastAPI instance.
- Produces: `require_admin` dependency returning `AdminIdentity`.

- [ ] **Step 1: Write failing API tests**

Use `fastapi.testclient.TestClient`. Cover:

- `GET /api/health` returns 200.
- Local mode (`FIREBASE_PROJECT_ID` unset) returns 200 from `/api/simulation/overview`.
- Missing CSVs return 503 with `detail` mentioning the missing file.
- When `FIREBASE_PROJECT_ID=demo-test`, a missing bearer token returns 401.
- A valid non-admin token returns 403 (mock the token verifier and Firestore lookup).
- A valid admin token returns 200.

- [ ] **Step 2: Run tests to verify failure**

Run: `python -m pytest backend/tests/test_api.py -v`

Expected: FAIL because the app does not exist.

- [ ] **Step 3: Implement auth**

`backend/app/auth.py`:

- `AdminIdentity` dataclass with `uid`, `email`, `mode`.
- `require_admin(credentials=Depends(HTTPBearer(auto_error=False)))`.
- Local mode returns `AdminIdentity("local-dev", "", "local")`.
- Firebase mode:
  - Decode unsigned emulator tokens when `FIREBASE_AUTH_EMULATOR_HOST` is set.
  - Otherwise call `firebase_admin.auth.verify_id_token`.
  - Read `users/{uid}`, then `usuarios/{uid}`; require `rol in {"Admin", "Administrador"}` and `activo != false`.
  - Raise `HTTPException(401, detail="missing_token")` or `403, detail="admin_required"`.
- Initialize the Firebase Admin app once; use `FIREBASE_SERVICE_ACCOUNT` when provided, otherwise application default credentials.

- [ ] **Step 4: Implement the app**

`backend/app/main.py`:

- FastAPI title `Manuela Simulation API`.
- CORS from `get_cors_origins()`, methods `["GET"]`, headers `["Authorization", "Content-Type"]`.
- `GET /api/health` returns `{"status": "ok", "authMode": "local" | "firebase"}`.
- `GET /api/simulation/overview` depends on `require_admin`, catches `SimulationDataError`, and raises `HTTPException(503, detail=str(exc))`.

- [ ] **Step 5: Run API tests**

Run: `python -m pytest backend/tests/test_api.py -v`

Expected: PASS.

- [ ] **Step 6: Smoke-test with Uvicorn**

Run: `python -m uvicorn backend.app.main:app --port 8000`

Then: `Invoke-RestMethod http://127.0.0.1:8000/api/health`

Expected: `status = ok`.

---

### Task 5: Frontend API service, route, navigation, and translations

**Files:**
- Create: `src/services/simulationService.js`
- Modify: `src/App.jsx`
- Modify: `src/config/dashboardNav.js`
- Modify: `src/i18n/es.json`
- Modify: `src/i18n/en.json`
- Modify: `vite.config.js`
- Modify: `src/utils/errors.js`

**Interfaces:**
- Produces: `fetchSimulationOverview() -> Promise<Overview>`
- Produces: route `/admin/simulacion`
- Produces: nav key `simulacion`.

- [ ] **Step 1: Add the service**

`src/services/simulationService.js`:

```js
import { auth } from "./firebase.js";
import { appError } from "../utils/errors.js";

const baseUrl = String(import.meta.env.VITE_SIMULATION_API_URL || "").replace(/\/$/, "");

export const fetchSimulationOverview = async () => {
  const token = await auth?.currentUser?.getIdToken?.();
  const response = await fetch(`${baseUrl}/api/simulation/overview`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 401 || response.status === 403) {
    throw appError("simulation/unauthorized");
  }
  if (!response.ok) throw appError("simulation/unavailable");
  return response.json();
};
```

- [ ] **Step 2: Wire route and navigation**

- Lazy import `SimulationPage` in `src/App.jsx`.
- Add `/admin/simulacion` under `ProtectedRoute roles={[ROLES.ADMIN]}`.
- Add `adminNav` item `{ key: "simulacion", label: "nav.dashboard.simulation", icon: ChartColumn, to: "/admin/simulacion" }`.
- Use `ChartColumn` from `lucide-react`.

- [ ] **Step 3: Add translations**

Add `nav.dashboard.simulation` plus a `dashboard.simulation` block in both `es.json` and `en.json` containing:

- page title/description, title, subtitle, back, refresh, source note;
- stats labels for buyers, sellers, admins, raw rows;
- chart titles/descriptions for all nine charts;
- axis labels, unknown label, generated-at label, loading, error title/text, empty title/text, retry;
- error messages for `simulation/unavailable` and `simulation/unauthorized`.

- [ ] **Step 4: Map error codes**

In `src/utils/errors.js`:

```js
"simulation/unavailable": "errors.simulation.unavailable",
"simulation/unauthorized": "errors.simulation.unauthorized",
```

Add the corresponding keys to both language files.

- [ ] **Step 5: Add the Vite proxy**

In `vite.config.js`:

```js
server: {
  proxy: {
    "/api": "http://127.0.0.1:8000",
  },
},
```

- [ ] **Step 6: Verify i18n parity and build**

Run a key-parity check (the set of leaf keys in `es.json` and `en.json` must match) and `npm run build`.

Expected: parity and build pass.

---

### Task 6: Simulation admin page with Recharts

**Files:**
- Create: `src/pages/dashboard/SimulationPage.jsx`
- Create: `src/components/admin/SimulationChartCard.jsx`
- Modify: `src/styles/dashboard.css`
- Create: `tests/e2e/simulation.spec.js`

**Interfaces:**
- Consumes: `fetchSimulationOverview()` and the overview payload from Task 3/4.
- Produces: nine chart cards with stable `data-testid` hooks: `chart-buyer-balances`, `chart-buyer-status`, `chart-buyer-interests`, `chart-seller-balances`, `chart-seller-status`, `chart-seller-sold`, `chart-admin-types`, `chart-admin-share`, `chart-admin-quality`.

- [ ] **Step 1: Build the chart card wrapper**

`SimulationChartCard.jsx` renders:

- `section.surface.panel` with `data-testid`;
- eyebrow, title, description;
- `ResponsiveContainer` with a 280px height;
- the chart child.

- [ ] **Step 2: Build the page**

`SimulationPage.jsx`:

- Uses `DashboardLayout` with `adminNav` mapped so every item except `simulacion` and `cuenta` points to `/admin`.
- Active key `simulacion`.
- Loads data with `useEffect`; refresh button reuses the loader.
- Renders four `StatCard`s.
- Renders three grouped sections, each with chart cards.
- Uses Recharts `BarChart`, `PieChart`, `Bar`, `Pie`, `Cell`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `Legend`.
- Formats counts with `formatNumber`, balances with `formatCOP`, and status/type labels through translation keys.
- Shows `TableSkeleton`/`PageLoader` while loading, `ErrorState` on failure, and `EmptyState` when all totals are zero.
- Includes a `dashboard-note` explaining the CSV source and refresh behavior.

- [ ] **Step 3: Add styles**

Add `simulation-*` classes to `src/styles/dashboard.css`:

- responsive chart grid `repeat(auto-fit, minmax(320px, 1fr))`;
- chart card spacing and minimum height;
- summary strip;
- mobile single-column behavior at the existing breakpoints.

- [ ] **Step 4: Add the E2E test**

`tests/e2e/simulation.spec.js`:

- Login as demo admin.
- Navigate to `/admin/simulacion`.
- Assert all nine chart test ids are visible.
- Assert totals show 300 buyers, 300 sellers, 300 admins, 315 raw rows.
- Click refresh and assert charts remain visible.
- Optionally intercept `/api/simulation/overview` with a 503 and assert the error state and retry button.

- [ ] **Step 5: Run the new test and build**

Start emulators, seed, backend, then run:

```powershell
npx playwright test tests/e2e/simulation.spec.js
npm run build
```

Expected: PASS and build success.

---

### Task 7: Full regression, documentation, and delivery notes

**Files:**
- Modify: `backend/README.md`
- Modify: `READ-ME.md`
- Create: `backend/.env.example` (if not already created)
- Possibly modify source files for defects found.

**Interfaces:**
- Consumes: all previous tasks.

- [ ] **Step 1: Document backend setup**

`backend/README.md` must cover:

- install commands;
- `SIMULATION_DIR`, `CORS_ORIGINS`, `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT`;
- local mode warning;
- emulator seed command;
- Uvicorn command;
- endpoint and auth behavior;
- production deployment notes (HTTPS, CORS, service account, reverse proxy for `/api`).

- [ ] **Step 2: Update the main README**

Add a short section for the simulation tab and backend, plus the emulator/Playwright verification commands.

- [ ] **Step 3: Run full verification**

```powershell
python -m pytest backend/tests -v
npm run build
npm run test:rules
npx playwright test
python backend/scripts/validate_xlsx.py test-results/excel/*.xlsx --expected-users 14 --expected-properties 12 --expected-sales 12
```

Expected:

- backend tests pass;
- build passes;
- Firestore rules 111/111 and Storage 8/8;
- Playwright passes;
- Excel row/sheet validation passes.

- [ ] **Step 4: Report results**

Final message must include:

- what works and what changed;
- dependencies installed;
- test commands and results;
- manual steps to run backend/frontend/emulators;
- assumptions, including the untracked simulation folder;
- unresolved risks, including local auth mode and production deployment.
