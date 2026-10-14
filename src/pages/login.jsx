import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrarUsuarioCompleto } from "../services/auth.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!role) {
      setError("Selecciona si deseas registrarte como comprador o vendedor.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const documentId = String(form.get("document") || "").trim();
    const birthDate = String(form.get("birthDate") || "");
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setIsSubmitting(true);
    try {
      await registrarUsuarioCompleto(email, password, {
        nombre: name,
        cedula: documentId,
        fecha: birthDate,
        rol: role,
      });
      navigate("/home.html", { replace: true });
    } catch (registrationError) {
      console.error("No se pudo registrar el usuario:", registrationError);
      setError(
        registrationError.message || "No se pudo crear la cuenta. Intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="premium-card text-center">
      <img src="img/LOGOV2.png" alt="Inmobiliaria Manuela" className="logo" />
      <h1 className="h2 mb-4 font-weight-bold" style={{ color: "#2c3e50" }}>
        Crea tu Cuenta
      </h1>

      <form onSubmit={handleSubmit}>
        <fieldset className="d-flex justify-content-between mb-4">
          <legend className="sr-only">Tipo de cuenta</legend>
          {["Comprador", "Vendedor"].map((option) => (
            <button
              key={option}
              type="button"
              className={`btn role-btn ${
                role === option ? "active" : ""
              } ${option === "Comprador" ? "comprador-btn" : "vendedor-btn"}`}
              aria-pressed={role === option}
              onClick={() => setRole(option)}
            >
              Soy {option}
            </button>
          ))}
        </fieldset>

        <div className="form-row text-left">
          <div className="col-12 mb-3">
            <label htmlFor="reg-name">Nombre Completo</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-control"
              placeholder="Tu nombre"
              autoComplete="name"
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label htmlFor="reg-id">Cédula</label>
            <input
              id="reg-id"
              name="document"
              type="text"
              className="form-control"
              placeholder="Documento"
              required
            />
          </div>
          <div className="col-6 mb-3">
            <label htmlFor="reg-birth">Nacimiento</label>
            <input
              id="reg-birth"
              name="birthDate"
              type="date"
              className="form-control"
              autoComplete="bday"
              required
            />
          </div>
          <div className="col-12 mb-3">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="col-12 mb-4">
            <label htmlFor="reg-pass">Contraseña</label>
            <input
              id="reg-pass"
              name="password"
              type="password"
              className="form-control"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              minLength={6}
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
          {isSubmitting ? "Creando cuenta..." : "Registrarme"}
        </button>
        <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/profiles.html" className="auth-link">
            Inicia Sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
