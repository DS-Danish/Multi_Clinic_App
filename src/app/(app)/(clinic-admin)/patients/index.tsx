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
import { ClinicAdminAPI, Patient } from "../../../../services/mock/clinicAdmin";

export default function PatientsList() {
   const [loading, setLoading] = useState(true);
   const [patients, setPatients] = useState<Patient[]>([]);

   useEffect(() => {
      loadPatients();
   }, []);

   const loadPatients = async () => {
      try {
         setLoading(true);
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const clinicId = clinicRes.data.id;
         const response = await ClinicAdminAPI.getClinicPatients(clinicId);
         setPatients(response.data);
      } catch (error) {
         console.error("Failed to load patients:", error);
      } finally {
         setLoading(false);
      }
   };

   const renderPatient = ({ item }: { item: Patient }) => (
      <View style={styles.patientCard}>
         <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
         </View>
         <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.name}</Text>
            <Text style={styles.patientEmail}>{item.email}</Text>
            <View style={styles.patientDetails}>
               {item.phone && (
                  <Text style={styles.detailText}>{item.phone}</Text>
               )}
               {item.age && (
                  <Text style={styles.detailText}>Age: {item.age}</Text>
               )}
               {item.gender && (
                  <Text style={styles.detailText}>{item.gender}</Text>
               )}
            </View>
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
         <View style={styles.container}>
            <View style={styles.header}>
               <Text style={styles.title}>Patients</Text>
               <Button
                  title="Add Patient"
                  onPress={() => router.push("/patients/add")}
                  style={styles.addButton}
               />
            </View>

            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
               </View>
            ) : (
               <FlatList
                  data={patients}
                  renderItem={renderPatient}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                     <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                           name="account-group"
                           size={48}
                           color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>No patients found</Text>
                        <Text style={styles.emptySubtext}>
                           Add your first patient to get started
                        </Text>
                        <Button
                           title="Add Patient"
                           onPress={() => router.push("/patients/add")}
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
      width: 120,
   },
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   listContent: {
      padding: 16,
   },
   patientCard: {
      flexDirection: "row",
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
   patientAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
   },
   avatarText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#2563eb",
   },
   patientInfo: {
      flex: 1,
   },
   patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 2,
   },
   patientEmail: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 4,
   },
   patientDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
   },
   detailText: {
      fontSize: 12,
      color: "#6b7280",
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
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
