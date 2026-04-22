import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import {
   ScrollView,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { ClinicAdminAPI } from "../../../services/clinicAdmin";

// Menu items with const assertions so path is treated as literal string
const menuItems = [
   {
      id: "dashboard",
      label: "Dashboard",
      icon: "view-dashboard",
      path: "/(app)/(clinic-admin)" as const,
   },
   {
      id: "doctors",
      label: "Doctors",
      icon: "stethoscope",
      path: "/(app)/(clinic-admin)/doctors" as const,
   },
   {
      id: "patients",
      label: "Patients",
      icon: "account-group",
      path: "/(app)/(clinic-admin)/patients" as const,
   },
   {
      id: "appointments",
      label: "Appointments",
      icon: "calendar",
      path: "/(app)/(clinic-admin)/appointments" as const,
   },
   {
      id: "receptionists",
      label: "Receptionists",
      icon: "account-tie",
      path: "/(app)/(clinic-admin)/receptionists" as const,
   },
   {
      id: "settings",
      label: "Settings",
      icon: "cog",
      path: "/(app)/(clinic-admin)/settings" as const,
   },
];

export default function ClinicAdminLayout() {
   const pathname = usePathname();
   const { user, logout } = useAuth();
   const [clinicName, setClinicName] = useState("City Medical Center");
   const [sidebarOpen, setSidebarOpen] = useState(false);

   useEffect(() => {
      ClinicAdminAPI.getMyClinic().then((res) => {
         setClinicName(res.data.name);
      });
   }, []);

   const isActive = (path: string) => {
      if (
         path === "/(app)/(clinic-admin)" &&
         pathname === "/(app)/(clinic-admin)"
      )
         return true;
      return pathname.startsWith(path);
   };

   const handleNavigation = (path: string) => {
      router.push(path as any);
      setSidebarOpen(false);
   };

   return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
         <View style={styles.layout}>
            {/* Sidebar */}
            <View style={[styles.sidebar, sidebarOpen && styles.sidebarOpen]}>
               <View style={styles.clinicInfo}>
                  <View style={styles.logo}>
                     <MaterialCommunityIcons
                        name="hospital-building"
                        size={28}
                        color="#2563eb"
                     />
                  </View>
                  <View>
                     <Text style={styles.clinicName}>{clinicName}</Text>
                     <Text style={styles.clinicRole}>Clinic Admin Portal</Text>
                  </View>
               </View>

               <ScrollView style={styles.menu}>
                  {menuItems.map((item) => (
                     <TouchableOpacity
                        key={item.id}
                        style={[
                           styles.menuItem,
                           isActive(item.path) && styles.activeMenuItem,
                        ]}
                        onPress={() => handleNavigation(item.path)}
                     >
                        <MaterialCommunityIcons
                           name={item.icon as any}
                           size={20}
                           color={isActive(item.path) ? "#2563eb" : "#6b7280"}
                        />
                        <Text
                           style={[
                              styles.menuText,
                              isActive(item.path) && styles.activeMenuText,
                           ]}
                        >
                           {item.label}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>

               <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                  <MaterialCommunityIcons
                     name="logout"
                     size={20}
                     color="#ef4444"
                  />
                  <Text style={styles.logoutText}>Logout</Text>
               </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
               {/* Header */}
               <View style={styles.header}>
                  <View style={styles.userInfo}>
                     <Text style={styles.userName}>
                        {user?.name || "Admin"}
                     </Text>
                     <Text style={styles.userRole}>Clinic Admin</Text>
                  </View>
                  <TouchableOpacity
                     onPress={() => setSidebarOpen(!sidebarOpen)}
                     style={styles.menuButton}
                  >
                     <MaterialCommunityIcons
                        name="menu"
                        size={24}
                        color="#1f2937"
                     />
                  </TouchableOpacity>
               </View>

               {/* Content */}
               <Stack screenOptions={{ headerShown: false }} />
            </View>

            {/* Mobile overlay */}
            {sidebarOpen && (
               <TouchableOpacity
                  style={styles.overlay}
                  onPress={() => setSidebarOpen(false)}
               />
            )}
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "#f9fafb",
   },
   layout: {
      flex: 1,
      flexDirection: "row",
   },
   sidebar: {
      width: 280,
      backgroundColor: "#ffffff",
      borderLeftWidth: 1, // change from borderRightWidth
      borderLeftColor: "#e5e7eb",
      padding: 20,
      position: "absolute",
      top: 0,
      bottom: 0,
      right: -280, // change from left: -280
      zIndex: 20,
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 0 }, // shadow on left
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
   },
   sidebarOpen: {
      right: 0, // change from left: 0
   },
   clinicInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 20,
   },
   logo: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
   },
   clinicName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#1f2937",
   },
   clinicRole: {
      fontSize: 12,
      color: "#6b7280",
   },
   menu: {
      flex: 1,
   },
   menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 8,
      marginBottom: 4,
   },
   activeMenuItem: {
      backgroundColor: "#eff6ff",
   },
   menuText: {
      fontSize: 14,
      color: "#4b5563",
   },
   activeMenuText: {
      color: "#2563eb",
      fontWeight: "500",
   },
   logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
   },
   logoutText: {
      fontSize: 14,
      color: "#ef4444",
   },
   main: {
      flex: 1,
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#ffffff",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
   },
   menuButton: {
      padding: 8,
   },
   userInfo: {
      alignItems: "flex-start",
   },
   userName: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1f2937",
   },
   userRole: {
      fontSize: 12,
      color: "#6b7280",
   },
   headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
   },
   notificationButton: {
      padding: 8,
      position: "relative",
   },
   notificationBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ef4444",
   },
   overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 10,
   },
   centerInfo: {
      alignItems: "center",
      flex: 1,
   },
   rightPlaceholder: {
      width: 40, // same as menuButton width to keep center aligned
   },
});
