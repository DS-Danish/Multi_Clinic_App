import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ActivityIndicator,
   Alert,
   StyleSheet,
   Text,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/auth";

export default function VerifyEmailScreen() {
   const { token, email, sent } = useLocalSearchParams<{
      token?: string;
      email?: string;
      sent?: string;
   }>();
   const [status, setStatus] = useState<
      "loading" | "success" | "error" | "pending"
   >("loading");
   const [message, setMessage] = useState("");
   const [isResending, setIsResending] = useState(false);

   const handleResend = async () => {
      if (!email) return;

      setIsResending(true);

      try {
         const response = await authService.resendVerificationEmail(email);
         setStatus("pending");
         setMessage(
            response.message ||
               `We sent a new verification email to ${response.sentTo || email}.`,
         );
      } catch (error: any) {
         Alert.alert(
            "Unable to resend",
            error.message || "Could not resend the verification email.",
         );
      } finally {
         setIsResending(false);
      }
   };

   useEffect(() => {
      if (!token) {
         if (email) {
            setStatus("pending");
            setMessage(
               sent === "0"
                  ? `Your account was created for ${email}, but we could not send the verification email yet. Use resend to try again.`
                  : `We sent a verification email to ${email}. Open that link before signing in.`,
            );
         } else {
            setStatus("error");
            setMessage("No verification token or email provided.");
         }

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
   }, [email, sent, token]);

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

               {status === "pending" && (
                  <View style={styles.centerContent}>
                     <View style={[styles.iconCircle, styles.pendingCircle]}>
                        <MaterialCommunityIcons
                           name="email-outline"
                           size={40}
                           color="#2563eb"
                        />
                     </View>
                     <Text style={styles.title}>Check Your Email</Text>
                     <Text style={styles.message}>{message}</Text>
                     {email ? (
                        <Button
                           title={
                              isResending
                                 ? "Sending..."
                                 : "Resend Verification Email"
                           }
                           onPress={handleResend}
                           style={styles.button}
                           disabled={isResending}
                           loading={isResending}
                        />
                     ) : null}
                     <Button
                        title="Back to Login"
                        onPress={() => router.replace("/login")}
                        style={styles.secondaryButton}
                        textStyle={styles.secondaryButtonText}
                     />
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
                     {email ? (
                        <Button
                           title={
                              isResending
                                 ? "Sending..."
                                 : "Resend Verification Email"
                           }
                           onPress={handleResend}
                           style={styles.button}
                           disabled={isResending}
                           loading={isResending}
                        />
                     ) : null}
                     <Link href="/login" asChild>
                        <Button
                           title="Go to Login Page"
                           onPress={() => {}}
                           style={email ? styles.secondaryButton : styles.button}
                           textStyle={
                              email ? styles.secondaryButtonText : undefined
                           }
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
   pendingCircle: {
      backgroundColor: "#dbeafe",
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
   secondaryButton: {
      width: "100%",
      marginTop: 12,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#d1d5db",
   },
   secondaryButtonText: {
      color: "#374151",
   },
});
