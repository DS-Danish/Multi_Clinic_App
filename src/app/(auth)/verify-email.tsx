import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/auth";

export default function VerifyEmailScreen() {
   const { token } = useLocalSearchParams<{ token?: string }>();
   const [status, setStatus] = useState<"loading" | "success" | "error">(
      "loading",
   );
   const [message, setMessage] = useState("");

   useEffect(() => {
      if (!token) {
         setStatus("error");
         setMessage("No verification token provided.");
         return;
      }

      let isMounted = true;

      const verify = async () => {
         try {
            const response = await authService.verifyEmail(token);
            if (!isMounted) return;

            setStatus("success");
            setMessage(
               response.message ||
                  "Email verified successfully! You can now log in.",
            );

            setTimeout(() => {
               router.replace("/login");
            }, 3000);
         } catch (error: any) {
            if (!isMounted) return;

            setStatus("error");
            setMessage(
               error.message ||
                  "Verification failed. Please request a new verification email.",
            );
         }
      };

      verify();

      return () => {
         isMounted = false;
      };
   }, [token]);

   return (
      <SafeAreaView style={styles.safeArea}>
         <View style={styles.container}>
            <View style={styles.card}>
               {status === "loading" && (
                  <View style={styles.centerContent}>
                     <ActivityIndicator size="large" color="#2563eb" />
                     <Text style={styles.title}>Verifying Email</Text>
                     <Text style={styles.message}>
                        Please wait while we verify your email address...
                     </Text>
                  </View>
               )}

               {status === "success" && (
                  <View style={styles.centerContent}>
                     <View style={[styles.iconCircle, styles.successCircle]}>
                        <MaterialCommunityIcons
                           name="check"
                           size={40}
                           color="#10b981"
                        />
                     </View>
                     <Text style={styles.title}>Email Verified!</Text>
                     <Text style={styles.message}>{message}</Text>
                     <Text style={styles.redirectNote}>
                        Redirecting to login page...
                     </Text>
                  </View>
               )}

               {status === "error" && (
                  <View style={styles.centerContent}>
                     <View style={[styles.iconCircle, styles.errorCircle]}>
                        <MaterialCommunityIcons
                           name="close"
                           size={40}
                           color="#ef4444"
                        />
                     </View>
                     <Text style={styles.title}>Verification Failed</Text>
                     <Text style={styles.message}>{message}</Text>
                     <Link href="/login" asChild>
                        <Button
                           title="Go to Login Page"
                           onPress={() => {}}
                           style={styles.button}
                        />
                     </Link>
                  </View>
               )}
            </View>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
   },
   card: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 32,
      width: "100%",
      maxWidth: 400,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
   },
   centerContent: {
      alignItems: "center",
      gap: 16,
   },
   iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
   },
   successCircle: {
      backgroundColor: "#d1fae5",
   },
   errorCircle: {
      backgroundColor: "#fee2e2",
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
      textAlign: "center",
   },
   message: {
      fontSize: 16,
      color: "#6b7280",
      textAlign: "center",
      marginBottom: 8,
   },
   redirectNote: {
      fontSize: 14,
      color: "#9ca3af",
   },
   button: {
      width: "100%",
      marginTop: 16,
   },
});
