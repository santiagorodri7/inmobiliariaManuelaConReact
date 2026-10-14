import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../services/auth.js";

export default function ProfilesPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setIsSubmitting(true);
    try {
      await iniciarSesion(email, password);
      navigate("/home.html", { replace: true });
    } catch (loginError) {
      console.error("No se pudo iniciar sesión:", loginError);
      setError(
        loginError.message === "CUENTA_DESACTIVADA"
          ? "Tu cuenta está desactivada. Contacta con la administración."
          : "No se pudo iniciar sesión. Verifica el correo y la contraseña.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="premium-card text-center" style={{ maxWidth: "400px" }}>
      <img src="img/LOGOV2.png" alt="Inmobiliaria Manuela" className="logo" />
      <h1 className="h2 mb-4 font-weight-bold" style={{ color: "#2c3e50" }}>
        Bienvenido
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="form-row text-left">
          <div className="col-12 mb-3">
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="col-12 mb-4">
            <label htmlFor="login-pass">Contraseña</label>
            <input
              id="login-pass"
              name="password"
              type="password"
              className="form-control"
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
            />
          </div>
        </div>
        {error && (
          <p className="alert alert-danger text-left" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-register btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          ¿Aún no tienes cuenta?{" "}
          <Link to="/login.html" className="auth-link">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </main>
  );
}
