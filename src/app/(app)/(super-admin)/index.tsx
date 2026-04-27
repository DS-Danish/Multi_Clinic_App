import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   Button,
   FlatList,
   Modal,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { ContactUsButton } from "../../../components/ContactUsButton";
import { Guard } from "../../../components/Guard";
import { Clinic, SuperAdminAPI } from "../../../services/superAdmin";

export default function SuperAdminDashboard() {
   const [loading, setLoading] = useState(true);
   const [clinics, setClinics] = useState<Clinic[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
   const [modalVisible, setModalVisible] = useState(false);

   useEffect(() => {
      loadClinics();
   }, []);

   const loadClinics = async () => {
      try {
         setLoading(true);
         const res = await SuperAdminAPI.getClinics();
         setClinics(res.data);
      } catch (error) {
         console.error("Failed to load clinics:", error);
      } finally {
         setLoading(false);
      }
   };

   const filteredClinics = clinics.filter(
      (clinic) =>
         clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         clinic.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
         clinic.email.toLowerCase().includes(searchQuery.toLowerCase()),
   );

   const totalAdmins = clinics.reduce((sum, c) => sum + c.admins, 0);
   const totalPatients = clinics.reduce((sum, c) => sum + c.patients, 0);

   const renderClinic = ({ item }: { item: Clinic }) => (
      <View style={styles.clinicRow}>
         <View style={styles.clinicCell}>
            <Text style={styles.clinicName}>{item.name}</Text>
            <Text style={styles.clinicCode}>{item.code}</Text>
         </View>
         <View style={styles.contactCell}>
            <Text style={styles.contactEmail}>{item.email}</Text>
            <Text style={styles.contactPhone}>{item.phone}</Text>
         </View>
         <View style={styles.statsCell}>
            <Text style={styles.statsText}>Admins: {item.admins}</Text>
            <Text style={styles.statsText}>Patients: {item.patients}</Text>
         </View>
         <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
               setSelectedClinic(item);
               setModalVisible(true);
            }}
         >
            <Text style={styles.actionText}>View</Text>
         </TouchableOpacity>
      </View>
   );

   return (
      <Guard allowedRoles={["SYSTEM_ADMIN"]}>
         <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
         >
            {/* Header with Add button */}
            <View style={styles.header}>
               <Text style={styles.title}>Dashboard Overview</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
               <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Clinics</Text>
                  <Text style={styles.statValue}>{clinics.length}</Text>
               </View>
               <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Admins</Text>
                  <Text style={styles.statValue}>{totalAdmins}</Text>
               </View>
               <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Patients</Text>
                  <Text style={styles.statValue}>{totalPatients}</Text>
               </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
               <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color="#9ca3af"
               />
               <TextInput
                  style={styles.searchInput}
                  placeholder="Search clinics..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
               />
            </View>

            {/* Clinics Table */}
            <View style={styles.tableContainer}>
               <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, { flex: 2 }]}>Clinic</Text>
                  <Text style={[styles.headerCell, { flex: 2 }]}>Contact</Text>
                  <Text style={[styles.headerCell, { flex: 1.5 }]}>Stats</Text>
                  <Text style={[styles.headerCell, { flex: 0.8 }]}>
                     Actions
                  </Text>
               </View>

               {loading ? (
                  <View style={styles.loadingContainer}>
                     <ActivityIndicator size="large" color="#2563eb" />
                  </View>
               ) : (
                  <FlatList
                     data={filteredClinics}
                     renderItem={renderClinic}
                     keyExtractor={(item) => item.id}
                     scrollEnabled={false}
                     ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                           <MaterialCommunityIcons
                              name="hospital-building"
                              size={48}
                              color="#9ca3af"
                           />
                           <Text style={styles.emptyText}>
                              No clinics found
                           </Text>
                        </View>
                     }
                  />
               )}
            </View>
            <Modal
               visible={modalVisible}
               transparent
               animationType="slide"
               onRequestClose={() => setModalVisible(false)}
            >
               <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                     <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Clinic Details</Text>
                        <TouchableOpacity
                           onPress={() => setModalVisible(false)}
                        >
                           <MaterialCommunityIcons
                              name="close"
                              size={24}
                              color="#6b7280"
                           />
                        </TouchableOpacity>
                     </View>
                     {selectedClinic && (
                        <ScrollView>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Name:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.name}
                              </Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Code:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.code}
                              </Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Email:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.email}
                              </Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Phone:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.phone}
                              </Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Admins:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.admins}
                              </Text>
                           </View>
                           <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>Patients:</Text>
                              <Text style={styles.detailValue}>
                                 {selectedClinic.patients}
                              </Text>
                           </View>
                        </ScrollView>
                     )}
                     <View style={styles.modalButtonWrapper}>
                        <Button
                           title="Close"
                           onPress={() => setModalVisible(false)}
                        />
                     </View>
                  </View>
               </View>
            </Modal>

            <ContactUsButton style={styles.contactSection} />
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
   addButton: {
      width: 140,
   },
   statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
   },
   statCard: {
      flex: 1,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   statLabel: {
      fontSize: 12,
      color: "#6b7280",
      marginBottom: 4,
   },
   statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
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
   searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color: "#1f2937",
   },
   tableContainer: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   contactSection: {
      marginTop: 20,
   },
   tableHeader: {
      flexDirection: "row",
      backgroundColor: "#f9fafb",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
   },
   headerCell: {
      fontSize: 12,
      fontWeight: "600",
      color: "#4b5563",
   },
   clinicRow: {
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
      alignItems: "center",
   },
   clinicCell: {
      flex: 2,
   },
   clinicName: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   clinicCode: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
   },
   contactCell: {
      flex: 2,
   },
   contactEmail: {
      fontSize: 14,
      color: "#1f2937",
   },
   contactPhone: {
      fontSize: 12,
      color: "#6b7280",
   },
   statsCell: {
      flex: 1.5,
   },
   statsText: {
      fontSize: 12,
      color: "#6b7280",
   },
   actionButton: {
      flex: 0.8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: "#eff6ff",
      borderRadius: 4,
      alignItems: "center",
   },
   actionText: {
      fontSize: 12,
      color: "#2563eb",
      fontWeight: "500",
   },
   loadingContainer: {
      padding: 40,
      alignItems: "center",
   },
   emptyContainer: {
      padding: 40,
      alignItems: "center",
   },
   emptyText: {
      fontSize: 14,
      color: "#9ca3af",
      marginTop: 12,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
   },
   modalContent: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      width: "90%",
      maxHeight: "80%",
   },
   modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   detailRow: {
      flexDirection: "row",
      marginBottom: 12,
   },
   detailLabel: {
      width: 80,
      fontSize: 14,
      fontWeight: "500",
      color: "#6b7280",
   },
   detailValue: {
      flex: 1,
      fontSize: 14,
      color: "#1f2937",
   },
   modalButton: {
      marginTop: 16,
   },
   modalButtonWrapper: {
      marginTop: 16,
   },
});
