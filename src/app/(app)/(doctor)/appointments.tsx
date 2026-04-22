import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   FlatList,
   Modal,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Guard } from "../../../components/Guard";
import { ReportModal } from "../../../components/ReportModal";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { DoctorAppointment, DoctorService } from "../../../services/doctor";
import { AppointmentReport, ReportService } from "../../../services/report";

type Appointment = {
   id: string;
   patientName: string;
   clinicName: string;
   startTime: string;
   endTime: string;
   report?: AppointmentReport | null;
};

const normalizeAppointment = (appointment: DoctorAppointment): Appointment => ({
   id: appointment.id,
   patientName: appointment.patientName,
   clinicName: appointment.clinicName,
   startTime: appointment.startTime,
   endTime: appointment.endTime,
   report: appointment.report || null,
});

export default function DoctorAppointments() {
   const { user } = useAuth();
   const [searchQuery, setSearchQuery] = useState("");
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedAppointment, setSelectedAppointment] =
      useState<Appointment | null>(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
      "create",
   );
   const [viewReport, setViewReport] = useState<AppointmentReport | null>(null);
   const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

   useEffect(() => {
      if (!user?.id) return;

      const loadAppointments = async () => {
         try {
            setLoading(true);
            const response = await DoctorService.getAppointments(user.id);
            setAppointments(response.map(normalizeAppointment));
         } catch (error) {
            console.error("Failed to load doctor appointments:", error);
         } finally {
            setLoading(false);
         }
      };

      loadAppointments();
   }, [user?.id]);

   const filteredAppointments = useMemo(() => {
      if (!searchQuery.trim()) return appointments;
      const query = searchQuery.toLowerCase();
      return appointments.filter(
         (appointment) =>
            appointment.patientName.toLowerCase().includes(query) ||
            appointment.clinicName.toLowerCase().includes(query),
      );
   }, [appointments, searchQuery]);

   const handleCreateReport = (appointment: Appointment) => {
      setSelectedAppointment(appointment);
      setViewReport(null);
      setModalMode("create");
      setModalVisible(true);
   };

   const handleEditReport = (appointment: Appointment) => {
      if (!appointment.report) return;
      setSelectedAppointment(appointment);
      setViewReport(appointment.report);
      setModalMode("edit");
      setModalVisible(true);
   };

   const handleViewReport = (appointment: Appointment) => {
      if (!appointment.report) return;
      setSelectedAppointment(appointment);
      setViewReport(appointment.report);
      setModalMode("view");
      setModalVisible(true);
   };

   const handleDeleteReport = (appointment: Appointment) => {
      setSelectedAppointment(appointment);
      setDeleteConfirmVisible(true);
   };

   const confirmDelete = async () => {
      if (!selectedAppointment) return;

      try {
         await ReportService.deleteReport(selectedAppointment.id);
         setAppointments((prev) =>
            prev.map((appointment) =>
               appointment.id === selectedAppointment.id
                  ? { ...appointment, report: null }
                  : appointment,
            ),
         );
         setDeleteConfirmVisible(false);
         setSelectedAppointment(null);
      } catch (error: any) {
         Alert.alert("Error", error.message || "Failed to delete report");
      }
   };

   const handleSaveReport = async (reportData: any) => {
      if (!selectedAppointment) return;

      try {
         const savedReport =
            modalMode === "create"
               ? await ReportService.createReport(
                    selectedAppointment.id,
                    reportData,
                 )
               : await ReportService.updateReport(
                    selectedAppointment.id,
                    reportData,
                 );

         setAppointments((prev) =>
            prev.map((appointment) =>
               appointment.id === selectedAppointment.id
                  ? { ...appointment, report: savedReport }
                  : appointment,
            ),
         );
         setModalVisible(false);
         setSelectedAppointment(null);
         setViewReport(null);
      } catch (error: any) {
         Alert.alert("Error", error.message || "Failed to save report");
      }
   };

   const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

   const renderAppointment = ({ item }: { item: Appointment }) => (
      <View style={styles.row}>
         <View style={styles.cell}>
            <MaterialCommunityIcons name="account" size={18} color="#3b82f6" />
            <Text style={styles.cellText}>{item.patientName}</Text>
         </View>
         <Text style={styles.cellText}>{item.clinicName}</Text>
         <Text style={styles.cellText}>{formatDateTime(item.startTime)}</Text>
         <Text style={styles.cellText}>{formatDateTime(item.endTime)}</Text>
         <View style={styles.actionsCell}>
            {item.report ? (
               <>
                  <TouchableOpacity
                     style={styles.actionButton}
                     onPress={() => handleViewReport(item)}
                  >
                     <MaterialCommunityIcons
                        name="eye"
                        size={20}
                        color="#6b7280"
                     />
                  </TouchableOpacity>
                  <TouchableOpacity
                     style={styles.actionButton}
                     onPress={() => handleEditReport(item)}
                  >
                     <MaterialCommunityIcons
                        name="pencil"
                        size={20}
                        color="#2563eb"
                     />
                  </TouchableOpacity>
                  <TouchableOpacity
                     style={styles.actionButton}
                     onPress={() => handleDeleteReport(item)}
                  >
                     <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color="#ef4444"
                     />
                  </TouchableOpacity>
               </>
            ) : (
               <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCreateReport(item)}
               >
                  <MaterialCommunityIcons
                     name="plus"
                     size={20}
                     color="#10b981"
                  />
               </TouchableOpacity>
            )}
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["DOCTOR"]}>
         <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.content}>
               <Text style={styles.title}>Appointments</Text>
               <Text style={styles.subtitle}>
                  All upcoming and completed appointments for today & this week.
               </Text>

               <View style={styles.searchContainer}>
                  <MaterialCommunityIcons
                     name="magnify"
                     size={20}
                     color="#9ca3af"
                     style={styles.searchIcon}
                  />
                  <TextInput
                     style={styles.searchInput}
                     placeholder="Search by patient or clinic..."
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                     placeholderTextColor="#9ca3af"
                  />
               </View>

               {loading ? (
                  <View style={styles.emptyContainer}>
                     <ActivityIndicator size="large" color="#2563eb" />
                  </View>
               ) : (
                  <>
                     <View style={styles.headerRow}>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Patient</Text>
                        <Text style={[styles.headerCell, { flex: 1.2 }]}>Clinic</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Start</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>End</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Actions</Text>
                     </View>
                     <FlatList
                        data={filteredAppointments}
                        renderItem={renderAppointment}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={
                           <View style={styles.emptyContainer}>
                              <Text style={styles.emptyText}>
                                 No appointments found.
                              </Text>
                           </View>
                        }
                        contentContainerStyle={styles.listContent}
                     />
                  </>
               )}

               <ReportModal
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  mode={modalMode}
                  initialData={viewReport}
                  appointmentDetails={
                     selectedAppointment
                        ? {
                             patientName: selectedAppointment.patientName,
                             clinicName: selectedAppointment.clinicName,
                             date: selectedAppointment.startTime,
                          }
                        : undefined
                  }
                  onSave={handleSaveReport}
               />

               <Modal
                  visible={deleteConfirmVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setDeleteConfirmVisible(false)}
               >
                  <View style={styles.modalOverlay}>
                     <View style={styles.deleteModal}>
                        <View style={styles.deleteHeader}>
                           <View style={styles.deleteIcon}>
                              <MaterialCommunityIcons
                                 name="delete"
                                 size={24}
                                 color="#ef4444"
                              />
                           </View>
                           <Text style={styles.deleteTitle}>Delete Report?</Text>
                        </View>
                        <Text style={styles.deleteMessage}>
                           Are you sure you want to delete the report for{" "}
                           <Text style={{ fontWeight: "600" }}>
                              {selectedAppointment?.patientName}
                           </Text>
                           ? This action cannot be undone.
                        </Text>
                        <View style={styles.deleteActions}>
                           <Button
                              title="Cancel"
                              variant="outline"
                              onPress={() => setDeleteConfirmVisible(false)}
                              style={styles.deleteButton}
                           />
                           <Button
                              title="Delete Report"
                              onPress={confirmDelete}
                              style={[
                                 styles.deleteButton,
                                 { backgroundColor: "#ef4444" },
                              ]}
                              textStyle={{ color: "#ffffff" }}
                           />
                        </View>
                     </View>
                  </View>
               </Modal>
            </View>
         </SafeAreaView>
      </Guard>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   content: {
      flex: 1,
      padding: 16,
   },
   title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   subtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 20,
   },
   searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      height: 44,
   },
   searchIcon: {
      marginRight: 8,
   },
   searchInput: {
      flex: 1,
      fontSize: 14,
      color: "#1f2937",
      padding: 0,
   },
   headerRow: {
      flexDirection: "row",
      backgroundColor: "#f3f4f6",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginBottom: 8,
   },
   headerCell: {
      fontSize: 12,
      fontWeight: "600",
      color: "#4b5563",
      textAlign: "left",
      flex: 1,
   },
   row: {
      flexDirection: "row",
      backgroundColor: "#ffffff",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
      alignItems: "center",
   },
   cell: {
      flex: 1.5,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
   },
   cellText: {
      fontSize: 14,
      color: "#1f2937",
      flex: 1,
   },
   actionsCell: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 12,
   },
   actionButton: {
      padding: 6,
      borderRadius: 4,
   },
   addButton: {
      backgroundColor: "#3b82f6",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
   },
   addButtonText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "500",
   },
   listContent: {
      paddingBottom: 20,
   },
   emptyContainer: {
      padding: 32,
      alignItems: "center",
   },
   emptyText: {
      fontSize: 14,
      color: "#9ca3af",
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
   },
   deleteModal: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 400,
   },
   deleteHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
   },
   deleteIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#fee2e2",
      alignItems: "center",
      justifyContent: "center",
   },
   deleteTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   deleteMessage: {
      fontSize: 14,
      color: "#4b5563",
      marginBottom: 24,
      lineHeight: 20,
   },
   deleteActions: {
      flexDirection: "row",
      gap: 12,
   },
   deleteButton: {
      flex: 1,
   },
});
