import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  eliminarUsuario,
  obtenerUsuarioActual,
  obtenerUsuarios,
  toggleEstadoUsuario,
  verificarEstadoSesion,
} from "../services/auth.js";
import { listAllProperties } from "../services/properties.js";

const isAdmin = (user) =>
  ["admin", "administrador"].includes(
    String(user?.rol || "").trim().toLocaleLowerCase("es"),
  );

function UserRow({ user, currentUserId, onToggle, onDelete, busy }) {
  const active = user.activo !== false;
  const role = String(user.rol || "No especificado");
  const roleClass = {
    comprador: "comprador",
    vendedor: "vendedor",
    admin: "admin",
    administrador: "admin",
  }[role.toLocaleLowerCase("es")] || "default";

  return (
    <tr>
      <td><strong>{user.cedula || "N/A"}</strong></td>
      <td>{user.nombre || "N/A"}</td>
      <td>{user.email || "N/A"}</td>
      <td>{user.fechaNacimiento || "N/A"}</td>
      <td>{user.fechaRegistro || "N/A"}</td>
      <td><span className={`badge ${roleClass}`}>{role}</span></td>
      <td className="text-center">
        <span className={`badge-estado ${active ? "activo" : "inactivo"}`}>
          {active ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            type="button"
            className={`btn-toggle ${
              active ? "btn-desactivar" : "btn-activar"
            }`}
            title={active ? "Desactivar cuenta" : "Activar cuenta"}
            aria-label={active ? "Desactivar cuenta" : "Activar cuenta"}
            disabled={busy || user.id === currentUserId}
            onClick={() => onToggle(user)}
          >
            <i className={`fas ${active ? "fa-user-slash" : "fa-user-check"}`} />
          </button>
          <button
            type="button"
            className="btn-delete"
            title="Eliminar usuario"
            aria-label="Eliminar usuario"
            disabled={busy || user.id === currentUserId}
            onClick={() => onDelete(user)}
          >
            <i className="fas fa-trash-alt" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDates, setAppliedDates] = useState({ from: "", to: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = verificarEstadoSesion(async (firebaseUser) => {
      if (!active) return;
      if (!firebaseUser) {
        navigate("/profiles.html", { replace: true });
        return;
      }

      try {
        const profile = await obtenerUsuarioActual();
        if (!active) return;
        if (!isAdmin(profile)) {
          navigate("/home.html", { replace: true });
          return;
        }
        setCurrentUser(profile);
        const [loadedUsers, properties] = await Promise.all([
          obtenerUsuarios(),
          listAllProperties(),
        ]);
        if (active) {
          setUsers(loadedUsers);
          setPropertiesCount(properties.length);
          setError("");
        }
      } catch (loadError) {
        console.error("No se pudo cargar el panel administrativo:", loadError);
        if (active) setError("No se pudieron cargar los datos. Intenta de nuevo.");
      } finally {
        if (active) setIsLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return users.filter((user) => {
      const searchable = [user.nombre, user.email, user.cedula]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("es").includes(term));
      const registered = user.fechaRegistro || "";
      return (
        searchable &&
        (!appliedDates.from || registered >= appliedDates.from) &&
        (!appliedDates.to || registered <= appliedDates.to)
      );
    });
  }, [users, search, appliedDates]);

  const handleDateFilter = (event) => {
    event.preventDefault();
    if (!dateFrom && !dateTo) {
      setError("Selecciona al menos una fecha para filtrar.");
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setError("La fecha inicial no puede ser posterior a la fecha final.");
      return;
    }
    setError("");
    setAppliedDates({ from: dateFrom, to: dateTo });
  };

  const handleToggle = async (user) => {
    const nextActive = user.activo === false;
    const action = nextActive ? "activar" : "desactivar";
    if (!window.confirm(`¿Deseas ${action} la cuenta de ${user.nombre || user.email}?`)) {
      return;
    }
    setBusyUserId(user.id);
    try {
      await toggleEstadoUsuario(user.id, nextActive);
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, activo: nextActive } : item,
        ),
      );
    } catch (actionError) {
      console.error("No se pudo cambiar el estado de la cuenta:", actionError);
      setError(actionError.message || "No se pudo actualizar la cuenta.");
    } finally {
      setBusyUserId("");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar permanentemente a ${user.nombre || user.email}?`)) {
      return;
    }
    setBusyUserId(user.id);
    try {
      await eliminarUsuario(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (actionError) {
      console.error("No se pudo eliminar el usuario:", actionError);
      setError(actionError.message || "No se pudo eliminar el usuario.");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <main className="dashboard-container container-fluid p-4">
      <header className="header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">
          <i className="fas fa-users-cog" /> Panel de Administración{" "}
          <span className="badge-admin-title ml-2">Admin</span>
        </h1>
        <div className="d-flex gap-2">
          <Link
            to="/reporteVentas.html"
            className="btn btn-success fw-bold text-decoration-none"
          >
            <i className="fas fa-chart-line" /> Reporte de Ventas
          </Link>
          <Link to="/home.html" className="btn-home">
            <i className="fas fa-arrow-left" /> Volver
          </Link>
        </div>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <section className="row g-4 mb-4" aria-label="Resumen">
        {[
          ["Inmuebles Activos", propertiesCount, "fa-home", "#2563eb"],
          ["Usuarios Registrados", users.length, "fa-users", "#8b5cf6"],
        ].map(([label, count, icon, color]) => (
          <div className="col-12 col-sm-6 col-lg-3" key={label}>
            <article
              className="card h-100 border-0 shadow-sm p-3 stat-card"
              style={{ borderLeft: `5px solid ${color}` }}
            >
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="text-muted text-uppercase small fw-bold">{label}</h2>
                  <p className="h3 fw-bold text-dark m-0">{count}</p>
                </div>
                <i className={`fas ${icon} fa-2x`} style={{ color }} />
              </div>
            </article>
          </div>
        ))}
      </section>

      <section className="filter-section mb-4">
        <h2 className="h5 fw-bold mb-3 text-secondary">
          <i className="fas fa-filter me-2" /> Filtrar por fecha de registro
        </h2>
        <form className="row g-3 align-items-end" onSubmit={handleDateFilter}>
          <div className="col-12 col-md-4">
            <label htmlFor="fecha-desde" className="form-label">Fecha desde</label>
            <input
              id="fecha-desde"
              type="date"
              className="form-control date-input"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-4">
            <label htmlFor="fecha-hasta" className="form-label">Fecha hasta</label>
            <input
              id="fecha-hasta"
              type="date"
              className="form-control date-input"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
            />
          </div>
          <div className="col-12 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-filtrar w-100">Filtrar</button>
            <button
              type="button"
              className="btn btn-limpiar w-100"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setAppliedDates({ from: "", to: "" });
                setError("");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <div className="row mb-4">
        <div className="col-12">
          <label className="sr-only" htmlFor="search-input">Buscar usuarios</label>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white text-muted">
              <i className="fas fa-search" />
            </span>
            <input
              id="search-input"
              type="search"
              className="form-control"
              placeholder="Buscar por nombre, correo o cédula..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setSearch("")}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <section className="card border-0 shadow-sm p-4">
        <h2 className="h5 fw-bold mb-3 text-secondary">Usuarios Registrados</h2>
        <div className="table-wrapper table-responsive">
          <table>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Fecha de Nac.</th>
                <th>Fecha Registro</th>
                <th>Rol</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="loading">Cargando usuarios...</td></tr>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    busy={busyUserId === user.id}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-5">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
