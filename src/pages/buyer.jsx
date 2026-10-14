import React, { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  actualizarUsuario,
  cambiarPassword,
  cerrarSesion,
  eliminarCuentaUsuario,
  obtenerUsuarioActual,
} from "../services/auth.js";
import { listPropertiesByUser } from "../services/properties.js";

export default function BuyerPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const navigate = useNavigate();
  const avatarInput = useRef(null);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [profile, setProfile] = useState({ nombre: "", telefono: "", email: "", direccion: "" });
  const [avatar, setAvatar] = useState("");
  const [preferences, setPreferences] = useState({ zona: "Zonas de Interés en Medellín", presupuesto: 250000000 });
  const [notifications, setNotifications] = useState({ email: false, push: false, whatsapp: false });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  useEffect(() => {
    let active = true;
    obtenerUsuarioActual()
      .then((currentUser) => {
        if (!active) return;
        if (!currentUser) {
          setIsLoadingUser(false);
          navigate("/login.html", { replace: true });
          return;
        }
        setUser(currentUser);
        setIsLoadingUser(false);
        setProfile({
          nombre: currentUser.nombre || "",
          telefono: currentUser.telefono || "",
          email: currentUser.email || "",
          direccion: currentUser.direccion || "",
        });
        setAvatar(currentUser.avatar || localStorage.getItem(`avatarImage_${currentUser.id}`) || "");
        setIsLoadingProperties(true);
        listPropertiesByUser(currentUser.id)
          .then((items) => {
            if (active) setProperties(items);
          })
          .catch((error) => {
            console.error("No se pudieron cargar las propiedades del usuario:", error);
            if (active) showMessage("No se pudieron cargar tus propiedades.", true);
          })
          .finally(() => {
            if (active) setIsLoadingProperties(false);
          });
        try {
          const storedPreferences = localStorage.getItem(`buyerPreferences_${currentUser.id}`);
          const storedNotifications = localStorage.getItem(`buyerNotifications_${currentUser.id}`);
          if (storedPreferences) setPreferences((current) => ({ ...current, ...JSON.parse(storedPreferences) }));
          if (storedNotifications) setNotifications((current) => ({ ...current, ...JSON.parse(storedNotifications) }));
        } catch (error) {
          console.error("No se pudieron cargar las preferencias del perfil:", error);
        }
      })
      .catch((error) => {
        console.error("No se pudo cargar el perfil:", error);
        if (active) {
          setIsLoadingUser(false);
          navigate("/login.html", { replace: true });
        }
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const showMessage = (text, isError = false) => {
    setMessage(text);
    setMessageError(isError);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    try {
      await actualizarUsuario(user.id, {
        nombre: profile.nombre.trim(),
        telefono: profile.telefono.trim(),
        direccion: profile.direccion.trim(),
      });
      showMessage("Tu información personal fue actualizada.");
    } catch (error) {
      console.error("No se pudo actualizar el perfil:", error);
      showMessage("No se pudo actualizar tu información. Inténtalo de nuevo.", true);
    }
  };

  const handlePreferencesSubmit = (event) => {
    event.preventDefault();
    if (!user) return;
    localStorage.setItem(`buyerPreferences_${user.id}`, JSON.stringify(preferences));
    localStorage.setItem(`buyerNotifications_${user.id}`, JSON.stringify(notifications));
    showMessage("Tus preferencias fueron guardadas en este dispositivo.");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      showMessage("La nueva contraseña y su confirmación no coinciden.", true);
      return;
    }
    if (password.newPassword.length < 6) {
      showMessage("La nueva contraseña debe tener al menos 6 caracteres.", true);
      return;
    }
    try {
      await cambiarPassword(password.currentPassword, password.newPassword);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMessage("Tu contraseña fue actualizada.");
    } catch (error) {
      console.error("No se pudo cambiar la contraseña:", error);
      showMessage("No se pudo cambiar la contraseña. Verifica la contraseña actual.", true);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 700 * 1024) {
      showMessage("Selecciona una imagen válida de hasta 700 KB.", true);
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string" || !user) return;
      try {
        await actualizarUsuario(user.id, { avatar: reader.result });
        localStorage.setItem(`avatarImage_${user.id}`, reader.result);
        setAvatar(reader.result);
        setUser((current) => ({ ...current, avatar: reader.result }));
        showMessage("Tu foto de perfil fue actualizada.");
      } catch (error) {
        console.error("No se pudo guardar la foto de perfil:", error);
        showMessage("No se pudo guardar la foto de perfil.", true);
      }
    };
    reader.onerror = () => showMessage("No se pudo leer la imagen seleccionada.", true);
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => {
    try {
      await cerrarSesion();
      navigate("/home.html");
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      showMessage("No se pudo cerrar la sesión. Inténtalo de nuevo.", true);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarCuentaUsuario();
      navigate("/home.html", { replace: true });
    } catch (error) {
      console.error("No se pudo eliminar la cuenta:", error);
      showMessage("No se pudo eliminar la cuenta. Vuelve a iniciar sesión e inténtalo de nuevo.", true);
    }
  };

  const handleDownloadData = () => {
    if (!user) return;
    const data = new Blob([JSON.stringify({ ...user, ...profile, preferences, notifications }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mis-datos-inmobiliaria.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (isLoadingUser || !user) {
    return (
      <main className="container py-5" role="status">
        {isLoadingUser ? "Cargando perfil..." : "Redirigiendo al inicio de sesión..."}
      </main>
    );
  }

  return (
    <>
      <div className="container py-5">
        <nav
          className={
            "navbar navbar-expand-lg bg-white navbar-light shadow-sm fixed-top py-3 py-lg-0 px-3 px-lg-5 transition-navbar"
          }
        >
          <Link
            to="/home.html"
            className="navbar-brand d-flex align-items-center"
          >
            <img
              src="img/LOGOV2.png"
              alt="Manuela Bermudez Logo"
              style={{ maxHeight: "55px" }}
              className="mr-2"
            />

            <h1 className="m-0 text-primary font-weight-bold">
              Manuela Bermudez
            </h1>
          </Link>

          <button
            type="button"
            className="navbar-toggler"
            aria-expanded={menuOpen}
            aria-controls="navbarCollapse"
            aria-label="Abrir o cerrar navegación"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div
            className={`collapse navbar-collapse justify-content-between ${menuOpen ? "show" : ""}`}
            id="navbarCollapse"
          >
            <div className="navbar-nav ml-auto py-0">
              <Link to="/home.html" className="nav-item nav-link animated-link">
                Inicio
              </Link>

              <Link
                to="/service.html"
                className="nav-item nav-link animated-link"
              >
                Servicios
              </Link>

              <Link
                to="/about.html"
                className="nav-item nav-link animated-link"
              >
                Nosotros
              </Link>

              <Link
                to="/contact.html"
                className="nav-item nav-link animated-link"
              >
                Contacto
              </Link>
            </div>
          </div>
        </nav>

        <header className="hero">
          <p className="hero-subtitle">Configuración del Perfil</p>

          <h1 className="hero-title">Configuración del Perfil</h1>

          <p className="hero-subtitle">
            Personaliza y gestiona tu cuenta de usuario
          </p>
        </header>

        <main className="buyer-container">
          <aside className="sidebar">
            <div className="card profile-card">
              <button
                type="button"
                className="avatar-upload"
                onClick={() => avatarInput.current?.click()}
                style={avatar ? { backgroundImage: `url("${avatar}")`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                aria-label="Cambiar foto de perfil"
              >
                {!avatar && <Icon name="upload" size={32} />}

                <div className="upload-icon-small">
                  <Icon name="upload" size={14} />
                </div>
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={handleAvatarChange}
                aria-label="Seleccionar imagen de perfil"
              />

              <h3>Foto de Perfil</h3>
            </div>

            <div className="card sidebar-menu">
              <button
                type="button"
                className={`menu-item ${activeSection === "personal" ? "active" : ""}`}
                aria-current={activeSection === "personal" ? "page" : undefined}
                onClick={() => setActiveSection("personal")}
              >
                <Icon name="user" />
                Información Personal
              </button>

              <button
                type="button"
                className={`menu-item ${activeSection === "preferences" ? "active" : ""}`}
                aria-current={activeSection === "preferences" ? "page" : undefined}
                onClick={() => setActiveSection("preferences")}
              >
                <Icon name="sliders-horizontal" />
                {
                  "\n                    Preferencias de Propiedad\n                "
                }
              </button>

              <button
                type="button"
                className={`menu-item ${activeSection === "security" ? "active" : ""}`}
                aria-current={activeSection === "security" ? "page" : undefined}
                onClick={() => setActiveSection("security")}
              >
                <Icon name="lock" />
                {
                  "\n                    Contraseña y Seguridad\n                "
                }
              </button>

              <button
                type="button"
                className={`menu-item ${activeSection === "properties" ? "active" : ""}`}
                aria-current={activeSection === "properties" ? "page" : undefined}
                onClick={() => setActiveSection("properties")}
              >
                <Icon name="building-2" />
                {
                  "\n                    Mis Propiedades Listadas\n                "
                }
              </button>

              <button type="button" className="menu-item" onClick={handleSignOut}>
                <Icon name="log-out" />
                Cerrar Sesión
              </button>
            </div>
          </aside>

          <div className="forms-area">
            {message && (
              <p className={`alert ${messageError ? "alert-danger" : "alert-success"}`} role="status">
                {message}
              </p>
            )}
            {activeSection === "personal" && (
              <div className="card form-card">
                <h2 className="section-header">
                  <Icon name="user" />
                  Información Personal
                </h2>

                <form id="personal-form" onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>

                  <div className="input-with-icon">
                    <Icon name="user" size={18} className="input-icon" />

                    <input
                      type="text"
                      className="form-input"
                      name="nombre"
                      placeholder="Nombre Completo"
                      required
                      value={profile.nombre}
                      onChange={(event) => setProfile({ ...profile, nombre: event.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>

                  <div className="input-with-icon">
                    <Icon name="phone" size={18} className="input-icon" />

                    <input
                      type="tel"
                      className="form-input"
                      name="telefono"
                      placeholder="Teléfono"
                      required
                      value={profile.telefono}
                      onChange={(event) => setProfile({ ...profile, telefono: event.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>

                  <div className="input-with-icon">
                    <Icon name="mail" size={18} className="input-icon" />

                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      placeholder="Correo Electrónico"
                      required
                      value={profile.email}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección de Contacto</label>

                  <div className="input-with-icon">
                    <Icon name="map-pin" size={18} className="input-icon" />

                    <textarea
                      className="form-input"
                      name="direccion"
                      placeholder="Dirección de Contacto"
                      value={profile.direccion}
                      onChange={(event) => setProfile({ ...profile, direccion: event.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Actualizar Información
                </button>
                </form>
              </div>
            )}

            {activeSection === "preferences" && (
              <div className="card form-card">
                <h2 className="section-header">
                  <Icon name="sliders-horizontal" />
                  Preferencias de Propiedad
                </h2>

                <form id="preferences-form" onSubmit={handlePreferencesSubmit}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <Icon name="map-pin" size={18} className="input-icon" />

                    <label className="form-label">Zonas de Interés</label>

                    <select
                      className="form-input"
                      name="zonas"
                      style={{ paddingLeft: "var(--space-3)" }}
                      value={preferences.zona}
                      onChange={(event) => setPreferences({ ...preferences, zona: event.target.value })}
                    >
                      <option>Zonas de Interés en Medellín</option>

                      <option>Zona Centro</option>

                      <option>Zona Oriental</option>

                      <option>Zona Occidental</option>

                      <option>Zona Sur</option>
                    </select>
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{ marginTop: "var(--space-6)" }}
                >
                  <div className="input-with-icon">
                    <Icon
                      name="sliders-horizontal"
                      size={18}
                      className="input-icon"
                    />

                    <label className="form-label">Presupuesto</label>

                    <div className="range-container">
                      <input
                        type="range"
                        min="100000000"
                        max="500000000"
                        step="10000000"
                        className="form-input"
                        aria-label="Presupuesto máximo"
                        value={preferences.presupuesto}
                        onChange={(event) => setPreferences({ ...preferences, presupuesto: Number(event.target.value) })}
                      />
                      <div className="range-values">
                        <span className="value-label">Presupuesto máximo:</span>
                        <output className="value-amount">
                          {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(preferences.presupuesto)}
                        </output>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{ marginTop: "var(--space-6)" }}
                >
                  <div className="input-with-icon">
                    <Icon name="bell" size={18} className="input-icon" />

                    <label className="form-label">Recibir Notificaciones</label>

                    <div className="toggles-row">
                      <div className="toggle-group">
                        <button
                          type="button"
                          className={`toggle ${notifications.email ? "active" : ""}`}
                          role="switch"
                          aria-checked={notifications.email}
                          aria-label="Notificaciones por email"
                          onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                        />

                        <span>Email</span>
                      </div>

                      <div className="toggle-group">
                        <button
                          type="button"
                          className={`toggle ${notifications.push ? "active" : ""}`}
                          role="switch"
                          aria-checked={notifications.push}
                          aria-label="Notificaciones push"
                          onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                        />

                        <span>Push</span>
                      </div>

                      <div className="toggle-group">
                        <button
                          type="button"
                          className={`toggle ${notifications.whatsapp ? "active" : ""}`}
                          role="switch"
                          aria-checked={notifications.whatsapp}
                          aria-label="Notificaciones por WhatsApp"
                          onClick={() => setNotifications({ ...notifications, whatsapp: !notifications.whatsapp })}
                        />

                        <span>WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Guardar Mis Preferencias
                </button>
                </form>
              </div>
            )}

            {activeSection === "security" && (
              <div className="card form-card">
                <h2 className="section-header">
                  <Icon name="lock" />
                  Contraseña y Seguridad
                </h2>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="key" size={20} />
                  {
                    "\n                        Cambio de Contraseña\n                    "
                  }
                </h3>

                <form id="password-form" className="security-form" onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label">Contraseña Actual</label>

                    <div className="input-with-icon">
                      <Icon name="lock" size={18} className="input-icon" />

                      <input
                        type="password"
                        className="form-input"
                        name="currentPassword"
                        placeholder="Contraseña actual"
                        required
                        value={password.currentPassword}
                        onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nueva Contraseña</label>

                    <div className="input-with-icon">
                      <Icon name="key" size={18} className="input-icon" />

                      <input
                        type="password"
                        className="form-input"
                        name="newPassword"
                        placeholder="Nueva contraseña"
                        required
                        value={password.newPassword}
                        onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Confirmar Nueva Contraseña
                    </label>

                    <div className="input-with-icon">
                      <Icon name="key" size={18} className="input-icon" />

                      <input
                        type="password"
                        className="form-input"
                        name="confirmPassword"
                        placeholder="Confirmar nueva contraseña"
                        required
                        value={password.confirmPassword}
                        onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">
                    Cambiar Contraseña
                  </button>
                </form>
              </div>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="shield" size={20} />
                  {
                    "\n                        Autenticación en Dos Pasos (2FA)\n                    "
                  }
                </h3>

                <div className="security-content">
                  <div
                    className={
                      "d-flex justify-content-between align-items-center mb-3"
                    }
                  >
                    <div>
                      <h5 className="mb-1">
                        Estado:
                        <span id="2fa-status" className="text-danger">
                          Desactivado
                        </span>
                      </h5>

                      <p className="text-muted small mb-0">
                        Añade una capa extra de seguridad a tu cuenta
                      </p>
                    </div>

                    <button id="toggle-2fa" type="button" className="btn btn-outline-primary" disabled>
                      No disponible
                    </button>
                  </div>

                  <div id="2fa-setup" className="d-none">
                    <div className="alert alert-info">
                      <h6>Configurar Autenticación 2FA</h6>

                      <p>
                        {
                          "Escanea el código QR con tu aplicación de autenticación:"
                        }
                      </p>

                      <div id="qr-code" className="text-center my-3"></div>

                      <div className="form-group">
                        <label>Código de Verificación</label>

                        <input
                          type="text"
                          className="form-input"
                          id="2fa-code"
                          placeholder="Ingresa el código de 6 dígitos"
                        />
                      </div>

                      <button id="verify-2fa" className="btn btn-primary">
                        Verificar y Activar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="fingerprint" size={20} />
                  {
                    "\n                        Inicio de Sesión Sin Contraseña\n                    "
                  }
                </h3>

                <div className="security-content">
                  <div
                    className={
                      "d-flex justify-content-between align-items-center mb-3"
                    }
                  >
                    <div>
                      <h5 className="mb-1">
                        Biometría:
                        <span id="biometric-status" className="text-danger">
                          No configurado
                        </span>
                      </h5>

                      <p className="text-muted small mb-0">
                        Usa huella dactilar o reconocimiento facial
                      </p>
                    </div>

                    <button
                      id="setup-biometric"
                      type="button"
                      className="btn btn-outline-primary"
                      disabled
                    >
                      Configurar
                    </button>
                  </div>

                  <div
                    className={
                      "d-flex justify-content-between align-items-center"
                    }
                  >
                    <div>
                      <h5 className="mb-1">
                        Passkeys:
                        <span id="passkey-status" className="text-danger">
                          No configurado
                        </span>
                      </h5>

                      <p className="text-muted small mb-0">
                        Claves de acceso seguras para este dispositivo
                      </p>
                    </div>

                    <button
                      id="setup-passkey"
                      type="button"
                      className="btn btn-outline-primary"
                      disabled
                    >
                      Crear Passkey
                    </button>
                  </div>
                </div>
              </div>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="link" size={20} />
                  {
                    "\n                        Cuentas Vinculadas\n                    "
                  }
                </h3>

                <div className="security-content">
                  <p className="text-muted mb-3">
                    Conecta tus cuentas sociales para un acceso más rápido
                  </p>

                  <div className="linked-accounts">
                    <div
                      className={
                        "account-item d-flex justify-content-between align-items-center mb-2"
                      }
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          name="facebook"
                          size={20}
                          className="text-primary mr-2"
                        />

                        <span>Facebook</span>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        id="link-facebook"
                        type="button"
                        disabled
                      >
                        Vincular
                      </button>
                    </div>

                    <div
                      className={
                        "account-item d-flex justify-content-between align-items-center mb-2"
                      }
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          name="twitter"
                          size={20}
                          className="text-primary mr-2"
                        />

                        <span>Twitter</span>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        id="link-twitter"
                        type="button"
                        disabled
                      >
                        Vincular
                      </button>
                    </div>

                    <div
                      className={
                        "account-item d-flex justify-content-between align-items-center"
                      }
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          name="mail"
                          size={20}
                          className="text-primary mr-2"
                        />

                        <span>Google</span>
                      </div>

                      <button
                        className="btn btn-sm btn-outline-primary"
                        id="link-google"
                        type="button"
                        disabled
                      >
                        Vincular
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="monitor" size={20} />
                  {
                    "\n                        Sesiones Activas\n                    "
                  }
                </h3>

                <div className="security-content">
                  <p className="text-muted mb-3">
                    Dispositivos donde has iniciado sesión recientemente
                  </p>

                  <div id="active-sessions" className="sessions-list">
                    <p className="mb-0">Sesión actual: {user?.email || "dispositivo actual"}</p>
                  </div>

                  <button
                  id="revoke-all-sessions"
                  className="btn btn-outline-danger mt-3"
                  type="button"
                  onClick={handleSignOut}
                  >
                  Cerrar Sesión
                  </button>
                </div>
              </div>

              <div className="security-section">
                <h3 className="security-title">
                  <Icon name="download" size={20} />
                  {
                    "\n                        Descarga de Datos\n                    "
                  }
                </h3>

                <div className="security-content">
                  <p className="text-muted mb-3">
                    Descarga una copia de todos tus datos personales
                  </p>

                  <button
                    id="download-data"
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={handleDownloadData}
                  >
                    Descargar Mis Datos
                  </button>

                  <div className="mt-2 small text-muted">
                    {
                      "\n                            Los datos incluyen: información personal, preferencias, historial de búsquedas y actividad.\n                        "
                    }
                  </div>
                </div>
              </div>

              <div className="security-section border-danger">
                <h3 className="security-title text-danger">
                  <Icon name="alert-triangle" size={20} />
                  {
                    "\n                        Zona de Peligro\n                    "
                  }
                </h3>

                <div className="security-content">
                  <div className="alert alert-danger">
                    <h5>Eliminar Cuenta</h5>

                    <p className="mb-3">
                      {
                        "Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, propiedades listadas y actividad."
                      }
                    </p>

                    <button id="delete-account" className="btn btn-danger" type="button" onClick={handleDeleteAccount}>
                      Eliminar Mi Cuenta
                    </button>
                  </div>
                </div>
              </div>
              </div>
            )}

            {activeSection === "properties" && (
              <section className="card form-card" id="listaCasas">
                <h2 className="section-header">
                  <Icon name="building-2" />
                  Mis Propiedades Listadas
                </h2>
                {isLoadingProperties ? (
                  <p role="status">Cargando propiedades...</p>
                ) : properties.length === 0 ? (
                  <p className="text-muted mb-0">
                    Aún no tienes propiedades publicadas en esta cuenta.
                  </p>
                ) : (
                  <div className="row">
                    {properties.map((property) => (
                      <article className="col-md-6 mb-4" key={property.id}>
                        <div className="card h-100">
                          <img
                            className="card-img-top"
                            src={property.imageUrl || property.image || "img/placeholder.png"}
                            alt={property.title || "Propiedad"}
                            style={{ height: 190, objectFit: "cover" }}
                          />
                          <div className="card-body">
                            <h3 className="h5 card-title">{property.title || "Propiedad"}</h3>
                            <p className="text-muted mb-2">{property.location || "Ubicación no especificada"}</p>
                            <p className="font-weight-bold mb-3">
                              ${Number(property.price || 0).toLocaleString("es-CO")} COP
                            </p>
                            <Link
                              to={`/property-details.html?id=${encodeURIComponent(property.id)}`}
                              className="btn btn-outline-primary"
                            >
                              Ver propiedad
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      <footer className="real-estate-footer pt-5" id="contacto">
        <div className="container pt-4 pb-3">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-5 pe-lg-4">
              <img
                src="img/LOGOV2.png"
                alt="Inmobiliaria Manuela Logo"
                style={{ maxHeight: "55px" }}
                className="mr-2"
              />
              Inm. Manuela
              <p
                className="text-white-50"
                style={{ lineHeight: "1.8", fontSize: "0.95rem" }}
              >
                {
                  "Tu aliado estratégico en bienes raíces. Brindamos certeza jurídica y oportunidades únicas de inversión con un enfoque profesional y humano."
                }
              </p>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Links Rápidos
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#inicio">
                  Inicio
                </a>

                <a className="text-white-50 mb-3" href="#destacadas">
                  Ventas
                </a>

                <a className="text-white-50 mb-3" href="#destacadas">
                  Alquiler
                </a>

                <a className="text-white-50 mb-3" href="#servicios">
                  Servicios
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Propiedades
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#">
                  Casas
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Departamentos
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Comercial
                </a>

                <a className="text-white-50" href="#">
                  Terrenos
                </a>
              </div>
            </div>

            <div className="col-lg-2 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Legal
              </h5>

              <div
                className={
                  "d-flex flex-column justify-content-start footer-links list-unstyled"
                }
              >
                <a className="text-white-50 mb-3" href="#contacto">
                  Contactos
                </a>

                <a className="text-white-50 mb-3" href="#servicios">
                  Servicios
                </a>

                <a className="text-white-50 mb-3" href="#">
                  Privacidad
                </a>

                <a className="text-white-50" href="#">
                  Términos Uso
                </a>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 mb-5">
              <h5
                className="text-white text-uppercase mb-4"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Contactanos
              </h5>

              <p className="text-white-50 mb-3 d-flex align-items-center">
                <i className="fa fa-phone-alt text-primary mr-3" />
                {
                  "\n                        +57 300 123 4567\n                    "
                }
              </p>

              <p className="text-white-50 mb-4 d-flex align-items-center">
                <i className="fa fa-envelope text-primary mr-3" />
                {
                  "\n                        info@inmomanuela.com\n                    "
                }
              </p>
              {
                "\n                    \n                   \n                    "
              }
              <div className="d-flex w-100 footer-social">
                <a className="btn btn-outline-light btn-social mr-2" href="#">
                  <i className="fab fa-facebook-f" />
                </a>

                <a className="btn btn-outline-light btn-social mr-2" href="#">
                  <i className="fab fa-instagram" />
                </a>

                <a className="btn btn-outline-light btn-social mr-2" href="#">
                  <i className="fab fa-linkedin-in" />
                </a>

                <a className="btn btn-outline-light btn-social" href="#">
                  <i className="fab fa-twitter" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid" style={{ backgroundColor: "#111111" }}>
          <div className="row pt-4 pb-4">
            <div className="col-12 text-center">
              <p className="m-0 text-white-50" style={{ fontSize: "0.9rem" }}>
                ©<span className="text-white">Inmobiliaria Manuela</span>. Todos
                los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
