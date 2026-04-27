import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactUsButton } from "../../../components/ContactUsButton";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { CustomPicker } from "../../../components/CustomPicker";
import { EditAppointmentDialog } from "../../../components/EditAppointmentDialog";
import { Guard } from "../../../components/Guard";
import { ReportModal } from "../../../components/ReportModal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";
import { PatientService } from "../../../services/patient";
import { ReportService } from "../../../services/report";
import { AppointmentStatus } from "../../../types/appointment.types";

// Mock data types
interface Clinic {
   id: string;
   name: string;
}

interface Doctor {
   id: string;
   name: string;
}

interface Appointment {
   id: string;
   clinicName: string;
   doctorName: string;
   startTime: string;
   endTime: string;
   status: AppointmentStatus;
   notes?: string;
}

interface Notification {
   id: string;
   message: string;
   sentAt: string;
}

interface Report {
   id: string;
   title: string;
   content: string;
   diagnosis?: string;
   prescription?: string;
   recommendations?: string;
   fileUrl?: string;
   createdAt: string;
   updatedAt: string;
}

interface PatientReport {
   appointmentId: string;
   appointmentDate: string;
   doctor: { id: string; name: string };
   clinic: { id: string; name: string };
   report: Report;
}

// Helper functions for datetime conversion
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

export default function PatientDetails() {
   const { user, logout } = useAuth();
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("overview");

   const handleLogout = async () => {
      await logout();
      router.replace("/login");
   };

   // Data states
   const [clinics, setClinics] = useState<Clinic[]>([]);
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [reports, setReports] = useState<PatientReport[]>([]);

   // Form states for booking
   const [selectedClinic, setSelectedClinic] = useState("");
   const [selectedDoctor, setSelectedDoctor] = useState("");
   const [startTimeStr, setStartTimeStr] = useState(
      formatDateTimeLocal(new Date()),
   );
   const [endTimeStr, setEndTimeStr] = useState(
      formatDateTimeLocal(new Date(Date.now() + 3600000)),
   ); // +1 hour

   // Dialog states
   const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
   const [appointmentToCancel, setAppointmentToCancel] = useState<
      string | null
   >(null);
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [appointmentToEdit, setAppointmentToEdit] =
      useState<Appointment | null>(null);
   const [viewReportDialog, setViewReportDialog] = useState(false);
   const [selectedReport, setSelectedReport] = useState<PatientReport | null>(
      null,
   );
   const [showCancelled, setShowCancelled] = useState(false);

   const refreshPatientData = async () => {
      if (!user?.id) return;

      try {
         setLoading(true);
         const [clinicsRes, appointmentsRes, notificationsRes, reportsRes] =
            await Promise.all([
               PatientService.getClinics(),
               PatientService.getAppointments(user.id),
               PatientService.getNotifications(user.id),
               ReportService.getPatientReports(user.id),
            ]);

         setClinics(clinicsRes);
         setAppointments(
            appointmentsRes.map((appointment) => ({
               ...appointment,
               status: appointment.status as AppointmentStatus,
            })),
         );
         setNotifications(notificationsRes);
         setReports(reportsRes);
      } catch (error) {
         console.error("Failed to load patient data:", error);
         Alert.alert("Error", "Failed to load patient data.");
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      refreshPatientData();
   }, [user?.id]);

   const loadDoctors = async (clinicId: string) => {
      if (!clinicId) {
         setDoctors([]);
         return;
      }

      try {
         const response = await PatientService.getDoctorsForClinic(clinicId);
         setDoctors(response);
      } catch (error) {
         console.error("Failed to load clinic doctors:", error);
         setDoctors([]);
      }
   };

   const handleCreateAppointment = async () => {
      if (!selectedClinic || !selectedDoctor) {
         Alert.alert("Error", "Please select clinic and doctor");
         return;
      }
      // Validate dates
      const startDate = parseDateTimeLocal(startTimeStr);
      const endDate = parseDateTimeLocal(endTimeStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
         Alert.alert("Error", "Please enter valid dates and times");
         return;
      }

      try {
         await PatientService.createAppointment({
            clinicId: selectedClinic,
            doctorId: selectedDoctor,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
         });
         Alert.alert("Success", "Appointment request sent!");
         setSelectedClinic("");
         setSelectedDoctor("");
         setDoctors([]);
         setStartTimeStr(formatDateTimeLocal(new Date()));
         setEndTimeStr(formatDateTimeLocal(new Date(Date.now() + 3600000)));
         await refreshPatientData();
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to create appointment",
         );
      }
   };

   const handleCancelAppointment = async () => {
      if (!appointmentToCancel) return;

      try {
         await PatientService.cancelAppointment(appointmentToCancel);
         setCancelDialogOpen(false);
         setAppointmentToCancel(null);
         await refreshPatientData();
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to cancel appointment",
         );
      }
   };

   const handleEditAppointment = async (data: any) => {
      if (!data.id) return;

      try {
         await PatientService.updateAppointment(data.id, {
            startTime: data.startTime,
            endTime: data.endTime,
            notes: data.notes,
         });
         setEditDialogOpen(false);
         setAppointmentToEdit(null);
         await refreshPatientData();
      } catch (error: any) {
         Alert.alert(
            "Error",
            error.message || "Failed to update appointment",
         );
      }
   };

   const openCancelDialog = (appointmentId: string) => {
      setAppointmentToCancel(appointmentId);
      setCancelDialogOpen(true);
   };

   const openEditDialog = (appointment: Appointment) => {
      setAppointmentToEdit(appointment);
      setEditDialogOpen(true);
   };

   const getStatusBadge = (status: AppointmentStatus) => {
      const statusColors = {
         [AppointmentStatus.PENDING]: { bg: "#fef3c7", text: "#92400e" },
         [AppointmentStatus.SCHEDULED]: { bg: "#dbeafe", text: "#1e40af" },
         [AppointmentStatus.COMPLETED]: { bg: "#d1fae5", text: "#065f46" },
         [AppointmentStatus.CANCELLED]: { bg: "#fee2e2", text: "#991b1b" },
      };
      const colors = statusColors[status] || { bg: "#f3f4f6", text: "#1f2937" };
      return (
         <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
               {status}
            </Text>
         </View>
      );
   };

   if (loading) {
      return (
         <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading patient data...</Text>
         </View>
      );
   }

   return (
      <Guard allowedRoles={["PATIENT"]}>
         <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView contentContainerStyle={styles.content}>
               {/* Header */}
               <View style={styles.header}>
                  <View style={styles.headerLeft}>
                     <View style={styles.logo}>
                        <MaterialCommunityIcons
                           name="heart-pulse"
                           size={24}
                           color="#ffffff"
                        />
                     </View>
                     <View>
                        <Text style={styles.headerTitle}>Patient Portal</Text>
                        <Text style={styles.headerSubtitle}>
                           Manage your health
                        </Text>
                     </View>
                  </View>

                  <View style={styles.headerRight}>
                     <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                     >
                        <MaterialCommunityIcons
                           name="logout"
                           size={24}
                           color="#ef4444"
                        />
                     </TouchableOpacity>
                  </View>
               </View>

               {/* Profile Card */}
               <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                     <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                           {user?.name?.charAt(0) || "P"}
                        </Text>
                     </View>
                     <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name}</Text>
                        <View style={styles.profileMeta}>
                           <MaterialCommunityIcons
                              name="email"
                              size={14}
                              color="#dbeafe"
                           />
                           <Text style={styles.profileMetaText}>
                              {user?.email}
                           </Text>
                        </View>
                        <View style={styles.profileMeta}>
                           <MaterialCommunityIcons
                              name="shield-account"
                              size={14}
                              color="#dbeafe"
                           />
                           <Text style={styles.profileMetaText}>
                              {user?.role}
                           </Text>
                        </View>
                     </View>
                  </View>

                  {/* Tabs */}
                  <View style={styles.tabBar}>
                     {[
                        "overview",
                        "appointments",
                        "reports",
                        "notifications",
                     ].map((tab) => (
                        <TouchableOpacity
                           key={tab}
                           style={[
                              styles.tab,
                              activeTab === tab && styles.activeTab,
                           ]}
                           onPress={() => setActiveTab(tab)}
                        >
                           <Text
                              style={[
                                 styles.tabText,
                                 activeTab === tab && styles.activeTabText,
                              ]}
                           >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                           </Text>
                        </TouchableOpacity>
                     ))}
                  </View>
               </View>

               {/* Tab Content */}
               {activeTab === "overview" && (
                  <View style={styles.tabContent}>
                     {/* Stats */}
                     <View style={styles.statsGrid}>
                        <View
                           style={[
                              styles.statCard,
                              { backgroundColor: "#3b82f6" },
                           ]}
                        >
                           <View>
                              <Text style={styles.statLabel}>
                                 Total Appointments
                              </Text>
                              <Text style={styles.statValue}>
                                 {appointments.length}
                              </Text>
                           </View>
                           <MaterialCommunityIcons
                              name="calendar"
                              size={40}
                              color="#93c5fd"
                           />
                        </View>
                        <View
                           style={[
                              styles.statCard,
                              { backgroundColor: "#a855f7" },
                           ]}
                        >
                           <View>
                              <Text style={styles.statLabel}>
                                 Notifications
                              </Text>
                              <Text style={styles.statValue}>
                                 {notifications.length}
                              </Text>
                           </View>
                           <MaterialCommunityIcons
                              name="bell"
                              size={40}
                              color="#d8b4fe"
                           />
                        </View>
                        <View
                           style={[
                              styles.statCard,
                              { backgroundColor: "#10b981" },
                           ]}
                        >
                           <View>
                              <Text style={styles.statLabel}>
                                 Account Status
                              </Text>
                              <Text style={styles.statValue}>Active</Text>
                           </View>
                           <MaterialCommunityIcons
                              name="check-circle"
                              size={40}
                              color="#a7f3d0"
                           />
                        </View>
                     </View>

                     {/* Contact & Personal Info */}
                     <View style={styles.infoGrid}>
                        <View style={styles.infoCard}>
                           <View style={styles.infoHeader}>
                              <View
                                 style={[
                                    styles.infoIcon,
                                    { backgroundColor: "#dbeafe" },
                                 ]}
                              >
                                 <MaterialCommunityIcons
                                    name="email"
                                    size={20}
                                    color="#3b82f6"
                                 />
                              </View>
                              <Text style={styles.infoTitle}>
                                 Contact Information
                              </Text>
                           </View>
                           <View style={styles.infoRow}>
                              <MaterialCommunityIcons
                                 name="email-outline"
                                 size={18}
                                 color="#9ca3af"
                              />
                              <Text style={styles.infoLabel}>Email:</Text>
                              <Text style={styles.infoValue}>
                                 {user?.email}
                              </Text>
                           </View>
                           <View style={styles.infoRow}>
                              <MaterialCommunityIcons
                                 name="phone"
                                 size={18}
                                 color="#9ca3af"
                              />
                              <Text style={styles.infoLabel}>Phone:</Text>
                              <Text style={styles.infoValue}>
                                 {user?.phone || "Not provided"}
                              </Text>
                           </View>
                        </View>

                        <View style={styles.infoCard}>
                           <View style={styles.infoHeader}>
                              <View
                                 style={[
                                    styles.infoIcon,
                                    { backgroundColor: "#f3e8ff" },
                                 ]}
                              >
                                 <MaterialCommunityIcons
                                    name="account"
                                    size={20}
                                    color="#a855f7"
                                 />
                              </View>
                              <Text style={styles.infoTitle}>
                                 Personal Information
                              </Text>
                           </View>
                           <View style={styles.infoRow}>
                              <MaterialCommunityIcons
                                 name="account-outline"
                                 size={18}
                                 color="#9ca3af"
                              />
                              <Text style={styles.infoLabel}>Full Name:</Text>
                              <Text style={styles.infoValue}>{user?.name}</Text>
                           </View>
                           <View style={styles.infoRow}>
                              <MaterialCommunityIcons
                                 name="clock-outline"
                                 size={18}
                                 color="#9ca3af"
                              />
                              <Text style={styles.infoLabel}>
                                 Member Since:
                              </Text>
                              <Text style={styles.infoValue}>
                                 {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "Unknown"}
                              </Text>
                           </View>
                        </View>
                     </View>

                     {/* Quick Actions */}
                     <View style={styles.quickActions}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionButtons}>
                           <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => setActiveTab("appointments")}
                           >
                              <MaterialCommunityIcons
                                 name="calendar-plus"
                                 size={24}
                                 color="#3b82f6"
                              />
                              <Text style={styles.actionText}>
                                 Book Appointment
                              </Text>
                           </TouchableOpacity>
                           <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => setActiveTab("notifications")}
                           >
                              <MaterialCommunityIcons
                                 name="bell-ring"
                                 size={24}
                                 color="#a855f7"
                              />
                              <Text style={styles.actionText}>
                                 View Notifications
                              </Text>
                           </TouchableOpacity>
                           <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => setActiveTab("reports")}
                           >
                              <MaterialCommunityIcons
                                 name="file-document"
                                 size={24}
                                 color="#10b981"
                              />
                              <Text style={styles.actionText}>
                                 Medical Records
                              </Text>
                           </TouchableOpacity>
                           <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => router.push("/(app)/chatbot")}
                           >
                              <MaterialCommunityIcons
                                 name="robot"
                                 size={24}
                                 color="#ef4444"
                              />
                              <Text style={styles.actionText}>
                                 AI Medical Assistant
                              </Text>
                           </TouchableOpacity>
                        </View>
                     </View>
                  </View>
               )}

               {activeTab === "appointments" && (
                  <View style={styles.tabContent}>
                     <Text style={styles.sectionTitle}>Book Appointment</Text>
                     <View style={styles.form}>
                        {/* Clinic Picker */}
                        <Text style={styles.label}>Select Clinic</Text>
                        <CustomPicker
                           selectedValue={selectedClinic}
                           onValueChange={(value) => {
                              setSelectedClinic(value);
                              loadDoctors(value);
                           }}
                           items={clinics.map((c) => ({
                              label: c.name,
                              value: c.id,
                           }))}
                           placeholder="-- Choose --"
                        />

                        {/* Doctor Picker */}
                        <Text style={styles.label}>Select Doctor</Text>
                        <CustomPicker
                           selectedValue={selectedDoctor}
                           onValueChange={setSelectedDoctor}
                           items={
                              selectedClinic
                                 ? doctors.map((d) => ({
                                      label: d.name,
                                      value: d.id,
                                   }))
                                 : []
                           }
                           placeholder="-- Choose --"
                        />

                        {/* Start Time */}
                        <Text style={styles.label}>Start Time</Text>
                        <Input
                           value={startTimeStr}
                           onChangeText={setStartTimeStr}
                           placeholder="YYYY-MM-DDTHH:MM"
                           style={styles.input}
                        />

                        {/* End Time */}
                        <Text style={styles.label}>End Time</Text>
                        <Input
                           value={endTimeStr}
                           onChangeText={setEndTimeStr}
                           placeholder="YYYY-MM-DDTHH:MM"
                           style={styles.input}
                        />

                        <Button
                           title="Submit Appointment Request"
                           onPress={handleCreateAppointment}
                           style={styles.submitButton}
                        />
                     </View>

                     {/* Appointment List */}
                     <View style={styles.appointmentHeader}>
                        <Text style={styles.sectionTitle}>
                           Your Appointments
                        </Text>
                        <TouchableOpacity
                           style={styles.checkboxContainer}
                           onPress={() => setShowCancelled(!showCancelled)}
                        >
                           <View
                              style={[
                                 styles.checkbox,
                                 showCancelled && styles.checkboxChecked,
                              ]}
                           >
                              {showCancelled && (
                                 <MaterialCommunityIcons
                                    name="check"
                                    size={16}
                                    color="#ffffff"
                                 />
                              )}
                           </View>
                           <Text style={styles.checkboxLabel}>
                              Show cancelled
                           </Text>
                        </TouchableOpacity>
                     </View>

                     {appointments
                        .filter(
                           (a) =>
                              showCancelled ||
                              a.status !== AppointmentStatus.CANCELLED,
                        )
                        .map((a) => (
                           <View key={a.id} style={styles.appointmentCard}>
                              <View style={styles.appointmentRow}>
                                 <View style={styles.appointmentInfo}>
                                    <Text style={styles.appointmentTitle}>
                                       {a.clinicName} — {a.doctorName}
                                    </Text>
                                    <Text style={styles.appointmentTime}>
                                       {new Date(a.startTime).toLocaleString()}
                                    </Text>
                                    {getStatusBadge(a.status)}
                                 </View>
                                 {(a.status === AppointmentStatus.PENDING ||
                                    a.status ===
                                       AppointmentStatus.SCHEDULED) && (
                                    <View style={styles.appointmentActions}>
                                       <TouchableOpacity
                                          style={[
                                             styles.actionSmall,
                                             { backgroundColor: "#3b82f6" },
                                          ]}
                                          onPress={() => openEditDialog(a)}
                                       >
                                          <Text style={styles.actionSmallText}>
                                             Edit
                                          </Text>
                                       </TouchableOpacity>
                                       <TouchableOpacity
                                          style={[
                                             styles.actionSmall,
                                             { backgroundColor: "#ef4444" },
                                          ]}
                                          onPress={() => openCancelDialog(a.id)}
                                       >
                                          <Text style={styles.actionSmallText}>
                                             Cancel
                                          </Text>
                                       </TouchableOpacity>
                                    </View>
                                 )}
                              </View>
                           </View>
                        ))}
                  </View>
               )}

               {activeTab === "reports" && (
                  <View style={styles.tabContent}>
                     <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                           name="file-document"
                           size={24}
                           color="#a855f7"
                        />
                        <Text style={styles.sectionTitle}>Medical Reports</Text>
                     </View>
                     {reports.length === 0 ? (
                        <Text style={styles.emptyText}>
                           No medical reports available yet.
                        </Text>
                     ) : (
                        reports.map((item) => (
                           <TouchableOpacity
                              key={item.report.id}
                              style={styles.reportCard}
                              onPress={() => {
                                 setSelectedReport(item);
                                 setViewReportDialog(true);
                              }}
                           >
                              <View style={styles.reportIcon}>
                                 <MaterialCommunityIcons
                                    name="file-document-outline"
                                    size={24}
                                    color="#a855f7"
                                 />
                              </View>
                              <View style={styles.reportContent}>
                                 <Text style={styles.reportTitle}>
                                    {item.report.title}
                                 </Text>
                                 <Text style={styles.reportMeta}>
                                    {item.doctor.name} • {item.clinic.name}
                                 </Text>
                                 {item.report.diagnosis && (
                                    <Text
                                       style={styles.reportPreview}
                                       numberOfLines={2}
                                    >
                                       {item.report.diagnosis}
                                    </Text>
                                 )}
                                 <Text style={styles.reportDate}>
                                    {new Date(
                                       item.report.createdAt,
                                    ).toLocaleDateString()}
                                 </Text>
                              </View>
                              <MaterialCommunityIcons
                                 name="chevron-right"
                                 size={20}
                                 color="#9ca3af"
                              />
                           </TouchableOpacity>
                        ))
                     )}
                  </View>
               )}

               {activeTab === "notifications" && (
                  <View style={styles.tabContent}>
                     <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons
                           name="bell"
                           size={24}
                           color="#3b82f6"
                        />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                     </View>
                     {notifications.length === 0 ? (
                        <Text style={styles.emptyText}>No notifications</Text>
                     ) : (
                        notifications.map((n) => (
                           <View key={n.id} style={styles.notificationCard}>
                              <Text style={styles.notificationMessage}>
                                 {n.message}
                              </Text>
                              <Text style={styles.notificationTime}>
                                 {new Date(n.sentAt).toLocaleString()}
                              </Text>
                           </View>
                        ))
                     )}
                  </View>
               )}

               <ContactUsButton style={styles.contactSection} />
            </ScrollView>

            {/* Dialogs */}
            <EditAppointmentDialog
               visible={editDialogOpen}
               appointment={appointmentToEdit}
               onClose={() => {
                  setEditDialogOpen(false);
                  setAppointmentToEdit(null);
               }}
               onSave={handleEditAppointment}
            />

            <ConfirmDialog
               visible={cancelDialogOpen}
               title="Cancel Appointment?"
               message="Are you sure you want to cancel this appointment? This action cannot be undone."
               onCancel={() => {
                  setCancelDialogOpen(false);
                  setAppointmentToCancel(null);
               }}
               onConfirm={handleCancelAppointment}
            />

            {selectedReport && (
               <ReportModal
                  visible={viewReportDialog}
                  onClose={() => {
                     setViewReportDialog(false);
                     setSelectedReport(null);
                  }}
                  mode="view"
                  initialData={selectedReport.report}
                  onSave={async () => {}}
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
      paddingBottom: 32,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: "#4b5563",
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
   },
   headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   logo: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#2563eb",
      alignItems: "center",
      justifyContent: "center",
   },
   headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   headerSubtitle: {
      fontSize: 12,
      color: "#6b7280",
   },
   chatButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#2563eb",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      gap: 8,
   },
   chatButtonText: {
      color: "#ffffff",
      fontWeight: "500",
   },
   profileCard: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   profileHeader: {
      backgroundColor: "#2563eb",
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
   },
   avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
   },
   avatarText: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#2563eb",
   },
   profileInfo: {
      flex: 1,
   },
   profileName: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 4,
   },
   profileMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
   },
   profileMetaText: {
      fontSize: 12,
      color: "#dbeafe",
   },
   tabBar: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      paddingHorizontal: 16,
   },
   tab: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginRight: 8,
   },
   activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: "#2563eb",
   },
   tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#6b7280",
   },
   activeTabText: {
      color: "#2563eb",
   },
   tabContent: {
      marginTop: 16,
   },
   contactSection: {
      marginTop: 8,
      marginBottom: 24,
   },
   statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
   },
   statCard: {
      flex: 1,
      minWidth: "30%",
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      overflow: "hidden",
   },
   statLabel: {
      fontSize: 12,
      color: "#ffffff",
      opacity: 0.9,
   },
   statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
      marginTop: 4,
   },
   infoGrid: {
      gap: 16,
      marginBottom: 20,
   },
   infoCard: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
   },
   infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
   },
   infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
   },
   infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
   },
   infoLabel: {
      fontSize: 14,
      color: "#6b7280",
      width: 80,
   },
   infoValue: {
      fontSize: 14,
      color: "#1f2937",
      flex: 1,
   },
   quickActions: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 12,
   },
   actionButtons: {
      flexDirection: "row",
      gap: 12,
   },
   actionButton: {
      flex: 1,
      backgroundColor: "#f9fafb",
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#e5e7eb",
   },
   actionText: {
      fontSize: 12,
      color: "#4b5563",
      marginTop: 8,
      textAlign: "center",
   },
   form: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginTop: 12,
      marginBottom: 4,
   },
   pickerContainer: {
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 6,
      marginBottom: 8,
   },
   input: {
      marginBottom: 8,
   },
   submitButton: {
      marginTop: 16,
   },
   appointmentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
   },
   checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
   },
   checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: "#9ca3af",
      alignItems: "center",
      justifyContent: "center",
   },
   checkboxChecked: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
   },
   checkboxLabel: {
      fontSize: 12,
      color: "#4b5563",
   },
   appointmentCard: {
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
   },
   appointmentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
   },
   appointmentInfo: {
      flex: 1,
   },
   appointmentTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
      marginBottom: 2,
   },
   appointmentTime: {
      fontSize: 12,
      color: "#6b7280",
      marginBottom: 4,
   },
   appointmentActions: {
      flexDirection: "row",
      gap: 6,
   },
   actionSmall: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 4,
   },
   actionSmallText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "500",
   },
   badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
   },
   badgeText: {
      fontSize: 10,
      fontWeight: "500",
   },
   sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
   },
   emptyText: {
      fontSize: 14,
      color: "#6b7280",
      textAlign: "center",
      padding: 32,
   },
   reportCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
   },
   reportIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: "#faf5ff",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   reportContent: {
      flex: 1,
   },
   reportTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
      marginBottom: 2,
   },
   reportMeta: {
      fontSize: 12,
      color: "#6b7280",
      marginBottom: 2,
   },
   reportPreview: {
      fontSize: 12,
      color: "#4b5563",
      marginBottom: 2,
   },
   reportDate: {
      fontSize: 10,
      color: "#9ca3af",
   },
   notificationCard: {
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
   },
   notificationMessage: {
      fontSize: 14,
      color: "#1f2937",
      marginBottom: 4,
   },
   notificationTime: {
      fontSize: 10,
      color: "#9ca3af",
   },
   headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   logoutButton: {
      padding: 8,
      marginLeft: 8,
      position: "relative",
   },
});
