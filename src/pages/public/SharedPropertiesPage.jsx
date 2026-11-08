import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PropertyGrid from "../../components/property/PropertyGrid.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { usePageTitle } from "../../hooks/usePageTitle.js";
import { useI18n } from "../../i18n/I18nContext.jsx";
import { getPropertiesByIds } from "../../services/propertiesService.js";
import { parseSharedPropertyIds } from "../../utils/share.js";

export default function SharedPropertiesPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const ids = useMemo(
    () => parseSharedPropertyIds(searchParams.get("ids") || ""),
    [searchParams],
  );
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageTitle(
    t("shared.pageTitle"),
    t("shared.pageDescription", { count: ids.length }),
  );

  useEffect(() => {
    let active = true;
    if (!ids.length) {
      setProperties([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    getPropertiesByIds(ids)
      .then((items) => {
        if (active) setProperties(items);
      })
      .catch((loadError) => {
        console.error("No se pudo cargar la selección compartida:", loadError);
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ids]);

  if (!ids.length) {
    return <Navigate to="/#propiedades" replace />;
  }

  return (
    <>
      <PageHeader
        eyebrow={t("shared.eyebrow")}
        title={t("shared.title", { count: ids.length })}
        description={t("shared.description")}
        breadcrumb={[
          { label: t("shared.breadcrumb") },
        ]}
      />

      <section className="section">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("shared.listEyebrow")}</p>
              <h2>{t("shared.listTitle")}</h2>
              <p>{t("shared.listDescription")}</p>
            </div>
            <Link to="/#propiedades" className="text-link">
              {t("shared.viewCatalog")}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          {!loading && properties.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={t("shared.emptyTitle")}
              description={t("shared.emptyDescription")}
              action={
                <Link to="/#propiedades" className="btn btn-primary">
                  {t("shared.viewCatalog")}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              }
            />
          ) : (
            <PropertyGrid
              properties={properties}
              loading={loading}
              skeletonCount={Math.min(ids.length, 6)}
            />
          )}
        </div>
      </section>
    </>
  );
}
