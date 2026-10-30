import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  ChevronRight,
  ExternalLink,
  MapPin,
  Maximize,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PropertyGallery from "../../components/property/PropertyGallery.jsx";
import PropertyGrid from "../../components/property/PropertyGrid.jsx";
import ContactForm from "../../components/contact/ContactForm.jsx";
import { OperationBadge, PropertyStatusPill } from "../../components/ui/StatusBadge.jsx";
import ErrorState from "../../components/ui/ErrorState.jsx";
import { PageLoader } from "../../components/ui/Spinner.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useProperties } from "../../hooks/useProperties.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPropertyById } from "../../services/propertiesService.js";
import { formatArea, formatCOP } from "../../utils/format.js";
import { isAdmin } from "../../utils/roles.js";
import { site, whatsappUrl } from "../../config/site.js";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { properties: publicProperties } = useProperties({ publicOnly: true });

  usePageTitle(
    property?.title || "Detalle de propiedad",
    property?.description || "Conoce esta propiedad en Medellín y agenda una visita.",
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getPropertyById(id)
      .then((item) => {
        if (active) setProperty(item);
      })
      .catch((loadError) => {
        console.error("No se pudo cargar la propiedad:", loadError);
        if (active) setError("No pudimos cargar esta propiedad. Inténtalo de nuevo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const canSee = useMemo(() => {
    if (!property) return false;
    if (property.status === "disponible") return true;
    if (!profile) return false;
    return isAdmin(profile) || property.ownerId === profile.id;
  }, [property, profile]);

  const related = useMemo(() => {
    if (!property) return [];
    return publicProperties
      .filter(
        (item) =>
          item.id !== property.id &&
          (item.operation === property.operation ||
            item.type === property.type),
      )
      .slice(0, 3);
  }, [publicProperties, property]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles.");
    } catch {
      toast.info("Copia el enlace desde la barra del navegador.");
    }
  };

  if (loading) return <PageLoader message="Cargando propiedad…" />;

  if (error) {
    return (
      <section className="section">
        <div className="shell">
          <ErrorState
            title="No pudimos abrir esta propiedad"
            description={error}
            onRetry={() => window.location.reload()}
          />
          <div className="text-center mt-4">
            <Link to="/" className="btn btn-outline-secondary">
              <ArrowLeft size={16} aria-hidden="true" />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!property || !canSee) {
    return (
      <section className="section">
        <div className="shell">
          <div className="not-found-card">
            <Building2 size={30} aria-hidden="true" />
            <p className="eyebrow">Propiedad no disponible</p>
            <h1>No encontramos esta publicación</h1>
            <p>
              Puede que haya sido retirada o que el enlace ya no sea válido.
              Explora el catálogo actual o cuéntanos qué estás buscando.
            </p>
            <Link to="/" className="btn btn-primary">
              Ver propiedades
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const specs = [
    property.bedrooms > 0 && { icon: BedDouble, label: "Habitaciones", value: property.bedrooms },
    property.bathrooms > 0 && { icon: Bath, label: "Baños", value: property.bathrooms },
    property.parking > 0 && { icon: Car, label: "Parqueaderos", value: property.parking },
    property.area > 0 && { icon: Maximize, label: "Área", value: formatArea(property.area) },
    property.stratum > 0 && { icon: Building2, label: "Estrato", value: property.stratum },
  ].filter(Boolean);

  const inquirySubject =
    property.operation === "renta"
      ? "Quiero arrendar una propiedad"
      : "Quiero comprar una propiedad";

  return (
    <>
      <section className="property-detail-hero">
        <div className="shell">
          <nav className="breadcrumb-line breadcrumb-line--dark" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link to="/#propiedades">Propiedades</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <span>{property.title}</span>
          </nav>

          <div className="property-detail-grid">
            <div className="property-detail-grid__gallery">
              <PropertyGallery property={property} />
            </div>

            <aside className="property-summary">
              <div className="property-summary__top">
                <OperationBadge operation={property.operation} />
                {property.status !== "disponible" && (
                  <PropertyStatusPill status={property.status} />
                )}
                <button type="button" className="icon-button" onClick={handleShare} aria-label="Compartir propiedad">
                  <Share2 size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="property-summary__type">{property.type}</p>
              <h1>{property.title}</h1>
              <p className="property-summary__location">
                <MapPin size={17} aria-hidden="true" />
                {property.location || "Ubicación por confirmar"}
              </p>

              <div className="property-summary__price">
                <span>{property.operation === "renta" ? "Canon mensual" : "Precio de venta"}</span>
                <strong>{formatCOP(property.price)}</strong>
                {property.operation === "renta" && <small>COP / mes</small>}
              </div>

              {specs.length > 0 && (
                <div className="property-spec-grid">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="property-summary__actions">
                <a href="#consulta" className="btn btn-primary w-100">
                  Solicitar una visita
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a
                  href={whatsappUrl(
                    `Hola ${site.name}, me interesa la propiedad "${property.title}" (${property.location}). ¿Podemos hablar?`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-secondary w-100"
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  Preguntar por WhatsApp
                </a>
              </div>

              <div className="agent-mini-card">
                <span className="agent-mini-card__mark" aria-hidden="true">MB</span>
                <div>
                  <strong>{site.name}</strong>
                  <span>{site.role}</span>
                </div>
                <ShieldCheck size={19} aria-label="Acompañamiento directo" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section property-detail-body">
        <div className="shell property-detail-body__grid">
          <div className="property-detail-copy">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Sobre este lugar</p>
                <h2>Lo que hace especial esta propiedad</h2>
              </div>
            </div>
            <p className="property-description">{property.description}</p>

            {property.amenities.length > 0 && (
              <div className="amenities-block">
                <h3>Amenidades y espacios</h3>
                <ul>
                  {property.amenities.map((amenity) => (
                    <li key={amenity}>
                      <Check size={15} aria-hidden="true" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="property-location-card">
              <span className="property-location-card__icon" aria-hidden="true">
                <MapPin size={22} />
              </span>
              <div>
                <h3>{property.location || "Ubicación por confirmar"}</h3>
                <p>
                  La dirección exacta se comparte durante la visita para cuidar
                  la privacidad de quienes viven en el inmueble.
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.location || "Medellín"}, Colombia`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-sm"
              >
                Ver zona
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="property-detail-note">
              <Sparkles size={18} aria-hidden="true" />
              <p>
                ¿Quieres revisar esta propiedad con más detalle? Podemos
                coordinar una visita y revisar juntos las condiciones,
                documentos y tiempos del proceso.
              </p>
            </div>
          </div>

          <aside className="property-detail-aside">
            <div className="surface property-consult-card">
              <p className="eyebrow">Hablemos de esta propiedad</p>
              <h2>Agenda una visita</h2>
              <p>
                Déjanos tus datos y te contactamos para coordinar una visita o
                resolver tus dudas.
              </p>
              <ContactForm
                propertyId={property.id}
                defaultSubject={inquirySubject}
                compact
              />
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--sand">
          <div className="shell">
            <div className="section-heading section-heading--split">
              <div>
                <p className="eyebrow">También te puede interesar</p>
                <h2>Otras propiedades para explorar</h2>
              </div>
              <Link to="/#propiedades" className="text-link">
                Ver todo el catálogo
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <PropertyGrid properties={related} />
          </div>
        </section>
      )}
    </>
  );
}
