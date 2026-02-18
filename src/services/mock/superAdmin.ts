// src/services/mock/superAdmin.ts

export interface Clinic {
   id: string;
   name: string;
   code: string;
   email: string;
   phone: string;
   admins: number;
   patients: number;
}

// Mock data
let MOCK_CLINICS: Clinic[] = [
   {
      id: "c1",
      name: "City Medical Center",
      code: "CMC001",
      email: "info@citymedical.com",
      phone: "(555) 123-4567",
      admins: 2,
      patients: 150,
   },
   {
      id: "c2",
      name: "Westside Health",
      code: "WSH002",
      email: "contact@westsidehealth.com",
      phone: "(555) 987-6543",
      admins: 1,
      patients: 85,
   },
   {
      id: "c3",
      name: "Downtown Clinic",
      code: "DTC003",
      email: "hello@downtownclinic.com",
      phone: "(555) 456-7890",
      admins: 1,
      patients: 42,
   },
];

export const SuperAdminAPI = {
   // Get all clinics
   getClinics: async (): Promise<{ data: Clinic[] }> => {
      return { data: [...MOCK_CLINICS] };
   },

   // Create a new clinic with admin
   createClinicWithAdmin: async (data: {
      clinicName: string;
      clinicCode: string;
      clinicEmail: string;
      clinicPhone?: string;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
   }): Promise<{ data: Clinic }> => {
      const newClinic: Clinic = {
         id: `c${Date.now()}`,
         name: data.clinicName,
         code: data.clinicCode,
         email: data.clinicEmail,
         phone: data.clinicPhone || "",
         admins: 1, // The new admin
         patients: 0,
      };
      MOCK_CLINICS.push(newClinic);
      return { data: newClinic };
   },

   // Get total stats
   getTotalAdmins: async (): Promise<number> => {
      return MOCK_CLINICS.reduce((sum, c) => sum + c.admins, 0);
   },

   getTotalPatients: async (): Promise<number> => {
      return MOCK_CLINICS.reduce((sum, c) => sum + c.patients, 0);
   },
};
