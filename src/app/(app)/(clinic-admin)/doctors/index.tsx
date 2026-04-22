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
import { ClinicAdminAPI, Doctor } from "../../../../services/clinicAdmin";

export default function DoctorsList() {
   const [loading, setLoading] = useState(true);
   const [doctors, setDoctors] = useState<Doctor[]>([]);

   useEffect(() => {
      loadDoctors();
   }, []);

   const loadDoctors = async () => {
      try {
         setLoading(true);
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const clinicId = clinicRes.data.id;
         const response = await ClinicAdminAPI.getClinicDoctors(clinicId);
         setDoctors(response.data);
      } catch (error) {
         console.error("Failed to load doctors:", error);
      } finally {
         setLoading(false);
      }
   };

   const renderDoctor = ({ item }: { item: Doctor }) => (
      <View style={styles.doctorCard}>
         <View style={styles.doctorAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
         </View>
         <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{item.name}</Text>
            <Text style={styles.doctorEmail}>{item.email}</Text>
            {item.phone && <Text style={styles.doctorPhone}>{item.phone}</Text>}
            {item.specialties && item.specialties.length > 0 && (
               <View style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>
                     {item.specialties.map((specialty) => specialty.name).join(", ")}
                  </Text>
               </View>
            )}
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
         <View style={styles.container}>
            <View style={styles.header}>
               <Text style={styles.title}>Doctors</Text>
               <Button
                  title="Add Doctor"
                  onPress={() => router.push("/doctors/add")}
                  style={styles.addButton}
               />
            </View>

            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
               </View>
            ) : (
               <FlatList
                  data={doctors}
                  renderItem={renderDoctor}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                     <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                           name="stethoscope"
                           size={48}
                           color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>No doctors found</Text>
                        <Text style={styles.emptySubtext}>
                           Add your first doctor to get started
                        </Text>
                        <Button
                           title="Add Doctor"
                           onPress={() => router.push("/doctors/add")}
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
   doctorCard: {
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
   doctorAvatar: {
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
   doctorInfo: {
      flex: 1,
   },
   doctorName: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 2,
   },
   doctorEmail: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 2,
   },
   doctorPhone: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 4,
   },
   specialtyBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#e0f2fe",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
   },
   specialtyText: {
      fontSize: 12,
      color: "#0369a1",
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
