import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { Guard } from "../../../components/Guard";
import { useAuth } from "../../../context/AuthContext";
import { DoctorService } from "../../../services/doctor";
import { ReportService } from "../../../services/report";

export default function DoctorDashboard() {
   const { user } = useAuth();
   const [stats, setStats] = useState([
      {
         label: "Today's Appointments",
         value: "0",
         icon: "calendar-clock" as const,
         color: "#3b82f6",
      },
      {
         label: "Total Patients",
         value: "0",
         icon: "account-group" as const,
         color: "#10b981",
      },
      {
         label: "Pending Reports",
         value: "0",
         icon: "clipboard-list" as const,
         color: "#a855f7",
      },
      {
         label: "Active Clinics",
         value: "0",
         icon: "hospital-building" as const,
         color: "#f97316",
      },
   ]);

   useEffect(() => {
      if (!user?.id) return;

      const loadStats = async () => {
         try {
            const [appointments, patients, reports] = await Promise.all([
               DoctorService.getAppointments(user.id),
               DoctorService.getPatients(),
               ReportService.getDoctorReports(user.id),
            ]);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todaysAppointments = appointments.filter((appointment) => {
               const start = new Date(appointment.startTime);
               start.setHours(0, 0, 0, 0);
               return start.getTime() === today.getTime();
            }).length;

            const activeClinics = new Set(
               appointments.map((appointment) => appointment.clinicName),
            ).size;

            const pendingReports = appointments.filter(
               (appointment) => !appointment.report,
            ).length;

            setStats([
               {
                  label: "Today's Appointments",
                  value: String(todaysAppointments),
                  icon: "calendar-clock" as const,
                  color: "#3b82f6",
               },
               {
                  label: "Total Patients",
                  value: String(patients.length),
                  icon: "account-group" as const,
                  color: "#10b981",
               },
               {
                  label: "Pending Reports",
                  value: String(Math.max(pendingReports, 0)),
                  icon: "clipboard-list" as const,
                  color: "#a855f7",
               },
               {
                  label: "Active Clinics",
                  value: String(activeClinics),
                  icon: "hospital-building" as const,
                  color: "#f97316",
               },
            ]);
         } catch (error) {
            console.error("Failed to load doctor dashboard stats:", error);
         }
      };

      loadStats();
   }, [user?.id]);

   const quickActions = [
      {
         label: "View Schedule",
         icon: "calendar" as const,
         color: "#3b82f6",
         bgColor: "#eff6ff",
         route: "/(app)/(doctor)/appointments" as const,
      },
      {
         label: "Patients",
         icon: "account-plus" as const,
         color: "#10b981",
         bgColor: "#f0fdf4",
         route: "/(app)/(doctor)/patients" as const,
      },
      {
         label: "View Reports",
         icon: "file-document" as const,
         color: "#a855f7",
         bgColor: "#faf5ff",
         route: "/(app)/(doctor)/reports" as const,
      },
      {
         label: "AI Medical Assistant",
         icon: "robot" as const,
         color: "#ef4444",
         bgColor: "#fef2f2",
         route: "/(app)/chatbot" as const,
      },
   ] as const;

   type QuickActionRoute = (typeof quickActions)[number]["route"];

   const handleNavigation = (route: QuickActionRoute) => {
      router.push(route);
   };

   return (
      <Guard allowedRoles={["DOCTOR"]}>
         <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
         >
            {/* Greeting */}
            <View style={styles.greetingContainer}>
               <Text style={styles.greeting}>
                  Welcome back, Dr. {user?.name?.split(" ")[1] || user?.name}!
                  👋
               </Text>
               <Text style={styles.subGreeting}>
                  Here's what's happening today.
               </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
               {stats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                     <View
                        style={[
                           styles.statIcon,
                           { backgroundColor: stat.color },
                        ]}
                     >
                        <MaterialCommunityIcons
                           name={stat.icon}
                           size={24}
                           color="#ffffff"
                        />
                     </View>
                     <Text style={styles.statValue}>{stat.value}</Text>
                     <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
               ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
               <Text style={styles.sectionTitle}>Quick Actions</Text>
               <View style={styles.actionsList}>
                  {quickActions.map((action, index) => (
                     <TouchableOpacity
                        key={index}
                        style={[
                           styles.actionButton,
                           { backgroundColor: action.bgColor },
                        ]}
                        onPress={() => handleNavigation(action.route)}
                     >
                        <View
                           style={[
                              styles.actionIcon,
                              { backgroundColor: action.color },
                           ]}
                        >
                           <MaterialCommunityIcons
                              name={action.icon}
                              size={20}
                              color="#ffffff"
                           />
                        </View>
                        <Text
                           style={[styles.actionLabel, { color: action.color }]}
                        >
                           {action.label}
                        </Text>
                     </TouchableOpacity>
                  ))}
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
      paddingBottom: 32,
   },
   greetingContainer: {
      marginBottom: 24,
   },
   greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   subGreeting: {
      fontSize: 14,
      color: "#6b7280",
   },
   statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
   },
   statCard: {
      width: "47%", // approximately 2 per row with gap
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      marginBottom: 8,
   },
   statIcon: {
      width: 48,
      height: 48,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
   },
   statValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 4,
   },
   statLabel: {
      fontSize: 12,
      color: "#6b7280",
   },
   quickActionsContainer: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: 16,
   },
   actionsList: {
      gap: 12,
   },
   actionButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
   },
   actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
   },
   actionLabel: {
      fontSize: 16,
      fontWeight: "500",
   },
});
