"""Seed deterministic demo data into the Firebase emulator suite.

This script is intentionally restricted to emulator projects. It never
initializes against a production Firebase project.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import firebase_admin
from firebase_admin import auth, firestore
from google.auth.credentials import AnonymousCredentials

PROJECT_ID = os.environ.get("GCLOUD_PROJECT", "demo-manuela")
ADMIN_EMAIL = "admin.demo@manuela.local"
ADMIN_PASSWORD = "Demo1234!"
ADMIN_NAME = "Admin Demo"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def guard_emulator() -> None:
    if not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        fail(
            "FIRESTORE_EMULATOR_HOST no está definido. "
            "Inicia el emulador antes de sembrar datos."
        )
    if not PROJECT_ID.startswith("demo-"):
        fail(
            f"El proyecto '{PROJECT_ID}' no parece un proyecto demo. "
            "Usa un id que empiece por 'demo-'."
        )
    os.environ.setdefault("FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9099")


def initialize() -> None:
    if firebase_admin._apps:
        return
    firebase_admin.initialize_app(
        AnonymousCredentials(),
        options={"projectId": PROJECT_ID},
    )


def upsert_admin() -> str:
    try:
        user = auth.get_user_by_email(ADMIN_EMAIL)
    except auth.UserNotFoundError:
        user = auth.create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_NAME,
            email_verified=True,
        )
    print(f"Admin auth listo: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    return user.uid


def profile_payload(
    *,
    nombre: str,
    email: str,
    rol: str,
    cedula: str,
    activo: bool = True,
    created_at: datetime | None = None,
) -> dict:
    stamp = created_at or datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc)
    return {
        "nombre": nombre,
        "cedula": cedula,
        "fechaNacimiento": "1990-05-12",
        "email": email,
        "telefono": "3001234567",
        "direccion": "Medellín",
        "avatar": "",
        "rol": rol,
        "activo": activo,
        "estadoCivil": "soltero",
        "tipoContrato": "indefinido",
        "ingresosMensuales": 4500000,
        "ingresosExtras": 0,
        "aceptaTratamiento": True,
        "fechaAceptacionTratamiento": stamp,
        "fechaRegistro": stamp,
        "createdAt": stamp,
        "updatedAt": stamp,
    }


def seed_users(db, admin_uid: str) -> None:
    canonical = [
        (admin_uid, "Admin Demo", ADMIN_EMAIL, "Admin", True),
        ("demo-buyer-01", "Camila Restrepo", "camila.demo@manuela.local", "Comprador", True),
        ("demo-buyer-02", "Andrés Mejía", "andres.demo@manuela.local", "Comprador", True),
        ("demo-buyer-03", "Valentina Torres", "valentina.demo@manuela.local", "Comprador", False),
        ("demo-buyer-04", "Santiago Gómez", "santiago.demo@manuela.local", "Comprador", True),
        ("demo-buyer-05", "Laura Cárdenas", "laura.demo@manuela.local", "Comprador", False),
        ("demo-seller-01", "Manuela Bermúdez", "manuela.demo@manuela.local", "Vendedor", True),
        ("demo-seller-02", "Julián Ospina", "julian.demo@manuela.local", "Vendedor", True),
        ("demo-seller-03", "Paula Montoya", "paula.demo@manuela.local", "Vendedor", False),
        ("demo-seller-04", "Ricardo Salazar", "ricardo.demo@manuela.local", "Vendedor", True),
        ("demo-seller-05", "Diana Quintero", "diana.demo@manuela.local", "Vendedor", True),
        ("demo-seller-06", "Tomás Herrera", "tomas.demo@manuela.local", "Vendedor", True),
    ]
    for index, (uid, nombre, email, rol, activo) in enumerate(canonical):
        created = datetime(2026, 6, 1 + index, 12, 0, tzinfo=timezone.utc)
        db.collection("users").document(uid).set(
            profile_payload(
                nombre=nombre,
                email=email,
                rol=rol,
                cedula=f"100000{index:04d}",
                activo=activo,
                created_at=created,
            )
        )

    # Legacy collection: one duplicate that must be overridden by `users` and
    # two legacy-only profiles that must still appear in the admin table.
    db.collection("usuarios").document("demo-buyer-01").set(
        profile_payload(
            nombre="Camila (legacy)",
            email="camila.demo@manuela.local",
            rol="Comprador",
            cedula="1000000001",
        )
    )
    legacy_only = [
        ("demo-legacy-01", "Cliente Heredado", "legacy1@manuela.local", "Comprador"),
        ("demo-legacy-02", "Vendedor Heredado", "legacy2@manuela.local", "Vendedor"),
    ]
    for index, (uid, nombre, email, rol) in enumerate(legacy_only, start=1):
        db.collection("usuarios").document(uid).set(
            profile_payload(
                nombre=nombre,
                email=email,
                rol=rol,
                cedula=f"200000{index:04d}",
                created_at=datetime(2026, 5, index, 12, 0, tzinfo=timezone.utc),
            )
        )


def seed_properties(db) -> None:
    statuses = [
        "disponible",
        "disponible",
        "disponible",
        "disponible",
        "disponible",
        "disponible",
        "inactiva",
        "inactiva",
        "vendida",
        "vendida",
        "rentada",
        "rentada",
    ]
    operations = ["venta", "renta"]
    types = ["apartamento", "casa", "finca", "apartaestudio"]
    locations = [
        "El Poblado, Medellín",
        "Laureles, Medellín",
        "Envigado",
        "Sabaneta",
        "Bello",
        "Rionegro",
    ]
    for index, status in enumerate(statuses, start=1):
        owner_index = (index % 6) + 1
        owner_id = f"demo-seller-0{owner_index}"
        created = datetime(2026, 6, index, 10, 0, tzinfo=timezone.utc)
        db.collection("propiedades").document(f"demo-prop-{index:02d}").set(
            {
                "ownerId": owner_id,
                "ownerName": f"Vendedor Demo {owner_index}",
                "title": f"Inmueble demo {index:02d}",
                "location": locations[(index - 1) % len(locations)],
                "price": 250_000_000 + index * 35_000_000,
                "type": types[(index - 1) % len(types)],
                "operation": operations[index % 2],
                "status": status,
                "description": "Inmueble de demostración para validar el panel.",
                "bedrooms": 2 + (index % 3),
                "bathrooms": 1 + (index % 2),
                "parking": index % 2,
                "area": 70 + index * 5,
                "stratum": 3 + (index % 3),
                "amenities": ["balcón", "gimnasio"],
                "images": [],
                "imageUrl": "",
                "featured": index <= 2,
                "saleId": f"demo-sale-{index:02d}" if status in {"vendida", "rentada"} else "",
                "createdAt": created,
                "updatedAt": created,
            }
        )


def seed_sales(db, admin_uid: str) -> None:
    months = [6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
    for index, month in enumerate(months, start=1):
        day = 3 + (index % 20)
        closing = datetime(2026, month, day, 15, 0, tzinfo=timezone.utc)
        status = "anulada" if index in {5, 11} else "cerrada"
        db.collection("ventas").document(f"demo-sale-{index:02d}").set(
            {
                "propertyId": f"demo-prop-{index:02d}",
                "propertyTitle": f"Inmueble demo {index:02d}",
                "operation": "renta" if index % 3 == 0 else "venta",
                "sellerId": f"demo-seller-0{(index % 6) + 1}",
                "sellerName": f"Vendedor Demo {(index % 6) + 1}",
                "buyerId": "",
                "buyerName": f"Comprador Demo {index:02d}",
                "buyerEmail": f"buyer{index:02d}@demo.local",
                "buyerPhone": "3005556677",
                "closingValue": 180_000_000 + index * 25_000_000,
                "currency": "COP",
                "closingDate": closing,
                "status": status,
                "notes": "Cierre de demostración.",
                "createdBy": admin_uid,
                "createdAt": closing,
                "updatedAt": closing,
            }
        )


def seed_testimonials(db) -> None:
    states = ["pendiente", "pendiente", "pendiente", "pendiente", "aprobado", "aprobado", "aprobado", "aprobado", "inactivo", "inactivo", "inactivo", "inactivo"]
    for index, state in enumerate(states, start=1):
        created = datetime(2026, 6, index, 9, 0, tzinfo=timezone.utc)
        db.collection("testimonios").document(f"demo-testimonial-{index:02d}").set(
            {
                "nombre": f"Cliente Demo {index:02d}",
                "profesion": "Comprador",
                "texto": (
                    "Atención clara, acompañamiento completo y respuesta rápida "
                    f"durante todo el proceso. Testimonio {index:02d}."
                ),
                "rating": (index % 5) + 1,
                "estado": state,
                "fecha": created,
                "fechaCreacion": created,
            }
        )


def cleanup_non_seed_documents(db, admin_uid: str) -> None:
    """Delete documents created by manual or E2E testing between seed runs.

    The same emulator instance is often reused while iterating, so the seed
    must be idempotent: remove anything that is not part of the fixture.
    """
    keep = {
        "users": {admin_uid}
        | {f"demo-buyer-{index:02d}" for index in range(1, 6)}
        | {f"demo-seller-{index:02d}" for index in range(1, 7)},
        "usuarios": {"demo-buyer-01", "demo-legacy-01", "demo-legacy-02"},
        "propiedades": {f"demo-prop-{index:02d}" for index in range(1, 13)},
        "ventas": {f"demo-sale-{index:02d}" for index in range(1, 13)},
        "testimonios": {
            f"demo-testimonial-{index:02d}" for index in range(1, 13)
        },
        "auditLog": set(),
    }

    for collection_name, keep_ids in keep.items():
        removed = 0
        for document in db.collection(collection_name).stream():
            if document.id not in keep_ids:
                document.reference.delete()
                removed += 1
        if removed:
            print(f"Limpiados {removed} documentos previos en {collection_name}.")


def main() -> None:
    guard_emulator()
    initialize()
    db = firestore.client()
    admin_uid = upsert_admin()
    cleanup_non_seed_documents(db, admin_uid)
    seed_users(db, admin_uid)
    seed_properties(db)
    seed_sales(db, admin_uid)
    seed_testimonials(db)
    print("Datos demo sembrados correctamente.")
    print("Usuarios canónicos: 12")
    print("Usuarios legacy-only: 2")
    print("Propiedades: 12")
    print("Ventas: 12")
    print("Testimonios: 12")


if __name__ == "__main__":
    main()
