"""Aggregations that mirror the Python simulation reports.

The source of truth is ``integrador_nt_Manuela_Bermudez_Reaktor/src/reporte_datos.py``.
This module reads the generated CSV files with the standard library and
returns JSON-friendly structures for the React admin charts.
"""

from __future__ import annotations

import csv
import math
from bisect import bisect_right
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from .config import get_simulation_dir


class SimulationDataError(Exception):
    """Raised when the simulation CSV files are missing or malformed."""


BUYER_REQUIRED_COLUMNS = ("status", "propiedad_de_interes", "balance")
SELLER_REQUIRED_COLUMNS = ("status", "propiedadesVendidas", "balance")
ADMIN_REQUIRED_COLUMNS = ("user_id", "adminType")

STATUS_KEYS = {
    "true": "active",
    "si": "active",
    "1": "active",
    "false": "inactive",
    "no": "inactive",
    "0": "inactive",
}
ADMIN_TYPE_KEYS = {"admin": "admin", "superadmin": "superadmin"}


def _read_csv(path: Path, required_columns: Iterable[str]) -> list[dict[str, str]]:
    if not path.is_file():
        raise SimulationDataError(
            f"No se encontró el archivo requerido: {path.name}"
        )
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            fieldnames = reader.fieldnames or []
            missing = [column for column in required_columns if column not in fieldnames]
            if missing:
                raise SimulationDataError(
                    f"El archivo {path.name} no tiene las columnas: "
                    f"{', '.join(missing)}"
                )
            return [dict(row) for row in reader]
    except UnicodeDecodeError as error:
        raise SimulationDataError(
            f"No se pudo leer {path.name} como UTF-8: {error}"
        ) from error


def _parse_number(raw: str | None) -> float | None:
    value = (raw or "").strip()
    if not value:
        return None
    try:
        number = float(value)
    except ValueError:
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def _balance_summary(
    rows: list[dict[str, str]], column: str = "balance"
) -> dict:
    balances: list[float] = []
    for row in rows:
        number = _parse_number(row.get(column))
        if number is not None:
            balances.append(number)

    excluded = len(rows) - len(balances)
    if not balances:
        return {"total": 0, "excluded": excluded, "bins": []}

    millions = [value / 1_000_000 for value in balances]
    minimum = min(millions)
    maximum = max(millions)
    amplitude = maximum - minimum
    step = max(50.0, math.ceil(amplitude / 10 / 50) * 50)
    start = math.floor(minimum / step) * step
    end = math.floor(maximum / step) * step + step

    edges: list[float] = []
    value = start
    while value < end + step:
        edges.append(value)
        value += step

    counts = [0] * max(0, len(edges) - 1)
    for million in millions:
        index = bisect_right(edges, million) - 1
        if index >= len(counts):
            index = len(counts) - 1
        if 0 <= index < len(counts):
            counts[index] += 1

    bins = [
        {
            "from": int(round(edges[index])),
            "to": int(round(edges[index + 1])),
            "count": counts[index],
        }
        for index in range(len(counts))
    ]
    return {"total": len(balances), "excluded": excluded, "bins": bins}


def _status_counts(rows: list[dict[str, str]]) -> list[dict]:
    counts = {"active": 0, "inactive": 0, "unknown": 0}
    for row in rows:
        raw = (row.get("status") or "").strip().lower()
        counts[STATUS_KEYS.get(raw, "unknown")] += 1
    return [
        {"key": key, "value": value}
        for key, value in counts.items()
        if value > 0
    ]


def _interest_counts(rows: list[dict[str, str]]) -> list[dict]:
    counts: dict[str, int] = {}
    for row in rows:
        raw = (row.get("propiedad_de_interes") or "").strip()
        key = raw or "unknown"
        counts[key] = counts.get(key, 0) + 1
    ordered = sorted(counts.items(), key=lambda item: (item[1], item[0]))
    return [{"key": key, "value": value} for key, value in ordered]


def _sold_properties(rows: list[dict[str, str]]) -> list[dict]:
    counts: dict[int, int] = {}
    for row in rows:
        number = _parse_number(row.get("propiedadesVendidas"))
        if number is None:
            continue
        key = int(number)
        counts[key] = counts.get(key, 0) + 1
    return [
        {"key": str(key), "value": counts[key]}
        for key in sorted(counts)
    ]


def _admin_type_counts(rows: list[dict[str, str]]) -> list[dict]:
    counts: dict[str, int] = {}
    for row in rows:
        raw = (row.get("adminType") or "").strip().lower()
        key = ADMIN_TYPE_KEYS.get(raw, "invalid")
        counts[key] = counts.get(key, 0) + 1
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [{"key": key, "value": value} for key, value in ordered]


def _unique_ids(rows: list[dict[str, str]]) -> int:
    # pandas converts empty CSV fields to NaN and dropna() removes them,
    # so blanks do not count as identifiers in the Python report.
    return len(
        {
            (row.get("user_id") or "").strip()
            for row in rows
            if (row.get("user_id") or "").strip()
        }
    )


def load_overview(root: Path | None = None) -> dict:
    """Load the simulation CSVs and return the admin overview payload."""
    base = Path(root) if root is not None else get_simulation_dir()
    clean_dir = base / "data" / "limpios"
    dirty_dir = base / "data" / "sucios"

    buyers = _read_csv(clean_dir / "compradores_limpios.csv", BUYER_REQUIRED_COLUMNS)
    sellers = _read_csv(clean_dir / "vendedores_limpios.csv", SELLER_REQUIRED_COLUMNS)
    admins = _read_csv(
        clean_dir / "administradores_limpios.csv", ADMIN_REQUIRED_COLUMNS
    )
    dirty_admins = _read_csv(
        dirty_dir / "administradores_sucios.csv", ADMIN_REQUIRED_COLUMNS
    )

    admin_types = _admin_type_counts(admins)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totals": {
            "buyers": len(buyers),
            "sellers": len(sellers),
            "admins": len(admins),
            "rawAdminRows": len(dirty_admins),
        },
        "charts": {
            "buyerBalances": _balance_summary(buyers),
            "buyerStatus": _status_counts(buyers),
            "buyerInterests": _interest_counts(buyers),
            "sellerBalances": _balance_summary(sellers),
            "sellerStatus": _status_counts(sellers),
            "sellerSoldProperties": _sold_properties(sellers),
            "adminTypes": admin_types,
            "adminTypeShare": [dict(item) for item in admin_types],
            "adminQuality": [
                {"key": "rawRows", "value": len(dirty_admins)},
                {"key": "rawUniqueIds", "value": _unique_ids(dirty_admins)},
                {"key": "cleanAdmins", "value": _unique_ids(admins)},
            ],
        },
    }
