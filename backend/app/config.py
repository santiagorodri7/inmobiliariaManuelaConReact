"""Configuration helpers for the simulation API.

Environment variables are read at call time so tests can monkeypatch them.
"""

from __future__ import annotations

import os
import sys
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


def get_simulation_python() -> str:
    """Return the Python executable used to run the simulator pipeline.

    ``SIMULATION_PYTHON`` lets deployments point to an isolated virtual
    environment that has pandas and Faker installed. It defaults to the
    interpreter running FastAPI.
    """
    configured = os.environ.get("SIMULATION_PYTHON", "").strip()
    return configured or sys.executable or "python"


def get_simulation_timeout_seconds() -> int:
    """Return the maximum duration of a full simulation run, in seconds."""
    raw = os.environ.get("SIMULATION_TIMEOUT_SECONDS", "").strip()
    try:
        value = int(raw) if raw else 120
    except ValueError:
        value = 120
    return max(10, min(value, 900))
