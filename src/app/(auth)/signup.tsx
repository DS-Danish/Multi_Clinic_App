import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
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

type Role = "DOCTOR" | "PATIENT" | "RECEPTIONIST";

export default function SignupScreen() {
   const { width } = useWindowDimensions();
   const isLargeScreen = width >= 1024;

   const [form, setForm] = useState({
      name: "",
      email: "",
      password: "",
      role: "PATIENT" as Role,
   });

   const { register, loading: authLoading } = useAuth();

   const handleSignup = async () => {
      if (!form.name || !form.email || !form.password) {
         Alert.alert("Error", "Please fill in all fields");
         return;
      }
      try {
         await register({
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
         });
         Alert.alert(
            "Registration successful",
            "Check your email for the verification link, then sign in.",
            [
               {
                  text: "Go to login",
                  onPress: () => router.replace("/login"),
               },
            ],
         );
      } catch (error: any) {
         Alert.alert("Error", error.message);
      }
   };

   const roles: {
      id: Role;
      label: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: readonly [string, string];
      description: string;
   }[] = [
      {
         id: "PATIENT",
         label: "Patient",
         icon: "account-group",
         color: ["#10b981", "#059669"] as const,
         description: "Book appointments and manage health records",
      },
      {
         id: "DOCTOR",
         label: "Doctor",
         icon: "stethoscope",
         color: ["#3b82f6", "#06b6d4"] as const,
         description: "Manage patients and appointments",
      },
      {
         id: "RECEPTIONIST",
         label: "Receptionist",
         icon: "account-check",
         color: ["#a855f7", "#ec4899"] as const,
         description: "Handle scheduling and administration",
      },
   ];

   return (
      <SafeAreaView style={styles.safeArea}>
         <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
               {/* Left Panel */}
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
                        <View>
                           <Text style={styles.leftTitle}>
                              Join Our Healthcare Community
                           </Text>
                           <Text style={styles.leftDescription}>
                              Create your account and experience seamless
                              healthcare management with our modern platform.
                           </Text>
                           <View style={styles.benefitsList}>
                              {[
                                 "Secure and encrypted data protection",
                                 "Real-time appointment scheduling",
                                 "Easy access to medical records",
                                 "24/7 platform availability",
                              ].map((benefit, idx) => (
                                 <View key={idx} style={styles.benefitItem}>
                                    <View style={styles.benefitIcon}>
                                       <MaterialCommunityIcons
                                          name="check-circle"
                                          size={16}
                                          color="#ffffff"
                                       />
                                    </View>
                                    <Text style={styles.benefitText}>
                                       {benefit}
                                    </Text>
                                 </View>
                              ))}
                           </View>
                        </View>
                        <Text style={styles.copyright}>
                           © 2025 ClinicConnect AI. All rights reserved.
                        </Text>
                     </View>
                  </View>
               )}

               {/* Right Panel */}
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
                     <Text style={styles.formTitle}>Create Account</Text>
                     <Text style={styles.formSubtitle}>
                        Sign up to get started
                     </Text>

                     {/* Name */}
                     <Label>Full Name</Label>
                     <Input
                        value={form.name}
                        onChangeText={(text) =>
                           setForm({ ...form, name: text })
                        }
                        placeholder="John Doe"
                        style={styles.inputField}
                     />

                     {/* Email */}
                     <Label>Email Address</Label>
                     <Input
                        value={form.email}
                        onChangeText={(text) =>
                           setForm({ ...form, email: text })
                        }
                        placeholder="you@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.inputField}
                     />

                     {/* Password */}
                     <Label>Password</Label>
                     <Input
                        value={form.password}
                        onChangeText={(text) =>
                           setForm({ ...form, password: text })
                        }
                        placeholder="Create a strong password"
                        secureTextEntry
                        style={styles.inputField}
                     />

                     {/* Role Selection */}
                     <Label style={styles.roleLabel}>I am a...</Label>
                     <View style={styles.roleList}>
                        {roles.map((role) => {
                           const isSelected = form.role === role.id;
                           return (
                              <TouchableOpacity
                                 key={role.id}
                                 style={[
                                    styles.roleCard,
                                    isSelected && styles.roleCardSelected,
                                 ]}
                                 onPress={() =>
                                    setForm({ ...form, role: role.id })
                                 }
                              >
                                 {isSelected ? (
                                    <View
                                       style={[
                                          styles.roleGradient,
                                          { backgroundColor: role.color[0] },
                                       ]}
                                    >
                                       <View style={styles.roleIconContainer}>
                                          <MaterialCommunityIcons
                                             name={role.icon}
                                             size={24}
                                             color="#ffffff"
                                          />
                                       </View>
                                       <View style={styles.roleTextContainer}>
                                          <Text style={styles.roleTitle}>
                                             {role.label}
                                          </Text>
                                          <Text style={styles.roleDescription}>
                                             {role.description}
                                          </Text>
                                       </View>
                                       <MaterialCommunityIcons
                                          name="check-circle"
                                          size={24}
                                          color="#ffffff"
                                       />
                                    </View>
                                 ) : (
                                    <View style={styles.roleInactive}>
                                       <View style={styles.roleIconInactive}>
                                          <MaterialCommunityIcons
                                             name={role.icon}
                                             size={24}
                                             color="#6b7280"
                                          />
                                       </View>
                                       <View style={styles.roleTextContainer}>
                                          <Text
                                             style={styles.roleTitleInactive}
                                          >
                                             {role.label}
                                          </Text>
                                          <Text
                                             style={
                                                styles.roleDescriptionInactive
                                             }
                                          >
                                             {role.description}
                                          </Text>
                                       </View>
                                    </View>
                                 )}
                              </TouchableOpacity>
                           );
                        })}
                     </View>

                     {/* Signup Button */}
                     <Button
                        disabled={authLoading}
                        onPress={handleSignup}
                        title={
                           authLoading ? "Creating Account..." : "Create Account"
                        }
                        style={styles.signupButton}
                        textStyle={styles.signupButtonText}
                        loading={authLoading}
                     />

                     {/* Divider */}
                     <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>
                           Already registered?
                        </Text>
                        <View style={styles.dividerLine} />
                     </View>

                     {/* Sign In Link */}
                     <Link href="/login" asChild>
                        <TouchableOpacity>
                           <Text style={styles.signinText}>
                              Have an account?{" "}
                              <Text style={styles.signinLink}>Sign In</Text>
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
      fontSize: 32,
      fontWeight: "bold",
      color: "#ffffff",
      marginBottom: 16,
   },
   leftDescription: {
      fontSize: 16,
      color: "#dbeafe",
      marginBottom: 24,
      maxWidth: 400,
   },
   benefitsList: {
      gap: 12,
   },
   benefitItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
   },
   benefitIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
   },
   benefitText: {
      fontSize: 14,
      color: "#ffffff",
   },
   copyright: {
      fontSize: 12,
      color: "#bfdbfe",
      marginTop: 24,
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
   formTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   formSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 24,
   },
   inputField: {
      marginBottom: 16,
   },
   roleLabel: {
      marginTop: 8,
      marginBottom: 8,
   },
   roleList: {
      gap: 12,
      marginBottom: 24,
   },
   roleCard: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#e5e7eb",
      backgroundColor: "#ffffff",
      overflow: "hidden",
   },
   roleCardSelected: {
      borderColor: "transparent",
   },
   roleGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
   },
   roleInactive: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
   },
   roleIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
   },
   roleIconInactive: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: "#f3f4f6",
      alignItems: "center",
      justifyContent: "center",
   },
   roleTextContainer: {
      flex: 1,
   },
   roleTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
   },
   roleDescription: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
   },
   roleTitleInactive: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1f2937",
   },
   roleDescriptionInactive: {
      fontSize: 12,
      color: "#6b7280",
   },
   signupButton: {
      width: "100%",
      marginTop: 8,
   },
   signupButtonText: {
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
   signinText: {
      textAlign: "center",
      fontSize: 14,
      color: "#4b5563",
      marginBottom: 16,
   },
   signinLink: {
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
