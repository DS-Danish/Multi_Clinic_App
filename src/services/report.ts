import { apiRequest } from "./api";

export interface CreateReportDto {
   title: string;
   content: string;
   diagnosis?: string;
   prescription?: string;
   recommendations?: string;
   fileUrl?: string;
}

export interface UpdateReportDto extends CreateReportDto {}

export interface AppointmentReport {
   id: string;
   appointmentId: string;
   doctorId: string;
   title: string;
   content: string;
   diagnosis?: string;
   prescription?: string;
   recommendations?: string;
   fileUrl?: string;
   createdAt: string;
   updatedAt: string;
}

export interface PatientReportResponse {
   appointmentId: string;
   appointmentDate: string;
   doctor: {
      id: string;
      name: string;
      email: string;
   };
   clinic: {
      id: string;
      name: string;
   };
   report: AppointmentReport;
}

export const ReportService = {
   createReport: async (
      appointmentId: string,
      data: CreateReportDto,
   ): Promise<AppointmentReport> =>
      apiRequest<AppointmentReport>(`/appointments/${appointmentId}/report`, {
         method: "POST",
         body: data,
      }),

   updateReport: async (
      appointmentId: string,
      data: UpdateReportDto,
   ): Promise<AppointmentReport> =>
      apiRequest<AppointmentReport>(`/appointments/${appointmentId}/report`, {
         method: "PUT",
         body: data,
      }),

   deleteReport: async (appointmentId: string): Promise<void> => {
      await apiRequest<void>(`/appointments/${appointmentId}/report`, {
         method: "DELETE",
      });
   },

   getAppointmentReport: async (
      appointmentId: string,
   ): Promise<AppointmentReport> =>
      apiRequest<AppointmentReport>(`/appointments/${appointmentId}/report`),

   getDoctorReports: async (
      doctorId: string,
   ): Promise<AppointmentReport[]> =>
      apiRequest<AppointmentReport[]>(`/appointments/doctor/${doctorId}/reports`),

   getPatientReports: async (
      patientId: string,
   ): Promise<PatientReportResponse[]> =>
      apiRequest<PatientReportResponse[]>(
         `/appointments/patient/${patientId}/reports`,
      ),
};
