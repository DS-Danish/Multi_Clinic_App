import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface GuardProps {
   allowedRoles: Array<
      "SYSTEM_ADMIN" | "CLINIC_ADMIN" | "DOCTOR" | "PATIENT" | "RECEPTIONIST"
   >;
   children: ReactNode;
}

export function Guard({ allowedRoles, children }: GuardProps) {
   const { user } = useAuth();
   if (!user) return <Redirect href="/login" />;
   if (!allowedRoles.includes(user.role)) return <Redirect href="/login" />;
   return <>{children}</>;
}
