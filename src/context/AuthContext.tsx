import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth";
import { RegisterResponse, User, UserRole } from "../services/auth/types";
import { hydrateSession } from "../services/auth/sessionStorage";

export type RegisterableRole = "DOCTOR" | "PATIENT" | "RECEPTIONIST";

interface AuthContextType {
   user: User | null;
   login: (email: string, password: string, role?: UserRole) => Promise<void>;
   register: (data: {
      name: string;
      email: string;
      password: string;
      role: RegisterableRole;
   }) => Promise<RegisterResponse>;
   logout: () => Promise<void>;
   loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const init = async () => {
         try {
            // ✅ CRITICAL FIX
            await hydrateSession();

            const current = await authService.getCurrentUser();
            setUser(current);
         } catch (err) {
            console.log("AUTH INIT ERROR:", err);
         } finally {
            setLoading(false);
         }
      };

      init();
   }, []);

   const login = async (email: string, password: string, role?: UserRole) => {
      try {
         const loggedUser = await authService.login({ email, password, role });

         // ✅ ensure state updates after session is ready
         setUser(loggedUser);
      } catch (error: any) {
         throw new Error(error.message || "Login failed");
      }
   };

   const register = async (data: {
      name: string;
      email: string;
      password: string;
      role: RegisterableRole;
   }): Promise<RegisterResponse> => {
      if (
         data.role !== "PATIENT" &&
         data.role !== "DOCTOR" &&
         data.role !== "RECEPTIONIST"
      ) {
         throw new Error("Invalid role for registration");
      }

      try {
         return await authService.register(data);
      } catch (error: any) {
         throw new Error(error.message || "Registration failed");
      }
   };

   const logout = async () => {
      await authService.logout();
      setUser(null);
   };

   return (
      <AuthContext.Provider value={{ user, login, register, logout, loading }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => {
   const context = useContext(AuthContext);
   if (!context) throw new Error("useAuth must be used within AuthProvider");
   return context;
};