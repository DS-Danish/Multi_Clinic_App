import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   Alert,
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   useWindowDimensions,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { useAuth } from "../../context/AuthContext";

type Role =
   | "DOCTOR"
   | "PATIENT"
   | "RECEPTIONIST"
   | "CLINIC_ADMIN"
   | "SYSTEM_ADMIN";

export default function LoginScreen() {
   const { width } = useWindowDimensions();
   const isLargeScreen = width >= 1024;

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [activeRole, setActiveRole] = useState<Role>("DOCTOR");

   const { user, login, loading: authLoading } = useAuth(); // ✅ include user

   // If already logged in, redirect to appropriate dashboard
   useEffect(() => {
      if (user) {
         switch (user.role) {
            case "DOCTOR":
               router.replace("/(app)/(doctor)/dashboard");
               break;
            case "RECEPTIONIST":
               router.replace("/(app)/(receptionist)");
               break;
            case "PATIENT":
               router.replace("/(app)/(patient)/details");
               break;
            case "SYSTEM_ADMIN":
               router.replace("/(app)/(super-admin)");
               break;
            case "CLINIC_ADMIN":
               router.replace("/(app)/(clinic-admin)");
               break;
         }
      }
   }, [user]);

   const handleLogin = async () => {
      if (!email || !password) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }
      try {
         await login(email, password, activeRole);
         // Navigation handled by useEffect
      } catch (error: any) {
         Alert.alert("Error", error.message);
      }
   };

   const roles: {
      id: Role;
      label: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: readonly [string, string];
   }[] = [
      {
         id: "DOCTOR",
         label: "Doctor",
         icon: "stethoscope",
         color: ["#3b82f6", "#06b6d4"] as const,
      },
      {
         id: "PATIENT",
         label: "Patient",
         icon: "account-group",
         color: ["#10b981", "#059669"] as const,
      },
      {
         id: "RECEPTIONIST",
         label: "Receptionist",
         icon: "account-check",
         color: ["#a855f7", "#ec4899"] as const,
      },
      {
         id: "CLINIC_ADMIN",
         label: "Clinic Admin",
         icon: "office-building",
         color: ["#f97316", "#eab308"] as const,
      },
      {
         id: "SYSTEM_ADMIN",
         label: "Super Admin",
         icon: "shield-check",
         color: ["#ef4444", "#f43f5e"] as const,
      },
   ];

   return (
      <SafeAreaView style={styles.safeArea}>
         <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
               {/* Left Panel - only visible on large screens */}
               {isLargeScreen && (
                  <View
                     style={[styles.leftPanel, { backgroundColor: "#2563eb" }]}
                  >
                     <View style={styles.overlay} />
                     <View style={styles.leftContent}>
                        <View style={styles.logoContainer}>
                           <View style={styles.logoIcon}>
                              <MaterialCommunityIcons
                                 name="stethoscope"
                                 size={28}
                                 color="#ffffff"
                              />
                           </View>
                           <Text style={styles.logoText}>ClinicConnect AI</Text>
                        </View>
                        <Text style={styles.leftTitle}>
                           Streamlined healthcare management system for doctors,
                           patients, and staff.
                        </Text>
                        <View style={styles.statsGrid}>
                           <View style={styles.statCard}>
                              <Text style={styles.statNumber}>24/7</Text>
                              <Text style={styles.statLabel}>Access</Text>
                           </View>
                           <View style={styles.statCard}>
                              <Text style={styles.statNumber}>100%</Text>
                              <Text style={styles.statLabel}>Secure</Text>
                           </View>
                           <View style={styles.statCard}>
                              <Text style={styles.statNumber}>Fast</Text>
                              <Text style={styles.statLabel}>Response</Text>
                           </View>
                        </View>
                        <Text style={styles.copyright}>
                           © 2025 ClinicConnect AI. All rights reserved.
                        </Text>
                     </View>
                  </View>
               )}

               {/* Right Panel - Form */}
               <View
                  style={[
                     styles.rightPanel,
                     isLargeScreen && styles.rightPanelLarge,
                  ]}
               >
                  {!isLargeScreen && (
                     <View style={styles.mobileHeader}>
                        <View style={styles.mobileLogoIcon}>
                           <MaterialCommunityIcons
                              name="stethoscope"
                              size={24}
                              color="#ffffff"
                           />
                        </View>
                        <Text style={styles.mobileLogoText}>
                           ClinicConnect AI
                        </Text>
                     </View>
                  )}

                  <View style={styles.formContainer}>
                     <Text style={styles.welcomeTitle}>Welcome Back</Text>
                     <Text style={styles.welcomeSubtitle}>
                        Sign in to access your account
                     </Text>

                     {/* Role Selector */}
                     <View style={styles.roleGrid}>
                        {roles.map((role) => {
                           const isActive = activeRole === role.id;
                           return (
                              <TouchableOpacity
                                 key={role.id}
                                 style={[
                                    styles.roleButton,
                                    isActive && {
                                       backgroundColor: "transparent",
                                    },
                                 ]}
                                 onPress={() => setActiveRole(role.id)}
                              >
                                 {isActive ? (
                                    <View
                                       style={[
                                          styles.roleGradient,
                                          { backgroundColor: role.color[0] },
                                       ]}
                                    >
                                       <MaterialCommunityIcons
                                          name={role.icon}
                                          size={20}
                                          color="#ffffff"
                                       />
                                       <Text style={styles.roleLabelActive}>
                                          {role.label}
                                       </Text>
                                    </View>
                                 ) : (
                                    <View style={styles.roleInactive}>
                                       <MaterialCommunityIcons
                                          name={role.icon}
                                          size={20}
                                          color="#6b7280"
                                       />
                                       <Text style={styles.roleLabelInactive}>
                                          {role.label}
                                       </Text>
                                    </View>
                                 )}
                              </TouchableOpacity>
                           );
                        })}
                     </View>

                     {/* Email */}
                     <Label>Email Address</Label>
                     <Input
                        value={email}
                        onChangeText={setEmail}
                        placeholder="email@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.inputField}
                     />

                     {/* Password */}
                     <Label style={styles.passwordLabel}>Password</Label>
                     <Input
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        style={styles.inputField}
                     />

                     {/* Login Button */}
                     <Button
                        onPress={handleLogin}
                        title={authLoading ? "Signing In..." : "Sign In"}
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        disabled={authLoading}
                        loading={authLoading}
                     />

                     {/* Divider */}
                     <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>
                           New to the portal?
                        </Text>
                        <View style={styles.dividerLine} />
                     </View>

                     {/* Sign Up Link */}
                     <Link href="/signup" asChild>
                        <TouchableOpacity>
                           <Text style={styles.signupText}>
                              Don’t have an account?{" "}
                              <Text style={styles.signupLink}>Sign up</Text>
                           </Text>
                        </TouchableOpacity>
                     </Link>

                     {/* Help Link */}
                     <Text style={styles.helpText}>
                        Need help? Contact{" "}
                        <Text style={styles.helpLink}>
                           support@clinicconnect.ai
                        </Text>
                     </Text>
                  </View>
               </View>
            </View>
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safeArea: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   scrollContainer: {
      flexGrow: 1,
   },
   container: {
      flex: 1,
      flexDirection: "row",
      minHeight: "100%",
   },
   leftPanel: {
      flex: 1,
      padding: 48,
      justifyContent: "space-between",
      position: "relative",
   },
   overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.1)",
   },
   leftContent: {
      flex: 1,
      justifyContent: "space-between",
      zIndex: 10,
   },
   logoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 32,
   },
   logoIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
   },
   logoText: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
   },
   leftTitle: {
      fontSize: 18,
      color: "#dbeafe",
      maxWidth: 400,
      marginBottom: 24,
   },
   statsGrid: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 32,
   },
   statCard: {
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
   },
   statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
   },
   statLabel: {
      fontSize: 14,
      color: "#bfdbfe",
   },
   copyright: {
      fontSize: 12,
      color: "#bfdbfe",
   },
   rightPanel: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: "#f9fafb",
   },
   rightPanelLarge: {
      padding: 48,
   },
   mobileHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginBottom: 24,
   },
   mobileLogoIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "#2563eb",
      alignItems: "center",
      justifyContent: "center",
   },
   mobileLogoText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#1f2937",
   },
   formContainer: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
   },
   welcomeTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   welcomeSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 24,
   },
   roleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 24,
   },
   roleButton: {
      flex: 1,
      minWidth: 70,
      height: 70,
      borderRadius: 8,
      overflow: "hidden",
   },
   roleGradient: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
   },
   roleInactive: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f3f4f6",
      padding: 8,
   },
   roleLabelActive: {
      fontSize: 10,
      fontWeight: "500",
      color: "#ffffff",
      marginTop: 4,
   },
   roleLabelInactive: {
      fontSize: 10,
      fontWeight: "500",
      color: "#6b7280",
      marginTop: 4,
   },
   inputField: {
      marginBottom: 16,
   },
   passwordLabel: {
      marginTop: 8,
   },
   loginButton: {
      width: "100%",
      marginTop: 8,
   },
   loginButtonText: {
      fontSize: 16,
      fontWeight: "600",
   },
   dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
   },
   dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#e5e7eb",
   },
   dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: "#6b7280",
   },
   signupText: {
      textAlign: "center",
      fontSize: 14,
      color: "#4b5563",
      marginBottom: 16,
   },
   signupLink: {
      color: "#2563eb",
      fontWeight: "600",
   },
   helpText: {
      textAlign: "center",
      fontSize: 12,
      color: "#6b7280",
   },
   helpLink: {
      color: "#2563eb",
      fontWeight: "500",
   },
});
