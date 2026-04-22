import { apiRequest } from "./api";

export interface Clinic {
   id: string;
   name: string;
   code: string;
   email: string;
   phone: string;
   admins: number;
   patients: number;
}

const wrap = <T>(data: T) => ({ data });

export const SuperAdminAPI = {
   getClinics: async (): Promise<{ data: Clinic[] }> => {
      const response = await apiRequest<Clinic[]>("/super-admin/clinics");
      return wrap(response);
   },

   createClinicWithAdmin: async (data: {
      clinicName: string;
      clinicCode: string;
      clinicEmail: string;
      clinicPhone?: string;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
   }): Promise<{ data: Clinic }> => {
      const response = await apiRequest<{
         clinic: {
            id: string;
            name: string;
            code: string;
            email: string;
            phone: string;
         };
      }>("/super-admin/create-clinic-with-admin", {
         method: "POST",
         body: {
            ...data,
            clinicPhone: data.clinicPhone || "N/A",
         },
      });

      return wrap({
         ...response.clinic,
         admins: 1,
         patients: 0,
      });
   },

   getTotalAdmins: async (): Promise<number> => {
      const response = await apiRequest<Clinic[]>("/super-admin/clinics");
      return response.reduce((sum, clinic) => sum + clinic.admins, 0);
   },

   getTotalPatients: async (): Promise<number> => {
      const response = await apiRequest<Clinic[]>("/super-admin/clinics");
      return response.reduce((sum, clinic) => sum + clinic.patients, 0);
   },
};
