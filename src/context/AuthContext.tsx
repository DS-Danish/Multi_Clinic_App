import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth";
import { User, UserRole } from "../services/auth/types";

export type RegisterableRole = "DOCTOR" | "PATIENT" | "RECEPTIONIST";

interface AuthContextType {
   user: User | null;
   login: (email: string, password: string, role?: UserRole) => Promise<void>;
   register: (data: {
      name: string;
      email: string;
      password: string;
      role: RegisterableRole;
   }) => Promise<void>;
   logout: () => Promise<void>;
   loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      authService
         .initialize()
         .then(() => {
            authService
               .getCurrentUser()
               .then((current) => {
                  setUser(current);
                  setLoading(false);
               })
               .catch(() => setLoading(false));
         })
         .catch(() => setLoading(false));
   }, []);

   const login = async (email: string, password: string, role?: UserRole) => {
      try {
         const loggedUser = await authService.login({ email, password, role });
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
   }) => {
      // Ensure role is allowed
      if (
         data.role !== "PATIENT" &&
         data.role !== "DOCTOR" &&
         data.role !== "RECEPTIONIST"
      ) {
         throw new Error("Invalid role for registration");
      }
      try {
         const newUser = await authService.register(data);
         setUser(newUser);
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
