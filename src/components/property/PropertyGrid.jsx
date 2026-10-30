import { Building2 } from "lucide-react";
import PropertyCard from "./PropertyCard.jsx";
import { PropertyGridSkeleton } from "../ui/Skeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";

export default function PropertyGrid({
  properties = [],
  loading = false,
  error = "",
  onRetry,
  emptyTitle = "Todavía no hay propiedades publicadas",
  emptyDescription = "Vuelve pronto o cuéntanos qué estás buscando para ayudarte a encontrarlo.",
  emptyAction = null,
  skeletonCount = 3,
}) {
  if (loading) return <PropertyGridSkeleton count={skeletonCount} />;
  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar las propiedades"
        description={error}
        onRetry={onRetry}
      />
    );
  }
  if (!properties.length) {
    return (
      <EmptyState
        icon={Building2}
        title={emptyTitle}
        description={emptyDescription}
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
