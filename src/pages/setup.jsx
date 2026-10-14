import React from "react";
import { Link } from "react-router-dom";

export default function SetupPage() {
  return (
    <main className="container py-5">
      <h1>Configuración administrativa</h1>
      <p>
        Por seguridad, la creación de cuentas administrativas debe realizarse
        desde un entorno seguro de Firebase y no desde el navegador.
      </p>
      <Link className="btn btn-primary" to="/profiles.html">
        Ir al inicio de sesión
      </Link>
    </main>
  );
}
