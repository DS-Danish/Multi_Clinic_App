import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   Alert,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { Guard } from "../../../../components/Guard";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Clinic, ClinicAdminAPI } from "../../../../services/mock/clinicAdmin";

export default function ClinicSettings() {
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [clinic, setClinic] = useState<Clinic | null>(null);
   const [formData, setFormData] = useState({
      name: "",
      address: "",
      phone: "",
   });

   useEffect(() => {
      loadClinic();
   }, []);

   const loadClinic = async () => {
      setLoading(true);
      try {
         const res = await ClinicAdminAPI.getMyClinic();
         setClinic(res.data);
         setFormData({
            name: res.data.name || "",
            address: res.data.address || "",
            phone: res.data.phone || "",
         });
      } catch (error) {
         Alert.alert("Error", "Failed to load clinic information");
      } finally {
         setLoading(false);
      }
   };

   const handleSave = async () => {
      if (!formData.name) {
         Alert.alert("Error", "Clinic name is required");
         return;
      }

      setSaving(true);
      try {
         // In a real app, you would call an API to update the clinic
         // For mock, we just simulate success
         setTimeout(() => {
            Alert.alert("Success", "Clinic settings updated successfully");
            setSaving(false);
         }, 1000);
      } catch (error) {
         Alert.alert("Error", "Failed to update clinic settings");
         setSaving(false);
      }
   };

   return (
      <Guard allowedRoles={["CLINIC_ADMIN"]}>
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
               <Text style={styles.title}>Clinic Settings</Text>
            </View>

            {loading ? (
               <View style={styles.loadingContainer}>
                  <Text>Loading clinic information...</Text>
               </View>
            ) : (
               <View style={styles.form}>
                  <View style={styles.iconHeader}>
                     <View style={styles.iconCircle}>
                        <MaterialCommunityIcons
                           name="hospital-building"
                           size={32}
                           color="#2563eb"
                        />
                     </View>
                     <Text style={styles.clinicId}>ID: {clinic?.id}</Text>
                  </View>

                  <Text style={styles.label}>
                     Clinic Name <Text style={styles.required}>*</Text>
                  </Text>
                  <Input
                     value={formData.name}
                     onChangeText={(text) =>
                        setFormData({ ...formData, name: text })
                     }
                     placeholder="Enter clinic name"
                     style={styles.input}
                  />

                  <Text style={styles.label}>Address</Text>
                  <Input
                     value={formData.address}
                     onChangeText={(text) =>
                        setFormData({ ...formData, address: text })
                     }
                     placeholder="Enter clinic address"
                     style={styles.input}
                  />

                  <Text style={styles.label}>Phone Number</Text>
                  <Input
                     value={formData.phone}
                     onChangeText={(text) =>
                        setFormData({ ...formData, phone: text })
                     }
                     placeholder="+1 (555) 000-0000"
                     keyboardType="phone-pad"
                     style={styles.input}
                  />

                  <View style={styles.infoBox}>
                     <MaterialCommunityIcons
                        name="information-outline"
                        size={20}
                        color="#6b7280"
                     />
                     <Text style={styles.infoText}>
                        Changes to clinic information may take a few minutes to
                        reflect across the system.
                     </Text>
                  </View>

                  <View style={styles.buttonContainer}>
                     <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => router.back()}
                        style={styles.cancelButton}
                        disabled={saving}
                     />
                     <Button
                        title={saving ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        style={styles.submitButton}
                        disabled={saving}
                     />
                  </View>
               </View>
            )}
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
      marginBottom: 24,
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
   loadingContainer: {
      padding: 40,
      alignItems: "center",
   },
   form: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
   },
   iconHeader: {
      alignItems: "center",
      marginBottom: 24,
   },
   iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
   },
   clinicId: {
      fontSize: 12,
      color: "#9ca3af",
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
   infoBox: {
      flexDirection: "row",
      backgroundColor: "#f3f4f6",
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
      marginBottom: 8,
      gap: 8,
   },
   infoText: {
      flex: 1,
      fontSize: 12,
      color: "#6b7280",
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
