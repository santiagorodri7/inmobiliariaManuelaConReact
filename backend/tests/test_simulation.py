from __future__ import annotations

import csv
from pathlib import Path

import pytest

from backend.app.simulation import SimulationDataError, load_overview


def write_csv(path: Path, headers: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def build_dataset(
    root: Path,
    *,
    buyers: list[dict] | None = None,
    sellers: list[dict] | None = None,
    admins: list[dict] | None = None,
    dirty_admins: list[dict] | None = None,
) -> None:
    buyer_headers = [
        "user_id",
        "password",
        "nombre",
        "telefono",
        "correo",
        "status",
        "propiedad_de_interes",
        "balance",
    ]
    seller_headers = [
        "user_id",
        "password",
        "nombre",
        "telefono",
        "correo",
        "status",
        "propiedadesVendidas",
        "balance",
    ]
    admin_headers = ["user_id", "adminType"]

    write_csv(
        root / "data" / "limpios" / "compradores_limpios.csv",
        buyer_headers,
        buyers or [],
    )
    write_csv(
        root / "data" / "limpios" / "vendedores_limpios.csv",
        seller_headers,
        sellers or [],
    )
    write_csv(
        root / "data" / "limpios" / "administradores_limpios.csv",
        admin_headers,
        admins or [],
    )
    write_csv(
        root / "data" / "sucios" / "administradores_sucios.csv",
        admin_headers,
        dirty_admins or [],
    )


def buyer(user_id: str, **overrides) -> dict:
    row = {
        "user_id": user_id,
        "password": "secret",
        "nombre": f"Persona {user_id}",
        "telefono": "3000000000",
        "correo": f"{user_id}@example.com",
        "status": "True",
        "propiedad_de_interes": "casa",
        "balance": "60000000",
    }
    row.update(overrides)
    return row


def seller(user_id: str, **overrides) -> dict:
    row = {
        "user_id": user_id,
        "password": "secret",
        "nombre": f"Vendedor {user_id}",
        "telefono": "3000000000",
        "correo": f"{user_id}@example.com",
        "status": "True",
        "propiedadesVendidas": "2",
        "balance": "60000000",
    }
    row.update(overrides)
    return row


def test_balance_bins_follow_python_step_rule(tmp_path: Path) -> None:
    buyers = [
        buyer("b1", balance="10000000"),
        buyer("b2", balance="60000000"),
        buyer("b3", balance="120000000"),
        buyer("b4", balance="260000000"),
    ]
    build_dataset(tmp_path, buyers=buyers)

    overview = load_overview(tmp_path)

    assert overview["charts"]["buyerBalances"]["bins"] == [
        {"from": 0, "to": 50, "count": 1},
        {"from": 50, "to": 100, "count": 1},
        {"from": 100, "to": 150, "count": 1},
        {"from": 150, "to": 200, "count": 0},
        {"from": 200, "to": 250, "count": 0},
        {"from": 250, "to": 300, "count": 1},
    ]
    assert overview["charts"]["buyerBalances"]["total"] == 4
    assert overview["charts"]["buyerBalances"]["excluded"] == 0


def test_balance_bins_exclude_non_numeric_values(tmp_path: Path) -> None:
    buyers = [
        buyer("b1", balance="60000000"),
        buyer("b2", balance="no disponible"),
        buyer("b3", balance=""),
    ]
    build_dataset(tmp_path, buyers=buyers)

    overview = load_overview(tmp_path)

    assert overview["charts"]["buyerBalances"]["total"] == 1
    assert overview["charts"]["buyerBalances"]["excluded"] == 2


def test_status_normalization_is_case_insensitive_and_tolerant(tmp_path: Path) -> None:
    buyers = [
        buyer("b1", status="true"),
        buyer("b2", status="SI"),
        buyer("b3", status="1"),
        buyer("b4", status="false"),
        buyer("b5", status="No"),
        buyer("b6", status="0"),
        buyer("b7", status=""),
        buyer("b8", status="desconocido"),
    ]
    build_dataset(tmp_path, buyers=buyers)

    overview = load_overview(tmp_path)
    by_key = {item["key"]: item["value"] for item in overview["charts"]["buyerStatus"]}

    assert by_key == {"active": 3, "inactive": 3, "unknown": 2}


def test_interests_and_sold_properties_are_aggregated(tmp_path: Path) -> None:
    buyers = [
        buyer("b1", propiedad_de_interes="casa"),
        buyer("b2", propiedad_de_interes="casa"),
        buyer("b3", propiedad_de_interes="apartamento"),
        buyer("b4", propiedad_de_interes=" "),
    ]
    sellers = [
        seller("s1", propiedadesVendidas="0"),
        seller("s2", propiedadesVendidas="10"),
        seller("s3", propiedadesVendidas="2"),
        seller("s4", propiedadesVendidas="2"),
    ]
    build_dataset(tmp_path, buyers=buyers, sellers=sellers)

    overview = load_overview(tmp_path)

    assert overview["charts"]["buyerInterests"] == [
        {"key": "apartamento", "value": 1},
        {"key": "unknown", "value": 1},
        {"key": "casa", "value": 2},
    ]
    assert overview["charts"]["sellerSoldProperties"] == [
        {"key": "0", "value": 1},
        {"key": "2", "value": 2},
        {"key": "10", "value": 1},
    ]


def test_admin_types_and_quality_counts(tmp_path: Path) -> None:
    admins = [
        {"user_id": "a1", "adminType": "admin"},
        {"user_id": "a2", "adminType": "SUPERADMIN"},
        {"user_id": "a3", "adminType": "otro"},
        {"user_id": "a3", "adminType": "admin"},
    ]
    dirty_admins = [
        {"user_id": "a1", "adminType": "admin"},
        {"user_id": "a2", "adminType": "superadmin"},
        {"user_id": "a2", "adminType": "superadmin"},
        {"user_id": "a3", "adminType": "otro"},
        {"user_id": "a4", "adminType": "admin"},
        {"user_id": "", "adminType": "admin"},
    ]
    build_dataset(tmp_path, admins=admins, dirty_admins=dirty_admins)

    overview = load_overview(tmp_path)

    assert overview["charts"]["adminTypes"] == [
        {"key": "admin", "value": 2},
        {"key": "invalid", "value": 1},
        {"key": "superadmin", "value": 1},
    ]
    assert overview["charts"]["adminTypeShare"] == [
        {"key": "admin", "value": 2},
        {"key": "invalid", "value": 1},
        {"key": "superadmin", "value": 1},
    ]
    # pandas reads empty CSV fields as NaN, so the report excludes them from
    # the unique-id count. The fixture has a1, a2, a3, a4 and one blank.
    assert overview["charts"]["adminQuality"] == [
        {"key": "rawRows", "value": 6},
        {"key": "rawUniqueIds", "value": 4},
        {"key": "cleanAdmins", "value": 3},
    ]


def test_missing_required_file_raises_clear_error(tmp_path: Path) -> None:
    build_dataset(tmp_path)
    (tmp_path / "data" / "limpios" / "compradores_limpios.csv").unlink()

    with pytest.raises(SimulationDataError, match="compradores_limpios.csv"):
        load_overview(tmp_path)


def test_real_datasets_if_available() -> None:
    root = Path(__file__).resolve().parents[2] / "integrador_nt_Manuela_Bermudez_Reaktor"
    clean = root / "data" / "limpios" / "compradores_limpios.csv"
    if not clean.is_file():
        pytest.skip("Los CSV del simulador no están disponibles en este entorno.")

    overview = load_overview(root)

    assert overview["totals"]["buyers"] == 300
    assert overview["totals"]["sellers"] == 300
    assert overview["totals"]["admins"] == 300
    assert overview["totals"]["rawAdminRows"] == 315
    assert sum(item["value"] for item in overview["charts"]["buyerStatus"]) == 300
    assert sum(item["value"] for item in overview["charts"]["sellerStatus"]) == 300
    assert sum(
        item["value"] for item in overview["charts"]["sellerSoldProperties"]
    ) == 300
