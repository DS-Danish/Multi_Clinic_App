// src/services/mock/clinicAdmin.ts

export interface Doctor {
   id: string;
   name: string;
   email: string;
   phone?: string;
   specialty?: string;
}

export interface Patient {
   id: string;
   name: string;
   email: string;
   phone?: string;
   age?: number;
   gender?: string;
}

export interface Receptionist {
   id: string;
   name: string;
   email: string;
   phone?: string;
}

export interface Appointment {
   id: string;
   patientId: string;
   patientName?: string;
   doctorId: string;
   doctorName?: string;
   appointmentDate: string;
   appointmentTime?: string;
   status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface Clinic {
   id: string;
   name: string;
   address?: string;
   phone?: string;
}

// Mock data
const MOCK_CLINIC: Clinic = {
   id: "clinic1",
   name: "City Medical Center",
   address: "123 Main St, Anytown, USA",
   phone: "(555) 123-4567",
};

let MOCK_DOCTORS: Doctor[] = [
   {
      id: "d1",
      name: "Dr. Sarah Smith",
      email: "sarah.smith@clinic.com",
      phone: "(555) 111-2222",
      specialty: "Cardiology",
   },
   {
      id: "d2",
      name: "Dr. John Williams",
      email: "john.williams@clinic.com",
      phone: "(555) 333-4444",
      specialty: "Neurology",
   },
   {
      id: "d3",
      name: "Dr. Emily Brown",
      email: "emily.brown@clinic.com",
      phone: "(555) 555-6666",
      specialty: "Pediatrics",
   },
];

let MOCK_PATIENTS: Patient[] = [
   {
      id: "p1",
      name: "Alice Johnson",
      email: "alice@email.com",
      phone: "(555) 777-8888",
      age: 35,
      gender: "Female",
   },
   {
      id: "p2",
      name: "Bob Miller",
      email: "bob@email.com",
      phone: "(555) 999-0000",
      age: 42,
      gender: "Male",
   },
   {
      id: "p3",
      name: "Carol Davis",
      email: "carol@email.com",
      phone: "(555) 123-4567",
      age: 28,
      gender: "Female",
   },
];

let MOCK_RECEPTIONISTS: Receptionist[] = [
   {
      id: "r1",
      name: "Emma Wilson",
      email: "emma.wilson@clinic.com",
      phone: "(555) 222-3333",
   },
   {
      id: "r2",
      name: "James Taylor",
      email: "james.taylor@clinic.com",
      phone: "(555) 444-5555",
   },
];

let MOCK_APPOINTMENTS: Appointment[] = [
   {
      id: "a1",
      patientId: "p1",
      patientName: "Alice Johnson",
      doctorId: "d1",
      doctorName: "Dr. Sarah Smith",
      appointmentDate: "2025-04-15T09:00:00",
      status: "CONFIRMED",
   },
   {
      id: "a2",
      patientId: "p2",
      patientName: "Bob Miller",
      doctorId: "d2",
      doctorName: "Dr. John Williams",
      appointmentDate: "2025-04-15T10:30:00",
      status: "PENDING",
   },
   {
      id: "a3",
      patientId: "p3",
      patientName: "Carol Davis",
      doctorId: "d1",
      doctorName: "Dr. Sarah Smith",
      appointmentDate: "2025-04-16T14:00:00",
      status: "CONFIRMED",
   },
];

export const ClinicAdminAPI = {
   // Clinic info
   getMyClinic: async (): Promise<{ data: Clinic }> => {
      return { data: MOCK_CLINIC };
   },

   // Doctors
   getClinicDoctors: async (clinicId: string): Promise<{ data: Doctor[] }> => {
      return { data: MOCK_DOCTORS };
   },

   addDoctor: async (
      clinicId: string,
      data: any,
   ): Promise<{ data: Doctor }> => {
      const newDoctor: Doctor = {
         id: `d${Date.now()}`,
         name: data.name,
         email: data.email,
         phone: data.phone,
         specialty: data.specialityIds?.[0] || "General",
      };
      MOCK_DOCTORS.push(newDoctor);
      return { data: newDoctor };
   },

   // Patients
   getClinicPatients: async (
      clinicId: string,
   ): Promise<{ data: Patient[] }> => {
      return { data: MOCK_PATIENTS };
   },

   // Appointments
   getClinicAppointments: async (
      clinicId: string,
   ): Promise<{ data: Appointment[] }> => {
      return { data: MOCK_APPOINTMENTS };
   },

   // Receptionists
   getClinicReceptionists: async (
      clinicId: string,
   ): Promise<{ data: Receptionist[] }> => {
      return { data: MOCK_RECEPTIONISTS };
   },

   addReceptionist: async (
      clinicId: string,
      data: any,
   ): Promise<{ data: Receptionist }> => {
      const newReceptionist: Receptionist = {
         id: `r${Date.now()}`,
         name: data.name,
         email: data.email,
         phone: data.phone,
      };
      MOCK_RECEPTIONISTS.push(newReceptionist);
      return { data: newReceptionist };
   },

   // Stats helpers
   getTodayAppointments: (appointments: Appointment[]): Appointment[] => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointments.filter((apt) => {
         const aptDate = new Date(apt.appointmentDate);
         aptDate.setHours(0, 0, 0, 0);
         return aptDate.getTime() === today.getTime();
      });
   },

   getPendingAppointments: (appointments: Appointment[]): Appointment[] => {
      return appointments.filter((apt) => apt.status === "PENDING");
   },

   // Add this method to the ClinicAdminAPI object
   addPatient: async (
      clinicId: string,
      data: any,
   ): Promise<{ data: Patient }> => {
      const newPatient: Patient = {
         id: `p${Date.now()}`,
         name: data.name,
         email: data.email,
         phone: data.phone,
         age: data.age ? parseInt(data.age) : undefined,
         gender: data.gender,
      };
      MOCK_PATIENTS.push(newPatient);
      return { data: newPatient };
   },

   // Add these to the ClinicAdminAPI object

   addAppointment: async (
      clinicId: string,
      data: any,
   ): Promise<{ data: Appointment }> => {
      const doctor = MOCK_DOCTORS.find((d) => d.id === data.doctorId);
      const patient = MOCK_PATIENTS.find((p) => p.id === data.patientId);
      const newAppointment: Appointment = {
         id: `a${Date.now()}`,
         patientId: data.patientId,
         patientName: patient?.name || "Unknown",
         doctorId: data.doctorId,
         doctorName: doctor?.name || "Unknown",
         appointmentDate: data.appointmentDate,
         status: "PENDING",
      };
      MOCK_APPOINTMENTS.push(newAppointment);
      return { data: newAppointment };
   },

   getDoctorsForClinic: async (
      clinicId: string,
   ): Promise<{ data: Doctor[] }> => {
      // In mock, all doctors belong to all clinics
      return { data: MOCK_DOCTORS };
   },

   getPatientsForClinic: async (
      clinicId: string,
   ): Promise<{ data: Patient[] }> => {
      return { data: MOCK_PATIENTS };
   },

   
};
