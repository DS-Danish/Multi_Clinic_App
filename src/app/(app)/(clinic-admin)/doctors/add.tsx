import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Guard } from "../../../../components/Guard";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { ClinicAdminAPI } from "../../../../services/clinicAdmin";

export default function AddDoctor() {
   const [loading, setLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [clinicId, setClinicId] = useState("");
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      phone: "",
      specialty: "",
   });

   useEffect(() => {
      loadClinic();
   }, []);

   const loadClinic = async () => {
      setLoading(true);
      try {
         const res = await ClinicAdminAPI.getMyClinic();
         setClinicId(res.data.id);
      } catch (error) {
         Alert.alert("Error", "Failed to load clinic information");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = async () => {
      if (!formData.name || !formData.email || !formData.password) {
         Alert.alert("Error", "Please fill in all required fields");
         return;
      }

      if (!clinicId) {
         Alert.alert("Error", "Clinic information not loaded");
         return;
      }

      setSubmitting(true);
      try {
         const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            specialityIds: [],
         };
         await ClinicAdminAPI.addDoctor(clinicId, payload);
         Alert.alert("Success", "Doctor added successfully");
         router.back();
      } catch (error: any) {
         Alert.alert("Error", error.message || "Failed to add doctor");
      } finally {
         setSubmitting(false);
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
               <Text style={styles.title}>Add New Doctor</Text>
            </View>

            <View style={styles.form}>
               <Text style={styles.label}>
                  Full Name <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.name}
                  onChangeText={(text) =>
                     setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter doctor's full name"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Email Address <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.email}
                  onChangeText={(text) =>
                     setFormData({ ...formData, email: text })
                  }
                  placeholder="doctor@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
               />

               <Text style={styles.label}>
                  Password <Text style={styles.required}>*</Text>
               </Text>
               <Input
                  value={formData.password}
                  onChangeText={(text) =>
                     setFormData({ ...formData, password: text })
                  }
                  placeholder="Enter a secure password"
                  secureTextEntry
                  style={styles.input}
               />
               <Text style={styles.hint}>
                  Password should be at least 8 characters long
               </Text>

               <Text style={styles.label}>Phone Number</Text>
               <Input
                  value={formData.phone}
                  onChangeText={(text) =>
                     setFormData({ ...formData, phone: text })
                  }
                  placeholder="+1 (555) 000-0000"
                  style={styles.input}
               />

               <Text style={styles.label}>Specialty</Text>
               <Input
                  value={formData.specialty}
                  onChangeText={(text) =>
                     setFormData({ ...formData, specialty: text })
                  }
                  placeholder="e.g., Cardiology"
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
                     title={submitting ? "Adding..." : "Add Doctor"}
                     onPress={handleSubmit}
                     style={styles.submitButton}
                     disabled={submitting || loading}
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
   hint: {
      fontSize: 12,
      color: "#6b7280",
      marginBottom: 12,
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
