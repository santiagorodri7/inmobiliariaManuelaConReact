import { useEffect, useState } from "react";
import { listTestimonials } from "../services/testimonialsService.js";
import { getErrorMessage } from "../utils/errors.js";

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listTestimonials()
      .then((items) => {
        if (active) setTestimonials(items);
      })
      .catch((loadError) => {
        console.error("No se pudieron cargar los testimonios:", loadError);
        if (active) {
          setError(
            getErrorMessage(
              loadError,
              "No se pudieron cargar los testimonios.",
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { testimonials, loading, error, setTestimonials };
};
