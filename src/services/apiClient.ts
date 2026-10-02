// Base URL: SOLO desde variables de entorno (nada hardcodeado en el código).
// Local → .env (VIT_API_URL o VITE_API_URL). Vercel → Settings → Environment Variables.
// Sin esta variable la app no arranca: falla rápido con un mensaje claro.
const ENV_API_URL: string | undefined =
  import.meta.env.VIT_API_URL || import.meta.env.VITE_API_URL;

if (!ENV_API_URL) {
  throw new Error(
    "[apiClient] Falta la URL del backend: define VIT_API_URL (o VITE_API_URL) en tu .env local o en las Environment Variables de Vercel.",
  );
}

export const API_BASE_URL: string = ENV_API_URL;

/**
 * Error tipado para no perder status/code del backend.
 * El back devuelve { success:false, error, code } con códigos como:
 * OAUTH_ONLY_ACCOUNT, TOKEN_EXPIRED, INVALID_TOKEN,
 * AUTH_RATE_LIMIT_EXCEEDED, RATE_LIMIT_EXCEEDED, VALIDATION_ERROR
 */
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (code) this.code = code;
  }
}

interface FetchOptions extends RequestInit {
  data?: unknown;
  timeoutMs?: number;
}

function combineSignals(
  customSignal: AbortSignal | null | undefined,
  controller: AbortController,
): AbortSignal {
  if (!customSignal) return controller.signal;

  // Camino moderno: AbortSignal.any (Chrome 116+, FF 120+, Safari 17.4+)
  const anyFn = (AbortSignal as unknown as Record<string, unknown>)["any"];
  if (typeof anyFn === "function") {
    return (
      AbortSignal as unknown as {
        any: (signals: AbortSignal[]) => AbortSignal;
      }
    ).any([customSignal, controller.signal]);
  }

  // Fallback navegadores viejos: propaga el abort manual
  if (customSignal.aborted) controller.abort();
  else
    customSignal.addEventListener("abort", () => controller.abort(), {
      once: true,
    });
  return controller.signal;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    data,
    headers,
    timeoutMs,
    signal: customSignal,
    ...customConfig
  } = options;

  // Obtenemos el token guardado si existe
  const token = localStorage.getItem("token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timeoutId = timeoutMs
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  const combinedSignal = combineSignals(customSignal ?? null, controller);

  // Mezclamos cabeceras en un objeto mutable para poder borrar Content-Type en FormData
  const configHeaders: Record<string, string> = {
    ...defaultHeaders,
    ...((headers as Record<string, string> | undefined) ?? {}),
  };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    signal: combinedSignal,
    headers: configHeaders,
  };

  // Si pasamos body y no es FormData, lo serializamos a JSON
  if (data) {
    if (data instanceof FormData) {
      // FIX 6.1: borrar en configHeaders (la copia que viaja), no en defaultHeaders.
      // Si dejamos application/json, Multer rechaza el PDF de /api/ai/cv-extractor.
      delete configHeaders["Content-Type"];
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  try {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);
    if (response.status === 401) {
      // Si la ruta no es de auth (login/register), limpiamos token inválido
      if (!endpoint.includes("/auth/")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    // Parsear la respuesta
    let responseData: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Extraer mensaje + code del backend ({ message, error, code })
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;

      if (typeof responseData === "object" && responseData !== null) {
        const parsed = responseData as Record<string, unknown>;
        if (typeof parsed["code"] === "string") {
          errorCode = parsed["code"] as string;
        }
        if (typeof parsed["message"] === "string" && parsed["message"]) {
          errorMessage = parsed["message"] as string;
        } else if (typeof parsed["error"] === "string" && parsed["error"]) {
          errorMessage = parsed["error"] as string;
        }
      } else if (typeof responseData === "string" && responseData) {
        errorMessage = responseData;
      }

      // Traducción humana del rate-limit (10 req/15min auth, 30 req/15min ai)
      if (response.status === 429) {
        errorMessage =
          "Demasiadas peticiones. Inténtalo de nuevo en 15 minutos.";
        if (!errorCode) errorCode = "RATE_LIMIT_EXCEEDED";
      }

      throw new ApiError(errorMessage, response.status, errorCode);
    }
    return responseData as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new ApiError(
        timeoutMs && timeoutMs >= 60000
          ? "La búsqueda está tardando más de lo esperado (servidor despertando + IA analizando). Espera 1-2 min y revisa el Dashboard."
          : "Petición cancelada por timeout. Inténtalo de nuevo.",
        0,
        "TIMEOUT",
      );
    }
    // Fallo de red / CORS / Render dormido
    if (e instanceof TypeError) {
      throw new ApiError(
        "No se pudo conectar con el servidor. Si es la primera petición del día, Render tarda 30-50s en despertar: espera y reintenta.",
        0,
        "NETWORK_ERROR",
      );
    }
    throw e;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
