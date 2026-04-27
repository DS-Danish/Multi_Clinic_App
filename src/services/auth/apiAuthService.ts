import { apiRequest } from "../api";
import { clearSession, getStoredUser, hydrateSession, storeSession } from "./sessionStorage";
import {
   LoginCredentials,
   RegisterData,
   RegisterResponse,
   ResendVerificationResponse,
   User,
   VerifyEmailResponse,
} from "./types";

type LoginResponse = {
   accessToken: string;
   user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      isActive?: boolean;
      role: User["role"];
      password?: string | null;
      createdAt?: string | Date;
      updatedAt?: string | Date;
   };
};

const normalizeUser = (user: LoginResponse["user"]): User => ({
   id: user.id,
   name: user.name,
   email: user.email,
   phone: user.phone ?? null,
   isActive: user.isActive ?? true,
   role: user.role,
   password: user.password ?? null,
   createdAt: user.createdAt ? String(user.createdAt) : new Date().toISOString(),
   updatedAt: user.updatedAt ? String(user.updatedAt) : new Date().toISOString(),
});

class ApiAuthService {
   async initialize(): Promise<void> {
      await hydrateSession();
   }

   async register(data: RegisterData): Promise<RegisterResponse> {
      return apiRequest<RegisterResponse>("/auth/register", {
         method: "POST",
         body: data,
         auth: false,
      });
   }

   async login(credentials: LoginCredentials): Promise<User> {
      if (!credentials.role) {
         throw new Error("Please select a role before signing in.");
      }

      const response = await apiRequest<LoginResponse>("/auth/login", {
         method: "POST",
         body: credentials,
         auth: false,
      });

      const normalizedUser = normalizeUser(response.user);
      await storeSession(response.accessToken, normalizedUser);
      return normalizedUser;
   }

   async logout(): Promise<void> {
         console.log("LOGOUT CALLED");
      await clearSession();
   }

   async getCurrentUser(): Promise<User | null> {
      return getStoredUser();
   }

   async verifyEmail(token: string): Promise<VerifyEmailResponse> {
      return apiRequest<VerifyEmailResponse>(
         `/auth/verify-email?token=${encodeURIComponent(token)}`,
         {
            method: "GET",
            auth: false,
         },
      );
   }

   async resendVerificationEmail(
      email: string,
   ): Promise<ResendVerificationResponse> {
      return apiRequest<ResendVerificationResponse>(
         "/auth/resend-verification",
         {
            method: "POST",
            body: { email },
            auth: false,
         },
      );
   }
}

export const authService = new ApiAuthService();
