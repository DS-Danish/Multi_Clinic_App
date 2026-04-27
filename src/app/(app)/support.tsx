import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
   Alert,
   KeyboardAvoidingView,
   Linking,
   Platform,
   SafeAreaView,
   ScrollView,
   StyleSheet,
   Text,
   TextInput,
   TouchableOpacity,
   View,
} from "react-native";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

const SUPPORT_EMAIL = "dsohail402@gmail.com";

const roleLabel: Record<string, string> = {
   SYSTEM_ADMIN: "System Admin",
   CLINIC_ADMIN: "Clinic Admin",
   DOCTOR: "Doctor",
   PATIENT: "Patient",
   RECEPTIONIST: "Receptionist",
};

export default function SupportScreen() {
   const { user } = useAuth();
   const [subject, setSubject] = useState("Support Request");
   const [message, setMessage] = useState("");
   const [submitting, setSubmitting] = useState(false);

   const userRole = useMemo(() => {
      if (!user?.role) return "Unknown";
      return roleLabel[user.role] || user.role;
   }, [user?.role]);

   const handleSubmit = async () => {
      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();

      if (!trimmedSubject) {
         Alert.alert("Missing subject", "Please enter a subject.");
         return;
      }

      if (!trimmedMessage) {
         Alert.alert("Missing message", "Please describe your issue.");
         return;
      }

      const body = [
         `Name: ${user?.name || "Unknown"}`,
         `Email: ${user?.email || "Unknown"}`,
         `Role: ${userRole}`,
         "",
         "Issue details:",
         trimmedMessage,
      ].join("\n");

      const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(trimmedSubject)}&body=${encodeURIComponent(body)}`;

      setSubmitting(true);

      try {
         const supported = await Linking.canOpenURL(mailtoUrl);

         if (!supported) {
            Alert.alert(
               "Mail app unavailable",
               `No mail app was found. Please contact ${SUPPORT_EMAIL}.`,
            );
            return;
         }

         await Linking.openURL(mailtoUrl);
         setMessage("");
         Alert.alert("Support request ready", "Your support message is ready to send.");
      } catch {
         Alert.alert(
            "Unable to submit",
            `Please contact ${SUPPORT_EMAIL} manually.`,
         );
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <SafeAreaView style={styles.container}>
         <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
         >
            <ScrollView contentContainerStyle={styles.content}>
               <View style={styles.header}>
                  <TouchableOpacity
                     onPress={() => router.back()}
                     style={styles.backButton}
                  >
                     <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color="#1f2937"
                     />
                  </TouchableOpacity>
                  <View style={styles.headerCopy}>
                     <Text style={styles.title}>Contact Support</Text>
                     <Text style={styles.subtitle}>
                        Describe your issue and submit your request.
                     </Text>
                  </View>
               </View>

               <View style={styles.card}>
                  <View style={styles.infoRow}>
                     <Text style={styles.label}>Name</Text>
                     <Input
                        value={user?.name || ""}
                        onChangeText={() => {}}
                        editable={false}
                     />
                  </View>

                  <View style={styles.infoRow}>
                     <Text style={styles.label}>Email</Text>
                     <Input
                        value={user?.email || ""}
                        onChangeText={() => {}}
                        editable={false}
                        keyboardType="email-address"
                     />
                  </View>

                  <View style={styles.infoRow}>
                     <Text style={styles.label}>Role</Text>
                     <Input
                        value={userRole}
                        onChangeText={() => {}}
                        editable={false}
                     />
                  </View>

                  <View style={styles.infoRow}>
                     <Text style={styles.label}>Subject</Text>
                     <Input
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Enter a short subject"
                        autoCapitalize="sentences"
                     />
                  </View>

                  <View style={styles.infoRow}>
                     <Text style={styles.label}>Describe your issue</Text>
                     <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Tell us what happened and what you need help with"
                        autoCapitalize="sentences"
                        multiline
                        maxLength={1500}
                        placeholderTextColor="#9ca3af"
                        style={styles.messageInput}
                     />
                     <Text style={styles.helperText}>
                        {message.length}/1500 characters
                     </Text>
                  </View>

                  <Button
                     title={submitting ? "Submitting..." : "Submit Request"}
                     onPress={handleSubmit}
                     disabled={submitting}
                     loading={submitting}
                     style={styles.submitButton}
                  />
               </View>
            </ScrollView>
         </KeyboardAvoidingView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   flex: {
      flex: 1,
   },
   container: {
      flex: 1,
      backgroundColor: "#f8fafc",
   },
   content: {
      padding: 20,
      paddingBottom: 32,
   },
   header: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
   },
   backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   headerCopy: {
      flex: 1,
      paddingTop: 2,
   },
   title: {
      fontSize: 24,
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: 4,
   },
   subtitle: {
      fontSize: 14,
      color: "#64748b",
      lineHeight: 20,
   },
   card: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 3,
   },
   infoRow: {
      marginBottom: 16,
   },
   label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#334155",
      marginBottom: 8,
   },
   messageInput: {
      minHeight: 140,
      textAlignVertical: "top",
      paddingTop: 12,
   },
   helperText: {
      marginTop: 6,
      fontSize: 12,
      color: "#94a3b8",
      textAlign: "right",
   },
   submitButton: {
      marginTop: 8,
   },
});