import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Guard } from "../../../components/Guard";
import { useAuth } from "../../../context/AuthContext";

// Types
type Patient = {
   id: string;
   name: string;
   email: string;
   phone?: string | null;
   createdAt: string;
};

// Mock data
const MOCK_PATIENTS: Patient[] = [
   {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      createdAt: "2024-01-15T10:00:00Z",
   },
   {
      id: "2",
      name: "Emily Johnson",
      email: "emily.j@email.com",
      phone: "(555) 987-6543",
      createdAt: "2024-02-20T14:30:00Z",
   },
   {
      id: "3",
      name: "Michael Brown",
      email: "mbrown@email.com",
      phone: null,
      createdAt: "2024-03-10T09:15:00Z",
   },
];

export default function DoctorPatients() {
   const { user } = useAuth();
   const [searchQuery, setSearchQuery] = useState("");
   const [patients] = useState<Patient[]>(MOCK_PATIENTS);

   const filteredPatients = useMemo(() => {
      if (!searchQuery.trim()) return patients;
      const q = searchQuery.toLowerCase();
      return patients.filter(
         (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            (p.phone && p.phone.toLowerCase().includes(q)),
      );
   }, [patients, searchQuery]);

   const formatDate = (iso: string) => {
      return new Date(iso).toLocaleDateString();
   };

   const renderPatient = ({ item }: { item: Patient }) => (
      <View style={styles.patientCard}>
         <View style={styles.cardHeader}>
            <View style={styles.avatar}>
               <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.cardInfo}>
               <Text style={styles.name}>{item.name}</Text>
               <Text style={styles.email}>{item.email}</Text>
            </View>
         </View>
         <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
               <MaterialCommunityIcons name="phone" size={14} color="#6b7280" />
               <Text style={styles.detailText}>{item.phone || "No phone"}</Text>
            </View>
            <View style={styles.detailRow}>
               <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color="#6b7280"
               />
               <Text style={styles.detailText}>
                  Registered: {formatDate(item.createdAt)}
               </Text>
            </View>
         </View>
      </View>
   );

   return (
      <Guard allowedRoles={["DOCTOR"]}>
         <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.content}>
               <Text style={styles.title}>All Patients</Text>
               <Text style={styles.subtitle}>
                  List of all registered patients in the system.
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
                     placeholder="Search patients..."
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                     placeholderTextColor="#9ca3af"
                  />
               </View>

               <FlatList
                  data={filteredPatients}
                  renderItem={renderPatient}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={
                     <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No patients found.</Text>
                     </View>
                  }
                  contentContainerStyle={styles.listContent}
               />
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
   listContent: {
      paddingBottom: 20,
   },
   patientCard: {
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
   cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
   },
   avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   avatarText: {
      color: "#2563eb",
      fontSize: 18,
      fontWeight: "600",
   },
   cardInfo: {
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
   },
   cardDetails: {
      borderTopWidth: 1,
      borderTopColor: "#f3f4f6",
      paddingTop: 12,
      gap: 8,
   },
   detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
   },
   detailText: {
      fontSize: 14,
      color: "#4b5563",
   },
   emptyContainer: {
      padding: 32,
      alignItems: "center",
   },
   emptyText: {
      fontSize: 14,
      color: "#9ca3af",
   },
});
