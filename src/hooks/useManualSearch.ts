// src/hooks/useManualSearch.ts
// Búsqueda manual JSearch + matcher IA (extraído de Settings).
// Se usa en /buscar y en el botón rápido del header (vía autostart).
// Tarda 1-3 min: botón deshabilitado, timeout largo en el service, sin
// reintentos en paralelo.
import { useCallback, useState } from "react";
import { triggerManualSearch } from "../services/jobsService";
import { runMatcher } from "../services/aiService";

const LAST_SEARCH_KEY = "lastManualSearchAt";

function formatLastSearch(iso: string | null): string {
  if (!iso) return "Sin rastreos aún";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Sin rastreos aún";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useManualSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(() =>
    localStorage.getItem(LAST_SEARCH_KEY),
  );

  const runSearch = useCallback(async () => {
    setIsSearching(true);
    setSearchSuccess(null);
    setSearchError(null);
    try {
      const res = await triggerManualSearch();
      const total = res.data.meta.total;
      const nowIso = new Date().toISOString();
      localStorage.setItem(LAST_SEARCH_KEY, nowIso);
      setLastSearchAt(nowIso);
      const baseMsg =
        total === 0
          ? "Búsqueda completada, pero no se encontraron ofertas con tu perfil actual. Prueba a actualizar tu CV."
          : `¡Búsqueda completada! Se sincronizaron ${total} ofertas relevantes en el Panel de empleo.`;
      // Las ofertas nuevas entran como PENDING; el matcher las puntúa con IA.
      try {
        const matcher = await runMatcher();
        setSearchSuccess(
          matcher.processed === 0
            ? `${baseMsg} La IA no encontró ofertas pendientes por evaluar.`
            : `${baseMsg} La IA evaluó ${matcher.processed} de ellas: ${matcher.matches} compatibles.`,
        );
      } catch {
        setSearchSuccess(
          `${baseMsg} El análisis de compatibilidad con IA no se pudo completar; vuelve a intentarlo en unos minutos.`,
        );
      }
    } catch (e) {
      setSearchError(
        e instanceof Error ? e.message : "Error al lanzar la búsqueda.",
      );
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    isSearching,
    searchSuccess,
    searchError,
    lastSearchAt,
    lastSearchLabel: formatLastSearch(lastSearchAt),
    runSearch,
  };
}
