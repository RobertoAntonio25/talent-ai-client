// src/hooks/useManualSearch.ts
// Búsqueda manual JSearch + matcher IA (extraído de Settings).
// Se usa en /buscar y en el botón rápido del header (vía autostart).
// Fase 3a (issue #128, BREAKING): el back responde 202 con runId al instante
// y el ciclo sigue en segundo plano. Aquí se sondea GET /runs/:runId cada
// 5 s hasta DONE/ERROR y luego se leen los resultados. La IA ya evaluó
// dentro del ciclo: no hay segunda llamada al matcher. Si el cliente aborta,
// el ciclo sigue y el runId recupera el resultado.
// Fase 3b (issue #129): la "última sincronización" es real (GET
// /runs/latest → finishedAt ?? startedAt del último SearchCycleRun) y ya no
// vive en localStorage. La clave vieja solo se limpia por higiene.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLatestSearchCycleRun,
  getSearchCycleRun,
  getUserResults,
  triggerManualSearch,
} from "../services/jobsService";

const LEGACY_LAST_SEARCH_KEY = "lastManualSearchAt";
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 60; // 5 min: el ciclo tarda 1-3 min la 1ª vez

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useManualSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Fase 3b: sincronización real desde SearchCycleRun (sin localStorage).
  const [lastSearchAt, setLastSearchAt] = useState<string | null>(null);
  const busyRef = useRef(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    // Higiene: la Fase 3b jubiló esta clave; si queda un valor viejo, fuera.
    try {
      localStorage.removeItem(LEGACY_LAST_SEARCH_KEY);
    } catch {
      // localStorage no disponible (SSR/tests): no es fatal.
    }
    // Última sincronización real al montar (404 = aún no hay ciclos).
    void getLatestSearchCycleRun()
      .then((res) => {
        if (cancelledRef.current) return;
        setLastSearchAt(res.data.finishedAt ?? res.data.startedAt);
      })
      .catch(() => {
        if (!cancelledRef.current) setLastSearchAt(null);
      });
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const runSearch = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsSearching(true);
    setSearchSuccess(null);
    setSearchError(null);
    try {
      const trigger = await triggerManualSearch();
      const runId = trigger.data.runId;

      let attempts = 0;
      let status: string = "RUNNING";
      let offersNew = 0;
      let aiEvaluated = 0;
      let aiMatches = 0;
      while (status === "RUNNING") {
        attempts += 1;
        if (attempts > POLL_MAX_ATTEMPTS) {
          throw new Error(
            "La búsqueda sigue en curso. Revisa el Panel de empleo en unos minutos.",
          );
        }
        await sleep(POLL_INTERVAL_MS);
        if (cancelledRef.current) return;
        const run = await getSearchCycleRun(runId);
        status = run.data.status;
        offersNew = run.data.offersNew;
        aiEvaluated = run.data.aiEvaluated;
        aiMatches = run.data.aiMatches;
        if (status === "ERROR") {
          throw new Error(
            run.data.error ||
              "La búsqueda falló en el servidor. Inténtalo de nuevo.",
          );
        }
      }

      const res = await getUserResults(1, 20);
      if (cancelledRef.current) return;
      const total = res.meta.total;
      // Fase 3b: fecha real del ciclo recién cerrado (sin localStorage).
      try {
        const latest = await getLatestSearchCycleRun();
        if (!cancelledRef.current) {
          setLastSearchAt(
            latest.data.finishedAt ?? latest.data.startedAt ?? null,
          );
        }
      } catch {
        if (!cancelledRef.current) setLastSearchAt(new Date().toISOString());
      }
      const baseMsg =
        total === 0
          ? "Búsqueda completada, pero no se encontraron ofertas con tu perfil actual. Prueba a actualizar tu CV."
          : `¡Búsqueda completada! Se sincronizaron ${total} ofertas relevantes en el Panel de empleo (${offersNew} nuevas).`;
      setSearchSuccess(
        aiEvaluated === 0
          ? `${baseMsg} La IA no encontró ofertas pendientes por evaluar.`
          : `${baseMsg} La IA evaluó ${aiEvaluated} de ellas: ${aiMatches} compatibles.`,
      );
    } catch (e) {
      if (cancelledRef.current) return;
      setSearchError(
        e instanceof Error ? e.message : "Error al lanzar la búsqueda.",
      );
    } finally {
      busyRef.current = false;
      if (!cancelledRef.current) setIsSearching(false);
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
