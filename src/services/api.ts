import { getStoredToken } from "./auth/sessionStorage";
import { BACKEND_API_URL } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
   method?: HttpMethod;
   body?: unknown;
   headers?: Record<string, string>;
   auth?: boolean;
};

const buildUrl = (path: string) => {
   if (/^https?:\/\//i.test(path)) return path;
   return `${BACKEND_API_URL}${path}`;
};

const getErrorMessage = (payload: unknown, status: number) => {
   if (payload && typeof payload === "object") {
      const detail = (payload as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;

      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) {
         return message.filter((item) => typeof item === "string").join("\n");
      }

      const error = (payload as { error?: unknown }).error;
      if (typeof error === "string") return error;
   }

   return `Request failed with status ${status}`;
};

const parseResponse = async (response: Response) => {
   const text = await response.text();
   if (!text) return null;

   try {
      return JSON.parse(text);
   } catch {
      return text;
   }
};

export async function apiRequest<T>(
   path: string,
   options: RequestOptions = {},
): Promise<T> {
   const { method = "GET", body, headers = {}, auth = true } = options;
   const requestHeaders: Record<string, string> = { ...headers };

   if (!(body instanceof FormData) && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
   }

   if (auth) {
      const token = await getStoredToken();
      if (token) {
         requestHeaders.Authorization = `Bearer ${token}`;
      }
   }

   const response = await fetch(buildUrl(path), {
      method,
      headers: requestHeaders,
      body:
         body === undefined
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
   });

   const payload = await parseResponse(response);
   if (!response.ok) {
      throw new Error(getErrorMessage(payload, response.status));
   }

   return payload as T;
}
