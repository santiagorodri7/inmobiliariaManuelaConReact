"""Validate the Excel workbooks downloaded by the Playwright suite."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from openpyxl import load_workbook

EXPECTED_HEADERS = {
    "Usuarios": [
        "Nombre",
        "Cédula",
        "Correo",
        "Teléfono",
        "Rol",
        "Estado",
        "Fecha de nacimiento",
        "Fecha de registro",
    ],
    "Propiedades": [
        "Título",
        "Operación",
        "Tipo",
        "Estado",
        "Precio (COP)",
        "Ubicación",
        "Habitaciones",
        "Baños",
        "Parqueaderos",
        "Área (m²)",
        "Propietario",
        "Fecha de registro",
    ],
    "Ventas": [
        "Propiedad",
        "Operación",
        "Vendedor",
        "Comprador / arrendatario",
        "Correo comprador",
        "Teléfono comprador",
        "Valor (COP)",
        "Fecha de cierre",
        "Estado",
        "Notas",
    ],
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def read_sheet(workbook, sheet_name: str) -> tuple[list, int]:
    if sheet_name not in workbook.sheetnames:
        fail(f"Falta la hoja '{sheet_name}'. Hojas: {workbook.sheetnames}")
    sheet = workbook[sheet_name]
    rows = [
        row
        for row in sheet.iter_rows(values_only=True)
        if any(cell not in (None, "") for cell in row)
    ]
    if not rows:
        fail(f"La hoja '{sheet_name}' está vacía.")
    header = [str(cell or "").strip() for cell in rows[0]]
    expected = EXPECTED_HEADERS[sheet_name]
    if header != expected:
        fail(
            f"Encabezados inesperados en '{sheet_name}'.\n"
            f"Esperado: {expected}\nRecibido: {header}"
        )
    return header, len(rows) - 1


def validate(path: Path, expected: dict[str, int | None]) -> None:
    if not path.is_file():
        fail(f"No existe el archivo {path}")
    workbook = load_workbook(path, read_only=True, data_only=True)
    names = workbook.sheetnames

    if set(names) == set(EXPECTED_HEADERS):
        counts = {name: read_sheet(workbook, name)[1] for name in names}
        suffix = ", ".join(f"{name}={count}" for name, count in counts.items())
        print(f"OK {path.name}: libro completo ({suffix})")
    elif len(names) == 1:
        name = names[0]
        if name not in EXPECTED_HEADERS:
            fail(f"Hoja desconocida '{name}' en {path.name}")
        counts = {name: read_sheet(workbook, name)[1]}
        print(f"OK {path.name}: hoja {name} ({counts[name]} filas)")
    else:
        fail(f"Hojas inesperadas en {path.name}: {names}")

    for name, count in counts.items():
        wanted = expected.get(name)
        if wanted is not None and count != wanted:
            fail(
                f"{path.name}: '{name}' tiene {count} filas; "
                f"se esperaban {wanted}."
            )

    workbook.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Valida los Excel del panel admin.")
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--expected-users", type=int)
    parser.add_argument("--expected-properties", type=int)
    parser.add_argument("--expected-sales", type=int)
    args = parser.parse_args()

    expected = {
        "Usuarios": args.expected_users,
        "Propiedades": args.expected_properties,
        "Ventas": args.expected_sales,
    }
    for path in args.files:
        validate(path, expected)


if __name__ == "__main__":
    main()
