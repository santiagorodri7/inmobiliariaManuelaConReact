import { Check, MessageSquareQuote, X } from "lucide-react";
import StarRating from "../testimonials/StarRating.jsx";
import { TestimonialStatusPill } from "../ui/StatusBadge.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import { TableSkeleton } from "../ui/Skeleton.jsx";
import { initials } from "../../utils/format.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function TestimonialsTable({
  testimonials = [],
  loading = false,
  error = "",
  onRetry,
  onModerate,
  busyId = "",
}) {
  const { t, formatDate } = useI18n();

  if (loading) return <TableSkeleton rows={6} columns={6} />;
  if (error) {
    return (
      <ErrorState
        title={t("admin.testimonialsTable.errorTitle")}
        description={error}
        onRetry={onRetry}
        compact
      />
    );
  }

  if (!testimonials.length) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title={t("admin.testimonialsTable.emptyTitle")}
        description={t("admin.testimonialsTable.emptyDescription")}
        compact
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{t("admin.testimonialsTable.author")}</th>
            <th>{t("admin.testimonialsTable.testimonial")}</th>
            <th>{t("admin.testimonialsTable.rating")}</th>
            <th>{t("admin.testimonialsTable.date")}</th>
            <th>{t("admin.testimonialsTable.status")}</th>
            <th className="text-end">{t("admin.testimonialsTable.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((testimonial) => {
            const approved =
              testimonial.estado === "aprobado" || testimonial.estado === "activo";
            const pending = testimonial.estado === "pendiente";
            const busy = busyId === testimonial.id;
            return (
              <tr key={testimonial.id}>
                <td>
                  <div className="table-user">
                    <span className="testimonial-card__avatar" aria-hidden="true">
                      {initials(testimonial.nombre)}
                    </span>
                    <div>
                      <strong>{testimonial.nombre}</strong>
                      <span>
                        {testimonial.profesion ||
                          t("admin.testimonialsTable.noProfession")}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="table-message">
                  <p>{testimonial.texto}</p>
                </td>
                <td className="table-rating">
                  <StarRating
                    value={testimonial.rating}
                    readOnly
                    size={13}
                    label={t("testimonials.card.ratingAria")}
                  />
                </td>
                <td>{formatDate(testimonial.fecha)}</td>
                <td>
                  <TestimonialStatusPill status={testimonial.estado} />
                </td>
                <td>
                  <div className="table-actions">
                    {!approved && (
                      <button
                        type="button"
                        className="icon-button icon-button--success"
                        onClick={() => onModerate(testimonial, "aprobado")}
                        disabled={busy}
                        title={t("admin.testimonialsTable.approve")}
                        aria-label={t("admin.testimonialsTable.approveAria", {
                          name: testimonial.nombre,
                        })}
                      >
                        <Check size={17} />
                      </button>
                    )}
                    {(approved || pending) && (
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => onModerate(testimonial, "inactivo")}
                        disabled={busy}
                        title={t("admin.testimonialsTable.reject")}
                        aria-label={t("admin.testimonialsTable.rejectAria", {
                          name: testimonial.nombre,
                        })}
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
