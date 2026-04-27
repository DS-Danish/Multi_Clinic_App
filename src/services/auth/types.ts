export type UserRole =
   | "SYSTEM_ADMIN"
   | "CLINIC_ADMIN"
   | "DOCTOR"
   | "PATIENT"
   | "RECEPTIONIST";

export interface User {
   id: string;
   name: string;
   email: string;
   phone: string | null;
   isActive: boolean;
   password: string | null;
   role: UserRole;
   createdAt: string;
   updatedAt: string;
}

export interface RegisterData {
   name: string;
   email: string;
   password: string;
   role: Exclude<UserRole, "SYSTEM_ADMIN" | "CLINIC_ADMIN">;
   phone?: string;
}

export interface RegisterResponse {
   message: string;
   requiresEmailVerification: boolean;
   verificationEmailSent: boolean;
   verificationEmailSentTo: string;
   user: {
      id: string;
      name: string;
      email: string;
      role: Exclude<UserRole, "SYSTEM_ADMIN" | "CLINIC_ADMIN">;
      emailVerified?: boolean;
   };
}

export interface VerifyEmailResponse {
   message: string;
   success: boolean;
}

export interface ResendVerificationResponse {
   message: string;
   success: boolean;
   sentTo?: string;
}

export interface LoginCredentials {
   email: string;
   password: string;
   role?: UserRole;
}
