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
   ClinicAdminAPI,
   Receptionist,
} from "../../../../services/clinicAdmin";

export default function ReceptionistsList() {
   const [loading, setLoading] = useState(true);
   const [receptionists, setReceptionists] = useState<Receptionist[]>([]);

   useEffect(() => {
      loadReceptionists();
   }, []);

   const loadReceptionists = async () => {
      try {
         setLoading(true);
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const clinicId = clinicRes.data.id;
         const response = await ClinicAdminAPI.getClinicReceptionists(clinicId);
         setReceptionists(response.data);
      } catch (error) {
         console.error("Failed to load receptionists:", error);
      } finally {
         setLoading(false);
      }
   };

   const renderReceptionist = ({ item }: { item: Receptionist }) => (
      <View style={styles.receptionistCard}>
         <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
         </View>
         <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
         <View style={styles.container}>
            <View style={styles.header}>
               <Text style={styles.title}>Receptionists</Text>
               <Button
                  title="Add Receptionist"
                  onPress={() => router.push("/receptionists/add")}
                  style={styles.addButton}
               />
            </View>

            {loading ? (
               <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2563eb" />
               </View>
            ) : (
               <FlatList
                  data={receptionists}
                  renderItem={renderReceptionist}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                     <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons
                           name="account-tie"
                           size={48}
                           color="#9ca3af"
                        />
                        <Text style={styles.emptyText}>
                           No receptionists found
                        </Text>
                        <Text style={styles.emptySubtext}>
                           Add your first receptionist to get started
                        </Text>
                        <Button
                           title="Add Receptionist"
                           onPress={() => router.push("/receptionists/add")}
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
   receptionistCard: {
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
   avatar: {
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
   info: {
      flex: 1,
   },
   name: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 2,
   },
   email: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 2,
   },
   phone: {
      fontSize: 14,
      color: "#6b7280",
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
