"""FastAPI application that exposes the simulation chart data."""

from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .auth import AdminIdentity, require_admin
from .config import get_cors_origins, get_firebase_project_id
from .simulation import SimulationDataError, load_overview

app = FastAPI(
    title="Manuela Simulation API",
    description="Expone los reportes del simulador Python para el panel de administración.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Authorization", "Content-Type"],
)


def _auth_mode() -> str:
    return "firebase" if get_firebase_project_id() else "local"


@app.get("/api/health")
def health() -> dict:
    """Public health check used by the frontend and deployment probes."""
    return {"status": "ok", "authMode": _auth_mode()}


@app.get("/api/simulation/overview")
def simulation_overview(
    _admin: AdminIdentity = Depends(require_admin),
) -> dict:
    """Return the aggregated simulation reports for the admin charts."""
    try:
        return load_overview()
    except SimulationDataError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
