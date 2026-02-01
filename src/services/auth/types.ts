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
   password: string; // stored plain text as requested
   role: UserRole;
   createdAt: string;
}

export interface RegisterData {
   name: string;
   email: string;
   password: string;
   role: Exclude<UserRole, "SYSTEM_ADMIN" | "CLINIC_ADMIN">; // only patient, doctor, receptionist
}

export interface LoginCredentials {
   email: string;
   password: string;
   role?: UserRole; // optional, can be used to filter
}
