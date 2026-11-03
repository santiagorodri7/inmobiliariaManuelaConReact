import { Building2 } from "lucide-react";
import PropertyCard from "./PropertyCard.jsx";
import { PropertyGridSkeleton } from "../ui/Skeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function PropertyGrid({
  properties = [],
  loading = false,
  error = "",
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction = null,
  skeletonCount = 3,
}) {
  const { t } = useI18n();
  if (loading) return <PropertyGridSkeleton count={skeletonCount} />;
  if (error) {
    return (
      <ErrorState
        title={t("property.grid.errorTitle")}
        description={error}
        onRetry={onRetry}
      />
    );
  }
  if (!properties.length) {
    return (
      <EmptyState
        icon={Building2}
        title={emptyTitle || t("property.grid.emptyTitle")}
        description={emptyDescription || t("property.grid.emptyDescription")}
        action={emptyAction}
      />
    );
  }
  return (
    <div className="property-grid">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
