export const API_BASE_URL =
  import.meta.env.VIT_API_URL || "https://talent-ai-4j4j.onrender.com";

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { data, headers, ...customConfig } = options;

  // Obtenemos el token guardado si existe
  const token = localStorage.getItem("token");

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  // Si pasamos body y no es FormData, lo serializamos a JSON
  if (data) {
    if (data instanceof FormData) {
      delete defaultHeaders["Content-Type"]; // El navegador asigna el boundary correcto
      config.body = data;
    } else {
      config.body = JSON.stringify(data);
    }
  }

  // Aseguramos que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

  // Manejo de token expirado o no autorizado
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
    // Extraer mensaje del backend (tus controladores devuelven { message, error, etc. })
    let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;

    if (typeof responseData === "object" && responseData !== null) {
      const data = responseData as Record<string, unknown>;
      if (typeof data.message === "string" && data.message) {
        errorMessage = data.message;
      } else if (typeof data.error === "string" && data.error) {
        errorMessage = data.error;
      }
    } else if (typeof responseData === "string" && responseData) {
      errorMessage = responseData;
    }

    throw new Error(errorMessage);
  }
  return responseData as T;
}
