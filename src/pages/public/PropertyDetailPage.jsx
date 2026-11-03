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
  Clock3,
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
import { useI18n } from "../../i18n/I18nContext.jsx";
import { getPropertyById } from "../../services/propertiesService.js";
import { isAdmin } from "../../utils/roles.js";
import { isAvailable } from "../../utils/property.js";
import { buildWhatsappUrl, isWhatsappConfigured } from "../../utils/whatsapp.js";
import { site, whatsappUrl } from "../../config/site.js";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const {
    t,
    formatArea,
    formatCOP,
    propertyTypeLabel,
    amenityLabel,
  } = useI18n();
  const { profile } = useAuth();
  const toast = useToast();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { properties: publicProperties } = useProperties({ publicOnly: true });

  usePageTitle(
    property?.title || t("property.detail.pageTitle"),
    property?.description || t("property.detail.pageDescription"),
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
        if (!active) return;
        if (loadError?.code === "permission-denied") {
          setProperty(null);
          return;
        }
        setError(t("property.detail.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, t]);

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

  const isActive = isAvailable(property);

  const manuWhatsappHref = useMemo(() => {
    if (!property || !isActive || !isWhatsappConfigured) return "";
    const propertyUrl = `${window.location.origin}/propiedad/${encodeURIComponent(property.id)}`;
    return buildWhatsappUrl(
      t("property.detail.talkToManu.message", {
        title: property.title,
        url: propertyUrl,
      }),
    );
  }, [property, isActive, t]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t("property.detail.shareCopied"));
    } catch {
      toast.info(t("property.detail.shareManual"));
    }
  };

  if (loading) return <PageLoader message={t("property.detail.loading")} />;

  if (error) {
    return (
      <section className="section">
        <div className="shell">
          <ErrorState
            title={t("property.detail.errorTitle")}
            description={error}
            onRetry={() => window.location.reload()}
          />
          <div className="text-center mt-4">
            <Link to="/" className="btn btn-outline-secondary">
              <ArrowLeft size={16} aria-hidden="true" />
              {t("property.detail.backCatalog")}
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
            <p className="eyebrow">{t("property.detail.unavailableEyebrow")}</p>
            <h1>{t("property.detail.unavailableTitle")}</h1>
            <p>{t("property.detail.unavailableText")}</p>
            <Link to="/" className="btn btn-primary">
              {t("property.detail.viewProperties")}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const specs = [
    property.bedrooms > 0 && {
      icon: BedDouble,
      label: t("property.detail.specs.bedrooms"),
      value: property.bedrooms,
    },
    property.bathrooms > 0 && {
      icon: Bath,
      label: t("property.detail.specs.bathrooms"),
      value: property.bathrooms,
    },
    property.parking > 0 && {
      icon: Car,
      label: t("property.detail.specs.parking"),
      value: property.parking,
    },
    property.area > 0 && {
      icon: Maximize,
      label: t("property.detail.specs.area"),
      value: formatArea(property.area),
    },
    property.stratum > 0 && {
      icon: Building2,
      label: t("property.detail.specs.stratum"),
      value: property.stratum,
    },
  ].filter(Boolean);

  const inquirySubject =
    property.operation === "renta"
      ? t("labels.contactSubject.rent")
      : t("labels.contactSubject.buy");

  const location = property.location || t("property.detail.locationPending");

  return (
    <>
      <section className="property-detail-hero">
        <div className="shell">
          <nav className="breadcrumb-line" aria-label={t("nav.breadcrumb")}>
            <Link to="/">{t("property.detail.breadcrumbHome")}</Link>
            <ChevronRight size={13} aria-hidden="true" />
            <Link to="/#propiedades">{t("property.detail.breadcrumbProperties")}</Link>
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
                <button
                  type="button"
                  className="icon-button"
                  onClick={handleShare}
                  aria-label={t("property.detail.shareAria")}
                >
                  <Share2 size={18} aria-hidden="true" />
                </button>
              </div>

              <p className="property-summary__type">
                {propertyTypeLabel(property.type)}
              </p>
              <h1>{property.title}</h1>
              <p className="property-summary__location">
                <MapPin size={17} aria-hidden="true" />
                {location}
              </p>

              <div className="property-summary__price">
                <span>
                  {property.operation === "renta"
                    ? t("property.detail.monthlyRent")
                    : t("property.detail.salePrice")}
                </span>
                <strong>{formatCOP(property.price)}</strong>
                {property.operation === "renta" && (
                  <small>{t("property.detail.perMonth")}</small>
                )}
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
                  {t("property.detail.requestVisit")}
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a
                  href={whatsappUrl(
                    t("property.detail.whatsappMessage", {
                      name: site.name,
                      title: property.title,
                      location,
                    }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-secondary w-100"
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  {t("property.detail.askWhatsapp")}
                </a>
              </div>

              <div className="agent-mini-card">
                <span className="agent-mini-card__mark" aria-hidden="true">MB</span>
                <div>
                  <strong>{site.name}</strong>
                  <span>{t("site.role")}</span>
                </div>
                <ShieldCheck
                  size={19}
                  aria-label={t("property.detail.directSupport")}
                />
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
                <p className="eyebrow">{t("property.detail.aboutEyebrow")}</p>
                <h2>{t("property.detail.aboutTitle")}</h2>
              </div>
            </div>
            <p className="property-description">{property.description}</p>

            {property.amenities.length > 0 && (
              <div className="amenities-block">
                <h3>{t("property.detail.amenitiesTitle")}</h3>
                <ul>
                  {property.amenities.map((amenity) => (
                    <li key={amenity}>
                      <Check size={15} aria-hidden="true" />
                      {amenityLabel(amenity)}
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
                <h3>{location}</h3>
                <p>{t("property.detail.addressNote")}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${property.location || t("property.detail.locationPending")}, Colombia`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary btn-sm"
              >
                {t("property.detail.viewArea")}
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="property-detail-note">
              <Sparkles size={18} aria-hidden="true" />
              <p>{t("property.detail.reviewNote")}</p>
            </div>
          </div>

          <aside className="property-detail-aside">
            {isActive && manuWhatsappHref && (
              <section
                className="surface manu-contact-card"
                aria-labelledby="manu-contact-title"
              >
                <div className="manu-contact-card__head">
                  <span className="manu-contact-card__icon" aria-hidden="true">
                    <MessageCircle size={22} />
                  </span>
                  <div>
                    <p className="eyebrow">
                      {t("property.detail.talkToManu.eyebrow")}
                    </p>
                    <h2 id="manu-contact-title">
                      {t("property.detail.talkToManu.title")}
                    </h2>
                  </div>
                </div>
                <p>{t("property.detail.talkToManu.text")}</p>
                <span className="manu-contact-card__availability">
                  <Clock3 size={15} aria-hidden="true" />
                  {t("property.detail.talkToManu.availability")}
                </span>
                <a
                  href={manuWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-100"
                  aria-label={t("property.detail.talkToManu.aria", {
                    title: property.title,
                  })}
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  {t("property.detail.talkToManu.cta")}
                </a>
              </section>
            )}

            <div className="surface property-consult-card" id="consulta">
              <p className="eyebrow">{t("property.detail.consultEyebrow")}</p>
              <h2>{t("property.detail.consultTitle")}</h2>
              <p>{t("property.detail.consultText")}</p>
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
                <p className="eyebrow">{t("property.detail.relatedEyebrow")}</p>
                <h2>{t("property.detail.relatedTitle")}</h2>
              </div>
              <Link to="/#propiedades" className="text-link">
                {t("property.detail.viewCatalog")}
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
