import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
   Alert,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { Guard } from "../../../components/Guard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { SuperAdminAPI } from "../../../services/superAdmin";

export default function CreateClinic() {
   const [submitting, setSubmitting] = useState(false);
   const [formData, setFormData] = useState({
      clinicName: "",
      clinicCode: "",
      clinicEmail: "",
      clinicPhone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
   });

   const handleSubmit = async () => {
      // Validate required fields
      if (
         !formData.clinicName ||
         !formData.clinicCode ||
         !formData.clinicEmail ||
         !formData.adminName ||
         !formData.adminEmail ||
         !formData.adminPassword
      ) {
         Alert.alert("Error", "Please fill in all required fields");
         return;
      }

      setSubmitting(true);
      try {
         await SuperAdminAPI.createClinicWithAdmin(formData);
         Alert.alert("Success", "Clinic and admin created successfully");
         router.back();
      } catch (error: any) {
         Alert.alert("Error", error.message || "Failed to create clinic");
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <Guard allowedRoles={["SYSTEM_ADMIN"]}>
         <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
         >
            <View style={styles.header}>
               <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
               >
                  <MaterialCommunityIcons
                     name="arrow-left"
                     size={24}
                     color="#4b5563"
                  />
               </TouchableOpacity>
               <Text style={styles.title}>Create New Clinic</Text>
            </View>

            <View style={styles.formCard}>
               <Text style={styles.sectionTitle}>Clinic Information</Text>

               <Text style={styles.label}>
                  Clinic Name <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.clinicName}
                  onChangeText={(text) =>
                     setFormData({ ...formData, clinicName: text })
                  }
                  placeholder="Enter clinic name"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Clinic Code <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.clinicCode}
                  onChangeText={(text) =>
                     setFormData({ ...formData, clinicCode: text })
                  }
                  placeholder="e.g., CLN001"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Clinic Email <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.clinicEmail}
                  onChangeText={(text) =>
                     setFormData({ ...formData, clinicEmail: text })
                  }
                  placeholder="clinic@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
               />

               <Text style={styles.label}>Clinic Phone</Text>
               <Input
                  value={formData.clinicPhone}
                  onChangeText={(text) =>
                     setFormData({ ...formData, clinicPhone: text })
                  }
                  placeholder="+1 (555) 000-0000"
                  style={styles.input}
               />

               <View style={styles.divider} />
               <Text style={styles.sectionTitle}>Admin Account Details</Text>

               <Text style={styles.label}>
                  Admin Name <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.adminName}
                  onChangeText={(text) =>
                     setFormData({ ...formData, adminName: text })
                  }
                  placeholder="Enter admin name"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Admin Email <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.adminEmail}
                  onChangeText={(text) =>
                     setFormData({ ...formData, adminEmail: text })
                  }
                  placeholder="admin@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Admin Password <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.adminPassword}
                  onChangeText={(text) =>
                     setFormData({ ...formData, adminPassword: text })
                  }
                  placeholder="Enter secure password"
                  secureTextEntry
                  style={styles.input}
               />

               <View style={styles.buttonContainer}>
                  <Button
                     title="Cancel"
                     variant="outline"
                     onPress={() => router.back()}
                     style={styles.cancelButton}
                     disabled={submitting}
                  />
                  <Button
                     title={
                        submitting ? "Creating..." : "Create Clinic & Admin"
                     }
                     onPress={handleSubmit}
                     style={styles.submitButton}
                     disabled={submitting}
                  />
               </View>
            </View>
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
      alignItems: "center",
      marginBottom: 20,
   },
   backButton: {
      padding: 8,
      marginRight: 8,
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
   },
   formCard: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: 16,
   },
   divider: {
      height: 1,
      backgroundColor: "#e5e7eb",
      marginVertical: 20,
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginBottom: 4,
      marginTop: 12,
   },
   required: {
      color: "#ef4444",
   },
   input: {
      marginBottom: 8,
   },
   buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
   },
   cancelButton: {
      flex: 1,
   },
   submitButton: {
      flex: 1,
   },
});
