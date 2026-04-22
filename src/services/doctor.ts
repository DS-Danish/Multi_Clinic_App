import { apiRequest } from "./api";
import { AppointmentReport } from "./report";

export interface DoctorAppointment {
   id: string;
   patientName: string;
   clinicName: string;
   startTime: string;
   endTime: string;
   status: string;
   notes?: string;
   priority?: string;
   report?: AppointmentReport | null;
}

export interface DoctorPatient {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   createdAt: string;
}

export const DoctorService = {
   getAppointments: async (doctorId: string): Promise<DoctorAppointment[]> =>
      apiRequest<DoctorAppointment[]>(`/appointments/doctor/${doctorId}`),

   getPatients: async (): Promise<DoctorPatient[]> =>
      apiRequest<DoctorPatient[]>("/users/patients"),
};
