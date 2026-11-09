"""Run the Python simulation pipeline on demand.

The endpoint that uses this module regenerates the CSV files consumed by the
admin charts. The pipeline runs in a staging folder inside the simulator and
only replaces the live files after every stage succeeds and the resulting CSVs
can be aggregated. A lock serializes reads and runs so the API never serves a
half-written dataset.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import threading
import time
from dataclasses import dataclass
from pathlib import Path

from .config import (
    get_simulation_dir,
    get_simulation_python,
    get_simulation_timeout_seconds,
)
from .simulation import SimulationDataError, load_overview

PIPELINE_STEPS = (
    ("simular", "simular_datos.py"),
    ("ensuciar", "ensuciar_datos.py"),
    ("limpiar", "limpiar_datos.py"),
)
DATA_FOLDERS = {
    "crudos": (
        "compradores.csv",
        "vendedores.csv",
        "administradores.csv",
    ),
    "sucios": (
        "compradores_sucios.csv",
        "vendedores_sucios.csv",
        "administradores_sucios.csv",
    ),
    "limpios": (
        "compradores_limpios.csv",
        "vendedores_limpios.csv",
        "administradores_limpios.csv",
    ),
}

SIMULATION_LOCK = threading.Lock()


class SimulationRunError(Exception):
    """Raised when the Python pipeline cannot be executed."""


class SimulationBusyError(Exception):
    """Raised when another simulation run is already in progress."""


@dataclass(frozen=True)
class SimulationRunResult:
    """Metadata returned after a successful pipeline run."""

    duration_ms: int
    steps: int
    files: int


def _validate_simulation_dir(simulation_dir: Path) -> None:
    source_dir = simulation_dir / "src"
    if not source_dir.is_dir():
        raise SimulationRunError(
            "No se encontró la carpeta src del simulador en "
            f"{simulation_dir}. Define SIMULATION_DIR con la ruta correcta."
        )

    missing = [
        script for _, script in PIPELINE_STEPS if not (source_dir / script).is_file()
    ]
    if missing:
        raise SimulationRunError(
            "Faltan scripts del simulador: " + ", ".join(sorted(missing))
        )


def _build_env(work_dir: Path) -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUNBUFFERED"] = "1"
    # The simulator resolves its default paths from this variable. Pointing it
    # at the staging folder keeps every write away from the live data.
    env["PROYECTO_INTEGRADOR_DIR"] = str(work_dir)
    return env


def _run_step(
    *,
    name: str,
    script: str,
    simulation_dir: Path,
    work_dir: Path,
    python_executable: str,
    timeout_seconds: float,
) -> None:
    command = [
        python_executable,
        str(simulation_dir / "src" / script),
        "--project-dir",
        str(work_dir),
    ]
    try:
        completed = subprocess.run(
            command,
            cwd=str(simulation_dir),
            env=_build_env(work_dir),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired as error:
        raise SimulationRunError(
            f"La etapa '{name}' superó el tiempo límite de "
            f"{timeout_seconds:.0f} s."
        ) from error
    except OSError as error:
        raise SimulationRunError(
            f"No se pudo ejecutar Python para la etapa '{name}': {error}"
        ) from error

    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        if len(detail) > 1200:
            detail = "…" + detail[-1200:]
        suffix = f" Detalle: {detail}" if detail else ""
        raise SimulationRunError(
            f"La etapa '{name}' falló con código {completed.returncode}.{suffix}"
        )


def _staging_dir(simulation_dir: Path) -> Path:
    return Path(
        tempfile.mkdtemp(prefix=".simulation-run-", dir=str(simulation_dir))
    )


def _validate_staging(staging: Path) -> int:
    """Validate every generated CSV before touching the live dataset."""
    missing: list[str] = []
    for folder, filenames in DATA_FOLDERS.items():
        for filename in filenames:
            if not (staging / "data" / folder / filename).is_file():
                missing.append(f"{folder}/{filename}")
    if missing:
        raise SimulationRunError(
            "La simulación no generó todos los archivos esperados: "
            + ", ".join(sorted(missing))
        )

    try:
        load_overview(root=staging)
    except SimulationDataError as error:
        raise SimulationRunError(
            f"Los CSV generados no son válidos: {error}"
        ) from error

    # All files exist and can be aggregated; count them for the run metadata.
    return sum(len(filenames) for filenames in DATA_FOLDERS.values())


def _promote_staging(staging: Path, simulation_dir: Path) -> None:
    """Replace the live CSV files with the validated staging copies."""
    for folder, filenames in DATA_FOLDERS.items():
        source_dir = staging / "data" / folder
        target_dir = simulation_dir / "data" / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        for filename in filenames:
            source_file = source_dir / filename
            destination = target_dir / filename
            temporary = destination.with_name(f".{destination.name}.tmp")
            try:
                shutil.copy2(source_file, temporary)
                os.replace(temporary, destination)
            finally:
                temporary.unlink(missing_ok=True)


def _run_pipeline() -> int:
    simulation_dir = get_simulation_dir()
    _validate_simulation_dir(simulation_dir)

    python_executable = get_simulation_python()
    timeout_seconds = get_simulation_timeout_seconds()
    deadline = time.monotonic() + timeout_seconds
    try:
        staging = _staging_dir(simulation_dir)
    except OSError as error:
        raise SimulationRunError(
            "No se pudo crear la carpeta temporal de la simulación en "
            f"{simulation_dir}: {error}"
        ) from error

    try:
        for name, script in PIPELINE_STEPS:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise SimulationRunError(
                    "La simulación superó el tiempo límite total de "
                    f"{timeout_seconds} s."
                )
            _run_step(
                name=name,
                script=script,
                simulation_dir=simulation_dir,
                work_dir=staging,
                python_executable=python_executable,
                timeout_seconds=remaining,
            )

        files = _validate_staging(staging)
        try:
            _promote_staging(staging, simulation_dir)
        except OSError as error:
            raise SimulationRunError(
                f"No se pudieron reemplazar los CSV del simulador: {error}"
            ) from error
        return files
    finally:
        shutil.rmtree(staging, ignore_errors=True)


def run_simulation() -> dict:
    """Run the pipeline, replace the live data, and return a fresh overview."""
    if not SIMULATION_LOCK.acquire(blocking=False):
        raise SimulationBusyError(
            "Ya hay una simulación en curso. Espera a que termine."
        )

    try:
        started = time.monotonic()
        files = _run_pipeline()
        try:
            overview = load_overview()
        except SimulationDataError as error:
            raise SimulationRunError(
                f"La simulación terminó pero los datos no son válidos: {error}"
            ) from error

        overview["run"] = {
            "durationMs": int((time.monotonic() - started) * 1000),
            "steps": len(PIPELINE_STEPS),
            "files": files,
        }
        return overview
    finally:
        SIMULATION_LOCK.release()


def load_overview_locked() -> dict:
    """Load the live overview while serializing against a running pipeline."""
    with SIMULATION_LOCK:
        return load_overview()
