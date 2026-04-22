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

export interface LoginCredentials {
   email: string;
   password: string;
   role?: UserRole;
}
