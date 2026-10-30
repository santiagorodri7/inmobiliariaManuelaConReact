import { MessageSquareQuote } from "lucide-react";
import TestimonialCard from "./TestimonialCard.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";

export default function TestimonialGrid({
  testimonials = [],
  loading = false,
  error = "",
  limit = 0,
}) {
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

  if (error) return <ErrorState title="No pudimos cargar los testimonios" description={error} compact />;

  const items = limit ? testimonials.slice(0, limit) : testimonials;
  if (!items.length) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="Aún no hay testimonios publicados"
        description="Las experiencias de nuestros clientes aparecerán aquí."
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
