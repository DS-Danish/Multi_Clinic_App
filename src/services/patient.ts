import { apiRequest } from "./api";
import { AppointmentReport } from "./report";

export interface ClinicOption {
   id: string;
   name: string;
}

export interface DoctorOption {
   id: string;
   name: string;
}

export interface PatientAppointment {
   id: string;
   clinicName: string;
   doctorName: string;
   startTime: string;
   endTime: string;
   status: string;
   notes?: string;
   report?: AppointmentReport | null;
}

export interface NotificationItem {
   id: string;
   message: string;
   sentAt: string;
}

export const PatientService = {
   getClinics: async (): Promise<ClinicOption[]> =>
      apiRequest<ClinicOption[]>("/clinics"),

   getDoctorsForClinic: async (clinicId: string): Promise<DoctorOption[]> =>
      apiRequest<DoctorOption[]>(`/doctors/clinic/${clinicId}`),

   getAppointments: async (patientId: string): Promise<PatientAppointment[]> =>
      apiRequest<PatientAppointment[]>(`/appointments/patient/${patientId}`),

   getNotifications: async (userId: string): Promise<NotificationItem[]> =>
      apiRequest<NotificationItem[]>(`/notifications/${userId}`),

   createAppointment: async (data: {
      clinicId: string;
      doctorId: string;
      startTime: string;
      endTime: string;
      notes?: string;
   }) =>
      apiRequest(`/appointments`, {
         method: "POST",
         body: data,
      }),

   cancelAppointment: async (appointmentId: string) =>
      apiRequest(`/appointments/${appointmentId}/cancel`, {
         method: "PATCH",
      }),

   updateAppointment: async (
      appointmentId: string,
      data: { startTime?: string; endTime?: string; notes?: string },
   ) =>
      apiRequest(`/appointments/${appointmentId}`, {
         method: "PATCH",
         body: data,
      }),
};
