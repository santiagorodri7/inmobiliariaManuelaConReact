from __future__ import annotations

import csv
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import auth as auth_module
from backend.app.main import app

client = TestClient(app)


def write_csv(path: Path, headers: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def build_dataset(root: Path) -> None:
    write_csv(
        root / "data" / "limpios" / "compradores_limpios.csv",
        [
            "user_id",
            "status",
            "propiedad_de_interes",
            "balance",
        ],
        [
            {"user_id": "b1", "status": "true", "propiedad_de_interes": "casa", "balance": "120000000"},
            {"user_id": "b2", "status": "false", "propiedad_de_interes": "apartamento", "balance": "80000000"},
        ],
    )
    write_csv(
        root / "data" / "limpios" / "vendedores_limpios.csv",
        ["user_id", "status", "propiedadesVendidas", "balance"],
        [
            {"user_id": "s1", "status": "True", "propiedadesVendidas": "3", "balance": "250000000"},
        ],
    )
    write_csv(
        root / "data" / "limpios" / "administradores_limpios.csv",
        ["user_id", "adminType"],
        [
            {"user_id": "a1", "adminType": "admin"},
            {"user_id": "a2", "adminType": "superadmin"},
        ],
    )
    write_csv(
        root / "data" / "sucios" / "administradores_sucios.csv",
        ["user_id", "adminType"],
        [
            {"user_id": "a1", "adminType": "admin"},
            {"user_id": "a2", "adminType": "superadmin"},
            {"user_id": "a2", "adminType": "superadmin"},
        ],
    )


@pytest.fixture
def dataset(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    root = tmp_path / "simulation"
    build_dataset(root)
    monkeypatch.setenv("SIMULATION_DIR", str(root))
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)
    return root


def test_health_reports_local_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "authMode": "local"}


def test_overview_is_available_in_local_mode(dataset: Path) -> None:
    response = client.get("/api/simulation/overview")

    assert response.status_code == 200
    payload = response.json()
    assert payload["totals"] == {
        "buyers": 2,
        "sellers": 1,
        "admins": 2,
        "rawAdminRows": 3,
    }
    assert payload["charts"]["buyerStatus"] == [
        {"key": "active", "value": 1},
        {"key": "inactive", "value": 1},
    ]
    assert payload["charts"]["adminQuality"] == [
        {"key": "rawRows", "value": 3},
        {"key": "rawUniqueIds", "value": 2},
        {"key": "cleanAdmins", "value": 2},
    ]


def test_missing_csv_returns_503_with_file_name(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("SIMULATION_DIR", str(tmp_path))
    monkeypatch.delenv("FIREBASE_PROJECT_ID", raising=False)

    response = client.get("/api/simulation/overview")

    assert response.status_code == 503
    assert "compradores_limpios.csv" in response.json()["detail"]


def test_firebase_mode_requires_a_bearer_token(
    dataset: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "demo-test")

    response = client.get("/api/simulation/overview")

    assert response.status_code == 401


def test_non_admin_token_is_forbidden(
    dataset: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "demo-test")
    monkeypatch.setattr(
        auth_module,
        "_verify_token",
        lambda token: {"uid": "buyer-1", "email": "buyer@example.com"},
    )
    monkeypatch.setattr(
        auth_module,
        "_lookup_role",
        lambda uid: {"rol": "Comprador", "activo": True},
    )

    response = client.get(
        "/api/simulation/overview",
        headers={"Authorization": "Bearer fake-token"},
    )

    assert response.status_code == 403


def test_admin_token_can_read_the_overview(
    dataset: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "demo-test")
    monkeypatch.setattr(
        auth_module,
        "_verify_token",
        lambda token: {"uid": "admin-1", "email": "admin@example.com"},
    )
    monkeypatch.setattr(
        auth_module,
        "_lookup_role",
        lambda uid: {"rol": "Administrador", "activo": True},
    )

    response = client.get(
        "/api/simulation/overview",
        headers={"Authorization": "Bearer fake-token"},
    )

    assert response.status_code == 200
    assert response.json()["totals"]["buyers"] == 2


def test_inactive_admin_is_forbidden(
    dataset: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("FIREBASE_PROJECT_ID", "demo-test")
    monkeypatch.setattr(
        auth_module,
        "_verify_token",
        lambda token: {"uid": "admin-1"},
    )
    monkeypatch.setattr(
        auth_module,
        "_lookup_role",
        lambda uid: {"rol": "Admin", "activo": False},
    )

    response = client.get(
        "/api/simulation/overview",
        headers={"Authorization": "Bearer fake-token"},
    )

    assert response.status_code == 403
