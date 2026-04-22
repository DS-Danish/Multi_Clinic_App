import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
   Alert,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Guard } from "../../../../components/Guard";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { BillingAPI } from "../../../../services/billing";

export default function CreateBillScreen() {
   const router = useRouter();
   const params = useLocalSearchParams<{
      appointmentId?: string;
      patientId?: string;
      patientName?: string;
   }>();

   const [form, setForm] = useState({
      appointmentId: params.appointmentId || "",
      patientId: params.patientId || "",
      totalAmount: "",
      discount: "0",
   });
   const [loading, setLoading] = useState(false);

   const handleCreate = async () => {
      if (!form.appointmentId || !form.patientId || !form.totalAmount) {
         Alert.alert("Error", "Please fill all required fields");
         return;
      }
      const total = parseFloat(form.totalAmount);
      const discount = parseFloat(form.discount) || 0;
      if (isNaN(total) || total <= 0) {
         Alert.alert("Error", "Total amount must be a positive number");
         return;
      }
      setLoading(true);
      try {
         const bill = await BillingAPI.createBill({
            appointmentId: form.appointmentId,
            patientId: form.patientId,
            totalAmount: total,
            discount,
         });
         Alert.alert("Success", `Bill created: ${bill.id}`);
         router.replace(`/(app)/(receptionist)/billing/${bill.id}`);
      } catch (error) {
         Alert.alert("Error", "Failed to create bill");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Guard allowedRoles={["RECEPTIONIST"]}>
         <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <Stack.Screen options={{ title: "Create Bill" }} />
            <ScrollView contentContainerStyle={styles.content}>
               <View style={styles.card}>
                  {/* Back Button */}
                  <View style={styles.backButtonContainer}>
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
                  </View>

                  <Text style={styles.title}>Create New Bill</Text>

                  <Text style={styles.label}>Appointment ID</Text>
                  <Input
                     value={form.appointmentId}
                     onChangeText={(text) =>
                        setForm({ ...form, appointmentId: text })
                     }
                     placeholder="Enter appointment ID"
                     style={styles.input}
                     editable={!params.appointmentId}
                  />

                  <Text style={styles.label}>Patient ID</Text>
                  <Input
                     value={form.patientId}
                     onChangeText={(text) =>
                        setForm({ ...form, patientId: text })
                     }
                     placeholder="Enter patient ID"
                     style={styles.input}
                     editable={!params.patientId}
                  />

                  {params.patientName && (
                     <Text style={styles.patientName}>
                        Patient: {params.patientName}
                     </Text>
                  )}

                  <Text style={styles.label}>Total Amount *</Text>
                  <Input
                     value={form.totalAmount}
                     onChangeText={(text) =>
                        setForm({ ...form, totalAmount: text })
                     }
                     placeholder="0.00"
                     keyboardType="numeric"
                     style={styles.input}
                  />

                  <Text style={styles.label}>Discount (optional)</Text>
                  <Input
                     value={form.discount}
                     onChangeText={(text) =>
                        setForm({ ...form, discount: text })
                     }
                     placeholder="0"
                     keyboardType="numeric"
                     style={styles.input}
                  />

                  <Button
                     title={loading ? "Creating..." : "Create Bill"}
                     onPress={handleCreate}
                     disabled={loading}
                     style={styles.button}
                  />
               </View>
            </ScrollView>
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
      padding: 16,
   },
   card: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   backButtonContainer: {
      marginBottom: 16,
   },
   backButton: {
      padding: 8,
      alignSelf: "flex-start",
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 20,
   },
   label: {
      fontSize: 14,
      fontWeight: "500",
      color: "#374151",
      marginTop: 12,
      marginBottom: 4,
   },
   input: {
      marginBottom: 8,
   },
   patientName: {
      fontSize: 14,
      color: "#4b5563",
      marginVertical: 8,
      fontStyle: "italic",
   },
   button: {
      marginTop: 24,
   },
});
