import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  actualizarUsuario,
  cambiarPassword,
  cerrarSesion,
  eliminarCuentaUsuario,
  obtenerUsuarioActual,
  verificarEstadoSesion,
} from "../services/auth.js";
import {
  addProperty,
  deleteProperty,
  listPropertiesByUser,
  updateProperty,
} from "../services/properties.js";
import Icon from "../components/Icon.jsx";

const EMPTY_PROPERTY = {
  id: "",
  title: "",
  location: "",
  price: "",
  type: "",
  description: "",
};

const SECTIONS = [
  { id: "personal", label: "Información Personal", icon: "user" },
  { id: "publicar", label: "Publicar Propiedad", icon: "plus-circle" },
  { id: "mispropiedades", label: "Mis Propiedades", icon: "building-2" },
  { id: "seguridad", label: "Seguridad", icon: "shield" },
];

function SellerNavigation({ onAccountClick }) {
  return (
    <nav className="seller-navbar">
      <Link to="/home.html" className="navbar-brand">
        <img src="img/LOGOV2.png" alt="" />
        <h1>Manuela Bermudez Realtor</h1>
      </Link>
      <div className="navbar-links">
        <Link to="/home.html">Inicio</Link>
        <Link to="/service.html">Servicios</Link>
        <Link to="/about.html">Nosotros</Link>
        <Link to="/contact.html">Contacto</Link>
        <button type="button" className="btn-account" onClick={onAccountClick}>
          Mi Cuenta
        </button>
      </div>
    </nav>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <>
      <div className="section-header">
        <Icon name={icon} />
        <h2>{title}</h2>
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <hr className="section-divider" />
    </>
  );
}

function SellerSidebar({
  user,
  propertyCount,
  avatar,
  activeSection,
  onAvatarChange,
  onSectionChange,
  onLogout,
}) {
  const inputRef = useRef(null);
  const displayName =
    user?.nombre || user?.displayName || user?.email || "Usuario";

  return (
    <aside className="seller-sidebar">
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          <button
            type="button"
            className="avatar-upload"
            aria-label="Cambiar foto de perfil"
            onClick={() => inputRef.current?.click()}
          >
            <img
              src={avatar || "img/placeholder-avatar.png"}
              alt=""
              className="profile-avatar"
            />
            <span className="avatar-upload-overlay">
              <Icon name="camera" />
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            className="d-none"
            accept="image/*"
            onChange={onAvatarChange}
          />
        </div>
        <h3 className="profile-name">{displayName}</h3>
        <div className="profile-email">{user?.email}</div>
        <span className="profile-stat-pill">
          {propertyCount} propiedades publicadas
        </span>
      </div>

      <hr className="sidebar-divider" />
      <nav className="sidebar-menu" aria-label="Secciones de vendedor">
        {SECTIONS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            className={`menu-item ${activeSection === id ? "active" : ""}`}
            aria-current={activeSection === id ? "page" : undefined}
            onClick={() => onSectionChange(id)}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
        <button
          type="button"
          className="menu-item text-danger"
          onClick={onLogout}
        >
          <Icon name="log-out" />
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}

function ProfileSection({ user, onSave, savingField }) {
  const [values, setValues] = useState({
    nombre: user?.nombre || "",
    telefono: user?.telefono || "",
    direccion: user?.direccion || "",
  });

  useEffect(() => {
    setValues({
      nombre: user?.nombre || "",
      telefono: user?.telefono || "",
      direccion: user?.direccion || "",
    });
  }, [user]);

  const fields = [
    {
      name: "nombre",
      label: "Nombre Completo",
      icon: "user",
      placeholder: "Nombre Completo",
    },
    {
      name: "telefono",
      label: "Teléfono",
      icon: "phone",
      placeholder: "Ej: +57 300 123 4567",
      optional: true,
    },
    {
      name: "direccion",
      label: "Agregar dirección de contacto",
      icon: "map-pin",
      placeholder: "Ej: Calle 123 #45-67, Medellín",
    },
  ];

  return (
    <section id="personal" className="form-card">
      <SectionHeading
        icon="user"
        title="Información Personal"
        subtitle="Actualiza tus datos de contacto. Cada campo se guarda por separado."
      />
      <div className="form-card-inner">
        {fields.map(({ name, label, icon, placeholder, optional }) => (
          <div className="field-group" key={name}>
            <label className="form-label" htmlFor={`profile-${name}`}>
              {label}{" "}
              {optional && <span className="field-optional">(opcional)</span>}
            </label>
            <div className="field-row">
              <div className="input-with-icon flex-grow-1">
                <Icon name={icon} className="input-icon" size={18} />
                <input
                  id={`profile-${name}`}
                  type={name === "telefono" ? "tel" : "text"}
                  className="form-input"
                  placeholder={placeholder}
                  value={values[name]}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="button"
                className="btn-save-field"
                disabled={savingField === name}
                onClick={() => onSave(name, values[name])}
              >
                {savingField === name ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ))}
        <div className="field-group">
          <label className="form-label" htmlFor="profile-email">
            Correo Electrónico
          </label>
          <div className="field-row">
            <div className="input-with-icon flex-grow-1">
              <Icon name="mail" className="input-icon" size={18} />
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={user?.email || ""}
                readOnly
              />
            </div>
            <span className="field-readonly-tag">Vinculado a la cuenta</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PropertyForm({
  property,
  setProperty,
  image,
  setImage,
  isSaving,
  onSubmit,
}) {
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const chooseImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("La imagen debe pesar menos de 5 MB.");
      return;
    }
    setImage(file);
  };

  const updateField = (event) =>
    setProperty((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  return (
    <section id="publicar" className="form-card">
      <SectionHeading
        icon="plus-circle"
        title={property.id ? "Editar Propiedad" : "Publicar Nueva Propiedad"}
        subtitle="Completa los datos del inmueble para publicarlo."
      />
      <div className="form-card-inner">
        <form className="seller-property-form" onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="property-title">
                Título del Inmueble
              </label>
              <div className="input-with-icon">
                <Icon name="type" className="input-icon" size={18} />
                <input
                  id="property-title"
                  name="title"
                  className="form-input"
                  placeholder="Ej: Casa campestre con piscina"
                  value={property.title}
                  onChange={updateField}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="property-location">
                Ubicación (Ciudad / Sector)
              </label>
              <div className="input-with-icon">
                <Icon name="map-pin" className="input-icon" size={18} />
                <input
                  id="property-location"
                  name="location"
                  className="form-input"
                  placeholder="Ej: Medellín, El Poblado"
                  value={property.location}
                  onChange={updateField}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="property-price">
                Precio (COP $)
              </label>
              <div className="input-with-icon">
                <span className="input-icon">$</span>
                <input
                  id="property-price"
                  name="price"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Ej: 350000000"
                  value={property.price}
                  onChange={updateField}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="property-type">
                Tipo de Inmueble
              </label>
              <div className="input-with-icon">
                <Icon name="building" className="input-icon" size={18} />
                <select
                  id="property-type"
                  name="type"
                  className="form-input"
                  value={property.type}
                  onChange={updateField}
                  required
                >
                  <option value="">Selecciona tipo</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Oficina Comercial">Oficina Comercial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="property-description">
              Descripción Detallada
            </label>
            <div className="input-with-icon">
              <Icon name="align-left" className="input-icon" size={18} />
              <textarea
                id="property-description"
                name="description"
                className="form-input"
                rows={4}
                placeholder="Describe los detalles del inmueble."
                value={property.description}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="property-image">
              Imagen de la Propiedad
            </label>
            <button
              type="button"
              className={`drag-drop-zone ${isDragging ? "dragover" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                chooseImage(event.dataTransfer.files[0]);
              }}
            >
              {image ? (
                <span className="drag-drop-preview">
                  <img src={image} alt="Vista previa de la propiedad" />
                </span>
              ) : (
                <span className="drag-drop-msg">
                  <Icon
                    name="cloud-upload"
                    className="drag-drop-icon"
                    size={28}
                  />
                  <span>Arrastra tu foto aquí o haz clic para seleccionar</span>
                  <small>JPG, PNG, WEBP · Máx. 5 MB</small>
                </span>
              )}
            </button>
            <input
              ref={fileRef}
              id="property-image"
              type="file"
              className="d-none"
              accept="image/*"
              onChange={(event) => chooseImage(event.target.files[0])}
            />
            {image && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger mt-2"
                onClick={() => {
                  setImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                <Icon name="x" size={16} />
                Quitar imagen
              </button>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving
              ? "Guardando..."
              : property.id
                ? "Guardar cambios"
                : "Publicar propiedad"}
          </button>
        </form>
      </div>
    </section>
  );
}

function PropertyCard({ property, onEdit, onDelete }) {
  const title = property.title || property.titulo || "Propiedad";
  const location = property.location || property.ubicacion || "";
  const image = property.imageUrl || property.image || "img/placeholder.png";

  return (
    <article className="col-md-6 col-lg-4 mb-4 fade-in">
      <div className="card card-clean p-3 h-100 d-flex flex-column justify-content-between">
        <div>
          <div className="position-relative overflow-hidden rounded mb-3">
            <img className="prop-img img-fluid" src={image} alt={title} />
            <span className="badge badge-primary position-absolute price-badge">
              $
              {Number(property.price || property.precio || 0).toLocaleString(
                "es-CO",
              )}
            </span>
          </div>
          <h3 className="h5 font-weight-bold text-dark mb-1 text-truncate">
            {title}
          </h3>
          <p className="small-muted mb-2">
            <Icon name="map-pin" size={14} className="text-primary" />{" "}
            {location}
            {property.type && (
              <span className="badge badge-light ml-2">{property.type}</span>
            )}
          </p>
          <p className="text-muted small text-clamp-3">
            {property.description || property.descripcion || ""}
          </p>
        </div>
        <div className="d-flex justify-content-end actions-btns border-top pt-3 mt-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary mr-2"
            onClick={() => onEdit(property)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(property)}
          >
            Borrar
          </button>
        </div>
      </div>
    </article>
  );
}

function PropertiesSection({
  properties,
  query,
  onQueryChange,
  onEdit,
  onDelete,
}) {
  return (
    <section id="mispropiedades" className="form-card">
      <SectionHeading icon="building-2" title="Mis Propiedades" />
      <div className="props-toolbar">
        <div className="search-wrapper">
          <Icon name="search" size={18} className="search-icon" />
          <input
            type="search"
            aria-label="Buscar propiedad"
            placeholder="Buscar por título, ubicación..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <span className="prop-count-label">
          <strong>{properties.length}</strong> propiedades
        </span>
      </div>
      <div className="row">
        {properties.length ? (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-light text-center">
              No se encontraron propiedades.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SecuritySection({ onChangePassword, onDeleteAccount, isSaving }) {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const submitPassword = (event) => {
    event.preventDefault();
    onChangePassword(passwords, () =>
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }),
    );
  };

  return (
    <section id="seguridad" className="form-card">
      <SectionHeading
        icon="shield"
        title="Seguridad"
        subtitle="Administra tu contraseña y cuenta."
      />
      <div className="form-card-inner">
        <section className="security-section">
          <h3 className="security-title">
            <Icon name="key" size={20} /> Cambio de Contraseña
          </h3>
          <form onSubmit={submitPassword}>
            {[
              ["currentPassword", "Contraseña Actual"],
              ["newPassword", "Nueva Contraseña"],
              ["confirmPassword", "Confirmar Nueva Contraseña"],
            ].map(([name, label]) => (
              <div className="form-group" key={name}>
                <label className="form-label" htmlFor={`security-${name}`}>
                  {label}
                </label>
                <div className="input-with-icon">
                  <Icon
                    name={name === "currentPassword" ? "lock" : "key"}
                    className="input-icon"
                    size={18}
                  />
                  <input
                    id={`security-${name}`}
                    type="password"
                    className="form-input"
                    autoComplete={
                      name === "currentPassword"
                        ? "current-password"
                        : "new-password"
                    }
                    minLength={6}
                    required
                    value={passwords[name]}
                    onChange={(event) =>
                      setPasswords((current) => ({
                        ...current,
                        [name]: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </form>
        </section>
        <section className="security-section danger-card">
          <h3 className="security-title">
            <Icon name="alert-triangle" size={20} /> Zona de Peligro
          </h3>
          <p>
            Esta acción no se puede deshacer. Se eliminarán permanentemente tu
            cuenta y tus propiedades publicadas.
          </p>
          <button
            type="button"
            className="btn-danger-outline"
            onClick={onDeleteAccount}
            disabled={isSaving}
          >
            Eliminar Mi Cuenta
          </button>
        </section>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="real-estate-footer pt-5" id="contacto">
      <div className="container pt-4 pb-3">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-5">
            <h2 className="h5 text-white">Inm. Manuela</h2>
            <p>
              Tu aliado estratégico en bienes raíces. Brindamos certeza jurídica
              y oportunidades únicas de inversión con un enfoque profesional y
              humano.
            </p>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h2 className="h5 text-white">Contactanos</h2>
            <p>+57 300 123 4567</p>
            <p>info@inmomanuela.com</p>
          </div>
          <div className="col-lg-3 col-md-6 mb-5">
            <h2 className="h5 text-white">Accesos rápidos</h2>
            <Link to="/home.html" className="d-block mb-2">
              Inicio
            </Link>
            <Link to="/service.html" className="d-block mb-2">
              Servicios
            </Link>
            <Link to="/contact.html" className="d-block mb-2">
              Contacto
            </Link>
          </div>
        </div>
        <p className="text-center mb-0">
          © Manuela Bermudez. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default function SellerPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activeSection, setActiveSection] = useState("personal");
  const [property, setProperty] = useState(EMPTY_PROPERTY);
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingField, setSavingField] = useState("");
  const [notice, setNotice] = useState(null);
  const [avatar, setAvatar] = useState("");
  const noticeTimer = useRef(null);
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : existingImage),
    [selectedFile, existingImage],
  );

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  useEffect(
    () => () => {
      window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000);
  };

  const refreshProperties = async (ownerId) => {
    const results = await listPropertiesByUser(ownerId);
    setProperties(results);
  };

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
        if (!profile) {
          navigate("/profiles.html", { replace: true });
          return;
        }
        setUser(profile);
        setAvatar(profile.avatar || "");
        await refreshProperties(profile.id);
      } catch (error) {
        console.error("No se pudo cargar el panel del vendedor:", error);
        showNotice("No se pudo cargar tu cuenta. Intenta de nuevo.", "error");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [navigate]);

  const visibleProperties = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return properties.filter((item) =>
      [item.title, item.titulo, item.location, item.ubicacion, item.description]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("es").includes(term)),
    );
  }, [properties, search]);

  const handleSaveProfileField = async (field, value) => {
    if (!user) return;
    const cleanValue = value.trim();
    if (field === "nombre" && !cleanValue) {
      showNotice("El nombre no puede estar vacío.", "error");
      return;
    }

    setSavingField(field);
    try {
      await actualizarUsuario(user.id, { [field]: cleanValue });
      setUser((current) => ({ ...current, [field]: cleanValue }));
      showNotice("Información actualizada.");
    } catch (error) {
      console.error("No se pudo actualizar el perfil:", error);
      showNotice(error.message || "No se pudo guardar el cambio.", "error");
    } finally {
      setSavingField("");
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotice("Selecciona un archivo de imagen válido.", "error");
      return;
    }

    try {
      const avatarData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      await actualizarUsuario(user.id, { avatar: avatarData });
      localStorage.setItem(`avatarImage_${user.id}`, avatarData);
      setAvatar(avatarData);
      setUser((current) => ({ ...current, avatar: avatarData }));
      showNotice("Foto de perfil actualizada.");
    } catch (error) {
      console.error("No se pudo actualizar la foto de perfil:", error);
      showNotice(error.message || "No se pudo actualizar la foto.", "error");
    } finally {
      event.target.value = "";
    }
  };

  const handlePropertySubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      showNotice("Inicia sesión para publicar una propiedad.", "error");
      return;
    }
    setSaving(true);

    const payload = {
      title: property.title.trim(),
      location: property.location.trim(),
      price: Number(property.price),
      type: property.type,
      description: property.description.trim(),
      file: selectedFile,
      ownerId: user.id,
    };

    try {
      if (property.id) {
        await updateProperty(property.id, payload);
        showNotice("Propiedad actualizada correctamente.");
      } else {
        await addProperty(user.id, payload);
        showNotice("Propiedad publicada correctamente.");
      }
      await refreshProperties(user.id);
      setProperty(EMPTY_PROPERTY);
      setSelectedFile(null);
      setExistingImage("");
      setActiveSection("mispropiedades");
    } catch (error) {
      console.error("No se pudo guardar la propiedad:", error);
      showNotice(error.message || "No se pudo guardar la propiedad.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditProperty = (item) => {
    setProperty({
      id: item.id,
      title: item.title || item.titulo || "",
      location: item.location || item.ubicacion || "",
      price: item.price || item.precio || "",
      type: item.type || item.tipo || "",
      description: item.description || item.descripcion || "",
    });
    setSelectedFile(null);
    setExistingImage(item.imageUrl || item.image || "");
    setActiveSection("publicar");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProperty = async (item) => {
    if (!window.confirm("¿Deseas eliminar esta propiedad permanentemente?")) {
      return;
    }
    try {
      await deleteProperty(item.id);
      await refreshProperties(user.id);
      showNotice("Propiedad eliminada correctamente.");
    } catch (error) {
      console.error("No se pudo eliminar la propiedad:", error);
      showNotice(error.message || "No se pudo eliminar la propiedad.", "error");
    }
  };

  const handleChangePassword = async (passwords, clear) => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotice("La confirmación de contraseña no coincide.", "error");
      return;
    }
    setSaving(true);
    try {
      await cambiarPassword(passwords.currentPassword, passwords.newPassword);
      clear();
      showNotice("Contraseña actualizada correctamente.");
    } catch (error) {
      console.error("No se pudo cambiar la contraseña:", error);
      showNotice(error.message || "No se pudo cambiar la contraseña.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Esta acción es permanente. ¿Confirmas que deseas eliminar tu cuenta y tus propiedades?",
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      for (const item of properties) {
        await deleteProperty(item.id);
      }
      await eliminarCuentaUsuario();
      navigate("/home.html", { replace: true });
    } catch (error) {
      console.error("No se pudo eliminar la cuenta:", error);
      showNotice(error.message || "No se pudo eliminar la cuenta.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("¿Deseas cerrar sesión?")) return;
    try {
      await cerrarSesion();
      navigate("/home.html", { replace: true });
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      showNotice(error.message || "No se pudo cerrar la sesión.", "error");
    }
  };

  const editCurrentUserProfile = () => {
    setActiveSection("personal");
    document.getElementById("personal")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) {
    return (
      <main className="container py-5" aria-live="polite">
        Cargando tu cuenta...
      </main>
    );
  }

  return (
    <>
      <SellerNavigation onAccountClick={editCurrentUserProfile} />
      <div className="seller-dashboard">
        <SellerSidebar
          user={user}
          avatar={avatar}
          propertyCount={properties.length}
          activeSection={activeSection}
          onAvatarChange={handleAvatarChange}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
        <main className="seller-main">
          <section className="welcome-banner">
            <div className="welcome-banner-text">
              <h2>
                Bienvenido de vuelta,{" "}
                <span>
                  {(user.nombre || user.email || "Usuario").split(" ")[0]}
                </span>
              </h2>
              <p>
                Administra tus propiedades, actualiza tu perfil y gestiona tu
                cuenta.
              </p>
            </div>
            <div className="welcome-banner-stats">
              <div className="stat-item">
                <strong>{properties.length}</strong>
                <span>Propiedades</span>
              </div>
              <div className="stat-item">
                <strong>--</strong>
                <span>Vistas hoy</span>
              </div>
              <div className="stat-item">
                <strong>--</strong>
                <span>Contactos</span>
              </div>
            </div>
          </section>

          <div className="seller-sections">
            {activeSection === "personal" && (
              <ProfileSection
                user={user}
                onSave={handleSaveProfileField}
                savingField={savingField}
              />
            )}
            {activeSection === "publicar" && (
              <PropertyForm
                property={property}
                setProperty={setProperty}
                image={previewUrl}
                setImage={(file) => {
                  setSelectedFile(file);
                  setExistingImage("");
                }}
                isSaving={saving}
                onSubmit={handlePropertySubmit}
              />
            )}
            {activeSection === "mispropiedades" && (
              <PropertiesSection
                properties={visibleProperties}
                query={search}
                onQueryChange={setSearch}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            )}
            {activeSection === "seguridad" && (
              <SecuritySection
                onChangePassword={handleChangePassword}
                onDeleteAccount={handleDeleteAccount}
                isSaving={saving}
              />
            )}
          </div>
        </main>
      </div>
      <SiteFooter />
      {notice && (
        <div
          className={`seller-toast seller-toast-${notice.type}`}
          role="status"
          aria-live="polite"
        >
          {notice.message}
        </div>
      )}
    </>
  );
}
