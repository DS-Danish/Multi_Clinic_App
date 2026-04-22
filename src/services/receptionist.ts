import { apiRequest } from "./api";

export interface ReceptionistClinic {
   id: string;
   name: string;
   code?: string;
   email?: string;
   phone?: string;
   isActive?: boolean;
}

export interface ReceptionistDoctor {
   id: string;
   name: string;
   specialty?: string;
}

export interface ReceptionistPatient {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   age?: number;
   gender?: string;
}

export interface Availability {
   dayOfWeek: number;
   startTime: string;
   endTime: string;
}

export interface ReceptionistAppointment {
   id: string;
   patientId?: string;
   patientName: string;
   doctorId?: string;
   doctorName?: string;
   startTime: string;
   endTime?: string;
   status?: string;
   notes?: string;
}

const wrap = <T>(data: T) => ({ data });

const normalizeDoctor = (item: any): ReceptionistDoctor =>
   item.doctor
      ? {
           id: item.doctor.id,
           name: item.doctor.name,
        }
      : item;

const normalizeAppointment = (item: any): ReceptionistAppointment => ({
   id: item.id,
   patientId: item.patientId,
   patientName: item.patient?.name || item.patientName || "Unknown patient",
   doctorId: item.doctorId,
   doctorName: item.doctor?.name || item.doctorName,
   startTime: item.startTime,
   endTime: item.endTime,
   status: item.status,
   notes: item.notes,
});

export const ReceptionistAPI = {
   getMyClinic: async () =>
      wrap(await apiRequest<ReceptionistClinic>("/receptionist/my-clinic")),

   listClinics: async () =>
      wrap(await apiRequest<ReceptionistClinic[]>("/receptionist/clinics")),

   listPatients: async () =>
      wrap(await apiRequest<ReceptionistPatient[]>("/receptionist/patients")),

   listClinicDoctors: async (clinicId: string) => {
      const response = await apiRequest<any[]>(
         `/receptionist/clinics/${clinicId}/doctors`,
      );
      return wrap(response.map(normalizeDoctor));
   },

   getDoctorAvailability: async (doctorId: string) =>
      wrap(
         await apiRequest<Availability[]>(
            `/receptionist/doctors/${doctorId}/availability`,
         ),
      ),

   createAppointment: async (data: {
      clinicId: string;
      doctorId: string;
      patientId: string;
      startTime: string;
      endTime: string;
      notes?: string;
   }) =>
      wrap(
         normalizeAppointment(
            await apiRequest<any>("/receptionist/appointments", {
               method: "POST",
               body: data,
            }),
         ),
      ),

   acceptAppointment: async (id: string) =>
      wrap(
         normalizeAppointment(
            await apiRequest<any>(`/receptionist/appointments/${id}/accept`, {
               method: "PATCH",
            }),
         ),
      ),

   cancelAppointment: async (id: string) =>
      wrap(
         normalizeAppointment(
            await apiRequest<any>(`/receptionist/appointments/${id}/cancel`, {
               method: "PATCH",
            }),
         ),
      ),

   updateAppointment: async (
      id: string,
      data: { startTime?: string; endTime?: string; notes?: string },
   ) =>
      wrap(
         normalizeAppointment(
            await apiRequest<any>(`/receptionist/appointments/${id}`, {
               method: "PATCH",
               body: data,
            }),
         ),
      ),

   listPendingAppointments: async () => {
      const response = await apiRequest<any[]>(
         "/receptionist/appointments/pending",
      );
      return wrap(response.map(normalizeAppointment));
   },
};
