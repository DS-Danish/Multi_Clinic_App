import { apiRequest } from "./api";

export interface Doctor {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   isActive?: boolean;
   specialties?: Array<{
      id: string;
      name: string;
   }>;
}

export interface Patient {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   age?: number;
   gender?: string;
   createdAt?: string;
   isActive?: boolean;
}

export interface Receptionist {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   isActive?: boolean;
}

export interface Appointment {
   id: string;
   patientId: string;
   patientName?: string;
   doctorId: string;
   doctorName?: string;
   appointmentDate: string;
   appointmentTime?: string;
   startTime?: string;
   endTime?: string;
   status: "PENDING" | "SCHEDULED" | "CANCELLED" | "COMPLETED";
   notes?: string;
}

export interface Clinic {
   id: string;
   name: string;
   address?: string;
   phone?: string;
   code?: string;
   email?: string;
   isActive?: boolean;
}

export interface AddReceptionistDto {
   name: string;
   email: string;
   password: string;
   phone?: string;
}

export interface AddDoctorDto {
   name: string;
   email: string;
   password: string;
   phone?: string;
   specialityIds?: string[];
}

const wrap = <T>(data: T) => ({ data });

const normalizeAppointment = (appointment: any): Appointment => ({
   id: appointment.id,
   patientId: appointment.patientId,
   patientName: appointment.patient?.name,
   doctorId: appointment.doctorId,
   doctorName: appointment.doctor?.name,
   appointmentDate: appointment.startTime,
   appointmentTime: appointment.startTime,
   startTime: appointment.startTime,
   endTime: appointment.endTime,
   status: appointment.status,
   notes: appointment.notes,
});

export const addReceptionist = async (
   clinicId: string,
   data: AddReceptionistDto,
) => {
   const response = await apiRequest<{
      receptionist: Receptionist;
   }>(`/clinics/${clinicId}/receptionist`, {
      method: "POST",
      body: data,
   });

   return wrap(response.receptionist);
};

export const addDoctor = async (clinicId: string, data: AddDoctorDto) => {
   const response = await apiRequest<{
      doctor: Doctor;
   }>(`/clinics/${clinicId}/doctor`, {
      method: "POST",
      body: {
         ...data,
         specialityIds: data.specialityIds ?? [],
      },
   });

   return wrap(response.doctor);
};

export const addPatient = async (_clinicId: string, data: any) => {
   const response = await apiRequest<Patient>("/users", {
      method: "POST",
      body: {
         name: data.name,
         email: data.email,
         password: data.password,
         phone: data.phone || undefined,
         role: "PATIENT",
         isActive: true,
         emailVerified: true,
      },
   });

   return wrap(response);
};

export const addAppointment = async () => {
   throw new Error(
      "Clinic admin appointment creation is not available in the current backend. Use the receptionist workflow instead.",
   );
};

export const getMyClinic = async () => {
   const response = await apiRequest<Clinic>("/clinics/my-clinic");
   return wrap(response);
};

export const getClinicDoctors = async (clinicId: string) => {
   const response = await apiRequest<Doctor[]>(`/clinics/${clinicId}/doctors`);
   return wrap(response);
};

export const getClinicPatients = async (clinicId: string) => {
   const response = await apiRequest<Patient[]>(`/clinics/${clinicId}/patients`);
   return wrap(response);
};

export const getClinicAppointments = async (clinicId: string) => {
   const response = await apiRequest<any[]>(`/clinics/${clinicId}/appointments`);
   return wrap(response.map(normalizeAppointment));
};

export const getClinicReceptionists = async (clinicId: string) => {
   const response = await apiRequest<Receptionist[]>(
      `/clinics/${clinicId}/receptionists`,
   );
   return wrap(response);
};

export const getDoctorsForClinic = getClinicDoctors;
export const getPatientsForClinic = getClinicPatients;

export const ClinicAdminAPI = {
   addReceptionist,
   addDoctor,
   addPatient,
   addAppointment,
   getMyClinic,
   getClinicDoctors,
   getClinicPatients,
   getClinicAppointments,
   getClinicReceptionists,
   getDoctorsForClinic,
   getPatientsForClinic,
   getTodayAppointments: (appointments: Appointment[]): Appointment[] => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointments.filter((appointment) => {
         const appointmentDate = new Date(
            appointment.startTime || appointment.appointmentDate,
         );
         appointmentDate.setHours(0, 0, 0, 0);
         return appointmentDate.getTime() === today.getTime();
      });
   },
   getPendingAppointments: (appointments: Appointment[]): Appointment[] =>
      appointments.filter((appointment) => appointment.status === "PENDING"),
};
