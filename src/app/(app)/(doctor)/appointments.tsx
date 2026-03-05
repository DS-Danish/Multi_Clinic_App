import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
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

// Types (mirror web, but without backend logic)
type AppointmentReport = {
   id: string;
   title: string;
   content: string;
   diagnosis?: string;
   prescription?: string;
   recommendations?: string;
   fileUrl?: string;
   createdAt: string;
   updatedAt: string;
};

type Appointment = {
   id: string;
   patientName: string;
   clinicName: string;
   startTime: string;
   endTime: string;
   report?: AppointmentReport;
};

// Mock data for frontend demonstration
const MOCK_APPOINTMENTS: Appointment[] = [
   {
      id: "1",
      patientName: "John Smith",
      clinicName: "Downtown Health",
      startTime: "2025-03-15T09:00:00",
      endTime: "2025-03-15T09:30:00",
   },
   {
      id: "2",
      patientName: "Emily Johnson",
      clinicName: "Westside Clinic",
      startTime: "2025-03-15T10:00:00",
      endTime: "2025-03-15T10:30:00",
      report: {
         id: "r1",
         title: "Follow-up Visit",
         content: "Patient is recovering well.",
         diagnosis: "Mild hypertension",
         prescription: "Lisinopril 10mg",
         recommendations: "Reduce salt intake",
         createdAt: "2025-03-15T10:35:00",
         updatedAt: "2025-03-15T10:35:00",
      },
   },
   // add more as needed
];

export default function DoctorAppointments() {
   const { user } = useAuth();
   const [searchQuery, setSearchQuery] = useState("");
   const [appointments, setAppointments] =
      useState<Appointment[]>(MOCK_APPOINTMENTS);
   const [selectedAppointment, setSelectedAppointment] =
      useState<Appointment | null>(null);
   const [modalVisible, setModalVisible] = useState(false);
   const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
      "create",
   );
   const [viewReport, setViewReport] = useState<AppointmentReport | null>(null);
   const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

   // Filter appointments based on search
   const filteredAppointments = useMemo(() => {
      if (!searchQuery.trim()) return appointments;
      const q = searchQuery.toLowerCase();
      return appointments.filter(
         (a) =>
            a.patientName.toLowerCase().includes(q) ||
            a.clinicName.toLowerCase().includes(q),
      );
   }, [appointments, searchQuery]);

   // Handlers for report actions (mock)
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

   const confirmDelete = () => {
      if (!selectedAppointment) return;
      // Mock delete – just remove the report from the local state
      const updated = appointments.map((a) =>
         a.id === selectedAppointment.id ? { ...a, report: undefined } : a,
      );
      setAppointments(updated);
      setDeleteConfirmVisible(false);
      setSelectedAppointment(null);
   };

   const handleSaveReport = (reportData: any) => {
      // Mock save – update the local state
      if (!selectedAppointment) return;
      const now = new Date().toISOString();
      const newReport: AppointmentReport = {
         id: modalMode === "create" ? `r${Date.now()}` : viewReport!.id,
         title: reportData.title,
         content: reportData.content,
         diagnosis: reportData.diagnosis,
         prescription: reportData.prescription,
         recommendations: reportData.recommendations,
         fileUrl: reportData.fileUrl,
         createdAt: viewReport?.createdAt || now,
         updatedAt: now,
      };
      const updated = appointments.map((a) =>
         a.id === selectedAppointment.id ? { ...a, report: newReport } : a,
      );
      setAppointments(updated);
      setModalVisible(false);
      setSelectedAppointment(null);
      setViewReport(null);
   };

   const formatDateTime = (iso: string) => {
      const date = new Date(iso);
      return date.toLocaleString();
   };

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
                        color="#3b82f6"
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
                  style={[styles.actionButton, styles.addButton]}
                  onPress={() => handleCreateReport(item)}
               >
                  <MaterialCommunityIcons
                     name="plus"
                     size={20}
                     color="#ffffff"
                  />
                  <Text style={styles.addButtonText}>Add Report</Text>
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

               {/* Table Header */}
               <View style={styles.headerRow}>
                  <Text style={[styles.headerCell, { flex: 1.5 }]}>
                     Patient
                  </Text>
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

               {/* Report Modal (create/edit/view) */}
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

               {/* Delete Confirmation Modal */}
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
                           <Text style={styles.deleteTitle}>
                              Delete Report?
                           </Text>
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
