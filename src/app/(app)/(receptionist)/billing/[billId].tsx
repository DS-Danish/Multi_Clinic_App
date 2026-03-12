import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
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
import { Bill, BillingAPI } from "../../../../services/mock/billing";

export default function BillDetailScreen() {
   const router = useRouter();
   const { billId } = useLocalSearchParams<{ billId: string }>();
   const [bill, setBill] = useState<Bill | null>(null);
   const [loading, setLoading] = useState(true);
   const [paymentAmount, setPaymentAmount] = useState("");
   const [paying, setPaying] = useState(false);

   useEffect(() => {
      loadBill();
   }, [billId]);

   const loadBill = async () => {
      setLoading(true);
      try {
         const data = await BillingAPI.getBill(billId);
         setBill(data || null);
      } catch (error) {
         Alert.alert("Error", "Failed to load bill");
      } finally {
         setLoading(false);
      }
   };

   const handlePay = async () => {
      if (!bill) return;
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
         Alert.alert("Error", "Please enter a valid amount");
         return;
      }
      const totalDue = bill.totalAmount - bill.discount;
      const paidSoFar = bill.payments.reduce((sum, p) => sum + p.amount, 0);
      if (amount > totalDue - paidSoFar) {
         Alert.alert("Error", "Payment amount exceeds remaining balance");
         return;
      }
      setPaying(true);
      try {
         await BillingAPI.payBill(billId, { amount, method: "CASH" });
         await loadBill(); // refresh
         setPaymentAmount("");
         Alert.alert("Success", "Payment recorded");
      } catch (error) {
         Alert.alert("Error", "Payment failed");
      } finally {
         setPaying(false);
      }
   };

   if (loading) {
      return (
         <Guard allowedRoles={["RECEPTIONIST"]}>
            <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color="#2563eb" />
            </View>
         </Guard>
      );
   }

   if (!bill) {
      return (
         <Guard allowedRoles={["RECEPTIONIST"]}>
            <View style={styles.container}>
               <Text>Bill not found</Text>
            </View>
         </Guard>
      );
   }

   const totalDue = bill.totalAmount - bill.discount;
   const paid = bill.payments.reduce((sum, p) => sum + p.amount, 0);
   const remaining = totalDue - paid;

   return (
      <Guard allowedRoles={["RECEPTIONIST"]}>
         <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <Stack.Screen options={{ title: `Bill #${bill.id}` }} />
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

                  <Text style={styles.title}>Invoice #{bill.id}</Text>

                  <View style={styles.row}>
                     <Text style={styles.label}>Appointment:</Text>
                     <Text style={styles.value}>{bill.appointmentId}</Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Patient:</Text>
                     <Text style={styles.value}>
                        {bill.patientName || bill.patientId}
                     </Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Total Amount:</Text>
                     <Text style={styles.value}>
                        ${bill.totalAmount.toFixed(2)}
                     </Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Discount:</Text>
                     <Text style={styles.value}>
                        ${bill.discount.toFixed(2)}
                     </Text>
                  </View>
                  <View style={[styles.row, styles.totalRow]}>
                     <Text style={styles.label}>Total Due:</Text>
                     <Text style={styles.totalValue}>
                        ${totalDue.toFixed(2)}
                     </Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Paid:</Text>
                     <Text style={styles.value}>${paid.toFixed(2)}</Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Remaining:</Text>
                     <Text
                        style={[
                           styles.value,
                           remaining > 0 ? styles.negative : styles.positive,
                        ]}
                     >
                        ${remaining.toFixed(2)}
                     </Text>
                  </View>
                  <View style={styles.row}>
                     <Text style={styles.label}>Status:</Text>
                     <Text
                        style={[
                           styles.status,
                           bill.status === "PAID"
                              ? styles.paid
                              : styles.pending,
                        ]}
                     >
                        {bill.status}
                     </Text>
                  </View>

                  <Text style={styles.sectionTitle}>Payments</Text>
                  {bill.payments.length === 0 ? (
                     <Text style={styles.emptyText}>No payments yet</Text>
                  ) : (
                     bill.payments.map((p) => (
                        <View key={p.id} style={styles.paymentRow}>
                           <Text style={styles.paymentDate}>
                              {new Date(p.createdAt).toLocaleDateString()}
                           </Text>
                           <Text style={styles.paymentAmount}>
                              ${p.amount.toFixed(2)}
                           </Text>
                           <Text style={styles.paymentMethod}>{p.method}</Text>
                        </View>
                     ))
                  )}

                  {remaining > 0 && (
                     <View style={styles.paymentSection}>
                        <Text style={styles.sectionTitle}>Make Payment</Text>
                        <Input
                           value={paymentAmount}
                           onChangeText={setPaymentAmount}
                           placeholder="Amount"
                           keyboardType="numeric"
                           style={styles.paymentInput}
                        />
                        <Button
                           title={paying ? "Processing..." : "Pay Now"}
                           onPress={handlePay}
                           disabled={paying}
                           style={styles.payButton}
                        />
                     </View>
                  )}
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
   loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
   row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
   },
   label: {
      fontSize: 14,
      color: "#6b7280",
   },
   value: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   totalRow: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
   },
   totalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937",
   },
   negative: {
      color: "#ef4444",
   },
   positive: {
      color: "#10b981",
   },
   status: {
      fontSize: 14,
      fontWeight: "600",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
   },
   paid: {
      backgroundColor: "#d1fae5",
      color: "#065f46",
   },
   pending: {
      backgroundColor: "#fef3c7",
      color: "#92400e",
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1f2937",
      marginTop: 20,
      marginBottom: 12,
   },
   emptyText: {
      fontSize: 14,
      color: "#9ca3af",
      fontStyle: "italic",
   },
   paymentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f3f4f6",
   },
   paymentDate: {
      fontSize: 12,
      color: "#6b7280",
   },
   paymentAmount: {
      fontSize: 14,
      fontWeight: "500",
      color: "#1f2937",
   },
   paymentMethod: {
      fontSize: 12,
      color: "#6b7280",
   },
   paymentSection: {
      marginTop: 20,
   },
   paymentInput: {
      marginBottom: 12,
   },
   payButton: {
      marginTop: 8,
   },
});
