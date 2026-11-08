import { useEffect, useState } from "react";
import {
  listMostViewedProperties,
  MAX_MOST_VIEWED,
} from "../services/propertyViewsService.js";

export const useMostViewedProperties = (limit = MAX_MOST_VIEWED) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    listMostViewedProperties(limit)
      .then((items) => {
        if (active) setProperties(items);
      })
      .catch((error) => {
        console.warn("No se pudieron cargar las propiedades más vistas:", error);
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return { properties, loading };
};
