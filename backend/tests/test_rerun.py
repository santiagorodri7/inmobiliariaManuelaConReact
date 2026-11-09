from __future__ import annotations

import csv
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.rerun import SIMULATION_LOCK

client = TestClient(app)

FAKE_SIMULATE = """
import argparse
import csv
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--project-dir", required=True)
args = parser.parse_args()
root = Path(args.project_dir)
folder = root / "data" / "crudos"
folder.mkdir(parents=True, exist_ok=True)
rows = [
    {"user_id": f"raw-{index}", "status": "True", "balance": "1000000"}
    for index in range(5)
]
for name in ("compradores.csv", "vendedores.csv", "administradores.csv"):
    with (folder / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
"""

FAKE_DIRTY = """
import argparse
import csv
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--project-dir", required=True)
args = parser.parse_args()
root = Path(args.project_dir)
folder = root / "data" / "sucios"
folder.mkdir(parents=True, exist_ok=True)
rows = [
    {"user_id": "admin-1", "adminType": "admin"},
    {"user_id": "admin-2", "adminType": "superadmin"},
    {"user_id": "admin-2", "adminType": "superadmin"},
]
with (folder / "administradores_sucios.csv").open(
    "w", encoding="utf-8-sig", newline=""
) as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
for name in ("compradores_sucios.csv", "vendedores_sucios.csv"):
    with (folder / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["user_id"])
        writer.writeheader()
        writer.writerow({"user_id": "dirty-1"})
"""

FAKE_CLEAN = """
import argparse
import csv
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--project-dir", required=True)
args = parser.parse_args()
root = Path(args.project_dir)
folder = root / "data" / "limpios"
folder.mkdir(parents=True, exist_ok=True)

datasets = {
    "compradores_limpios.csv": (
        ["user_id", "status", "propiedad_de_interes", "balance"],
        [
            {
                "user_id": f"buyer-{index}",
                "status": "True" if index % 2 == 0 else "False",
                "propiedad_de_interes": "casa",
                "balance": str(1000000 + index),
            }
            for index in range(7)
        ],
    ),
    "vendedores_limpios.csv": (
        ["user_id", "status", "propiedadesVendidas", "balance"],
        [
            {
                "user_id": f"seller-{index}",
                "status": "True",
                "propiedadesVendidas": "2",
                "balance": "250000000",
            }
            for index in range(6)
        ],
    ),
    "administradores_limpios.csv": (
        ["user_id", "adminType"],
        [
            {"user_id": "admin-1", "adminType": "admin"},
            {"user_id": "admin-2", "adminType": "superadmin"},
        ],
    ),
}

for name, (headers, rows) in datasets.items():
    with (folder / name).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
"""


def write_csv(path: Path, headers: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def build_live_dataset(root: Path) -> None:
    write_csv(
        root / "data" / "limpios" / "compradores_limpios.csv",
        ["user_id", "status", "propiedad_de_interes", "balance"],
        [
            {
                "user_id": "old-buyer-1",
                "status": "true",
                "propiedad_de_interes": "casa",
                "balance": "120000000",
            },
            {
                "user_id": "old-buyer-2",
                "status": "false",
                "propiedad_de_interes": "apartamento",
                "balance": "80000000",
            },
        ],
    )
    write_csv(
        root / "data" / "limpios" / "vendedores_limpios.csv",
        ["user_id", "status", "propiedadesVendidas", "balance"],
        [
            {
                "user_id": "old-seller-1",
                "status": "True",
                "propiedadesVendidas": "3",
                "balance": "250000000",
            }
        ],
    )
    write_csv(
        root / "data" / "limpios" / "administradores_limpios.csv",
        ["user_id", "adminType"],
        [
            {"user_id": "old-admin-1", "adminType": "admin"},
            {"user_id": "old-admin-2", "adminType": "superadmin"},
        ],
    )
    write_csv(
        root / "data" / "sucios" / "administradores_sucios.csv",
        ["user_id", "adminType"],
        [
            {"user_id": "old-admin-1", "adminType": "admin"},
            {"user_id": "old-admin-2", "adminType": "superadmin"},
            {"user_id": "old-admin-2", "adminType": "superadmin"},
        ],
    )


def write_pipeline(root: Path) -> None:
    source = root / "src"
    source.mkdir(parents=True, exist_ok=True)
    (source / "simular_datos.py").write_text(FAKE_SIMULATE, encoding="utf-8")
    (source / "ensuciar_datos.py").write_text(FAKE_DIRTY, encoding="utf-8")
    (source / "limpiar_datos.py").write_text(FAKE_CLEAN, encoding="utf-8")


@pytest.fixture
def rerun_project(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    root = tmp_path / "simulator"
    write_pipeline(root)
    build_live_dataset(root)
    monkeypatch.setenv("SIMULATION_DIR", str(root))
    monkeypatch.setenv("SIMULATION_TIMEOUT_SECONDS", "30")
    monkeypatch.delenv("SIMULATION_PYTHON", raising=False)
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)
    return root


def read_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def test_rerun_regenerates_the_live_dataset(rerun_project: Path) -> None:
    response = client.post("/api/simulation/rerun")

    assert response.status_code == 200
    payload = response.json()
    assert payload["totals"] == {
        "buyers": 7,
        "sellers": 6,
        "admins": 2,
        "rawAdminRows": 3,
    }
    assert payload["run"]["steps"] == 3
    assert payload["run"]["files"] == 9
    assert payload["run"]["durationMs"] >= 0
    assert payload["generatedAt"]

    buyers = read_rows(
        rerun_project / "data" / "limpios" / "compradores_limpios.csv"
    )
    assert len(buyers) == 7
    assert buyers[0]["user_id"] == "buyer-0"
    assert not list(rerun_project.glob(".simulation-run-*"))


def test_rerun_keeps_the_live_dataset_when_a_stage_fails(
    rerun_project: Path,
) -> None:
    (rerun_project / "src" / "ensuciar_datos.py").write_text(
        "raise SystemExit(2)\n",
        encoding="utf-8",
    )

    response = client.post("/api/simulation/rerun")

    assert response.status_code == 503
    assert "ensuciar" in response.json()["detail"]
    assert "código 2" in response.json()["detail"]

    buyers = read_rows(
        rerun_project / "data" / "limpios" / "compradores_limpios.csv"
    )
    assert len(buyers) == 2
    assert buyers[0]["user_id"] == "old-buyer-1"
    assert not list(rerun_project.glob(".simulation-run-*"))


def test_rerun_keeps_the_live_dataset_when_generated_csvs_are_invalid(
    rerun_project: Path,
) -> None:
    (rerun_project / "src" / "limpiar_datos.py").write_text(
        """
import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--project-dir", required=True)
args = parser.parse_args()
folder = Path(args.project_dir) / "data" / "limpios"
folder.mkdir(parents=True, exist_ok=True)
for name in (
    "compradores_limpios.csv",
    "vendedores_limpios.csv",
    "administradores_limpios.csv",
):
    (folder / name).write_text("", encoding="utf-8")
""",
        encoding="utf-8",
    )

    response = client.post("/api/simulation/rerun")

    assert response.status_code == 503
    assert "no son válidos" in response.json()["detail"]

    buyers = read_rows(
        rerun_project / "data" / "limpios" / "compradores_limpios.csv"
    )
    assert len(buyers) == 2


def test_rerun_returns_409_when_another_run_is_in_progress(
    rerun_project: Path,
) -> None:
    assert SIMULATION_LOCK.acquire(blocking=False)
    try:
        response = client.post("/api/simulation/rerun")
    finally:
        SIMULATION_LOCK.release()

    assert response.status_code == 409
    assert "simulación en curso" in response.json()["detail"]


def test_rerun_returns_503_when_the_simulator_is_missing(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("SIMULATION_DIR", str(tmp_path / "missing"))
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)

    response = client.post("/api/simulation/rerun")

    assert response.status_code == 503
    assert "src" in response.json()["detail"]


def test_rerun_requires_an_admin_token(
    rerun_project: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "demo-test")

    response = client.post("/api/simulation/rerun")

    assert response.status_code == 401
