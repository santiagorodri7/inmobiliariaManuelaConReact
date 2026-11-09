# Admin Simulation + FastAPI — Design

## Goal

Verify the existing admin panel end-to-end, then add a FastAPI service that reads the Python simulation CSVs and exposes chart data to a new admin tab built with Recharts.

## Decisions

- Backend lives at `backend/` in the main repository.
- Chart data comes only from the simulation CSV files; no Firebase production writes.
- Charts are interactive in React with Recharts.
- API auth verifies a Firebase ID token and admin role when `FIREBASE_PROJECT_ID` is set; local development falls back to unauthenticated access.
- Admin verification uses the Firebase emulator suite and Playwright against `demo-manuela` with seeded test data.

## Backend

```text
backend/
  app/
    main.py
    config.py
    auth.py
    simulation.py
  scripts/
    seed_demo.py
    validate_xlsx.py
  tests/
  requirements.txt
  requirements-dev.txt
  .env.example
  README.md
```

### Endpoints

- `GET /api/health` — public status and auth mode.
- `GET /api/simulation/overview` — admin-protected; returns totals and the nine chart datasets.

### Data sources

- `data/limpios/compradores_limpios.csv`
- `data/limpios/vendedores_limpios.csv`
- `data/limpios/administradores_limpios.csv`
- `data/sucios/administradores_sucios.csv`

The aggregation must mirror `src/reporte_datos.py`:

- Status values normalized from `true/si/1` and `false/no/0`.
- Balance histogram step: `max(50, ceil(amplitude / 10 / 50) * 50)` in millions of COP.
- Interests counted with blanks mapped to an unknown key.
- Sold properties counted and sorted numerically.
- Admin types mapped to `admin`, `superadmin`, and `invalid`.
- Admin quality: raw rows, unique raw `user_id`, unique clean `user_id`.

### Auth

- `FIREBASE_PROJECT_ID` unset: local mode, no token required.
- `FIREBASE_PROJECT_ID` set: verify the bearer token and read `users/{uid}` or `usuarios/{uid}`.
- Require role `Admin`/`Administrador` and `activo != false`.
- Emulator mode accepts Auth Emulator tokens.
- CORS origins from `CORS_ORIGINS`.

## Frontend

- Route `/admin/simulacion`, lazy-loaded under the existing admin `ProtectedRoute`.
- New `simulacion` item in `adminNav`.
- 4 summary cards and 9 interactive charts grouped by buyers, sellers, and admins.
- Refresh button, loading state, retryable error state, empty state.
- Token read from `auth.currentUser.getIdToken()`.
- `VITE_SIMULATION_API_URL` configurable; Vite dev proxy `/api` to `127.0.0.1:8000`.
- ES/EN translations and dashboard CSS additions.

## Verification

1. Baseline admin verification against emulators:
   - login, all five admin sections, search, filters, pagination;
   - user activation, property visibility, testimonial moderation, sale creation/annulment;
   - sales report filters and monthly bars;
   - all four Excel downloads validated with `openpyxl`.
2. Backend unit and API tests.
3. New tab E2E: nine charts render, refresh works, API error state renders.
4. Final build, Firestore rules tests (111), Storage rules tests (8).

## Dependencies

- Node runtime: `recharts`.
- Node dev: `@playwright/test`, `firebase-tools`.
- Python: `fastapi`, `uvicorn`, `firebase-admin`, `PyJWT`.
- Python dev: `pytest`, `httpx`, `openpyxl`.
- Playwright Chromium.

## Risks and assumptions

- The simulation folder is untracked and contains a nested `.git`; the backend references it via `SIMULATION_DIR`. No deletion or restructuring of that folder.
- Charts reflect the last generated CSV snapshot; re-running the Python pipeline remains manual.
- Local API mode is unauthenticated and must not be exposed publicly.
- Existing admin defects found during baseline are fixed only when they block the requested flows; all findings are reported.
