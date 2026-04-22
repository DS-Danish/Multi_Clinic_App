import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   FlatList,
   Modal,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Guard } from "../../../components/Guard";
import { ReportModal } from "../../../components/ReportModal";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import { AppointmentReport, ReportService } from "../../../services/report";

export default function DoctorReports() {
   const { user } = useAuth();
   const [reports, setReports] = useState<AppointmentReport[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedReport, setSelectedReport] =
      useState<AppointmentReport | null>(null);
   const [viewModalVisible, setViewModalVisible] = useState(false);
   const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
   const [reportToDelete, setReportToDelete] =
      useState<AppointmentReport | null>(null);

   useEffect(() => {
      if (!user?.id) return;

      const loadReports = async () => {
         try {
            setLoading(true);
            const response = await ReportService.getDoctorReports(user.id);
            setReports(response);
         } catch (error) {
            console.error("Failed to load doctor reports:", error);
         } finally {
            setLoading(false);
         }
      };

      loadReports();
   }, [user?.id]);

   const handleViewReport = (report: AppointmentReport) => {
      setSelectedReport(report);
      setViewModalVisible(true);
   };

   const handleDeleteReport = (report: AppointmentReport) => {
      setReportToDelete(report);
      setDeleteConfirmVisible(true);
   };

   const confirmDelete = async () => {
      if (!reportToDelete) return;

      try {
         await ReportService.deleteReport(reportToDelete.appointmentId);
         setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
         setDeleteConfirmVisible(false);
         setReportToDelete(null);
      } catch (error: any) {
         Alert.alert("Error", error.message || "Failed to delete report");
      }
   };

   const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

   const renderReport = ({ item }: { item: AppointmentReport }) => (
      <View style={styles.row}>
         <View style={styles.cell}>
            <View style={styles.iconContainer}>
               <MaterialCommunityIcons
                  name="file-document"
                  size={20}
                  color="#a855f7"
               />
            </View>
            <View style={styles.reportInfo}>
               <Text style={styles.reportTitle}>{item.title}</Text>
               {item.diagnosis && (
                  <Text style={styles.diagnosisPreview} numberOfLines={1}>
                     {item.diagnosis}
                  </Text>
               )}
            </View>
         </View>
         <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
         <Text style={styles.date}>{formatDate(item.updatedAt)}</Text>
         <View style={styles.actionsCell}>
            <TouchableOpacity
               style={styles.actionButton}
               onPress={() => handleViewReport(item)}
            >
               <MaterialCommunityIcons name="eye" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
               style={styles.actionButton}
               onPress={() => handleDeleteReport(item)}
            >
               <MaterialCommunityIcons name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["DOCTOR"]}>
         <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.content}>
               <Text style={styles.title}>Your Reports</Text>
               <Text style={styles.subtitle}>
                  Review all reports generated for your appointments.
               </Text>

               {loading ? (
                  <View style={styles.emptyContainer}>
                     <ActivityIndicator size="large" color="#2563eb" />
                  </View>
               ) : (
                  <>
                     <View style={styles.headerRow}>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Title</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Created</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Updated</Text>
                        <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
                     </View>
                     <FlatList
                        data={reports}
                        renderItem={renderReport}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={
                           <View style={styles.emptyContainer}>
                              <Text style={styles.emptyText}>No reports found.</Text>
                           </View>
                        }
                        contentContainerStyle={styles.listContent}
                     />
                  </>
               )}

               {selectedReport && (
                  <ReportModal
                     visible={viewModalVisible}
                     onClose={() => setViewModalVisible(false)}
                     mode="view"
                     initialData={selectedReport}
                     onSave={async () => {}}
                  />
               )}

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
                           Are you sure you want to delete the following report?
                        </Text>
                        <Text style={styles.deleteReportTitle}>
                           "{reportToDelete?.title}"
                        </Text>
                        <Text style={styles.deleteWarning}>
                           This action cannot be undone.
                        </Text>
                        <View style={styles.deleteActions}>
                           <Button
                              title="Cancel"
                              variant="outline"
                              onPress={() => {
                                 setDeleteConfirmVisible(false);
                                 setReportToDelete(null);
                              }}
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
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
   },
   iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: "#faf5ff",
      alignItems: "center",
      justifyContent: "center",
   },
   reportInfo: {
      flex: 1,
   },
   reportTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   diagnosisPreview: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
   },
   date: {
      flex: 1,
      fontSize: 14,
      color: "#6b7280",
   },
   actionsCell: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
   },
   actionButton: {
      padding: 6,
      borderRadius: 4,
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
      marginBottom: 8,
   },
   deleteReportTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 12,
      textAlign: "center",
   },
   deleteWarning: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 24,
   },
   deleteActions: {
      flexDirection: "row",
      gap: 12,
   },
   deleteButton: {
      flex: 1,
   },
});