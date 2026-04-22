import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   Alert,
   FlatList,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { CustomPicker } from "../../../components/CustomPicker";
import { EditAppointmentDialog } from "../../../components/EditAppointmentDialog";
import { Guard } from "../../../components/Guard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";
import { ReceptionistAPI } from "../../../services/receptionist";
import { AppointmentStatus } from "../../../types/appointment.types";

// Types
interface Patient {
   id: string;
   name: string;
   email: string;
   age?: number;
   gender?: string;
}

interface Doctor {
   id: string;
   name: string;
   specialty?: string;
}

interface Clinic {
   id: string;
   name: string;
}

interface Availability {
   dayOfWeek: number;
   startTime: string;
   endTime: string;
}

interface Appointment {
   id: string;
   patientName: string;
   patientId?: string;
   doctorId?: string;
   startTime: string;
   endTime?: string;
   status?: AppointmentStatus;
   notes?: string;
}

// Helper functions
const formatDateTimeLocal = (date: Date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");
   return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateTimeLocal = (str: string) => {
   const date = new Date(str);
   return isNaN(date.getTime()) ? new Date() : date;
};

export default function ReceptionistDashboard() {
   const { user, logout } = useAuth();

   const handleLogout = async () => {
      await logout();
      router.replace("/login");
   };

   // State for data
   const [myClinic, setMyClinic] = useState<Clinic | null>(null);
   const [clinics, setClinics] = useState<Clinic[]>([]);
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const [patients, setPatients] = useState<Patient[]>([]);
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [availability, setAvailability] = useState<Availability[]>([]);

   // Form state for new appointment
   const [form, setForm] = useState({
      clinicId: "",
      doctorId: "",
      patientId: "",
      startTime: formatDateTimeLocal(new Date()),
      endTime: formatDateTimeLocal(new Date(Date.now() + 3600000)), // +1 hour
      notes: "",
   });

   // Search and pagination for patients
   const [patientSearch, setPatientSearch] = useState("");
   const [patientPage, setPatientPage] = useState(1);
   const PATIENT_LIMIT = 5;

   // Pagination for appointments
   const [appointmentPage, setAppointmentPage] = useState(1);
   const APPOINTMENT_LIMIT = 5;

   // Filters for appointments (optional)
   const [appointmentDoctorFilter, setAppointmentDoctorFilter] = useState("");
   const [appointmentDateFilter, setAppointmentDateFilter] = useState("");

   // Dialog states
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [selectedAppointmentId, setSelectedAppointmentId] = useState<
      string | null
   >(null);
   const [editOpen, setEditOpen] = useState(false);
   const [editData, setEditData] = useState<any>(null);

   useEffect(() => {
      const loadDashboardData = async () => {
         try {
            const [myClinicRes, clinicsRes, patientsRes, appointmentsRes] =
               await Promise.all([
                  ReceptionistAPI.getMyClinic(),
                  ReceptionistAPI.listClinics(),
                  ReceptionistAPI.listPatients(),
                  ReceptionistAPI.listPendingAppointments(),
               ]);

            setMyClinic(myClinicRes.data);
            setClinics(clinicsRes.data);
            setPatients(patientsRes.data);
            setAppointments(
               appointmentsRes.data.map((appointment) => ({
                  ...appointment,
                  status: appointment.status as AppointmentStatus,
               })),
            );
            setForm((prev) => ({
               ...prev,
               clinicId: myClinicRes.data.id,
            }));
         } catch (error) {
            console.error("Failed to load receptionist dashboard:", error);
            Alert.alert(
               "Error",
               "Failed to load receptionist dashboard data.",
            );
         }
      };

      loadDashboardData();
   }, []);

   // Load doctors when clinic changes
   useEffect(() => {
      if (!form.clinicId) {
         setDoctors([]);
         return;
      }

      const loadDoctors = async () => {
         try {
            const response = await ReceptionistAPI.listClinicDoctors(
               form.clinicId,
            );
            setDoctors(response.data);
         } catch (error) {
            console.error("Failed to load clinic doctors:", error);
            setDoctors([]);
         }
      };

      loadDoctors();
   }, [form.clinicId]);

   // Load availability when doctor changes
   useEffect(() => {
      if (!form.doctorId) {
         setAvailability([]);
         return;
      }

      const loadAvailability = async () => {
         try {
            const response = await ReceptionistAPI.getDoctorAvailability(
               form.doctorId,
            );
            setAvailability(response.data);
         } catch (error) {
            console.error("Failed to load doctor availability:", error);
            setAvailability([]);
         }
      };

      loadAvailability();
   }, [form.doctorId]);

   // Create appointment
   const handleCreateAppointment = async () => {
      if (!form.clinicId || !form.doctorId || !form.patientId) {
         Alert.alert("Error", "Please select clinic, doctor, and patient");
         return;
      }

      try {
         const response = await ReceptionistAPI.createAppointment({
            clinicId: form.clinicId,
            doctorId: form.doctorId,
            patientId: form.patientId,
            startTime: parseDateTimeLocal(form.startTime).toISOString(),
            endTime: parseDateTimeLocal(form.endTime).toISOString(),
            notes: form.notes,
         });

         setAppointments((prev) => [
            ...prev,
            {
               ...response.data,
               status: response.data.status as AppointmentStatus,
            },
         ]);
         Alert.alert("Success", "Appointment created successfully");
         setForm({
            clinicId: myClinic?.id || "",
            doctorId: "",
            patientId: "",
            startTime: formatDateTimeLocal(new Date()),
            endTime: formatDateTimeLocal(new Date(Date.now() + 3600000)),
            notes: "",
         });
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to create appointment",
         );
      }
   };

   // Accept appointment
   const handleAccept = async (id: string) => {
      try {
         const response = await ReceptionistAPI.acceptAppointment(id);
         setAppointments((prev) =>
            prev.map((appointment) =>
               appointment.id === id
                  ? {
                       ...response.data,
                       status: response.data.status as AppointmentStatus,
                    }
                  : appointment,
            ),
         );
         Alert.alert("Success", "Appointment confirmed");
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to confirm appointment",
         );
      }
   };

   // Cancel appointment
   const handleCancel = (id: string) => {
      setSelectedAppointmentId(id);
      setConfirmOpen(true);
   };

   const confirmCancel = async () => {
      if (!selectedAppointmentId) return;

      try {
         const response = await ReceptionistAPI.cancelAppointment(
            selectedAppointmentId,
         );
         setAppointments((prev) =>
            prev.map((appointment) =>
               appointment.id === selectedAppointmentId
                  ? {
                       ...response.data,
                       status: response.data.status as AppointmentStatus,
                    }
                  : appointment,
            ),
         );
         setConfirmOpen(false);
         setSelectedAppointmentId(null);
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to cancel appointment",
         );
      }
   };

   // Edit appointment
   const handleEdit = (appointment: Appointment) => {
      setEditData(appointment);
      setEditOpen(true);
   };

   const saveEdit = async (data: any) => {
      try {
         const response = await ReceptionistAPI.updateAppointment(data.id, {
            startTime: data.startTime,
            endTime: data.endTime,
            notes: data.notes,
         });
         setAppointments((prev) =>
            prev.map((appointment) =>
               appointment.id === data.id
                  ? {
                       ...response.data,
                       status: response.data.status as AppointmentStatus,
                    }
                  : appointment,
            ),
         );
         setEditOpen(false);
         setEditData(null);
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to update appointment",
         );
      }
   };

   // Navigate to billing (placeholder)
   const handleBill = (appointment: Appointment) => {
      router.push({
         pathname: "/(app)/(receptionist)/billing/create",
         params: {
            appointmentId: appointment.id,
            patientId: appointment.patientId || "",
            patientName: appointment.patientName,
         },
      });
   };

   // Filtered patients for search
   const filteredPatients = patients.filter((p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()),
   );
   const paginatedPatients = filteredPatients.slice(
      (patientPage - 1) * PATIENT_LIMIT,
      patientPage * PATIENT_LIMIT,
   );

   // Filtered appointments (by doctor and date)
   const filteredAppointments = appointments
      .filter((a) => a.status === AppointmentStatus.PENDING) // show only pending? In web they show pending list.
      .filter((a) =>
         appointmentDoctorFilter
            ? a.doctorId === appointmentDoctorFilter
            : true,
      )
      .filter((a) =>
         appointmentDateFilter
            ? a.startTime.startsWith(appointmentDateFilter)
            : true,
      );
   const paginatedAppointments = filteredAppointments.slice(
      (appointmentPage - 1) * APPOINTMENT_LIMIT,
      appointmentPage * APPOINTMENT_LIMIT,
   );

   const totalAppointmentPages =
      Math.ceil(filteredAppointments.length / APPOINTMENT_LIMIT) || 1;
   const totalPatientPages =
      Math.ceil(filteredPatients.length / PATIENT_LIMIT) || 1;

   const renderAppointmentItem = ({ item }: { item: Appointment }) => {
      const patient = patients.find((p) => p.name === item.patientName);
      return (
         <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
               <Text style={styles.patientName}>{item.patientName}</Text>
               <Text style={styles.appointmentTime}>
                  {new Date(item.startTime).toLocaleString()}
               </Text>
            </View>
            <View style={styles.appointmentActions}>
               <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#10b981" }]}
                  onPress={() => handleAccept(item.id)}
               >
                  <Text style={styles.actionText}>Accept</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
                  onPress={() => handleEdit(item)}
               >
                  <Text style={styles.actionText}>Edit</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#f59e0b" }]}
                  onPress={() => handleCancel(item.id)}
               >
                  <Text style={styles.actionText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
                  onPress={() => handleBill(item)}
               >
                  <Text style={styles.actionText}>Bill</Text>
               </TouchableOpacity>
            </View>
         </View>
      );
   };

   const renderPatientItem = ({ item }: { item: Patient }) => (
      <View style={styles.patientCard}>
         <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
         </View>
         <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.name}</Text>
            <Text style={styles.patientEmail}>{item.email}</Text>
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["RECEPTIONIST"]}>
         <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView contentContainerStyle={styles.content}>
               {/* Header */}
               <View style={styles.header}>
                  <View>
                     <Text style={styles.title}>Receptionist Dashboard</Text>
                     <Text style={styles.subtitle}>
                        Manage appointments & patients
                     </Text>
                  </View>
                  <TouchableOpacity
                     onPress={handleLogout}
                     style={styles.iconButton}
                  >
                     <MaterialCommunityIcons
                        name="logout"
                        size={24}
                        color="#ef4444"
                     />
                  </TouchableOpacity>
               </View>

               {/* Main grid */}
               <View style={styles.grid}>
                  {/* Left column: Appointments & Patients */}
                  <View style={styles.leftColumn}>
                     {/* Appointments Section */}
                     <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                           <Text style={styles.sectionTitle}>
                              Pending Appointments (
                              {filteredAppointments.length})
                           </Text>
                        </View>
                        <FlatList
                           data={paginatedAppointments}
                           renderItem={renderAppointmentItem}
                           keyExtractor={(item) => item.id}
                           scrollEnabled={false}
                           ListEmptyComponent={
                              <Text style={styles.emptyText}>
                                 No pending appointments
                              </Text>
                           }
                           contentContainerStyle={styles.listContent}
                        />
                        <View style={styles.pagination}>
                           <TouchableOpacity
                              disabled={appointmentPage === 1}
                              onPress={() => setAppointmentPage((p) => p - 1)}
                              style={[
                                 styles.pageButton,
                                 appointmentPage === 1 && styles.disabled,
                              ]}
                           >
                              <Text>Previous</Text>
                           </TouchableOpacity>
                           <Text style={styles.pageText}>
                              Page {appointmentPage} of {totalAppointmentPages}
                           </Text>
                           <TouchableOpacity
                              disabled={
                                 appointmentPage === totalAppointmentPages
                              }
                              onPress={() => setAppointmentPage((p) => p + 1)}
                              style={[
                                 styles.pageButton,
                                 appointmentPage === totalAppointmentPages &&
                                    styles.disabled,
                              ]}
                           >
                              <Text>Next</Text>
                           </TouchableOpacity>
                        </View>
                     </View>

                     {/* Patients Section */}
                     <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                           <Text style={styles.sectionTitle}>Patients</Text>
                        </View>
                        <View style={styles.searchContainer}>
                           <MaterialCommunityIcons
                              name="magnify"
                              size={20}
                              color="#9ca3af"
                           />
                           <TextInput
                              style={styles.searchInput}
                              placeholder="Search patient..."
                              value={patientSearch}
                              onChangeText={setPatientSearch}
                           />
                        </View>
                        <FlatList
                           data={paginatedPatients}
                           renderItem={renderPatientItem}
                           keyExtractor={(item) => item.id}
                           scrollEnabled={false}
                           ListEmptyComponent={
                              <Text style={styles.emptyText}>No patients</Text>
                           }
                           contentContainerStyle={styles.listContent}
                        />
                        <View style={styles.pagination}>
                           <TouchableOpacity
                              disabled={patientPage === 1}
                              onPress={() => setPatientPage((p) => p - 1)}
                              style={[
                                 styles.pageButton,
                                 patientPage === 1 && styles.disabled,
                              ]}
                           >
                              <Text>Previous</Text>
                           </TouchableOpacity>
                           <Text style={styles.pageText}>
                              Page {patientPage} of {totalPatientPages}
                           </Text>
                           <TouchableOpacity
                              disabled={patientPage === totalPatientPages}
                              onPress={() => setPatientPage((p) => p + 1)}
                              style={[
                                 styles.pageButton,
                                 patientPage === totalPatientPages &&
                                    styles.disabled,
                              ]}
                           >
                              <Text>Next</Text>
                           </TouchableOpacity>
                        </View>
                     </View>
                  </View>

                  {/* Right column: Create Appointment Form */}
                  <View style={styles.rightColumn}>
                     <View style={styles.formCard}>
                        <View style={styles.formHeader}>
                           <Text style={styles.formTitle}>
                              Create Appointment
                           </Text>
                        </View>
                        <View style={styles.formContent}>
                           {myClinic && (
                              <View style={styles.clinicBadge}>
                                 <Text style={styles.clinicLabel}>
                                    Your Clinic:
                                 </Text>
                                 <Text style={styles.clinicName}>
                                    {myClinic.name}
                                 </Text>
                              </View>
                           )}

                           {/* Doctor Picker */}
                           <Text style={styles.label}>Doctor</Text>
                           <CustomPicker
                              selectedValue={form.doctorId}
                              onValueChange={(value) =>
                                 setForm({ ...form, doctorId: value })
                              }
                              items={doctors.map((d) => ({
                                 label: d.name,
                                 value: d.id,
                              }))}
                              placeholder="Select Doctor"
                           />

                           {/* Availability display */}
                           {availability.length > 0 && (
                              <View style={styles.availabilityBox}>
                                 <Text style={styles.availabilityTitle}>
                                    Doctor Availability:
                                 </Text>
                                 {availability.map((a, idx) => (
                                    <Text
                                       key={idx}
                                       style={styles.availabilityText}
                                    >
                                       Day {a.dayOfWeek}: {a.startTime} –{" "}
                                       {a.endTime}
                                    </Text>
                                 ))}
                              </View>
                           )}

                           {/* Patient Picker */}
                           <Text style={styles.label}>Patient</Text>
                           <CustomPicker
                              selectedValue={form.patientId}
                              onValueChange={(value) =>
                                 setForm({ ...form, patientId: value })
                              }
                              items={patients.map((p) => ({
                                 label: p.name,
                                 value: p.id,
                              }))}
                              placeholder="Select Patient"
                           />

                           {/* Start Time */}
                           <Text style={styles.label}>Start Time</Text>
                           <Input
                              value={form.startTime}
                              onChangeText={(text) =>
                                 setForm({ ...form, startTime: text })
                              }
                              placeholder="YYYY-MM-DDTHH:MM"
                              style={styles.input}
                           />

                           {/* End Time */}
                           <Text style={styles.label}>End Time</Text>
                           <Input
                              value={form.endTime}
                              onChangeText={(text) =>
                                 setForm({ ...form, endTime: text })
                              }
                              placeholder="YYYY-MM-DDTHH:MM"
                              style={styles.input}
                           />

                           {/* Notes */}
                           <Text style={styles.label}>Notes</Text>
                           <TextInput
                              style={styles.textarea}
                              value={form.notes}
                              onChangeText={(text) =>
                                 setForm({ ...form, notes: text })
                              }
                              multiline
                              numberOfLines={4}
                              placeholder="Add notes..."
                           />

                           <Button
                              title="Create Appointment"
                              onPress={handleCreateAppointment}
                              style={styles.createButton}
                           />
                        </View>
                     </View>
                  </View>
               </View>
            </ScrollView>

            {/* Dialogs */}
            <ConfirmDialog
               visible={confirmOpen}
               title="Cancel Appointment?"
               message="Are you sure you want to cancel this appointment?"
               onCancel={() => {
                  setConfirmOpen(false);
                  setSelectedAppointmentId(null);
               }}
               onConfirm={confirmCancel}
            />

            {editOpen && editData && (
               <EditAppointmentDialog
                  visible={editOpen}
                  appointment={editData}
                  onClose={() => {
                     setEditOpen(false);
                     setEditData(null);
                  }}
                  onSave={saveEdit}
               />
            )}
         </SafeAreaView>
      </Guard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f0f9ff",
   },
   content: {
      padding: 16,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
   },
   subtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginTop: 4,
   },
   logoutButton: {
      width: 100,
   },
   grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
   },
   leftColumn: {
      flex: 2,
      minWidth: 300,
      gap: 20,
   },
   rightColumn: {
      flex: 1,
      minWidth: 280,
   },
   section: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   sectionHeader: {
      marginBottom: 12,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937",
   },
   listContent: {
      paddingBottom: 8,
   },
   appointmentCard: {
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      backgroundColor: "#f9fafb",
   },
   appointmentHeader: {
      marginBottom: 8,
   },
   patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
   },
   appointmentTime: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
   },
   appointmentActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
   },
   actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      minWidth: 60,
      alignItems: "center",
   },
   actionText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "500",
   },
   pagination: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
      gap: 12,
   },
   pageButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: "#e5e7eb",
      borderRadius: 4,
   },
   disabled: {
      opacity: 0.5,
   },
   pageText: {
      fontSize: 14,
      color: "#4b5563",
   },
   emptyText: {
      textAlign: "center",
      color: "#9ca3af",
      padding: 20,
   },
   searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      paddingHorizontal: 12,
      marginBottom: 12,
      height: 44,
   },
   searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
   },
   patientCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
   },
   patientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   avatarText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2563eb",
   },
   patientInfo: {
      flex: 1,
   },
   patientEmail: {
      fontSize: 12,
      color: "#6b7280",
   },
   formCard: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   formHeader: {
      backgroundColor: "#8b5cf6",
      padding: 16,
   },
   formTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#ffffff",
   },
   formContent: {
      padding: 16,
   },
   clinicBadge: {
      backgroundColor: "#f3e8ff",
      borderWidth: 1,
      borderColor: "#d8b4fe",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
   },
   clinicLabel: {
      fontSize: 12,
      fontWeight: "500",
      color: "#6b21a8",
   },
   clinicName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#7e22ce",
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginTop: 12,
      marginBottom: 4,
   },
   input: {
      marginBottom: 8,
   },
   textarea: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      padding: 12,
      fontSize: 14,
      color: "#1f2937",
      textAlignVertical: "top",
      minHeight: 80,
      backgroundColor: "#ffffff",
      marginBottom: 16,
   },
   availabilityBox: {
      backgroundColor: "#f3e8ff",
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
   },
   availabilityTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#6b21a8",
      marginBottom: 4,
   },
   availabilityText: {
      fontSize: 12,
      color: "#7e22ce",
   },
   createButton: {
      marginTop: 8,
   },
   iconButton: {
      padding: 8,
      marginLeft: 8,
      position: "relative",
   },
});
