import { useCallback, useEffect, useState } from "react";
import {
  listProperties,
  listPropertiesByOwner,
} from "../services/propertiesService.js";
import { isPublicProperty } from "../utils/property.js";
import { getErrorMessage } from "../utils/errors.js";

export const useProperties = ({ ownerId = "", publicOnly = false } = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const request = ownerId
      ? listPropertiesByOwner(ownerId)
      : listProperties();

    request
      .then((items) => {
        if (!active) return;
        setProperties(publicOnly ? items.filter(isPublicProperty) : items);
      })
      .catch((loadError) => {
        console.error("No se pudieron cargar las propiedades:", loadError);
        if (active) {
          setError(
            getErrorMessage(
              loadError,
              "No se pudieron cargar las propiedades.",
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
  }, [ownerId, publicOnly, version]);

  return { properties, loading, error, reload, setProperties };
};
