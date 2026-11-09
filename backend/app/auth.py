"""Firebase authentication for the simulation API.

Local development mode (no ``FIREBASE_PROJECT_ID``) intentionally skips
authentication so the dashboard can be exercised without credentials. That
mode must never be exposed publicly.
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import firebase_admin
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import credentials, firestore

from .config import get_firebase_project_id, get_firebase_service_account

ADMIN_ROLES = {"Admin", "Administrador"}
bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AdminIdentity:
    """Authenticated admin returned by the dependency."""

    uid: str
    email: str
    mode: str


def _emulator_mode() -> bool:
    return bool(
        os.environ.get("FIREBASE_AUTH_EMULATOR_HOST")
        or os.environ.get("FIRESTORE_EMULATOR_HOST")
    )


def _ensure_app() -> None:
    if firebase_admin._apps:
        return

    project_id = get_firebase_project_id()
    service_account = get_firebase_service_account()
    if service_account:
        credential = credentials.Certificate(service_account)
    elif _emulator_mode():
        from google.auth.credentials import AnonymousCredentials

        credential = AnonymousCredentials()
    else:
        credential = None

    options = {"projectId": project_id} if project_id else None
    firebase_admin.initialize_app(credential, options=options)


def _verify_token(token: str) -> dict:
    """Verify a Firebase ID token, including unsigned emulator tokens."""
    if os.environ.get("FIREBASE_AUTH_EMULATOR_HOST"):
        return jwt.decode(
            token,
            options={
                "verify_signature": False,
                "verify_aud": False,
            },
        )

    _ensure_app()
    return firebase_admin.auth.verify_id_token(token)


def _lookup_role(uid: str) -> dict:
    """Read the canonical profile, falling back to the legacy collection."""
    _ensure_app()
    database = firestore.client()
    for collection_name in ("users", "usuarios"):
        snapshot = database.collection(collection_name).document(uid).get()
        if snapshot.exists:
            return snapshot.to_dict() or {}
    return {}


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_admin(
    credentials_header: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AdminIdentity:
    """Return the authenticated admin or raise 401/403."""
    project_id = get_firebase_project_id()
    if not project_id:
        return AdminIdentity(uid="local-dev", email="", mode="local")

    if (
        credentials_header is None
        or credentials_header.scheme.lower() != "bearer"
        or not credentials_header.credentials
    ):
        raise _unauthorized("missing_token")

    try:
        claims = _verify_token(credentials_header.credentials)
    except Exception as error:  # noqa: BLE001 - map every verifier failure to 401
        raise _unauthorized("invalid_token") from error

    uid = str(claims.get("uid") or claims.get("sub") or "").strip()
    if not uid:
        raise _unauthorized("invalid_token")

    profile = _lookup_role(uid)
    role = str(profile.get("rol") or profile.get("role") or "")
    if role not in ADMIN_ROLES or profile.get("activo") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="admin_required",
        )

    email = str(claims.get("email") or profile.get("email") or "")
    return AdminIdentity(uid=uid, email=email, mode="firebase")
