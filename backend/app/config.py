"""Configuration helpers for the simulation API.

Environment variables are read at call time so tests can monkeypatch them.
"""

from __future__ import annotations

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SIMULATION_DIR = REPO_ROOT / "integrador_nt_Manuela_Bermudez_Reaktor"
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


def get_simulation_dir() -> Path:
    """Return the root folder of the Python simulation project."""
    configured = os.environ.get("SIMULATION_DIR", "").strip()
    if configured:
        return Path(configured).expanduser().resolve()
    return DEFAULT_SIMULATION_DIR


def get_cors_origins() -> list[str]:
    """Return the allowed CORS origins for the API."""
    raw = os.environ.get("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    return origins or list(DEFAULT_CORS_ORIGINS)


def get_firebase_project_id() -> str:
    """Return the configured Firebase project id, or an empty string."""
    return os.environ.get("FIREBASE_PROJECT_ID", "").strip()


def get_firebase_service_account() -> str:
    """Return the path to a service account JSON file, or an empty string."""
    return os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip()
