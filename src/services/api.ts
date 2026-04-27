import { getStoredToken } from "./auth/sessionStorage";
import { BACKEND_API_URL } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
   method?: HttpMethod;
   body?: unknown;
   headers?: Record<string, string>;
   auth?: boolean;
};

const buildUrl = (path: string): string => {
   if (/^https?:\/\//i.test(path)) return path;
   return `${BACKEND_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const getErrorMessage = (payload: unknown, status: number): string => {
   if (payload && typeof payload === "object") {
      const message = (payload as any).message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join("\n");

      const error = (payload as any).error;
      if (typeof error === "string") return error;
   }

   return `Request failed with status ${status}`;
};

const parseResponse = async (response: Response): Promise<any> => {
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

      console.log("TOKEN USED:", token);

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
      console.log("API ERROR:", response.status, payload);
      throw new Error(getErrorMessage(payload, response.status));
   }

   return payload as T;
}