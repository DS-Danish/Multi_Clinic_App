import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   FlatList,
   StyleSheet,
   Text,
   View,
} from "react-native";
import { Guard } from "../../../../components/Guard";
import { Button } from "../../../../components/ui/Button";
import {
   Appointment,
   ClinicAdminAPI,
} from "../../../../services/clinicAdmin";

export default function AppointmentsList() {
   const [loading, setLoading] = useState(true);
   const [appointments, setAppointments] = useState<Appointment[]>([]);

   useEffect(() => {
      loadAppointments();
   }, []);

   const loadAppointments = async () => {
      try {
         setLoading(true);
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const clinicId = clinicRes.data.id;
         const response = await ClinicAdminAPI.getClinicAppointments(clinicId);
         setAppointments(response.data);
      } catch (error) {
         console.error("Failed to load appointments:", error);
      } finally {
         setLoading(false);
      }
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case "CONFIRMED":
            return "#10b981";
         case "PENDING":
            return "#f59e0b";
         case "CANCELLED":
            return "#ef4444";
         case "COMPLETED":
            return "#6b7280";
         default:
            return "#6b7280";
      }
   };

   const getStatusBg = (status: string) => {
      switch (status) {
         case "CONFIRMED":
            return "#d1fae5";
         case "PENDING":
            return "#fef3c7";
         case "CANCELLED":
            return "#fee2e2";
         case "COMPLETED":
            return "#f3f4f6";
         default:
            return "#f3f4f6";
      }
   };

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return (
         date.toLocaleDateString() +
         " " +
         date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
   };

   const renderAppointment = ({ item }: { item: Appointment }) => (
      <View style={styles.appointmentCard}>
         <View style={styles.appointmentHeader}>
            <View style={styles.patientInfo}>
               <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                     {item.patientName?.charAt(0) || "?"}
                  </Text>
               </View>
               <View>
                  <Text style={styles.patientName}>
                     {item.patientName || "Unknown"}
                  </Text>
                  <Text style={styles.doctorName}>
                     {item.doctorName || "Unknown Doctor"}
                  </Text>
               </View>
            </View>
            <View
               style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusBg(item.status) },
               ]}
            >
               <Text
                  style={[
                     styles.statusText,
                     { color: getStatusColor(item.status) },
                  ]}
               >
                  {item.status}
               </Text>
            </View>
         </View>
         <Text style={styles.appointmentTime}>
            {formatDate(item.appointmentDate)}
         </Text>
      </View>
   );

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
         <View style={styles.container}>
            <View style={styles.header}>
               <Text style={styles.title}>Appointments</Text>
               <Button
                  title="New Appointment"
                  onPress={() => router.push("/appointments/add")}
                  style={styles.addButton}
               />
            </View>

            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
               </View>
            ) : (
               <FlatList
                  data={appointments}
                  renderItem={renderAppointment}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                     <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                           name="calendar"
                           size={48}
                           color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>
                           No appointments found
                        </Text>
                        <Text style={styles.emptySubtext}>
                           Create your first appointment
                        </Text>
                        <Button
                           title="New Appointment"
                           onPress={() => router.push("/appointments/add")}
                           style={styles.emptyButton}
                        />
                     </View>
                  }
               />
            )}
         </View>
      </Guard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   addButton: {
      width: 140,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   listContent: {
      padding: 16,
   },
   appointmentCard: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   appointmentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
   },
   patientInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
   },
   avatarText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2563eb",
   },
   patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
   },
   doctorName: {
      fontSize: 14,
      color: "#6b7280",
   },
   statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   statusText: {
      fontSize: 12,
      fontWeight: "500",
   },
   appointmentTime: {
      fontSize: 14,
      color: "#6b7280",
      marginTop: 4,
   },
   emptyContainer: {
      alignItems: "center",
      padding: 40,
   },
   emptyText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#4b5563",
      marginTop: 16,
   },
   emptySubtext: {
      fontSize: 14,
      color: "#9ca3af",
      marginTop: 8,
      marginBottom: 24,
   },
   emptyButton: {
      width: 200,
   },
});
