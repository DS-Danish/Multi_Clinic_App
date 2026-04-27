import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { ContactUsButton } from "../../../components/ContactUsButton";
import { Guard } from "../../../components/Guard";
import { ClinicAdminAPI, Patient } from "../../../services/clinicAdmin";

// Mock recent appointments (since we don't have API for activity)
const recentAppointments = [
   {
      id: 1,
      patient: "Sarah Johnson",
      doctor: "Dr. Smith",
      time: "09:00 AM",
      status: "confirmed",
   },
   {
      id: 2,
      patient: "Mike Peters",
      doctor: "Dr. Williams",
      time: "10:30 AM",
      status: "pending",
   },
   {
      id: 3,
      patient: "Emma Davis",
      doctor: "Dr. Brown",
      time: "11:00 AM",
      status: "confirmed",
   },
   {
      id: 4,
      patient: "John Wilson",
      doctor: "Dr. Smith",
      time: "02:00 PM",
      status: "cancelled",
   },
];

const quickActions = [
   {
      icon: "account-plus",
      label: "Add Doctor",
      color: "#3b82f6",
      route: "/doctors/add",
   },
   {
      icon: "account-group",
      label: "Add Patient",
      color: "#10b981",
      route: "/patients/add",
   },
   {
      icon: "calendar-plus",
      label: "New Appointment",
      color: "#8b5cf6",
      route: "/appointments/add",
   },
   {
      icon: "account-tie",
      label: "Add Receptionist",
      color: "#f97316",
      route: "/receptionists/add",
   },
   {
      icon: "robot",
      label: "AI Assistant",
      color: "#3b82f6",
      route: "/chatbot",
   },
];

export default function ClinicAdminDashboard() {
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
      totalDoctors: 0,
      totalPatients: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      revenue: 0,
      receptionists: 0,
   });

   const [recentPatients, setRecentPatients] = useState<Patient[]>([]);

   useEffect(() => {
      loadDashboardData();
   }, []);

   const loadDashboardData = async () => {
      try {
         setLoading(true);
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const clinicId = clinicRes.data.id;

         const [doctorsRes, patientsRes, appointmentsRes, receptionistsRes] =
            await Promise.all([
               ClinicAdminAPI.getClinicDoctors(clinicId),
               ClinicAdminAPI.getClinicPatients(clinicId),
               ClinicAdminAPI.getClinicAppointments(clinicId),
               ClinicAdminAPI.getClinicReceptionists(clinicId),
            ]);

         const doctors = doctorsRes.data;
         const patients = patientsRes.data;
         const appointments = appointmentsRes.data;
         const receptionists = receptionistsRes.data;

         const todayAppts = ClinicAdminAPI.getTodayAppointments(appointments);
         const pendingAppts =
            ClinicAdminAPI.getPendingAppointments(appointments);

         setStats({
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            todayAppointments: todayAppts.length,
            pendingAppointments: pendingAppts.length,
            revenue: 0, // Would need billing integration
            receptionists: receptionists.length,
         });

         setRecentPatients(patients.slice(0, 4));
      } catch (error) {
         console.error("Failed to load dashboard data:", error);
      } finally {
         setLoading(false);
      }
   };

   const getStatusIcon = (status: string) => {
      switch (status) {
         case "confirmed":
            return "check-circle";
         case "pending":
            return "clock-outline";
         case "cancelled":
            return "alert-circle";
         default:
            return "circle-outline";
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case "confirmed":
            return "#10b981";
         case "pending":
            return "#f59e0b";
         case "cancelled":
            return "#ef4444";
         default:
            return "#6b7280";
      }
   };

   const getStatusBg = (status: string) => {
      switch (status) {
         case "confirmed":
            return "#d1fae5";
         case "pending":
            return "#fef3c7";
         case "cancelled":
            return "#fee2e2";
         default:
            return "#f3f4f6";
      }
   };

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
         <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
         >
            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
               </View>
            ) : (
               <>
                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                     <View
                        style={[
                           styles.statCard,
                           { borderLeftColor: "#3b82f6" },
                        ]}
                     >
                        <View style={styles.statIcon}>
                           <MaterialCommunityIcons
                              name="stethoscope"
                              size={24}
                              color="#3b82f6"
                           />
                        </View>
                        <Text style={styles.statValue}>
                           {stats.totalDoctors}
                        </Text>
                        <Text style={styles.statLabel}>Total Doctors</Text>
                        <Text style={styles.statTrend}>+2 this month</Text>
                     </View>

                     <View
                        style={[
                           styles.statCard,
                           { borderLeftColor: "#10b981" },
                        ]}
                     >
                        <View style={styles.statIcon}>
                           <MaterialCommunityIcons
                              name="account-group"
                              size={24}
                              color="#10b981"
                           />
                        </View>
                        <Text style={styles.statValue}>
                           {stats.totalPatients}
                        </Text>
                        <Text style={styles.statLabel}>Total Patients</Text>
                        <Text style={styles.statTrend}>+28 this week</Text>
                     </View>

                     <View
                        style={[
                           styles.statCard,
                           { borderLeftColor: "#8b5cf6" },
                        ]}
                     >
                        <View style={styles.statIcon}>
                           <MaterialCommunityIcons
                              name="calendar"
                              size={24}
                              color="#8b5cf6"
                           />
                        </View>
                        <Text style={styles.statValue}>
                           {stats.todayAppointments}
                        </Text>
                        <Text style={styles.statLabel}>
                           Today's Appointments
                        </Text>
                        <Text style={styles.statTrend}>
                           {stats.pendingAppointments} pending
                        </Text>
                     </View>

                     <View
                        style={[
                           styles.statCard,
                           { borderLeftColor: "#10b981" },
                        ]}
                     >
                        <View style={styles.statIcon}>
                           <MaterialCommunityIcons
                              name="cash"
                              size={24}
                              color="#10b981"
                           />
                        </View>
                        <Text style={styles.statValue}>${stats.revenue}</Text>
                        <Text style={styles.statLabel}>Revenue</Text>
                        <Text style={styles.statTrend}>+12% this month</Text>
                     </View>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Quick Actions</Text>
                     <View style={styles.actionsGrid}>
                        {quickActions.map((action, index) => (
                           <TouchableOpacity
                              key={index}
                              style={styles.actionCard}
                              onPress={() => router.push(action.route as any)}
                           >
                              <View
                                 style={[
                                    styles.actionIcon,
                                    { backgroundColor: action.color },
                                 ]}
                              >
                                 <MaterialCommunityIcons
                                    name={action.icon as any}
                                    size={24}
                                    color="#ffffff"
                                 />
                              </View>
                              <Text style={styles.actionLabel}>
                                 {action.label}
                              </Text>
                           </TouchableOpacity>
                        ))}
                     </View>
                  </View>

                  {/* Recent Appointments */}
                  <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                           Recent Appointments
                        </Text>
                        <TouchableOpacity
                           onPress={() => router.push("/appointments")}
                        >
                           <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                     </View>
                     {recentAppointments.map((apt) => (
                        <View key={apt.id} style={styles.appointmentCard}>
                           <View style={styles.appointmentLeft}>
                              <View style={styles.appointmentAvatar}>
                                 <Text style={styles.avatarText}>
                                    {apt.patient
                                       .split(" ")
                                       .map((n) => n[0])
                                       .join("")}
                                 </Text>
                              </View>
                              <View>
                                 <Text style={styles.appointmentPatient}>
                                    {apt.patient}
                                 </Text>
                                 <Text style={styles.appointmentDoctor}>
                                    {apt.doctor}
                                 </Text>
                              </View>
                           </View>
                           <View style={styles.appointmentRight}>
                              <Text style={styles.appointmentTime}>
                                 {apt.time}
                              </Text>
                              <View
                                 style={[
                                    styles.statusBadge,
                                    {
                                       backgroundColor: getStatusBg(apt.status),
                                    },
                                 ]}
                              >
                                 <MaterialCommunityIcons
                                    name={getStatusIcon(apt.status)}
                                    size={12}
                                    color={getStatusColor(apt.status)}
                                 />
                                 <Text
                                    style={[
                                       styles.statusText,
                                       { color: getStatusColor(apt.status) },
                                    ]}
                                 >
                                    {apt.status}
                                 </Text>
                              </View>
                           </View>
                        </View>
                     ))}
                  </View>

                  {/* Recent Patients */}
                  <View style={styles.section}>
                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Patients</Text>
                        <TouchableOpacity
                           onPress={() => router.push("/patients")}
                        >
                           <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                     </View>
                     {recentPatients.map((patient) => (
                        <View key={patient.id} style={styles.patientCard}>
                           <View style={styles.patientAvatar}>
                              <Text style={styles.patientAvatarText}>
                                 {patient.name.charAt(0)}
                              </Text>
                           </View>
                           <View style={styles.patientInfo}>
                              <Text style={styles.patientName}>
                                 {patient.name}
                              </Text>
                              <Text style={styles.patientEmail}>
                                 {patient.email}
                              </Text>
                           </View>
                        </View>
                     ))}
                  </View>

                  <ContactUsButton style={styles.contactSection} />
               </>
            )}
         </ScrollView>
      </Guard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   content: {
      padding: 16,
      paddingBottom: 32,
   },
   loadingContainer: {
      padding: 40,
      alignItems: "center",
   },
   statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
   },
   statCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: "#ffffff",
      borderRadius: 8,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   statIcon: {
      marginBottom: 12,
   },
   statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
   },
   statLabel: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
   },
   statTrend: {
      fontSize: 10,
      color: "#10b981",
      marginTop: 8,
   },
   section: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   contactSection: {
      marginBottom: 20,
   },
   sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937",
   },
   viewAll: {
      fontSize: 14,
      color: "#2563eb",
   },
   actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
   },
   actionCard: {
      flex: 1,
      minWidth: "30%",
      alignItems: "center",
      padding: 12,
   },
   actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
   },
   actionLabel: {
      fontSize: 12,
      color: "#4b5563",
      textAlign: "center",
   },
   appointmentCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      backgroundColor: "#f9fafb",
      borderRadius: 8,
      marginBottom: 8,
   },
   appointmentLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   appointmentAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
   },
   avatarText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#2563eb",
   },
   appointmentPatient: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   appointmentDoctor: {
      fontSize: 12,
      color: "#6b7280",
   },
   appointmentRight: {
      alignItems: "flex-end",
   },
   appointmentTime: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
      marginBottom: 4,
   },
   statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   statusText: {
      fontSize: 10,
      fontWeight: "500",
   },
   patientCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      backgroundColor: "#f9fafb",
      borderRadius: 8,
      marginBottom: 8,
   },
   patientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
   },
   patientAvatarText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2563eb",
   },
   patientInfo: {
      flex: 1,
   },
   patientName: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   patientEmail: {
      fontSize: 12,
      color: "#6b7280",
   },
});
