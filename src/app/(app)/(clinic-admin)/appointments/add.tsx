import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CustomPicker } from "../../../../components/CustomPicker";
import { Guard } from "../../../../components/Guard";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import {
   ClinicAdminAPI,
   Doctor,
   Patient,
} from "../../../../services/clinicAdmin";

// Helper to format date for datetime-local input
const formatDateTimeLocal = (date: Date) => {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0");
   const day = String(date.getDate()).padStart(2, "0");
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");
   return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AddAppointment() {
   const [loading, setLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [clinicId, setClinicId] = useState("");
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const [patients, setPatients] = useState<Patient[]>([]);
   const [formData, setFormData] = useState({
      doctorId: "",
      patientId: "",
      appointmentDate: formatDateTimeLocal(new Date()),
   });

   useEffect(() => {
      loadInitialData();
   }, []);

   const loadInitialData = async () => {
      setLoading(true);
      try {
         const clinicRes = await ClinicAdminAPI.getMyClinic();
         const currentClinicId = clinicRes.data.id;
         setClinicId(currentClinicId);

         const [doctorsRes, patientsRes] = await Promise.all([
            ClinicAdminAPI.getDoctorsForClinic(currentClinicId),
            ClinicAdminAPI.getPatientsForClinic(currentClinicId),
         ]);

         setDoctors(doctorsRes.data);
         setPatients(patientsRes.data);
      } catch (error) {
         Alert.alert("Error", "Failed to load data");
      } finally {
         setLoading(false);
      }
   };

   const handleSubmit = async () => {
      if (
         !formData.doctorId ||
         !formData.patientId ||
         !formData.appointmentDate
      ) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }

      if (!clinicId) {
         Alert.alert("Error", "Clinic information not loaded");
         return;
      }

      setSubmitting(true);
      try {
         await ClinicAdminAPI.addAppointment(clinicId, formData);
         Alert.alert("Success", "Appointment created successfully");
         router.back();
      } catch (error: any) {
         Alert.alert(
            "Unavailable",
            error.message || "Failed to create appointment",
         );
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
               <Text style={styles.title}>New Appointment</Text>
            </View>

            <View style={styles.form}>
               <Text style={styles.label}>Doctor</Text>
               <CustomPicker
                  selectedValue={formData.doctorId}
                  onValueChange={(value) =>
                     setFormData({ ...formData, doctorId: value })
                  }
                  items={doctors.map((d) => ({ label: d.name, value: d.id }))}
                  placeholder="Select doctor"
               />

               <Text style={styles.label}>Patient</Text>
               <CustomPicker
                  selectedValue={formData.patientId}
                  onValueChange={(value) =>
                     setFormData({ ...formData, patientId: value })
                  }
                  items={patients.map((p) => ({ label: p.name, value: p.id }))}
                  placeholder="Select patient"
               />

               <Text style={styles.label}>Date & Time</Text>
               <Input
                  value={formData.appointmentDate}
                  onChangeText={(text) =>
                     setFormData({ ...formData, appointmentDate: text })
                  }
                  placeholder="YYYY-MM-DDTHH:MM"
                  style={styles.input}
               />
               <Text style={styles.hint}>
                  Format: YYYY-MM-DDTHH:MM (e.g., 2025-04-15T14:30)
               </Text>

               <View style={styles.buttonContainer}>
                  <Button
                     title="Cancel"
                     variant="outline"
                     onPress={() => router.back()}
                     style={styles.cancelButton}
                     disabled={submitting}
                  />
                  <Button
                     title={submitting ? "Creating..." : "Create Appointment"}
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
   input: {
      marginBottom: 4,
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
