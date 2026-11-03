import { MessageSquareQuote } from "lucide-react";
import TestimonialCard from "./TestimonialCard.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function TestimonialGrid({
  testimonials = [],
  loading = false,
  error = "",
  limit = 0,
}) {
  const { t } = useI18n();
  if (loading) {
    return (
      <div className="testimonial-grid">
        {[1, 2, 3].map((item) => (
          <div className="testimonial-card testimonial-card--skeleton" key={item}>
            <span className="skeleton skeleton-line skeleton-line--short" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line skeleton-line--medium" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorState title={t("testimonials.grid.errorTitle")} description={error} compact />;

  const items = limit ? testimonials.slice(0, limit) : testimonials;
  if (!items.length) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title={t("testimonials.grid.emptyTitle")}
        description={t("testimonials.grid.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="testimonial-grid">
      {items.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}
